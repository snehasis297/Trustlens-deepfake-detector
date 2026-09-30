import numpy as np
from PIL import Image

def analyze(path, label):
    img = Image.open(path).convert("RGB")
    arr = np.array(img, dtype=np.float32)
    h, w, _ = arr.shape
    gray = 0.299 * arr[:, :, 0] + 0.587 * arr[:, :, 1] + 0.114 * arr[:, :, 2]
    
    # 1. Frequency domain (2D FFT)
    f = np.fft.fft2(gray)
    fshift = np.fft.fftshift(f)
    mag = 20 * np.log(np.abs(fshift) + 1e-6)
    
    cy, cx = h // 2, w // 2
    y, x = np.ogrid[:h, :w]
    dist = np.sqrt((x - cx)**2 + (y - cy)**2)
    r_max = min(h, w) // 2
    high_freq = mag[dist > (r_max * 0.7)]
    low_freq = mag[dist < (r_max * 0.2)]
    hf_ratio = float(np.mean(high_freq) / (np.mean(low_freq) + 1e-4))
    
    # 2. Skin noise vs non-skin noise
    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
    skin_mask = (r > 90) & (g > 50) & (b > 30) & (r > g) & (g > b)
    
    lap = np.abs(gray[1:-1, 1:-1] * 4 - gray[:-2, 1:-1] - gray[2:, 1:-1] - gray[1:-1, :-2] - gray[1:-1, 2:])
    skin_lap = lap[skin_mask[1:-1, 1:-1]]
    skin_noise_mean = float(np.mean(skin_lap)) if len(skin_lap) > 0 else 0
    non_skin_noise_mean = float(np.mean(lap[~skin_mask[1:-1, 1:-1]])) if np.any(~skin_mask[1:-1, 1:-1]) else 0
    
    # In AI generated faces: skin has heavy GAN/diffusion smoothing, so skin_noise is drastically lower than edge regions
    # In real camera selfies: CMOS sensor noise is present everywhere uniformly, including across facial skin
    noise_ratio = skin_noise_mean / (non_skin_noise_mean + 1e-4)

    # 3. Asymmetry and boundary coherence (eyes / pupils)
    # Check chromatic variance
    hsv = np.array(img.convert("HSV"), dtype=np.float32)
    s = hsv[:, :, 1] / 255.0
    v = hsv[:, :, 2] / 255.0

    print("=" * 60)
    print(f"{label} ({path.split('/')[-1].split(chr(92))[-1]}):")
    print(f"  Dimensions: {w}x{h}")
    print(f"  HF Energy Ratio: {hf_ratio:.4f}")
    print(f"  Skin Noise: {skin_noise_mean:.2f} | Non-Skin Noise: {non_skin_noise_mean:.2f}")
    print(f"  Skin/Non-Skin Noise Ratio: {noise_ratio:.4f}")
    print(f"  Mean Saturation: {np.mean(s):.4f}")

analyze(r"C:\Users\Snehasis\OneDrive\Pictures\images.jfif", "AI Synthetic Face (OneDrive images.jfif)")
analyze(r"C:\Users\Snehasis\Downloads\WhatsApp Image 2026-09-26 at 11.24.41 AM.jpeg", "Real Camera Selfie")
analyze(r"C:\Users\Snehasis\Downloads\Gemini_Generated_Image_n9b44en9b44en9b4.png", "Gemini AI Art")
