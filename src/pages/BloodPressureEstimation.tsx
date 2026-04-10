import React, { useRef, useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { Camera, Loader2, AlertTriangle, ChevronLeft, Eye, Activity, Shield, Zap, Heart, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Header from "@/components/Header"
import Footer from "@/components/Footer"

export default function BloodPressureEstimation() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const framesRef = useRef<string[]>([])
  const navigate = useNavigate()

  const [isRecording, setIsRecording] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(30)
  const [result, setResult] = useState<any>(null)
  const [cameraReady, setCameraReady] = useState(false)
  const [framesCaptured, setFramesCaptured] = useState(0)

  const startCamera = useCallback(async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" }, audio: false })
      if (videoRef.current) { videoRef.current.srcObject = stream; streamRef.current = stream; setCameraReady(true) }
    } catch (err: any) { setError("Failed to access camera. Please allow camera permissions.") }
  }, [])

  const stopCamera = useCallback(() => { if (streamRef.current) { streamRef.current.getTracks().forEach(track => track.stop()); streamRef.current = null; setCameraReady(false) } }, [])

  const captureFrames = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return
    const canvas = canvasRef.current; const video = videoRef.current
    canvas.width = video.videoWidth; canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const interval = setInterval(() => { ctx.drawImage(video, 0, 0); const frame = canvas.toDataURL('image/jpeg', 0.8); framesRef.current.push(frame); setFramesCaptured(framesRef.current.length) }, 500)
    return interval
  }, [])

  const startRecording = () => {
    setIsRecording(true); setCountdown(30); setFramesCaptured(0); framesRef.current = []
    const captureInterval = captureFrames()
    const countdownInterval = setInterval(() => {
      setCountdown(prev => { if (prev <= 1) { clearInterval(countdownInterval); if (captureInterval) clearInterval(captureInterval); stopRecording(); return 0 } return prev - 1 })
    }, 1000)
    ;(window as any).bpCaptureInterval = captureInterval; (window as any).bpCountdownInterval = countdownInterval
  }

  const stopRecording = async () => {
    setIsRecording(false); setIsLoading(true)
    if ((window as any).bpCaptureInterval) clearInterval((window as any).bpCaptureInterval)
    if ((window as any).bpCountdownInterval) clearInterval((window as any).bpCountdownInterval)
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 60000)
      const response = await fetch("http://localhost:8000/api/v1/bp/estimate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ frames: framesRef.current, duration: 30 }), signal: controller.signal })
      clearTimeout(timeoutId)
      const data = await response.json()
      if (!response.ok) throw new Error(data.detail || "Failed to estimate blood pressure")
      setResult(data)
    } catch (err: any) { setError(err.message || "Failed to process video") }
    finally { setIsLoading(false); framesRef.current = [] }
  }

  useEffect(() => { return () => { stopCamera(); if ((window as any).bpCaptureInterval) clearInterval((window as any).bpCaptureInterval); if ((window as any).bpCountdownInterval) clearInterval((window as any).bpCountdownInterval) } }, [stopCamera])
  useEffect(() => { startCamera() }, [startCamera])

  const getBPCategory = (systolic: number, diastolic: number) => {
    if (systolic < 120 && diastolic < 80) return { label: "Normal", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" }
    if (systolic < 130 && diastolic < 80) return { label: "Elevated", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" }
    if (systolic < 140 || diastolic < 90) return { label: "Stage 1 Hypertension", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" }
    return { label: "Stage 2 Hypertension", color: "text-red-600", bg: "bg-red-50", border: "border-red-200" }
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-cyan-50/50 pt-24 pb-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl animate-breathe"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-cyan-200/30 rounded-full blur-3xl animate-breathe" style={{ animationDelay: "2s" }}></div>
        </div>

        <div className="container mx-auto px-6 max-w-4xl relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <button onClick={() => navigate(-1)} className="text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-2 group">
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Back
            </button>
            <div><h1 className="text-3xl font-bold text-slate-900">AI Blood Pressure Estimation</h1><p className="text-slate-600">Estimate your blood pressure from a 30-second face video</p></div>
          </div>

          <div className="mb-8 p-5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div><p className="text-amber-800 font-semibold mb-1">For Screening Purposes Only</p><p className="text-amber-700 text-sm">This is an experimental screening tool and should not replace professional medical diagnosis. Always consult a healthcare provider for accurate blood pressure measurement.</p></div>
          </div>

          {error && (<div className="mb-8 p-5 bg-red-50 border border-red-200 rounded-2xl text-red-600">{error}</div>)}

          {result && (
            <Card className="mb-8 p-8 bg-white/80 backdrop-blur-xl border border-slate-200 shadow-soft">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Estimated Blood Pressure</h2>
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="p-6 bg-blue-50 rounded-2xl text-center border border-blue-200"><p className="text-slate-500 text-sm mb-2">Systolic</p><p className="text-4xl font-bold text-blue-600">{result.systolic}</p><p className="text-xs text-slate-500 mt-1">mmHg</p></div>
                <div className="p-6 bg-cyan-50 rounded-2xl text-center border border-cyan-200"><p className="text-slate-500 text-sm mb-2">Diastolic</p><p className="text-4xl font-bold text-cyan-600">{result.diastolic}</p><p className="text-xs text-slate-500 mt-1">mmHg</p></div>
              </div>
              {(() => { const category = getBPCategory(result.systolic, result.diastolic); return (<div className={`p-6 rounded-2xl border ${category.bg} ${category.border} mb-6`}><p className="text-slate-500 text-sm mb-2">Category</p><p className={`text-2xl font-bold ${category.color}`}>{category.label}</p></div>) })()}
              <div className="p-6 bg-slate-50 rounded-2xl mb-6 border border-slate-200"><p className="text-slate-500 text-sm mb-2">Estimated Heart Rate</p><p className="text-3xl font-bold text-slate-900">{result.heart_rate} <span className="text-sm text-slate-500">BPM</span></p></div>
              <button onClick={() => { setResult(null); setCountdown(30); setFramesCaptured(0) }} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl shadow-glow-blue hover:shadow-medium transition-all duration-500 hover:-translate-y-1 flex items-center justify-center gap-2">
                Test Again <ChevronRight className="w-4 h-4" />
              </button>
            </Card>
          )}

          {!result && (
            <Card className="p-8 bg-white/80 backdrop-blur-xl border border-slate-200 shadow-soft">
              <div className="relative bg-slate-50 rounded-2xl overflow-hidden mb-6 border border-slate-200">
                <video ref={videoRef} autoPlay playsInline muted className={`w-full h-auto max-h-[400px] object-contain ${isRecording ? 'opacity-80' : ''}`} />
                <canvas ref={canvasRef} className="hidden" />
                {isRecording && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/50 pointer-events-none">
                    <div className="w-24 h-24 border-4 border-red-500 rounded-full flex items-center justify-center mb-4"><div className="w-20 h-20 bg-red-500 rounded-full animate-pulse"></div></div>
                    <p className="text-white text-2xl font-bold mb-2">Recording...</p>
                    <p className="text-slate-200 text-lg">Keep your face still and centered</p>
                    <p className="text-blue-400 text-5xl font-bold mt-4">{countdown}s</p>
                    <p className="text-slate-300 text-sm mt-2">Frames captured: {framesCaptured}</p>
                  </div>
                )}
                {isLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/70">
                    <Loader2 className="w-16 h-16 text-blue-500 animate-spin mb-4" />
                    <p className="text-white text-xl font-bold">Analyzing Video...</p>
                    <p className="text-slate-200">Extracting heart rate signals</p>
                  </div>
                )}
              </div>

              {!isRecording && !isLoading && (
                <div className="mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-200">
                  <h3 className="text-slate-900 font-semibold mb-4">Instructions:</h3>
                  <ul className="text-slate-600 text-sm space-y-3">
                    <li className="flex items-center gap-3"><Shield className="w-5 h-5 text-emerald-500 flex-shrink-0" /> Sit in a well-lit room</li>
                    <li className="flex items-center gap-3"><Activity className="w-5 h-5 text-blue-500 flex-shrink-0" /> Keep your face centered in the frame</li>
                    <li className="flex items-center gap-3"><Zap className="w-5 h-5 text-amber-500 flex-shrink-0" /> Remain still and avoid talking</li>
                    <li className="flex items-center gap-3"><Heart className="w-5 h-5 text-red-500 flex-shrink-0" /> Recording will take 30 seconds</li>
                  </ul>
                </div>
              )}

              <div className="flex justify-center">
                {!isRecording && !isLoading && cameraReady && (
                  <button onClick={startRecording} className="bg-blue-600 hover:bg-blue-700 px-10 py-4 text-lg text-white font-semibold rounded-2xl shadow-glow-blue hover:shadow-medium transition-all duration-500 hover:-translate-y-1 flex items-center gap-3">
                    <Camera className="w-5 h-5" /> Start Recording
                  </button>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}
