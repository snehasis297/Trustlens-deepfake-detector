import numpy as np
from PIL import Image
from inference import detector
import io

print("=================================================================")
print("RUNNING TRUSTLENS DUAL VALIDATION TEST")
print("=================================================================")

# -------------------------------------------------------------
# 1. REAL HUMAN SELFIE / PORTRAIT
# -------------------------------------------------------------
h, w = 400, 300
y, x = np.ogrid[:h, :w]
# Human skin tone: R > G > B, natural ambient light, natural sensor noise
r = np.clip(185 + np.random.normal(0, 8, (h, w)), 0, 255)
g = np.clip(135 + np.random.normal(0, 8, (h, w)), 0, 255)
b = np.clip(105 + np.random.normal(0, 8, (h, w)), 0, 255)
real_rgb = np.stack([r, g, b], axis=-1).astype(np.uint8)
img_real = Image.fromarray(real_rgb)
buf_real = io.BytesIO()
img_real.save(buf_real, format="JPEG")

result_real = detector.predict(buf_real.getvalue())
print("\n[TEST 1: REAL SELFIE / CAMERA PHOTO]")
print("Verdict:        ", "AI-Generated / Deepfake" if result_real["is_fake"] else "Authentic Photograph")
print("Confidence:     ", f"{result_real['confidence'] * 100}%")
print("Execution Prov: ", result_real["execution_provider"])
print("Explanation:    ", result_real["explanation"])

# -------------------------------------------------------------
# 2. AI SCI-FI ROBOT / GLOWING NEON ILLUSTRATION
# -------------------------------------------------------------
# Glowing golden sparks, neon filaments, hyper-saturated fantasy colors
synth_r = np.clip(250 + np.random.normal(0, 5, (h, w)), 0, 255)
synth_g = np.clip(190 + np.random.normal(0, 5, (h, w)), 0, 255)
synth_b = np.clip(25 + np.random.normal(0, 5, (h, w)), 0, 255)
# Add dense glowing filament lattice (like the robot's hair/sparks)
synth_r[::5, :] = 255
synth_g[::5, :] = 230
synth_b[::5, :] = 0
synth_rgb = np.stack([synth_r, synth_g, synth_b], axis=-1).astype(np.uint8)
img_synth = Image.fromarray(synth_rgb)
buf_synth = io.BytesIO()
img_synth.save(buf_synth, format="JPEG")

result_synth = detector.predict(buf_synth.getvalue())
print("\n[TEST 2: AI SCI-FI ROBOT / GLOWING ILLUSTRATION]")
print("Verdict:        ", "AI-Generated / Deepfake" if result_synth["is_fake"] else "Authentic Photograph")
print("Confidence:     ", f"{result_synth['confidence'] * 100}%")
print("Execution Prov: ", result_synth["execution_provider"])
print("Explanation:    ", result_synth["explanation"])
print("=================================================================")
