import urllib.request
import json
import uuid

def login():
    url = "http://localhost:8080/api/auth/login"
    payload = json.dumps({"email": "analyst@trustlens.ai", "password": "password123"}).encode("utf-8")
    req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        return data.get("token")

def scan_image(token, file_path):
    url = "http://localhost:8080/api/scan"
    boundary = "----WebKitFormBoundary" + uuid.uuid4().hex
    with open(file_path, "rb") as fp:
        file_bytes = fp.read()
    
    filename = file_path.split("\\")[-1]
    body = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="file"; filename="{filename}"\r\n'
        f"Content-Type: image/jpeg\r\n\r\n"
    ).encode("utf-8") + file_bytes + f"\r\n--{boundary}--\r\n".encode("utf-8")
    
    req = urllib.request.Request(
        url,
        data=body,
        headers={
            "Content-Type": f"multipart/form-data; boundary={boundary}",
            "Authorization": f"Bearer {token}"
        }
    )
    with urllib.request.urlopen(req) as resp:
        return resp.status, json.loads(resp.read().decode("utf-8"))

def ask_chat(token, scan_id, question):
    url = "http://localhost:8080/api/chat"
    payload = json.dumps({"scanId": scan_id, "message": question}).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=payload,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}"
        }
    )
    with urllib.request.urlopen(req) as resp:
        return resp.status, json.loads(resp.read().decode("utf-8"))

print("1. Logging in to get JWT token...")
token = login()
print("   Token acquired:", token[:25] + "...")

print("\n2. Scanning AI Cow in Hoodie (images (1).jfif)...")
status1, res1 = scan_image(token, r"C:\Users\Snehasis\OneDrive\Pictures\images (1).jfif")
print("   Status:", status1)
print("   isFake:", res1.get("isFake"), "fake:", res1.get("fake"))
print("   Confidence:", res1.get("confidence"))
print("   Explanation:", res1.get("explanation")[:120] + "...")

print("\n3. Scanning AI Boy Portrait (images.jfif)...")
status2, res2 = scan_image(token, r"C:\Users\Snehasis\OneDrive\Pictures\images.jfif")
print("   Status:", status2)
print("   isFake:", res2.get("isFake"), "fake:", res2.get("fake"))
print("   Confidence:", res2.get("confidence"))
print("   Explanation:", res2.get("explanation")[:120] + "...")

print("\n4. Scanning Genuine Camera Selfie (WhatsApp Image...)...")
status3, res3 = scan_image(token, r"C:\Users\Snehasis\Downloads\WhatsApp Image 2026-09-26 at 11.24.41 AM.jpeg")
print("   Status:", status3)
print("   isFake:", res3.get("isFake"), "fake:", res3.get("fake"))
print("   Confidence:", res3.get("confidence"))
print("   Explanation:", res3.get("explanation")[:120] + "...")

print("\n5. Testing AI Analyst Chat (Cow Scan)...")
status_chat, res_chat = ask_chat(token, res1.get("id"), "is this fake or real")
print("   Status:", status_chat)
print("   Response:", res_chat.get("response")[:160].encode("ascii", "replace").decode("ascii") + "...")
