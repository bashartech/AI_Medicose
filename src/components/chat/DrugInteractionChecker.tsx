import React, { useState } from "react"
import { Pill, AlertTriangle, CheckCircle, X, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

interface DrugInteractionCheckerProps { onClose: () => void }

export const DrugInteractionChecker: React.FC<DrugInteractionCheckerProps> = ({ onClose }) => {
  const [drug1, setDrug1] = useState("")
  const [drug2, setDrug2] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ severity: string; description: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleCheck = async () => {
    if (!drug1.trim() || !drug2.trim()) return
    setLoading(true); setError(null); setResult(null)
    try {
      const response = await fetch("http://localhost:8000/api/v1/drugs/check-interaction", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ drug1, drug2 }) })
      if (!response.ok) { const err = await response.json(); throw new Error(err.detail || "Failed to check interaction") }
      const data = await response.json()
      setResult(data)
    } catch (err: any) { setError(err.message) }
    finally { setLoading(false) }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "high": case "major": return "text-red-600 border-red-200 bg-red-50"
      case "moderate": return "text-amber-600 border-amber-200 bg-amber-50"
      default: return "text-emerald-600 border-emerald-200 bg-emerald-50"
    }
  }

  return (
    <Card className="p-6 bg-white/80 backdrop-blur-xl border border-slate-200 shadow-medium">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Pill className="w-5 h-5 text-blue-600" /> Drug Interaction Checker</h3>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-slate-700 rounded-xl"><X className="w-5 h-5" /></Button>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs text-slate-500 mb-1.5 block font-medium">First Medicine</label><Input value={drug1} onChange={(e) => setDrug1(e.target.value)} placeholder="e.g. Aspirin" className="bg-slate-50 border-slate-200 text-slate-900 rounded-xl" /></div>
          <div><label className="text-xs text-slate-500 mb-1.5 block font-medium">Second Medicine</label><Input value={drug2} onChange={(e) => setDrug2(e.target.value)} placeholder="e.g. Ibuprofen" className="bg-slate-50 border-slate-200 text-slate-900 rounded-xl" /></div>
        </div>

        <Button onClick={handleCheck} disabled={loading || !drug1.trim() || !drug2.trim()} className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl">
          {loading ? (<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />) : (<><Search className="w-4 h-4 mr-2" /> Check Interaction</>)}
        </Button>

        {error && (<div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>)}

        {result && (
          <div className={`p-4 rounded-xl border ${getSeverityColor(result.severity)}`}>
            <div className="flex items-center gap-2 mb-2">
              {result.severity.toLowerCase() === "none" ? (<CheckCircle className="w-5 h-5" />) : (<AlertTriangle className="w-5 h-5" />)}
              <span className="font-bold uppercase text-sm">Severity: {result.severity}</span>
            </div>
            <p className="text-sm opacity-90">{result.description}</p>
          </div>
        )}
      </div>
    </Card>
  )
}
