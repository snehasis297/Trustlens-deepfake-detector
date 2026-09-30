import urllib.request
import json

boundary = "----TrustLensTestBoundary12345"
content = open("ai-service/test.jpg", "rb").read()

body = (
    f"--{boundary}\r\n"
    f'Content-Disposition: form-data; name="image"; filename="test.jpg"\r\n'
    f"Content-Type: image/jpeg\r\n\r\n"
).encode("utf-8") + content + f"\r\n--{boundary}--\r\n".encode("utf-8")

req = urllib.request.Request(
    "http://localhost:8000/predict",
    data=body,
    headers={"Content-Type": f"multipart/form-data; boundary={boundary}"}
)

try:
    res = urllib.request.urlopen(req)
    data = json.loads(res.read().decode("utf-8"))
    print("STATUS:", res.status)
    print("RESULT:", json.dumps(data, indent=2))
except Exception as e:
    print("ERROR:", e)
