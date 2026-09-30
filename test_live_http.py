import urllib.request
import json
import os

boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'

test_files = [
    r'C:\Users\Snehasis\OneDrive\Pictures\images (1).jfif',
    r'C:\Users\Snehasis\OneDrive\Pictures\images.jfif',
    r'C:\Users\Snehasis\Downloads\Gemini_Generated_Image_lhc0c8lhc0c8lhc0.png',
    r'C:\Users\Snehasis\Downloads\ChatGPT Image Oct 13, 2025, 11_44_12 PM.png',
    r'C:\Users\Snehasis\Downloads\WhatsApp Image 2026-09-26 at 11.24.41 AM.jpeg',
    r'C:\Users\Snehasis\Downloads\Snehasis_Bhattacharya.jpeg',
    r'C:\Users\Snehasis\OneDrive\Pictures\nature.jpg'
]

print("=== TESTING LIVE FASTAPI AI ENGINE ON PORT 8000 ===")
for path in test_files:
    if not os.path.exists(path):
        continue
    with open(path, 'rb') as f:
        file_bytes = f.read()
    fname = os.path.basename(path)
    body = (
        f'--{boundary}\r\n'
        f'Content-Disposition: form-data; name="file"; filename="{fname}"\r\n'
        f'Content-Type: application/octet-stream\r\n\r\n'
    ).encode('utf-8') + file_bytes + f'\r\n--{boundary}--\r\n'.encode('utf-8')

    req = urllib.request.Request(
        'http://localhost:8000/predict',
        data=body,
        headers={'Content-Type': f'multipart/form-data; boundary={boundary}'}
    )
    with urllib.request.urlopen(req, timeout=10) as res:
        data = json.loads(res.read().decode('utf-8'))
        is_fake = data['is_fake']
        conf = data['confidence']
        tag = "AI-GENERATED" if is_fake else "AUTHENTIC   "
        print(f"[{tag}] ({conf*100:.1f}%) {fname[:32]:32} -> {data['explanation'][:60]}...")
