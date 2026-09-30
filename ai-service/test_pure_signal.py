import os
import numpy as np
from PIL import Image

def compute_forensic_score(img_path):
    img = Image.open(img_path).convert("RGB")
    arr = np.array(img, dtype=np.float32)
    h, w, _ = arr.shape
    gray = 0.299 * arr[:, :, 0] + 0.587 * arr[:, :, 1] + 0.114 * arr[:, :, 2]
    
    # 1. 2D FFT periodic grid / checkerboard detection
    f = np.fft.fft2(gray)
    fshift = np.fft.fftshift(f)
    psd = np.abs(fshift)**2
    log_psd = np.log(psd + 1e-6)
    
    cy, cx = h // 2, w // 2
    y, x = np.ogrid[:h, :w]
    r = np.sqrt((x - cx)**2 + (y - cy)**2)
    
    r_outer = min(h, w) // 2
    r_inner = r_outer // 3
    mask = (r >= r_inner) & (r <= r_outer)
    
    high_vals = log_psd[mask]
    spectral_spikes = float(np.mean(high_vals > (np.mean(high_vals) + 3.0 * np.std(high_vals))))
    
    # 2. Noise residual: High-pass Laplacian
    lap = np.abs(gray[1:-1, 1:-1] * 4 - gray[:-2, 1:-1] - gray[2:, 1:-1] - gray[1:-1, :-2] - gray[1:-1, 2:])
    noise_mean = float(np.mean(lap))
    noise_std = float(np.std(lap))
    noise_homogeneity = float(noise_std / (noise_mean + 1e-4))
    
    # 3. Inter-channel chromatic gradient divergence
    r_chan, g_chan, b_chan = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
    dr = np.abs(r_chan[:, 1:] - r_chan[:, :-1])
    dg = np.abs(g_chan[:, 1:] - g_chan[:, :-1])
    db = np.abs(b_chan[:, 1:] - b_chan[:, :-1])
    cross_corr_rg = float(np.corrcoef(dr.flatten(), dg.flatten())[0, 1])
    cross_corr_gb = float(np.corrcoef(dg.flatten(), db.flatten())[0, 1])
    channel_coherence = (cross_corr_rg + cross_corr_gb) / 2.0
    
    # 4. Color distribution & saturation
    hsv = np.array(img.convert("HSV"), dtype=np.float32)
    sat = hsv[:, :, 1] / 255.0
    mean_sat = float(np.mean(sat))

    filename = os.path.basename(img_path)
    print(f"=== {filename} ===")
    print(f"  Spikes: {spectral_spikes:.5f} | Noise Homo: {noise_homogeneity:.3f} | Chan Coherence: {channel_coherence:.4f} | Sat: {mean_sat:.3f}")

for p in [
    r"C:\Users\Snehasis\OneDrive\Pictures\images.jfif",
    r"C:\Users\Snehasis\Downloads\images.jfif",
    r"C:\Users\Snehasis\Downloads\Gemini_Generated_Image_n9b44en9b44en9b4.png",
    r"C:\Users\Snehasis\Downloads\WhatsApp Image 2026-09-26 at 11.24.41 AM.jpeg"
]:
    if os.path.exists(p):
        compute_forensic_score(p)
