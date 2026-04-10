import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { FileUploader } from "@/components/upload/FileUploader"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, ArrowLeft, FileText, Shield, Zap, Scan, ChevronRight } from "lucide-react"
import { api } from "@/services/api"

const reportTypes = [
  { value: "blood", label: "Blood Test (CBC)", icon: "🩸" },
  { value: "urine", label: "Urine Analysis", icon: "🧪" },
  { value: "liver", label: "Liver Function (LFT)", icon: "🫁" },
  { value: "kidney", label: "Kidney Function (KFT)", icon: "🫘" },
  { value: "thyroid", label: "Thyroid Panel", icon: "🦋" },
  { value: "lipid", label: "Lipid Profile", icon: "❤️" },
  { value: "diabetes", label: "Diabetes (HbA1c)", icon: "🍬" },
  { value: "hormone", label: "Hormone Panel", icon: "⚗️" },
  { value: "allergy", label: "Allergy Test", icon: "🤧" },
  { value: "vitamin", label: "Vitamin Panel", icon: "💊" },
  { value: "cardiac", label: "Cardiac Markers", icon: "💓" },
  { value: "general", label: "General Health", icon: "📋" },
]

const specialists = [
  { value: "general-physician", label: "General Physician" },
  { value: "cardiologist-specialist", label: "Cardiologist" },
  { value: "nutritionist-specialist", label: "Nutritionist" },
  { value: "pharmacy-assistant", label: "Pharmacy Assistant" },
  { value: "endocrinologist", label: "Endocrinologist" },
  { value: "nephrologist", label: "Nephrologist" },
]

export default function UploadReport() {
  const navigate = useNavigate()
  const [selectedReportType, setSelectedReportType] = useState("blood")
  const [selectedSpecialist, setSelectedSpecialist] = useState("general-physician")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleUpload = async () => {
    if (!selectedFile) { setError("Please select a file first"); return }
    setIsUploading(true); setError(null)
    try {
      const result = await api.reports.upload(selectedFile, selectedSpecialist)
      navigate(`/analysis/report/${result.report_id || "temp-id"}`)
    } catch (err: any) { setError(err.message || "Upload failed") }
    finally { setIsUploading(false) }
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
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full text-blue-600 text-xs font-semibold uppercase tracking-wider mb-4"><FileText className="w-3 h-3" /> AI Report Analysis</div>
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-3">Upload Medical <span className="text-gradient">Report</span></h1>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">Upload a PDF or image report for AI-powered analysis with instant diagnostics</p>
          </div>

          {/* AI Status Bar */}
          <div className="flex items-center justify-center gap-6 mb-10">
            {[{ icon: <Shield className="w-4 h-4 text-emerald-500" />, label: "Secure Upload" }, { icon: <Zap className="w-4 h-4 text-amber-500" />, label: "OCR + AI Analysis" }, { icon: <Scan className="w-4 h-4 text-blue-600" />, label: "Smart Reports" }].map((item, i) => (
              <div key={i} className="flex items-center gap-2">{item.icon}<span className="text-slate-500 text-sm font-medium">{item.label}</span></div>
            ))}
          </div>

          {/* Report Type Selection - Premium Grid */}
          <Card className="p-8 bg-white/80 backdrop-blur-xl border border-slate-200 mb-6 shadow-soft">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Select Report Type</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {reportTypes.map((type) => (
                <button key={type.value} onClick={() => setSelectedReportType(type.value)} className={`group p-5 rounded-2xl border-2 transition-all duration-500 hover:-translate-y-1 text-left ${selectedReportType === type.value ? "border-blue-500 bg-blue-50 shadow-glow-blue" : "border-slate-200 hover:border-slate-300 bg-white hover:bg-blue-50/30"}`}>
                  <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-500">{type.icon}</div>
                  <p className="text-slate-900 font-semibold text-sm">{type.label}</p>
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
            <FileUploader onFileSelect={setSelectedFile} acceptedTypes={["application/pdf", "image/png", "image/jpeg"]} label="Upload PDF or Image Report" />
          </Card>

          {/* Error Message */}
          {error && (<div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6"><p className="text-red-600">{error}</p></div>)}

          {/* Upload Button */}
          <button onClick={handleUpload} disabled={!selectedFile || isUploading} className="w-full py-5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-2xl shadow-glow-blue hover:shadow-medium transition-all duration-500 hover:-translate-y-1 flex items-center justify-center gap-3 text-lg">
            <Upload className="w-5 h-5" /> {isUploading ? "Uploading..." : "Upload & Analyze Report"}
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      <Footer />
    </>
  )
}
