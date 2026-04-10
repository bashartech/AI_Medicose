import { Card } from "@/components/ui/card"
import { FileText, User, CheckCircle, TrendingUp, TrendingDown, AlertCircle, Info, Shield, Zap } from "lucide-react"

interface ReportData {
  lab_info?: { name?: string; contact?: string }
  patient_info?: { name?: string; age_gender?: string }
  report_metadata?: { date?: string }
  sections?: Array<{ name: string; tests: Array<{ name: string; value: string; ref_range: string; unit: string; status: string; status_label: string }> }>
  all_tests?: Array<{ name: string; value: string; ref_range: string; unit: string; status: string; status_label: string }>
}

interface ReportViewerProps { reportData: ReportData; rawOcrText?: string }

export const ReportViewer: React.FC<ReportViewerProps> = ({ reportData, rawOcrText }) => {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "high": case "elevated": return "text-red-600 bg-red-50 border-red-200"
      case "low": case "decreased": return "text-amber-600 bg-amber-50 border-amber-200"
      default: return "text-emerald-600 bg-emerald-50 border-emerald-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "high": case "elevated": return <TrendingUp className="w-4 h-4" />
      case "low": case "decreased": return <TrendingDown className="w-4 h-4" />
      default: return <CheckCircle className="w-4 h-4" />
    }
  }

  const abnormalTests = reportData?.all_tests?.filter(t => t.status !== "normal") || []
  const normalTests = reportData?.all_tests?.filter(t => t.status === "normal") || []

  if (!reportData || (!reportData.sections?.length && !reportData.all_tests?.length)) {
    return (
      <Card className="p-8 bg-white/80 backdrop-blur-xl border border-slate-200 shadow-soft">
        <div className="flex items-center gap-2 mb-4"><FileText className="w-5 h-5 text-blue-600" /><h3 className="text-lg font-semibold text-slate-900">Extracted Report Data</h3></div>
        {rawOcrText && rawOcrText.length > 50 ? (<div className="bg-slate-50 rounded-xl p-4 max-h-96 overflow-y-auto border border-slate-200"><pre className="text-sm text-slate-700 whitespace-pre-wrap font-mono">{rawOcrText}</pre></div>) : (<div className="text-center py-8 text-slate-500"><AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-400" /><p>No data extracted from this report</p></div>)}
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      {/* AI Status Bar */}
      <div className="flex items-center justify-between p-5 bg-blue-50 border border-blue-200 rounded-xl">
        <div className="flex items-center gap-3"><div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div><span className="text-blue-600 text-sm font-semibold">AI Report Analysis Complete</span></div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs text-slate-500"><Shield className="w-3.5 h-3.5 text-emerald-500" /><span>Secure</span></div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500"><Zap className="w-3.5 h-3.5 text-amber-500" /><span>{abnormalTests.length + normalTests.length} Tests Analyzed</span></div>
        </div>
      </div>

      {/* Patient Info */}
      {(reportData.patient_info?.name || reportData.patient_info?.age_gender || reportData.report_metadata?.date) && (
        <Card className="p-8 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 shadow-soft">
          <div className="flex items-center gap-2 mb-6"><User className="w-5 h-5 text-blue-600" /><h3 className="text-lg font-semibold text-slate-900">Patient Information</h3></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {reportData.patient_info?.name && (<div className="bg-white rounded-xl p-4 border border-blue-100"><p className="text-xs text-slate-500 uppercase mb-2 font-medium">Patient Name</p><p className="text-slate-900 font-semibold">{reportData.patient_info.name}</p></div>)}
            {reportData.patient_info?.age_gender && (<div className="bg-white rounded-xl p-4 border border-blue-100"><p className="text-xs text-slate-500 uppercase mb-2 font-medium">Age / Gender</p><p className="text-slate-900 font-semibold">{reportData.patient_info.age_gender}</p></div>)}
            {reportData.report_metadata?.date && (<div className="bg-white rounded-xl p-4 border border-blue-100"><p className="text-xs text-slate-500 uppercase mb-2 font-medium">Report Date</p><p className="text-slate-900 font-semibold">{reportData.report_metadata.date}</p></div>)}
          </div>
        </Card>
      )}

      {/* Abnormal Results */}
      {abnormalTests.length > 0 && (
        <Card className="p-8 bg-amber-50 border border-amber-200 shadow-soft">
          <div className="flex items-center gap-2 mb-6"><AlertCircle className="w-5 h-5 text-amber-600 animate-pulse-soft" /><h3 className="text-lg font-semibold text-amber-800">Attention Required ({abnormalTests.length} abnormal results)</h3></div>
          <div className="space-y-4">
            {abnormalTests.map((test, index) => (
              <div key={index} className="flex items-center justify-between bg-white rounded-xl p-5 border border-amber-200 hover:border-amber-300 transition-all duration-500 hover-lift">
                <div>
                  <p className="text-slate-900 font-semibold">{test.name}</p>
                  <p className="text-sm text-slate-600 mt-2">Your value: <span className="font-semibold text-amber-700">{test.value} {test.unit}</span>{test.ref_range && <span className="text-slate-500"> (Normal: {test.ref_range})</span>}</p>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border font-semibold ${getStatusColor(test.status)}`}>{getStatusIcon(test.status)}<span>{test.status_label}</span></span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Normal Results */}
      {normalTests.length > 0 && (
        <Card className="p-8 bg-emerald-50 border border-emerald-200 shadow-soft">
          <div className="flex items-center gap-2 mb-6"><CheckCircle className="w-5 h-5 text-emerald-600" /><h3 className="text-lg font-semibold text-emerald-800">Normal Results ({normalTests.length} tests)</h3></div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {normalTests.map((test, index) => (<div key={index} className="bg-white rounded-xl p-4 border border-emerald-200"><p className="text-sm text-slate-900 font-medium truncate">{test.name}</p><p className="text-xs text-slate-600 mt-2">{test.value} {test.unit}</p></div>))}
          </div>
        </Card>
      )}

      {/* Detailed Results by Section */}
      {reportData.sections?.map((section, sectionIndex) => (
        <Card key={sectionIndex} className="p-8 bg-white/80 backdrop-blur-xl border border-slate-200 shadow-soft">
          <div className="flex items-center gap-2 mb-6"><FileText className="w-5 h-5 text-blue-600" /><h3 className="text-lg font-semibold text-slate-900">{section.name}</h3></div>
          {section.tests && section.tests.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-slate-200 bg-slate-50"><th className="text-left py-3 px-4 text-slate-600 font-semibold">Test Name</th><th className="text-left py-3 px-4 text-slate-600 font-semibold">Your Value</th><th className="text-left py-3 px-4 text-slate-600 font-semibold">Reference Range</th><th className="text-left py-3 px-4 text-slate-600 font-semibold">Unit</th><th className="text-left py-3 px-4 text-slate-600 font-semibold">Status</th></tr></thead>
                <tbody>
                  {section.tests.map((test, testIndex) => (<tr key={testIndex} className="border-b border-slate-100 hover:bg-slate-50 transition-colors"><td className="py-3 px-4 text-slate-900 font-medium">{test.name}</td><td className="py-3 px-4 font-semibold text-blue-600">{test.value}</td><td className="py-3 px-4 text-slate-600">{test.ref_range}</td><td className="py-3 px-4 text-slate-500">{test.unit}</td><td className="py-3 px-4"><span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border font-semibold ${getStatusColor(test.status)}`}>{getStatusIcon(test.status)}<span>{test.status_label}</span></span></td></tr>))}
                </tbody>
              </table>
            </div>
          ) : (<div className="text-center py-8 text-slate-500"><Info className="w-8 h-8 mx-auto mb-2 text-slate-400" /><p>No test results found in this section</p></div>)}
        </Card>
      ))}
    </div>
  )
}
