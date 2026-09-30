import urllib.request
import json
import uuid

def post_multipart(url, file_path, field_name="file"):
    boundary = "----WebKitFormBoundary" + uuid.uuid4().hex
    with open(file_path, "rb") as fp:
        file_bytes = fp.read()
    
    filename = file_path.split("\\")[-1]
    
    body = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="{field_name}"; filename="{filename}"\r\n'
        f"Content-Type: image/jpeg\r\n\r\n"
    ).encode("utf-8") + file_bytes + f"\r\n--{boundary}--\r\n".encode("utf-8")
    
    req = urllib.request.Request(
        url,
        data=body,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"}
    )
    with urllib.request.urlopen(req) as resp:
        return resp.status, json.loads(resp.read().decode("utf-8"))

url = "http://localhost:8000/predict"

status1, res1 = post_multipart(url, r"C:\Users\Snehasis\Downloads\images.jfif")
print("=== 1. images.jfif ===")
print("HTTP Status:", status1)
print("is_fake:", res1["is_fake"], "fake:", res1["fake"], "isFake:", res1["isFake"])
print("Confidence:", res1["confidence"])
print("Explanation:", res1["explanation"])

status2, res2 = post_multipart(url, r"C:\Users\Snehasis\Downloads\Gemini_Generated_Image_n9b44en9b44en9b4.png")
print("\n=== 2. Gemini_Generated_Image_n9b44en9b44en9b4.png ===")
print("HTTP Status:", status2)
print("is_fake:", res2["is_fake"], "fake:", res2["fake"], "isFake:", res2["isFake"])
print("Confidence:", res2["confidence"])
print("Explanation:", res2["explanation"])
