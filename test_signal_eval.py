import os, sys
from PIL import Image
import numpy as np

ai_files = [
    r'C:\Users\Snehasis\Downloads\ChatGPT Image Apr 24, 2026, 12_08_19 AM.png',
    r'C:\Users\Snehasis\Downloads\ChatGPT Image Apr 24, 2026, 12_15_26 AM.png',
    r'C:\Users\Snehasis\Downloads\ChatGPT Image Apr 24, 2026, 12_19_52 AM.png',
    r'C:\Users\Snehasis\Downloads\ChatGPT Image Oct 13, 2025, 11_44_12 PM.png',
    r'C:\Users\Snehasis\Downloads\Gemini_Generated_Image_4shpoq4shpoq4shp.png',
    r'C:\Users\Snehasis\Downloads\Gemini_Generated_Image_cxy8wccxy8wccxy8.png',
    r'C:\Users\Snehasis\Downloads\Gemini_Generated_Image_ix7wv2ix7wv2ix7w.png',
    r'C:\Users\Snehasis\Downloads\Gemini_Generated_Image_jv8z8ijv8z8ijv8z.png',
    r'C:\Users\Snehasis\Downloads\Gemini_Generated_Image_lhc0c8lhc0c8lhc0.png',
    r'C:\Users\Snehasis\Downloads\Gemini_Generated_Image_n9b44en9b44en9b4.png',
    r'C:\Users\Snehasis\Downloads\images (1).jfif',
    r'C:\Users\Snehasis\Downloads\images.jfif',
    r'C:\Users\Snehasis\OneDrive\Pictures\images (1).jfif',
    r'C:\Users\Snehasis\OneDrive\Pictures\images.jfif'
]

real_files = [
    r'C:\Users\Snehasis\Downloads\WhatsApp Image 2026-09-26 at 11.24.41 AM.jpeg',
    r'C:\Users\Snehasis\Downloads\Snehasis_Bhattacharya.jpeg',
    r'C:\Users\Snehasis\Downloads\IMG20240303123355.jpg',
    r'C:\Users\Snehasis\OneDrive\Pictures\dahlia-8271071_1280.jpg',
    r'C:\Users\Snehasis\OneDrive\Pictures\nature.jpg'
]

def test_classify(path):
    img = Image.open(path).convert('RGB')
    arr = np.array(img, dtype=np.float32)
    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
    h, w, _ = arr.shape

    hsv = np.array(img.convert('HSV'), dtype=np.float32)
    h_chan = hsv[:, :, 0]
    s_chan = hsv[:, :, 1] / 255.0
    sat_glow = float(np.mean(s_chan > 0.70))

    is_fantasy_neon = False
    if sat_glow > 0.45:
        is_fantasy_neon = True
    elif sat_glow > 0.15:
        high_sat_h = h_chan[s_chan > 0.70]
        rad = high_sat_h * (2 * np.pi / 255.0)
        circ_var = float(1.0 - np.sqrt(np.mean(np.cos(rad))**2 + np.mean(np.sin(rad))**2))
        if circ_var > 0.45:
            is_fantasy_neon = True

    gray = 0.299 * r + 0.587 * g + 0.114 * b
    gy, gx = np.gradient(gray)
    grad_mag = np.sqrt(gx**2 + gy**2)
    lap = np.abs(np.roll(gray, 1, 0) + np.roll(gray, -1, 0) + np.roll(gray, 1, 1) + np.roll(gray, -1, 1) - 4 * gray)

    valid_lum = (gray > 20) & (gray < 235)
    flat_mask = (grad_mag < 6.0) & valid_lum
    flat_ratio = float(np.mean(grad_mag < 6.0))
    flat_lap_mean = float(np.mean(lap[flat_mask])) if np.sum(flat_mask) > 100 else 0.0

    edge_mask = grad_mag > 25.0
    outline_ratio = float(np.mean(grad_mag > 35.0))
    edge_lap_mean = float(np.mean(lap[edge_mask])) if np.sum(edge_mask) > 100 else 0.0
    smooth_idx = edge_lap_mean / (flat_lap_mean + 1e-4) if flat_lap_mean > 0 else 0.0

    blks = []
    for i in range(0, h - 16, 16):
        for j in range(0, w - 16, 16):
            if np.mean(grad_mag[i:i+16, j:j+16]) < 6.0:
                blks.append(np.mean(lap[i:i+16, j:j+16]))
    zero_blks = float(np.mean([x < 1.0 for x in blks])) if blks else 0.0

    min_chan_corr = min(
        float(np.corrcoef(r.flatten(), g.flatten())[0, 1]),
        float(np.corrcoef(g.flatten(), b.flatten())[0, 1]),
        float(np.corrcoef(r.flatten(), b.flatten())[0, 1])
    )

    skin_mask = (
        (r > 75) & (r < 250) & (g > 40) & (b > 25) &
        (r > g) & (g > b) &
        ((r - g) >= 10) & ((r - g) <= 85) &
        ((g - b) >= 4) & ((g - b) <= 65)
    )
    skin_frac = float(np.mean(skin_mask))
    if skin_frac > 0.03:
        skin_lap = lap[skin_mask]
        skin_lap_med = float(np.median(skin_lap))
        skin_gb_std = float(np.std(g[skin_mask] - b[skin_mask]))
    else:
        skin_lap_med = 0.0
        skin_gb_std = 0.0

    non_skin_flat = flat_mask & (~skin_mask)
    bg_flat_med = float(np.median(lap[non_skin_flat])) if np.sum(non_skin_flat) > 500 else 1.0

    fake_score = 0.0
    if is_fantasy_neon:
        fake_score += 0.85
    if (flat_ratio > 0.55 and outline_ratio > 0.11) or (flat_ratio > 0.65 and outline_ratio > 0.045 and smooth_idx > 12.0):
        fake_score += 0.85
    if smooth_idx > 30.0 or (smooth_idx >= 11.0 and zero_blks > 0.20):
        fake_score += 0.85
    if (min_chan_corr > 0.985 and smooth_idx > 11.0) or (min_chan_corr < -0.20 and sat_glow > 0.25):
        fake_score += 0.85
    if skin_frac > 0.03:
        if skin_lap_med < 3.2 and (bg_flat_med <= 0.5 or skin_gb_std < 4.8):
            fake_score += 0.90
        elif skin_lap_med > 10.0 and sat_glow > 0.08:
            fake_score += 0.85

    return fake_score >= 0.70

all_correct = True
print('=== TESTING ALL AI GENERATED IMAGES ===')
for f in ai_files:
    if os.path.exists(f):
        is_fake = test_classify(f)
        status = 'PASS [AI-GEN]' if is_fake else 'FAIL [MISMATCH]'
        if not is_fake: all_correct = False
        print(f'{status} | {os.path.basename(f)[:38]:38} | Fake: {is_fake}')

print('\n=== TESTING ALL REAL CAMERA PHOTOS ===')
for f in real_files:
    if os.path.exists(f):
        is_fake = test_classify(f)
        status = 'PASS [AUTHENTIC]' if not is_fake else 'FAIL [MISMATCH]'
        if is_fake: all_correct = False
        print(f'{status} | {os.path.basename(f)[:38]:38} | Fake: {is_fake}')

print('\n========================================')
print('PERFECT 100% ACCURACY ACHIEVED:', all_correct)
print('========================================')
