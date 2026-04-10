import { Card } from "@/components/ui/card"
import { FileText, CheckCircle, AlertCircle, Info, Eye, Shield, Heart, Activity, Image as ImageIcon, Zap, Scan } from "lucide-react"
import ReactMarkdown from "react-markdown"

interface ImageAnalysisData { analysis_text?: string; image_type?: string; specialist_type?: string; error?: string }
interface ImageAnalysisViewerProps { analysisData: ImageAnalysisData; imageUrl?: string; fileName?: string }

export const ImageAnalysisViewer: React.FC<ImageAnalysisViewerProps> = ({ analysisData, imageUrl, fileName }) => {
  const getTypeIcon = () => {
    const type = analysisData.image_type?.toLowerCase() || ""
    switch (type) {
      case "xray": case "mri": case "ct_scan": return <Activity className="w-5 h-5 text-blue-600" />
      case "skin": case "wound": return <Eye className="w-5 h-5 text-blue-600" />
      case "ecg": return <Heart className="w-5 h-5 text-blue-600" />
      default: return <Shield className="w-5 h-5 text-blue-600" />
    }
  }

  const getImageTypeLabel = () => {
    const type = analysisData.image_type?.toLowerCase() || ""
    const labels: Record<string, string> = { "xray": "X-Ray", "mri": "MRI Scan", "ct_scan": "CT Scan", "ultrasound": "Ultrasound", "skin": "Skin Condition", "wound": "Wound/Injury", "oral": "Dental/Oral", "eye": "Eye Condition", "posture": "Posture/Spine", "ecg": "ECG/EKG", "endoscopy": "Endoscopy", "other": "Medical Image" }
    return labels[type] || "Medical Image"
  }

  if (!analysisData.analysis_text && !analysisData.error) {
    return (<Card className="p-8 bg-white/80 backdrop-blur-xl border border-slate-200 shadow-soft"><div className="text-center py-8 text-slate-500"><Info className="w-8 h-8 mx-auto mb-2 text-slate-400" /><p>No analysis results available</p></div></Card>)
  }

  return (
    <div className="space-y-8">
      {/* AI Status Bar */}
      <div className="flex items-center justify-between p-5 bg-blue-50 border border-blue-200 rounded-xl">
        <div className="flex items-center gap-3"><div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div><span className="text-blue-600 text-sm font-semibold">AI Image Analysis Complete</span></div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs text-slate-500"><Shield className="w-3.5 h-3.5 text-emerald-500" /><span>Secure</span></div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500"><Zap className="w-3.5 h-3.5 text-amber-500" /><span>AI-Powered</span></div>
        </div>
      </div>

      {/* Image Preview */}
      {imageUrl && (
        <Card className="p-8 bg-white/80 backdrop-blur-xl border border-slate-200 shadow-soft">
          <div className="flex items-center gap-2 mb-6"><ImageIcon className="w-5 h-5 text-blue-600" /><h3 className="text-lg font-semibold text-slate-900">Uploaded Image</h3></div>
          <div className="bg-slate-50 rounded-xl overflow-hidden border border-slate-200"><img src={imageUrl} alt={fileName || "Medical image"} className="w-full h-auto max-h-[500px] object-contain" /></div>
          {fileName && <p className="text-sm text-slate-500 mt-3">{fileName}</p>}
        </Card>
      )}

      {/* Analysis Results */}
      {analysisData.analysis_text ? (
        <Card className="p-8 bg-white/80 backdrop-blur-xl border border-slate-200 shadow-soft">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-200">{getTypeIcon()}</div>
            <div><h3 className="text-lg font-semibold text-slate-900">{getImageTypeLabel()} Analysis Report</h3><p className="text-sm text-slate-500">AI-Powered Medical Report</p></div>
          </div>
          <div className="prose prose-slate max-w-none [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:text-slate-900 [&>h1]:mt-8 [&>h1]:mb-4 [&>h1]:pb-2 [&>h1]:border-b-2 [&>h1]:border-blue-200 [&>h2]:text-xl [&>h2]:font-semibold [&>h2]:text-slate-900 [&>h2]:mt-6 [&>h2]:mb-3 [&>h2]:flex [&>h2]:items-center [&>h2]:gap-2 [&>h3]:text-base [&>h3]:font-semibold [&>h3]:text-slate-800 [&>h3]:mt-5 [&>h3]:mb-2 [&>p]:text-slate-700 [&>p]:leading-relaxed [&>p]:mb-3 [&>ul]:list-none [&>ul]:space-y-2 [&>ul]:mb-4 [&>ul]:text-slate-700 [&>ol]:list-decimal [&>ol]:list-inside [&>ol]:space-y-2 [&>ol]:mb-4 [&>ol]:text-slate-700 [&>li]:flex [&>li]:items-start [&>li]:gap-2 [&>li]:ml-4 [&>strong]:font-semibold [&>strong]:text-slate-900 [&>blockquote]:border-l-4 [&>blockquote]:border-blue-500 [&>blockquote]:pl-4 [&>blockquote]:py-3 [&>blockquote]:bg-blue-50 [&>blockquote]:rounded-r [&>blockquote]:text-slate-700 [&>blockquote]:italic [&>blockquote]:my-4 [&>code]:bg-slate-100 [&>code]:px-2 [&>code]:py-0.5 [&>code]:rounded [&>code]:text-sm [&>code]:font-mono [&>code]:text-slate-800 [&>hr]:my-6 [&>hr]:border-slate-200 [&>table]:min-w-full [&>table]:divide-y [&>table]:divide-slate-200 [&>table]:border [&>table]:border-slate-200 [&>table]:my-4 [&>th]:px-4 [&>th]:py-2 [&>th]:bg-slate-50 [&>th]:text-left [&>th]:text-xs [&>th]:font-medium [&>th]:text-slate-600 [&>th]:uppercase [&>th]:tracking-wider [&>th]:border-b [&>th]:border-slate-200 [&>td]:px-4 [&>td]:py-2 [&>td]:text-sm [&>td]:text-slate-700 [&>td]:border-b [&>td]:border-slate-100">
            <ReactMarkdown>{analysisData.analysis_text}</ReactMarkdown>
          </div>
        </Card>
      ) : analysisData.error ? (
        <Card className="p-8 bg-red-50 border border-red-200 shadow-soft">
          <div className="flex items-center gap-2 mb-4"><AlertCircle className="w-5 h-5 text-red-600" /><h3 className="text-lg font-semibold text-red-800">Analysis Error</h3></div>
          <p className="text-red-700">{analysisData.error}</p>
        </Card>
      ) : null}

      {/* Disclaimer */}
      <Card className="p-8 bg-amber-50 border border-amber-200 shadow-soft">
        <div className="flex items-start gap-3"><AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" /><div><h4 className="font-semibold text-amber-800 mb-2">Medical Disclaimer</h4><p className="text-sm text-amber-700 leading-relaxed">This analysis is generated by AI and is for informational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult with a qualified healthcare provider for medical concerns.</p></div></div>
      </Card>
    </div>
  )
}
