import React, { useRef, useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { Camera, Loader2, AlertTriangle, ChevronLeft, Eye, Activity, Shield, Zap, Heart, Brain, Droplets, CheckCircle, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Header from "@/components/Header"
import Footer from "@/components/Footer"

export default function EyeScanNeurological() {
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
    ;(window as any).eyeCaptureInterval = captureInterval; (window as any).eyeCountdownInterval = countdownInterval
  }

  const stopRecording = async () => {
    setIsRecording(false); setIsLoading(true)
    if ((window as any).eyeCaptureInterval) clearInterval((window as any).eyeCaptureInterval)
    if ((window as any).eyeCountdownInterval) clearInterval((window as any).eyeCountdownInterval)
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 60000)
      const response = await fetch("http://localhost:8000/api/v1/eye-scan/neurological", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ frames: framesRef.current, duration: 30 }), signal: controller.signal })
      clearTimeout(timeoutId)
      const data = await response.json()
      if (!response.ok) throw new Error(data.detail || "Failed to analyze eye movements")
      if (!data.success) throw new Error(data.error || "Analysis failed")
      setResult(data)
    } catch (err: any) { 
      if (err.name === 'AbortError') setError("Analysis timed out. Please try again with better lighting.")
      else setError(err.message || "Failed to process video") 
    }
    finally { setIsLoading(false); framesRef.current = [] }
  }

  useEffect(() => { return () => { stopCamera(); if ((window as any).eyeCaptureInterval) clearInterval((window as any).eyeCaptureInterval); if ((window as any).eyeCountdownInterval) clearInterval((window as any).eyeCountdownInterval) } }, [stopCamera])
  useEffect(() => { startCamera() }, [startCamera])

  const getRiskLevel = (score: number) => {
    if (score < 30) return { label: "Low Risk", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" }
    if (score < 60) return { label: "Moderate Risk", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" }
    return { label: "High Risk", color: "text-red-600", bg: "bg-red-50", border: "border-red-200" }
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
            <div><h1 className="text-3xl font-bold text-slate-900">Neurological Eye Scan</h1><p className="text-slate-600">Screen for neurological disorders through eye movement analysis</p></div>
          </div>

          <div className="mb-8 p-5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div><p className="text-amber-800 font-semibold mb-1">For Screening Purposes Only</p><p className="text-amber-700 text-sm">This is an experimental screening tool and should not replace professional neurological diagnosis. Always consult a neurologist for accurate assessment.</p></div>
          </div>

          {error && (<div className="mb-8 p-5 bg-red-50 border border-red-200 rounded-2xl text-red-600">{error}</div>)}

          {result && result.success && (
            <Card className="mb-8 p-8 bg-white/80 backdrop-blur-xl border border-slate-200 shadow-soft">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Neurological Screening Results</h2>
              
              {/* Overall Score */}
              {(() => { 
                const risk = getRiskLevel(100 - result.overall_score); 
                return (
                  <div className={`p-6 rounded-2xl border ${risk.bg} ${risk.border} mb-8`}>
                    <p className="text-slate-500 text-sm mb-2">Overall Health Score</p>
                    <p className={`text-4xl font-bold ${risk.color}`}>{result.overall_score}/100</p>
                    <p className="text-slate-500 text-sm mt-2">Risk Level: {risk.label}</p>
                  </div>
                ); 
              })()}
              
              {/* Movement Metrics */}
              {result.movement_metrics && (
                <div className="grid grid-cols-3 gap-6 mb-8">
                  <div className="p-6 bg-blue-50 rounded-2xl text-center border border-blue-200">
                    <p className="text-slate-500 text-sm mb-2">Saccade Speed</p>
                    <p className="text-3xl font-bold text-blue-600">{result.movement_metrics.saccade_speed || 'N/A'}</p>
                    <p className="text-xs text-slate-500 mt-1">degrees/sec</p>
                  </div>
                  <div className="p-6 bg-purple-50 rounded-2xl text-center border border-purple-200">
                    <p className="text-slate-500 text-sm mb-2">Blink Rate</p>
                    <p className="text-3xl font-bold text-purple-600">{result.movement_metrics.blink_rate || 'N/A'}</p>
                    <p className="text-xs text-slate-500 mt-1">blinks/min</p>
                  </div>
                  <div className="p-6 bg-cyan-50 rounded-2xl text-center border border-cyan-200">
                    <p className="text-slate-500 text-sm mb-2">Gaze Stability</p>
                    <p className="text-3xl font-bold text-cyan-600">{result.movement_metrics.gaze_stability || 'N/A'}%</p>
                    <p className="text-xs text-slate-500 mt-1">stability</p>
                  </div>
                </div>
              )}

              {/* Health Assessment Summary */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {result.fatigue_level && (<div className="p-4 bg-slate-50 rounded-xl border border-slate-200"><p className="text-xs text-slate-500 mb-1">Fatigue</p><p className="text-sm font-semibold text-slate-900">{result.fatigue_level}</p></div>)}
                {result.sleep_level && (<div className="p-4 bg-slate-50 rounded-xl border border-slate-200"><p className="text-xs text-slate-500 mb-1">Sleep Quality</p><p className="text-sm font-semibold text-slate-900">{result.sleep_level}</p></div>)}
                {result.stress_level && (<div className="p-4 bg-slate-50 rounded-xl border border-slate-200"><p className="text-xs text-slate-500 mb-1">Stress Level</p><p className="text-sm font-semibold text-slate-900">{result.stress_level}</p></div>)}
                {result.hydration_level && (<div className="p-4 bg-slate-50 rounded-xl border border-slate-200"><p className="text-xs text-slate-500 mb-1">Hydration</p><p className="text-sm font-semibold text-slate-900">{result.hydration_level}</p></div>)}
                {result.liver_risk && (<div className="p-4 bg-slate-50 rounded-xl border border-slate-200"><p className="text-xs text-slate-500 mb-1">Liver Risk</p><p className="text-sm font-semibold text-slate-900">{result.liver_risk}</p></div>)}
                {result.neurological_risk && (<div className="p-4 bg-slate-50 rounded-xl border border-slate-200"><p className="text-xs text-slate-500 mb-1">Neurological Risk</p><p className="text-sm font-semibold text-slate-900">{result.neurological_risk}</p></div>)}
              </div>

              {/* Issues Detected */}
              {result.issues && result.issues.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-slate-900 font-semibold mb-4 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-amber-500" /> Issues Detected</h3>
                  <div className="space-y-3">{result.issues.map((issue: string, index: number) => (<div key={index} className="p-4 bg-amber-50 rounded-xl text-sm text-amber-800 border border-amber-200">{issue}</div>))}</div>
                </div>
              )}

              {/* Recommendations */}
              {result.recommendations && result.recommendations.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-slate-900 font-semibold mb-4 flex items-center gap-2"><CheckCircle className="w-5 h-5 text-emerald-500" /> Recommendations</h3>
                  <div className="space-y-3">{result.recommendations.map((rec: string, index: number) => (<div key={index} className="p-4 bg-emerald-50 rounded-xl text-sm text-emerald-800 border border-emerald-200">{rec}</div>))}</div>
                </div>
              )}

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
                    <div className="absolute top-4 left-4 flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div><p className="text-white text-sm font-medium">Recording...</p></div>
                    <p className="text-blue-400 text-5xl font-bold">{countdown}s</p>
                    <p className="text-slate-200 text-sm mt-2">Look directly at the camera</p>
                    <p className="text-slate-300 text-xs mt-1">Frames captured: {framesCaptured}</p>
                  </div>
                )}
                {isLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/70">
                    <Loader2 className="w-16 h-16 text-blue-500 animate-spin mb-4" />
                    <p className="text-white text-xl font-bold">Analyzing Eye Movements...</p>
                    <p className="text-slate-200">Detecting neurological patterns</p>
                  </div>
                )}
              </div>

              {!isRecording && !isLoading && (
                <div className="mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-200">
                  <h3 className="text-slate-900 font-semibold mb-4">What We Analyze:</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[{ icon: <Heart className="w-5 h-5 text-red-500" />, label: "Fatigue Level" }, { icon: <Activity className="w-5 h-5 text-blue-500" />, label: "Sleep Quality" }, { icon: <Droplets className="w-5 h-5 text-cyan-500" />, label: "Hydration" }, { icon: <Brain className="w-5 h-5 text-purple-500" />, label: "Stress Level" }, { icon: <Shield className="w-5 h-5 text-amber-500" />, label: "Neurological Risk" }, { icon: <Eye className="w-5 h-5 text-emerald-500" />, label: "Liver Indicators" }].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-slate-600 text-sm">{item.icon}<span>{item.label}</span></div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-center">
                {!isRecording && !isLoading && cameraReady && (
                  <button onClick={startRecording} className="bg-blue-600 hover:bg-blue-700 px-10 py-4 text-lg text-white font-semibold rounded-2xl shadow-glow-blue hover:shadow-medium transition-all duration-500 hover:-translate-y-1 flex items-center gap-3">
                    <Eye className="w-5 h-5" /> Start Health Scan
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
