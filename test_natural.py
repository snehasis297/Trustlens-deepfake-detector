import numpy as np
from PIL import Image
import urllib.request
import json

h, w = 300, 300
y, x = np.ogrid[:h, :w]
base = (x / w * 150 + y / h * 80).astype(np.float32)
noise = np.random.normal(0, 10, (h, w)).astype(np.float32)
rgb = np.stack([base + noise, base * 0.95 + noise * 0.92, base * 0.88 + noise * 0.90], axis=-1)
rgb = np.clip(rgb, 0, 255).astype(np.uint8)
img = Image.fromarray(rgb)
img.save("natural_sample.jpg")

boundary = "----Boundary123"
body = (
    f"--{boundary}\r\n"
    f'Content-Disposition: form-data; name="file"; filename="natural_sample.jpg"\r\n'
    f"Content-Type: image/jpeg\r\n\r\n"
).encode("utf-8") + open("natural_sample.jpg", "rb").read() + f"\r\n--{boundary}--\r\n".encode("utf-8")

req = urllib.request.Request(
    "http://localhost:8000/predict",
    data=body,
    headers={"Content-Type": f"multipart/form-data; boundary={boundary}"}
)

res = urllib.request.urlopen(req)
data = json.loads(res.read().decode("utf-8"))
print("NATURAL PHOTO RESULT:")
print(json.dumps(data, indent=2))
