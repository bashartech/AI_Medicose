import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, FileText, AlertCircle, CheckCircle, Activity, Heart, User, Download, Shield, Zap, Scan, ChevronRight } from "lucide-react"
import { api } from "@/services/api"
import { ReportViewer } from "@/components/analysis/ReportViewer"
import { ImageAnalysisViewer } from "@/components/analysis/ImageAnalysisViewer"

function generateReportContent(analysis: any): string {
  if (!analysis) return "No data available"
  let content = "MEDICAL REPORT ANALYSIS\n" + "=".repeat(50) + "\n\n"
  if (analysis.structured_data?.patient_info) {
    const p = analysis.structured_data.patient_info
    if (p.name) content += `Patient Name: ${p.name}\n`
    if (p.age_gender) content += `Age/Gender: ${p.age_gender}\n`
  }
  content += `\nFile Name: ${analysis.file_name || "N/A"}\nFile Type: ${analysis.file_type || "N/A"}\nFile Size: ${(analysis.file_size / 1024 / 1024).toFixed(2)} MB\nStatus: ${analysis.status}\n\n`
  if (analysis.structured_data?.sections) {
    for (const section of analysis.structured_data.sections) {
      content += `${section.name}\n` + "-".repeat(50) + "\nTest Name | Your Value | Reference Range | Unit | Status\n" + "-".repeat(50) + "\n"
      for (const test of section.tests || []) content += `${test.name} | ${test.value} | ${test.ref_range} | ${test.unit} | ${test.status_label}\n`
      content += "\n"
    }
  }
  const abnormal = analysis.structured_data?.all_tests?.filter((t: any) => t.status !== "normal") || []
  if (abnormal.length > 0) {
    content += "ATTENTION REQUIRED - Abnormal Results\n" + "=".repeat(50) + "\n"
    for (const test of abnormal) { content += `• ${test.name}: ${test.value} ${test.unit} (${test.status_label})\n`; if (test.ref_range) content += `  Normal Range: ${test.ref_range}\n` }
    content += "\n"
  }
  content += "\n" + "=".repeat(50) + "\nDisclaimer: This report is AI-generated and for informational purposes only.\nAlways consult with a qualified healthcare professional for medical advice.\n" + `Generated on: ${new Date().toLocaleString()}\n`
  return content
}

