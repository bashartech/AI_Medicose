import React, { useState, useCallback } from "react"
import { Upload, X, FileText, CheckCircle, Scan, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

interface FileUploaderProps {
  onFileSelect: (file: File) => void
  acceptedTypes?: string[]
  maxSizeMB?: number
  label?: string
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFileSelect,
  acceptedTypes = ["application/pdf", "image/png", "image/jpeg"],
  maxSizeMB = 10,
  label = "Upload Medical Report",
}) => {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  const validateFile = (file: File): boolean => {
    if (!acceptedTypes.includes(file.type)) {
      setError(`File type not allowed. Accepted: ${acceptedTypes.join(", ")}`)
      return false
    }
    const maxSize = maxSizeMB * 1024 * 1024
    if (file.size > maxSize) {
      setError(`File size exceeds ${maxSizeMB}MB limit`)
      return false
    }
    return true
  }

  const handleFile = useCallback((file: File) => {
    setError(null)
    if (validateFile(file)) {
      setSelectedFile(file)
      onFileSelect(file)
      setUploadProgress(0)
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) { clearInterval(interval); return 100 }
          return prev + 10
        })
      }, 100)
    }
  }, [onFileSelect])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true)
    else if (e.type === "dragleave") setDragActive(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0])
  }, [handleFile])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) handleFile(e.target.files[0])
  }, [handleFile])

  const handleRemove = () => { setSelectedFile(null); setError(null); setUploadProgress(0) }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <label className="block text-sm font-semibold text-slate-700 mb-2">{label}</label>

      {!selectedFile ? (
        <div className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-700 ${dragActive ? "border-blue-500 bg-blue-50 shadow-glow-blue" : "border-slate-300 hover:border-blue-400 bg-white hover:bg-blue-50/30"}`} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}>
          <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleChange} accept={acceptedTypes.join(",")} />
          
          {/* Scanning Animation */}
          {dragActive && (
            <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
              <div className="w-full h-8 bg-scan-line animate-scan opacity-40"></div>
            </div>
          )}

          <div className="relative z-10">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-blue-200 shadow-soft">
              <Upload className="w-10 h-10 text-blue-600" />
            </div>
            <p className="text-slate-700 mb-2 font-semibold text-lg">Drag and drop your file here</p>
            <p className="text-sm text-slate-500 mb-4">or click to browse</p>
            <p className="text-xs text-slate-400 mb-4">{acceptedTypes.includes("application/pdf") ? "PDF, " : ""}PNG, or JPG (max {maxSizeMB}MB)</p>
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                <span>Secure Upload</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Scan className="w-3.5 h-3.5 text-blue-600" />
                <span>AI Analysis</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-5 flex items-center justify-between border border-slate-200 shadow-soft hover-lift">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl flex items-center justify-center border border-blue-200">
              <FileText className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <p className="text-slate-900 font-semibold">{selectedFile.name}</p>
              <p className="text-sm text-slate-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="flex items-center gap-3">
                <Progress value={uploadProgress} className="w-32" />
                <span className="text-xs text-slate-500 font-medium">{uploadProgress}%</span>
              </div>
            )}
            {uploadProgress === 100 && <CheckCircle className="w-7 h-7 text-emerald-500 animate-pulse-soft" />}
            <Button variant="ghost" size="icon" onClick={handleRemove} className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      )}

      {error && <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-4">{error}</p>}
    </div>
  )
}
