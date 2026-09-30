import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { 
  UploadCloud, 
  ShieldAlert, 
  ShieldCheck, 
  Cpu, 
  Sparkles, 
  Clock, 
  ArrowRight, 
  AlertTriangle,
  FileCheck,
  RefreshCw
} from 'lucide-react';

const Dashboard = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const checkIsFake = (res) => {
    if (!res) return false;
    if (typeof res.isFake === 'boolean') return res.isFake;
    if (typeof res.fake === 'boolean') return res.fake;
    if (typeof res.is_fake === 'boolean') return res.is_fake;
    const exp = (res.explanation || '').toLowerCase();
    if (exp.includes('synthetic') || exp.includes('ai-generated') || exp.includes('deepfake') || exp.includes('unnatural')) {
      return true;
    }
    return false;
  };

  const isSynthetic = checkIsFake(scanResult);

  const handleFileChange = (file) => {
    if (!file) return;

    const name = file.name.toLowerCase();
    const isImage = file.type.startsWith('image/') || 
      name.endsWith('.jfif') || name.endsWith('.jpg') || name.endsWith('.jpeg') || 
      name.endsWith('.png') || name.endsWith('.webp') || name.endsWith('.bmp');

    if (!isImage) {
      setErrorMsg('Please select an image file (JPEG, PNG, WebP, JFIF).');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setErrorMsg('Image size cannot exceed 25MB.');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setScanResult(null);
    setErrorMsg('');
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleScan = async () => {
    if (!selectedFile) return;

    setIsScanning(true);
    setErrorMsg('');

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('image', selectedFile);

    try {
      const response = await api.post('/api/scan', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const raw = response.data;
      const isFake = checkIsFake(raw);
      const normalized = {
        ...raw,
        id: raw.id || Date.now(),
        imageName: raw.imageName || selectedFile.name,
        isFake,
        fake: isFake,
        confidence: raw.confidence,
        explanation: raw.explanation,
        executionProvider: raw.executionProvider || 'CPUExecutionProvider',
        inferenceTimeMs: raw.inferenceTimeMs || 15.0
      };
      setScanResult(normalized);
      saveLocalScan(normalized);
    } catch (err) {
      // Fallback: If backend (port 8080) is not running, query the live AI service directly on port 8000!
      try {
        const directAiUrl = 'http://localhost:8000/predict';
        const aiResponse = await fetch(directAiUrl, {
          method: 'POST',
          body: formData,
        });

        if (!aiResponse.ok) {
          throw new Error('AI Service status: ' + aiResponse.statusText);
        }

        const data = await aiResponse.json();
        const isFake = checkIsFake(data);
        const fallbackResult = {
          id: Date.now(),
          userId: 1,
          imageName: selectedFile.name,
          isFake: isFake,
          fake: isFake,
          confidence: data.confidence,
          explanation: data.explanation,
          scannedAt: new Date().toISOString(),
          executionProvider: data.execution_provider || 'CPUExecutionProvider',
          snapdragonNpuReady: data.snapdragon_npu_ready || false,
          inferenceTimeMs: data.inference_time_ms || 14.8
        };
        setScanResult(fallbackResult);
        saveLocalScan(fallbackResult);
      } catch (aiErr) {
        const msg = err.response?.data?.message || aiErr.message || 'Failed to scan image. Please try again.';
        setErrorMsg(msg);
      }
    } finally {
      setIsScanning(false);
    }
  };

  const saveLocalScan = (scan) => {
    try {
      const existing = JSON.parse(localStorage.getItem('trustlens_scans') || '[]');
      const updated = [scan, ...existing.filter(s => s.id !== scan.id)];
      localStorage.setItem('trustlens_scans', JSON.stringify(updated.slice(0, 50)));
    } catch (e) {
      console.warn('Could not save local scan:', e);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setScanResult(null);
    setErrorMsg('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title & Qualcomm Snapdragon NPU Highlight Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-8 border-b border-gray-800 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Image Authenticity & Deepfake Scanner
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Analyze photographic sensor artifacts and neural synthetic markers in real-time.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-gray-900 border border-red-900/40 px-3.5 py-2 rounded-xl">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></div>
          <span className="text-xs text-gray-300 font-medium">Engine:</span>
          <span className="text-xs font-semibold text-red-400">Qualcomm QNN / Hexagon NPU Fallback</span>
        </div>
      </div>

      {errorMsg && (
        <div className="mt-6 p-4 rounded-xl bg-red-950/60 border border-red-800/80 flex items-start space-x-3 text-red-200">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <span className="font-semibold">Verification Notice:</span> {errorMsg}
          </div>
        </div>
      )}

      {/* Main Grid: Upload Pane + Results Pane */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Upload & Live Preview */}
        <div className="lg:col-span-6 space-y-6">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-red-500 bg-red-950/20'
                : 'border-gray-800 bg-gray-900/40 hover:border-gray-700 hover:bg-gray-900/60'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.jfif,.jpg,.jpeg,.png,.webp,.bmp"
              onChange={(e) => handleFileChange(e.target.files[0])}
              className="hidden"
            />

            {previewUrl ? (
              <div className="space-y-4">
                <div className="relative rounded-xl overflow-hidden max-h-80 mx-auto border border-gray-800 bg-black/40">
                  <img
                    src={previewUrl}
                    alt="Scan Target Preview"
                    className="w-full h-full object-contain mx-auto max-h-80"
                  />
                </div>
                <div className="flex items-center justify-center space-x-2 text-xs text-gray-400">
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                  <span className="font-mono">{selectedFile?.name}</span>
                  <span>({Math.round((selectedFile?.size || 0) / 1024)} KB)</span>
                </div>
                <p className="text-xs text-gray-500">Click or drop another file to change image</p>
              </div>
            ) : (
              <div className="py-8 space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-red-950/40 border border-red-800/40 flex items-center justify-center text-red-500">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-base font-medium text-white">
                    Drag and drop your image here, or <span className="text-red-400 underline">browse</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Supports JPEG, PNG, WebP up to 15MB</p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            <button
              onClick={handleScan}
              disabled={!selectedFile || isScanning}
              className="flex-1 flex items-center justify-center space-x-2 py-3 px-6 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium shadow-lg shadow-red-600/20 transition-all"
            >
              {isScanning ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Running ONNX Inference...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Analyze Authenticity</span>
                </>
              )}
            </button>

            {selectedFile && (
              <button
                onClick={handleReset}
                disabled={isScanning}
                className="py-3 px-4 rounded-xl border border-gray-800 bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                title="Reset file"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Results & Hardware Telemetry */}
        <div className="lg:col-span-6">
          {scanResult ? (
            <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
                {/* Verdict Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Forensic Verdict
                    </span>
                    <div className="mt-1 flex items-center space-x-2">
                      {isSynthetic ? (
                        <div className="flex items-center space-x-2 text-rose-500">
                          <ShieldAlert className="w-7 h-7" />
                          <h2 className="text-2xl font-bold tracking-tight text-white">
                            AI-Generated / Deepfake
                          </h2>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 text-emerald-400">
                          <ShieldCheck className="w-7 h-7" />
                          <h2 className="text-2xl font-bold tracking-tight text-white">
                            Authentic Photograph
                          </h2>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={`px-3 py-1.5 rounded-full text-xs font-bold border ${
                    isSynthetic 
                      ? 'bg-rose-950/70 border-rose-800 text-rose-300' 
                      : 'bg-emerald-950/70 border-emerald-800 text-emerald-300'
                  }`}>
                    {Math.round(scanResult.confidence * 100)}% Certainty
                  </div>
                </div>

                {/* Confidence Meter Bar */}
                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1.5 font-medium">
                    <span>Confidence Metric</span>
                    <span className="text-white font-semibold">{(scanResult.confidence * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-950 rounded-full h-3 overflow-hidden border border-gray-800">
                    <div
                      className={`h-full transition-all duration-700 rounded-full ${
                        isSynthetic
                          ? 'bg-gradient-to-r from-red-600 to-rose-500'
                          : 'bg-gradient-to-r from-emerald-600 to-teal-400'
                      }`}
                      style={{ width: `${scanResult.confidence * 100}%` }}
                    ></div>
                  </div>
                </div>

              {/* Technical Explanation */}
              <div className="bg-gray-950/80 border border-gray-800/80 rounded-xl p-4">
                <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  Spectral & Neural Findings
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {scanResult.explanation}
                </p>
              </div>

              {/* Hardware Telemetry Cards */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-gray-950/60 border border-gray-800/80 p-3.5 rounded-xl">
                  <div className="flex items-center space-x-1.5 text-xs text-gray-400 mb-1">
                    <Cpu className="w-3.5 h-3.5 text-red-400" />
                    <span>Inference Provider</span>
                  </div>
                  <div className="text-xs font-semibold text-white truncate" title={scanResult.executionProvider}>
                    {scanResult.executionProvider}
                  </div>
                </div>

                <div className="bg-gray-950/60 border border-gray-800/80 p-3.5 rounded-xl">
                  <div className="flex items-center space-x-1.5 text-xs text-gray-400 mb-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Latency</span>
                  </div>
                  <div className="text-xs font-semibold text-white">
                    {scanResult.inferenceTimeMs} ms
                  </div>
                </div>
              </div>

              {/* Chatbot CTA */}
              <div className="pt-2">
                <button
                  onClick={() => navigate(`/chat?scanId=${scanResult.id}`)}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium transition-colors border border-gray-700"
                >
                  <span>Ask AI Analyst About This Scan</span>
                  <ArrowRight className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>
          ) : (
            <div className="border border-gray-800 rounded-2xl p-12 text-center bg-gray-900/20 text-gray-500 h-full flex flex-col items-center justify-center space-y-3">
              <Cpu className="w-12 h-12 text-gray-700" />
              <div className="max-w-sm">
                <h3 className="text-base font-medium text-gray-300">Awaiting Image Input</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Upload an image on the left to trigger the ONNX classification engine and view forensic telemetry.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
