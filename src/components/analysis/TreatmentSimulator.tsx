import React from "react"
import { Activity, Clock, AlertTriangle, CheckCircle, Pill, Dumbbell } from "lucide-react"
import { Card } from "@/components/ui/card"

interface SimulationData { recoveryTimeline: string; successProbability: string; sideEffects: string[]; details: string; type: "medicine" | "exercise" | "general" }
interface TreatmentSimulatorProps { content: string }

export const TreatmentSimulator: React.FC<TreatmentSimulatorProps> = ({ content }) => {
  const parseSimulation = (text: string): SimulationData | null => {
    const startTag = "[SIMULATION_START]"; const endTag = "[SIMULATION_END]"
    const startIndex = text.indexOf(startTag); const endIndex = text.indexOf(endTag)
    if (startIndex === -1 || endIndex === -1) return null
    const simulationText = text.substring(startIndex + startTag.length, endIndex).trim()
    const timelineMatch = simulationText.match(/Recovery Timeline:\s*(.*)/i)
    const probabilityMatch = simulationText.match(/Success Probability:\s*(.*)/i)
    const sideEffectsMatch = simulationText.match(/Side Effects:\s*([\s\S]*?)(?=Details:|$)/i)
    const detailsMatch = simulationText.match(/Details:\s*([\s\S]*)/i)
    const lowerText = simulationText.toLowerCase()
    const type = lowerText.includes("medicine") || lowerText.includes("drug") || lowerText.includes("pill") ? "medicine" : lowerText.includes("exercise") || lowerText.includes("workout") || lowerText.includes("yoga") ? "exercise" : "general"
    return {
      recoveryTimeline: timelineMatch ? timelineMatch[1].trim() : "N/A",
      successProbability: probabilityMatch ? probabilityMatch[1].trim() : "N/A",
      sideEffects: sideEffectsMatch ? sideEffectsMatch[1].trim().split(/[-•,]/).map(s => s.trim()).filter(s => s.length > 0) : [],
      details: detailsMatch ? detailsMatch[1].trim() : "",
      type
    }
  }

  const data = parseSimulation(content)
  if (!data) return null

  const probMatch = data.successProbability.match(/(\d+)%/)
  const probability = probMatch ? parseInt(probMatch[1]) : 0

  return (
    <Card className="mt-4 mb-4 border-l-4 border-l-blue-500 bg-white/80 backdrop-blur-xl border border-slate-200 overflow-hidden shadow-soft">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-5 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-100 rounded-xl"><Activity className="w-6 h-6 text-blue-600" /></div>
          <div><h3 className="text-lg font-bold text-slate-900">AI Treatment Simulator</h3><p className="text-sm text-slate-500">{data.type === "medicine" ? "💊 Medicine Analysis" : data.type === "exercise" ? "🏋️ Exercise Analysis" : "🩺 Treatment Analysis"}</p></div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Recovery Timeline */}
        <div className="flex items-start gap-4">
          <div className="p-2.5 bg-blue-50 rounded-xl"><Clock className="w-5 h-5 text-blue-600" /></div>
          <div><h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Recovery Timeline</h4><p className="text-slate-900 font-semibold mt-1">{data.recoveryTimeline}</p></div>
        </div>

        {/* Success Probability */}
        <div className="flex items-start gap-4">
          <div className="p-2.5 bg-emerald-50 rounded-xl"><CheckCircle className="w-5 h-5 text-emerald-600" /></div>
          <div className="flex-1"><h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Success Probability</h4><div className="flex items-center gap-3 mt-2"><div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-1000" style={{ width: `${probability}%` }}></div></div><span className="text-emerald-600 font-bold text-sm">{data.successProbability}</span></div></div>
        </div>

        {/* Side Effects */}
        {data.sideEffects.length > 0 && (
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-amber-50 rounded-xl"><AlertTriangle className="w-5 h-5 text-amber-600" /></div>
            <div><h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Potential Side Effects</h4><ul className="mt-2 space-y-1.5">{data.sideEffects.map((effect, index) => (<li key={index} className="text-amber-700 text-sm flex items-start gap-2"><span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 flex-shrink-0"></span>{effect}</li>))}</ul></div>
          </div>
        )}

        {/* Details */}
        {data.details && (<div className="bg-slate-50 rounded-xl p-5 border border-slate-200"><p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{data.details}</p></div>)}
      </div>
    </Card>
  )
}
