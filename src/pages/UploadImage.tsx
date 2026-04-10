import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { FileUploader } from "@/components/upload/FileUploader"
import { WebcamCapture } from "@/components/upload/WebcamCapture"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Camera, Upload, ArrowLeft, Scan, Shield, Zap, ChevronRight } from "lucide-react"
import { api } from "@/services/api"

const imageTypes = [
  { value: "xray", label: "X-Ray", icon: "🩻", description: "Bone fractures, chest, spine" },
  { value: "mri", label: "MRI Scan", icon: "🧲", description: "Brain, joints, soft tissue" },
  { value: "ct_scan", label: "CT Scan", icon: "🔬", description: "Internal organs, head, chest" },
  { value: "ultrasound", label: "Ultrasound", icon: "📡", description: "Pregnancy, abdomen, heart" },
  { value: "skin", label: "Skin Condition", icon: "🧴", description: "Rashes, moles, lesions" },
  { value: "wound", label: "Wound/Injury", icon: "🩹", description: "Cuts, burns, swelling" },
  { value: "oral", label: "Dental/Oral", icon: "🦷", description: "Teeth, gums, mouth" },
  { value: "eye", label: "Eye Condition", icon: "👁️", description: "Redness, swelling, injury" },
  { value: "posture", label: "Posture/Spine", icon: "🧍", description: "Back pain, alignment" },
  { value: "ecg", label: "ECG/EKG", icon: "💓", description: "Heart rhythm printout" },
  { value: "endoscopy", label: "Endoscopy", icon: "🔍", description: "Internal organ images" },
  { value: "other", label: "Other", icon: "📋", description: "Other medical images" },
]

const specialists = [
  { value: "cardiologist-specialist", label: "Cardiologist" },
  { value: "dermatologist-specialist", label: "Dermatologist" },
  { value: "orthopedic-specialist", label: "Orthopedic Surgeon" },
  { value: "dentist-specialist", label: "Dentist" },
  { value: "eye-specialist", label: "Eye Specialist" },
  { value: "general-physician", label: "General Physician" },
]

export default function UploadImage() {
  const navigate = useNavigate()
  const [selectedImageType, setSelectedImageType] = useState("skin")
  const [selectedSpecialist, setSelectedSpecialist] = useState("dermatologist-specialist")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [showWebcam, setShowWebcam] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleUpload = async () => {
    if (!selectedFile) { setError("Please select a file first"); return }
    setIsUploading(true); setError(null)
    try {
      const result = await api.images.upload(selectedFile, selectedImageType, selectedSpecialist)
      navigate(`/analysis/image/${result.image_id}`)
    } catch (err: any) { setError(err.message || "Upload failed") }
    finally { setIsUploading(false) }
  }

  const handleWebcamCapture = (imageData: string) => {
    const byteString = atob(imageData.split(",")[1])
    const mimeString = imageData.split(",")[0].split(":")[1].split(";")[0]
    const ab = new ArrayBuffer(byteString.length)
    const ia = new Uint8Array(ab)
    for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i)
    const blob = new Blob([ab], { type: mimeString })
    setSelectedFile(new File([blob], "webcam-capture.jpg", { type: mimeString }))
    setShowWebcam(false)
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-cyan-50/50 pt-24 pb-12 relative overflow-hidden">
        {/* Background Layers */}
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl animate-breathe"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-cyan-200/30 rounded-full blur-3xl animate-breathe" style={{ animationDelay: "2s" }}></div>
        </div>

        <div className="container mx-auto px-6 max-w-5xl relative z-10">
          {/* Back Button */}
          <button onClick={() => navigate(-1)} className="mb-6 text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-2 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back
          </button>

          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full text-blue-600 text-xs font-semibold uppercase tracking-wider mb-4"><Scan className="w-3 h-3" /> AI Image Analysis</div>
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-3">Upload Medical <span className="text-gradient">Image</span></h1>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">Upload or capture an image for AI-powered analysis with instant diagnostics</p>
          </div>

          {/* AI Status Bar */}
          <div className="flex items-center justify-center gap-6 mb-10">
            {[{ icon: <Shield className="w-4 h-4 text-emerald-500" />, label: "Secure Upload" }, { icon: <Zap className="w-4 h-4 text-amber-500" />, label: "Instant Analysis" }, { icon: <Scan className="w-4 h-4 text-blue-600" />, label: "AI-Powered" }].map((item, i) => (
              <div key={i} className="flex items-center gap-2">{item.icon}<span className="text-slate-500 text-sm font-medium">{item.label}</span></div>
            ))}
          </div>

          {/* Image Type Selection - Premium Grid */}
          <Card className="p-8 bg-white/80 backdrop-blur-xl border border-slate-200 mb-6 shadow-soft">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Select Image Type</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {imageTypes.map((type) => (
                <button key={type.value} onClick={() => setSelectedImageType(type.value)} className={`group p-5 rounded-2xl border-2 transition-all duration-500 hover:-translate-y-1 text-left ${selectedImageType === type.value ? "border-blue-500 bg-blue-50 shadow-glow-blue" : "border-slate-200 hover:border-slate-300 bg-white hover:bg-blue-50/30"}`}>
                  <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-500">{type.icon}</div>
                  <p className="text-slate-900 font-semibold text-sm mb-1">{type.label}</p>
                  <p className="text-slate-500 text-xs">{type.description}</p>
                </button>
              ))}
            </div>
          </Card>

          {/* Specialist Selection */}
          <Card className="p-8 bg-white/80 backdrop-blur-xl border border-slate-200 mb-6 shadow-soft">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Select Specialist</h3>
            <select value={selectedSpecialist} onChange={(e) => setSelectedSpecialist(e.target.value)} className="w-full px-4 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-soft">
              {specialists.map((spec) => (<option key={spec.value} value={spec.value}>{spec.label}</option>))}
            </select>
          </Card>

          {/* File Upload */}
          <Card className="p-8 bg-white/80 backdrop-blur-xl border border-slate-200 mb-6 shadow-soft">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">Upload Image</h3>
              <Button onClick={() => setShowWebcam(true)} variant="outline" className="border-blue-300 text-blue-600 hover:bg-blue-50 transition-all rounded-xl">
                <Camera className="w-4 h-4 mr-2" /> Use Webcam
              </Button>
            </div>
            <FileUploader onFileSelect={setSelectedFile} acceptedTypes={["image/png", "image/jpeg", "image/webp"]} label="Drag & drop or click to browse" />
          </Card>

          {/* Error Message */}
          {error && (<div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6"><p className="text-red-600">{error}</p></div>)}

          {/* Upload Button */}
          <button onClick={handleUpload} disabled={!selectedFile || isUploading} className="w-full py-5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-2xl shadow-glow-blue hover:shadow-medium transition-all duration-500 hover:-translate-y-1 flex items-center justify-center gap-3 text-lg">
            <Upload className="w-5 h-5" /> {isUploading ? "Uploading..." : "Upload & Analyze"}
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      {showWebcam && (<WebcamCapture onCapture={handleWebcamCapture} onClose={() => setShowWebcam(false)} />)}
      <Footer />
    </>
  )
}
