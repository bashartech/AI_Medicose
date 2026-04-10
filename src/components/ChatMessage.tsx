import type React from "react"
import { useState, useEffect } from "react"
import ReactMarkdown from "react-markdown"
import { FileText, Image as ImageIcon, Volume2, VolumeX, ExternalLink, Activity, Eye, Pill } from "lucide-react"
import { TreatmentSimulator } from "@/components/analysis/TreatmentSimulator"
import { Link } from "react-router-dom"

interface Message {
  id: string
  text: string
  sender: "user" | "agent"
  timestamp: Date
  attachment?: { type: "image" | "pdf"; url: string; file_name: string; analysis?: any }
  triage?: { level: string; urgency: string; risk_score: number; action: string; recommended_tests: string[] }
}

interface ChatMessageProps {
  message: Message
  onSpeak?: (text: string) => void
  isSpeaking?: boolean
  onStopSpeaking?: () => void
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onSpeak, isSpeaking = false, onStopSpeaking }) => {
  const isUser = message.sender === "user"
  const [formattedTime, setFormattedTime] = useState<string>("")

  useEffect(() => { setFormattedTime(message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })) }, [message.timestamp])

  // Parse test markers
  const parseTestMarkers = (text: string) => {
    const testRegex = /\[TEST:(\w+)\](.*?)\[\/TEST\]/g
    const tests: Array<{ id: string; label: string; link: string; icon: React.ReactNode }> = []
    const testLinks: Record<string, { link: string; icon: React.ReactNode }> = {
      BP_ESTIMATION: { link: "/bp-estimation", icon: <Activity className="w-4 h-4" /> },
      EYE_SCAN: { link: "/eye-scan", icon: <Eye className="w-4 h-4" /> },
      DRUG_CHECKER: { link: "/chat?agent=pharmacy-assistant", icon: <Pill className="w-4 h-4" /> }
    }
    let match
    while ((match = testRegex.exec(text)) !== null) {
      const config = testLinks[match[1]]
      if (config) tests.push({ id: match[1], label: match[2], link: config.link, icon: config.icon })
    }
    return tests
  }

  const cleanText = message.text.replace(/\[TEST:\w+\].*?\[\/TEST\]/g, "").trim()
  const testMarkers = parseTestMarkers(message.text)
  const hasSimulation = message.text.includes("[SIMULATION_START]") && message.text.includes("[SIMULATION_END]")
  const simulationCleanText = cleanText.replace(/\[SIMULATION_START\][\s\S]*?\[SIMULATION_END\]/g, "").trim()

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4 group animate-fade-in`}>
      <div className={`max-w-xs lg:max-w-md px-5 py-4 rounded-2xl shadow-soft transition-all duration-500 relative ${isUser ? "bg-blue-600 text-white shadow-glow-blue rounded-br-none" : "bg-white/80 backdrop-blur-xl text-slate-900 border border-slate-200 rounded-bl-none"}`}>
        
        {/* Triage Alert */}
        {message.triage && message.triage.level !== "NORMAL" && (
          <div className={`mb-4 p-4 rounded-xl border ${message.triage.level === "EMERGENCY" ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"}`}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{message.triage.urgency}</span>
              <div>
                <p className={`font-bold text-sm ${message.triage.level === "EMERGENCY" ? "text-red-700" : "text-amber-700"}`}>{message.triage.level} - Risk: {message.triage.risk_score}/100</p>
                <p className="text-xs text-slate-600">{message.triage.action}</p>
              </div>
            </div>
            {message.triage.recommended_tests?.length > 0 && (
              <div>
                <p className="text-xs text-slate-500 mb-2 font-semibold">Recommended Tests:</p>
                <div className="flex flex-wrap gap-1.5">
                  {message.triage.recommended_tests.map((test: string, i: number) => (<span key={i} className="px-2.5 py-1 bg-white rounded-lg text-xs text-blue-600 border border-blue-200 font-medium">{test}</span>))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* File Attachment */}
        {message.attachment && (
          <div className="mb-4">
            {message.attachment.type === "image" && message.attachment.url && message.attachment.url !== "data:image/png;base64,mock" ? (
              <div className="rounded-xl overflow-hidden mb-3 bg-slate-100 border border-slate-200">
                <img src={message.attachment.url} alt={message.attachment.file_name} className="max-w-full h-auto max-h-64 object-contain" onError={(e) => { const t = e.target as HTMLImageElement; t.style.display = 'none' }} />
              </div>
            ) : (
              <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-3 mb-3 border border-slate-200">
                {message.attachment.type === "image" ? <ImageIcon className="w-8 h-8 text-blue-600 flex-shrink-0" /> : <FileText className="w-8 h-8 text-blue-600 flex-shrink-0" />}
                <div className="min-w-0 flex-1">
                  <p className="text-slate-900 text-sm font-medium truncate">{message.attachment.file_name}</p>
                  <p className="text-xs text-slate-500">{message.attachment.type === "image" ? "Image" : "PDF Document"}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Treatment Simulator */}
        {hasSimulation && !isUser && <TreatmentSimulator content={message.text} />}

        {/* Test Recommendation Buttons */}
        {!isUser && testMarkers.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-slate-500 mb-2.5 font-semibold">🔬 Try Our Free Health Screening Tools:</p>
            <div className="flex flex-wrap gap-2">
              {testMarkers.map((test) => (
                <Link key={test.id} to={test.link} className="flex items-center gap-2 px-3.5 py-2.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-blue-600 text-xs font-semibold transition-all duration-500 hover:shadow-soft hover:-translate-y-0.5">
                  {test.icon}
                  <span>{test.label}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Message Text */}
        {simulationCleanText && (
          isUser ? (<p className="text-sm leading-relaxed">{simulationCleanText}</p>) : (
            <div className="prose prose-slate prose-sm max-w-none [&>*]:mb-2 [&>p]:mb-2 [&>ul]:mb-2 [&>ol]:mb-2 [&>h1]:text-lg [&>h2]:text-base [&>h3]:text-sm">
              <ReactMarkdown components={{ p: ({ ...props }) => <p className="mb-2" {...props} />, ul: ({ ...props }) => <ul className="list-disc list-inside mb-2" {...props} />, ol: ({ ...props }) => <ol className="list-decimal list-inside mb-2" {...props} />, li: ({ ...props }) => <li className="ml-2" {...props} />, strong: ({ ...props }) => <strong className="font-semibold" {...props} />, code: ({ ...props }) => <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs" {...props} /> }}>{simulationCleanText}</ReactMarkdown>
            </div>
          )
        )}

        {/* Speaker Button */}
        {!isUser && onSpeak && (
          <button onClick={isSpeaking ? onStopSpeaking : () => onSpeak(message.text)} className="absolute -right-10 top-2 p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-400 hover:text-blue-600 transition-all opacity-0 group-hover:opacity-100 shadow-soft" aria-label={isSpeaking ? "Stop speaking" : "Speak message"}>
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        )}

        {/* Timestamp */}
        <span className={`text-xs mt-3 block ${isUser ? "text-blue-100" : "text-slate-400"}`}>{formattedTime}</span>
      </div>
    </div>
  )
}

export default ChatMessage