function downloadReport(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `${filename.replace(/\.[^/.]+$/, "")}-analysis.txt`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export default function AnalysisResults() {
  const { type, id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [analysis, setAnalysis] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadAnalysis = async () => {
      setLoading(true); setError(null)
      try {
        let data
        if (type === "report") data = await api.reports.get(id || "")
        else if (type === "image") data = await api.images.get(id || "")
        if (data && data.id) setAnalysis(data)
        else setError("Analysis data not found.")
      } catch (err: any) { console.error("Error loading analysis:", err); setError(err.message || "Failed to load analysis") }
      finally { setLoading(false) }
    }
    if (id) loadAnalysis()
  }, [type, id])

  if (loading) return (<><Header /><div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-cyan-50/50 pt-24 pb-12"><div className="container mx-auto px-6 max-w-6xl"><div className="animate-pulse space-y-6"><div className="h-8 bg-slate-200 rounded w-1/3"></div><div className="grid grid-cols-1 md:grid-cols-4 gap-4">{[1, 2, 3, 4].map(i => (<div key={i} className="h-24 bg-slate-200 rounded-2xl"></div>))}</div><div className="h-64 bg-slate-200 rounded-2xl"></div></div></div></div><Footer /></>)

  if (error) return (<><Header /><div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-cyan-50/50 pt-24 pb-12"><div className="container mx-auto px-6 max-w-6xl"><div className="bg-red-50 border border-red-200 rounded-2xl p-8"><AlertCircle className="w-10 h-10 text-red-500 mb-4" /><h2 className="text-2xl font-bold text-red-700 mb-2">Error Loading Analysis</h2><p className="text-slate-600 mb-6">{error}</p><Button onClick={() => navigate(-1)} className="bg-red-600 hover:bg-red-700 rounded-xl">Go Back</Button></div></div></div><Footer /></>)

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-cyan-50/50 pt-24 pb-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl animate-breathe"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-cyan-200/30 rounded-full blur-3xl animate-breathe" style={{ animationDelay: "2s" }}></div>
        </div>

        <div className="container mx-auto px-6 max-w-6xl relative z-10">
          <div className="flex items-center justify-between mb-8">
            <button onClick={() => navigate(-1)} className="text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-2 group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back
            </button>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-emerald-500" /><span className="text-slate-500 text-sm">Secure Analysis</span></div>
              <div className="flex items-center gap-2"><Zap className="w-4 h-4 text-amber-500" /><span className="text-slate-500 text-sm">AI-Powered</span></div>
            </div>
          </div>

          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full text-blue-600 text-xs font-semibold uppercase tracking-wider mb-4"><Scan className="w-3 h-3" /> AI Analysis Complete</div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-2">{type === "report" ? "Medical Report Analysis" : "Image Analysis"}</h1>
            <p className="text-slate-600">{analysis?.file_name || "Analysis results"} • {analysis?.file_type}</p>
          </div>

          {analysis && (
            <div className="space-y-8">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { icon: <FileText className="w-6 h-6 text-blue-600" />, label: "Report Type", value: analysis.report_type || type, bg: "bg-blue-50" },
                  { icon: <CheckCircle className="w-6 h-6 text-emerald-600" />, label: "Status", value: analysis.status, bg: "bg-emerald-50" },
                  { icon: <Activity className="w-6 h-6 text-purple-600" />, label: "File Size", value: `${(analysis.file_size / 1024 / 1024).toFixed(2)} MB`, bg: "bg-purple-50" },
                  { icon: <User className="w-6 h-6 text-teal-600" />, label: "Specialist", value: analysis.specialist_type?.replace("-", " "), bg: "bg-teal-50" },
                ].map((card, i) => (
                  <Card key={i} className="p-5 bg-white/80 backdrop-blur-xl border border-slate-200 shadow-soft hover:shadow-medium transition-all duration-500 hover:-translate-y-1">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 ${card.bg} rounded-xl`}>{card.icon}</div>
                      <div><p className="text-xs text-slate-500 uppercase font-medium">{card.label}</p><p className="text-slate-900 font-semibold capitalize">{card.value}</p></div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Report Viewers */}
              {type === "report" && analysis.structured_data && <ReportViewer reportData={analysis.structured_data} rawOcrText={analysis.ocr_text} />}
              {type === "image" && analysis.ml_analysis_result && <ImageAnalysisViewer analysisData={{ analysis_text: analysis.ml_analysis_result.analysis_text, image_type: analysis.image_type || analysis.ml_analysis_result.image_type, specialist_type: analysis.specialist_type || analysis.ml_analysis_result.specialist_type, error: analysis.ml_analysis_result.error }} imageUrl={analysis.image_url} fileName={analysis.file_name} />}

              {/* File Information */}
              <Card className="p-8 bg-white/80 backdrop-blur-xl border border-slate-200 shadow-soft">
                <h3 className="text-xl font-bold text-slate-900 mb-6">File Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {[{ label: "File Name", value: analysis.file_name }, { label: "File Type", value: analysis.file_type }, { label: "File Size", value: `${(analysis.file_size / 1024 / 1024).toFixed(2)} MB` }, { label: "Status", value: analysis.status, color: "text-emerald-600" }].map((item, i) => (
                    <div key={i} className="bg-slate-50 rounded-xl p-4 border border-slate-200"><p className="text-slate-500 text-xs uppercase mb-2 font-medium">{item.label}</p><p className={`${(item as any).color || "text-slate-900"} font-semibold`}>{item.value}</p></div>
                  ))}
                </div>
              </Card>

              {/* Actions */}
              <div className="flex gap-4">
                <button onClick={() => navigate("/chat")} className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl shadow-glow-blue hover:shadow-medium transition-all duration-500 hover:-translate-y-1 flex items-center justify-center gap-2">
                  Continue Chat <ChevronRight className="w-4 h-4" />
                </button>
                <button onClick={() => downloadReport(generateReportContent(analysis), analysis?.file_name || 'medical-report')} className="flex-1 py-4 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-2xl border-2 border-slate-200 hover:border-blue-300 shadow-soft hover:shadow-medium transition-all duration-500 hover:-translate-y-1 flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" /> Download Report
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}
