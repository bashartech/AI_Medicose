import React, { useRef, useState, useEffect, useCallback } from "react"
import { Camera, RotateCcw, Check, X, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface WebcamCaptureProps { onCapture: (imageData: string) => void; onClose: () => void }

export const WebcamCapture: React.FC<WebcamCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    const startCamera = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error("Your browser doesn't support camera access")
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: false })
        if (isMounted && videoRef.current) {
          streamRef.current = stream
          videoRef.current.srcObject = stream
          videoRef.current.onloadedmetadata = () => { if (isMounted) { videoRef.current?.play(); setIsLoading(false) } }
        }
      } catch (err: any) {
        if (isMounted) {
          if (err.name === 'NotAllowedError') setError("Camera permission denied. Please allow camera access in your browser.")
          else if (err.name === 'NotFoundError') setError("No camera found on this device.")
          else setError(`Camera error: ${err.message}`)
          setIsLoading(false)
        }
      }
    }
    startCamera()
    return () => { isMounted = false; if (streamRef.current) { streamRef.current.getTracks().forEach(track => track.stop()) } }
  }, [])

  const capture = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0)
        const imageData = canvas.toDataURL('image/jpeg', 0.9)
        setCapturedImage(imageData)
        if (streamRef.current) { streamRef.current.getTracks().forEach(track => track.stop()) }
      }
    }
  }

  const retake = async () => {
    setCapturedImage(null); setError(null); setIsLoading(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: false })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => { videoRef.current?.play(); setIsLoading(false) }
      }
    } catch (err: any) { setError("Failed to restart camera: " + err.message); setIsLoading(false) }
  }

  const confirmCapture = () => { if (capturedImage) { onCapture(capturedImage); handleClose() } }
  const handleClose = () => { if (streamRef.current) { streamRef.current.getTracks().forEach(track => track.stop()) }; onClose() }

  return (
    <div className="fixed inset-0 bg-slate-900/90 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-large">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2"><Camera className="w-6 h-6 text-blue-600" /> Capture Image</h3>
          <Button variant="ghost" size="icon" onClick={handleClose} className="text-slate-400 hover:text-slate-700 rounded-xl"><X className="w-5 h-5" /></Button>
        </div>

        {/* Video/Image Area */}
        <div className="relative bg-slate-50 rounded-xl overflow-hidden mb-5 border border-slate-200">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-80">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-slate-600">Starting camera...</p>
              <p className="text-slate-400 text-sm mt-2">Please allow camera access if prompted</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-80 p-6">
              <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
              <p className="text-red-600 text-center mb-4">{error}</p>
              <Button onClick={retake} variant="outline" className="rounded-xl"><RotateCcw className="w-4 h-4 mr-2" /> Try Again</Button>
            </div>
          ) : !capturedImage ? (
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-auto max-h-[400px] object-contain" />
          ) : (
            <img src={capturedImage} alt="Captured" className="w-full h-auto max-h-[400px] object-contain" />
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Buttons */}
        <div className="flex justify-center gap-4">
          {!capturedImage && !error && !isLoading ? (
            <><Button onClick={capture} className="bg-blue-600 hover:bg-blue-700 rounded-xl px-8"><Camera className="w-5 h-5 mr-2" /> Capture</Button><Button variant="outline" onClick={handleClose} className="rounded-xl"><X className="w-5 h-5 mr-2" /> Cancel</Button></>
          ) : capturedImage ? (
            <><Button onClick={retake} variant="outline" className="rounded-xl"><RotateCcw className="w-5 h-5 mr-2" /> Retake</Button><Button onClick={confirmCapture} className="bg-blue-600 hover:bg-blue-700 rounded-xl px-8"><Check className="w-5 h-5 mr-2" /> Use This Image</Button></>
          ) : null}
        </div>
      </div>
    </div>
  )
}
