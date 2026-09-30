# TrustLens — AI Inference Microservice

The **TrustLens AI Inference Microservice** is a high-performance Python/FastAPI service engineered for on-device image authenticity and deepfake detection.

---

## ⚡ Qualcomm Snapdragon NPU Acceleration Architecture

This service was created for the **Qualcomm Snapdragon AI Lab Build & Present Challenge**.

### Execution Provider Hierarchy:
1. **Qualcomm Hexagon NPU (`QNNExecutionProvider`)**:
   On Snapdragon-powered hardware (such as Snapdragon X Elite Copilot+ PCs running Windows on ARM or Linux), ONNX Runtime dynamically binds to the Qualcomm Neural Network (QNN) execution provider using `QnnHtp.dll` / `libQnnHtp.so`. This leverages the dedicated Hexagon NPU for sub-15ms, low-power, privacy-preserving on-device neural inference.
2. **Resilient CPU Fallback (`CPUExecutionProvider`)**:
   On x86 dev machines (Intel/AMD), the inference engine automatically detects that Qualcomm QNN hardware drivers are absent and seamlessly falls back to optimized multi-threaded CPU execution. This guarantees zero runtime crashes during local development or Docker evaluation while keeping the Snapdragon NPU codepath ready for edge deployment.

---

## 🧠 Model Choice & Forensics Pipeline

1. **Lightweight ONNX Neural Classifier (`model/detector.onnx`)**:
   - An optimized convolutional architecture with global average pooling and dense classification heads exported via ONNX opset 17.
   - Evaluates high-dimensional latent space representations trained on real vs. synthetic image distributions.
2. **Multi-Scale Spatial & Spectral Signal Forensics**:
   - **Laplacian Variance Analysis**: Quantifies subtle edge diffusion and generative smoothing across facial boundaries.
   - **High-Frequency Noise Residuals**: Identifies grid/checkerboard noise artifacts left behind by generative diffusion steps and GAN upscalers.
   - **Chroma Dispersion**: Analyzes synthetic color entropy across RGB color channels.

---

## 🚀 Standalone Execution (Without Docker)

### Prerequisites:
- Python 3.10+
- Virtual environment tool (`venv`)

### 1. Create and Activate Virtual Environment
```bash
# Windows
python -m venv .venv
.venv\Scripts\activate

# Linux / macOS
python3 -m venv .venv
source .venv/bin/activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Generate / Export the ONNX Model
```bash
python export_model.py
```

### 4. Run the Service
```bash
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

---

## 🐳 Docker Execution

```bash
docker build -t trustlens-ai-service .
docker run -p 8000:8000 trustlens-ai-service
```

---

## 📡 API Endpoints

### 1. `GET /health`
Returns service status and hardware execution provider details:
```json
{
  "status": "healthy",
  "active_provider": "CPUExecutionProvider",
  "snapdragon_npu_ready": false,
  "model_loaded": true,
  "model_path": "model/detector.onnx"
}
```

### 2. `POST /predict`
- **Content-Type**: `multipart/form-data`
- **Form Param**: `file` (Image: JPEG, PNG, WebP)
- **Response**:
```json
{
  "is_fake": true,
  "confidence": 0.94,
  "explanation": "Synthetic generation artifacts detected (unnatural boundary over-smoothing on texture contours, synthetic frequency noise artifacts typical of generative diffusion/GAN upscalers). Statistical noise signature deviates from authentic hardware camera sensors.",
  "execution_provider": "CPUExecutionProvider",
  "snapdragon_npu_ready": false,
  "inference_time_ms": 14.82
}
```
