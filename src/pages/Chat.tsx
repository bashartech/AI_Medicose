import { useState, useRef, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import ChatLayout from "@/components/ChatLayout"
import ChatSidebar from "@/components/ChatSidebar"
import ChatMessage from "@/components/ChatMessage"
import ChatInput from "@/components/ChatInput"
import { WebcamCapture } from "@/components/upload/WebcamCapture"
import { DrugInteractionChecker } from "@/components/chat/DrugInteractionChecker"
import { api } from "@/services/api"
import { useVoice } from "@/hooks/useVoice"
import { Pill, Activity, Shield, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Message {
  id: string
  text: string
  sender: "user" | "agent"
  timestamp: Date
  attachment?: { type: "image" | "pdf"; url: string; file_name: string; analysis?: any }
  triage?: { level: string; urgency: string; risk_score: number; action: string; recommended_tests: string[] }
}

export default function ChatPage() {
  const [searchParams] = useSearchParams()
  const agentId = searchParams.get("agent") || "general-physician"
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string>()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [showWebcam, setShowWebcam] = useState(false)
  const [showDrugChecker, setShowDrugChecker] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { isListening, transcript, isSpeaking, startListening, stopListening, speak, stopSpeaking } = useVoice()

  useEffect(() => {
    setMessages([{ id: "1", text: `Hello! I'm your ${agentId.replace("-", " ")} specialist. How can I assist you with your health concerns today? You can also upload images or reports for analysis.`, sender: "agent", timestamp: new Date() }])
  }, [agentId])

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages])
  useEffect(() => { if (transcript && !isListening) handleSendMessage(transcript) }, [transcript, isListening])

  const handleSendMessage = async (message: string, file?: File) => {
    const fileToSend = file || selectedFile
    const newMessage: Message = { id: Date.now().toString(), text: message || (fileToSend ? `Uploaded: ${fileToSend.name}` : ""), sender: "user", timestamp: new Date(), attachment: fileToSend ? { type: fileToSend.type.startsWith("image/") ? "image" : "pdf", url: URL.createObjectURL(fileToSend), file_name: fileToSend.name } : undefined }
    setMessages((prev) => [...prev, newMessage])
    setIsLoading(true)
    setSelectedFile(null)

    try {
      let response
      if (fileToSend) response = await api.chat.sendWithFile(fileToSend, agentId, message || "Please analyze this", sessionId)
      else response = await api.chat.send(message, agentId, sessionId)

      const agentResponse: Message = { id: (Date.now() + 1).toString(), text: response.response, sender: "agent", timestamp: new Date(), attachment: response.attachment, triage: response.triage }
      setMessages((prev) => [...prev, agentResponse])
      setSessionId(response.session_id)
      speak(response.response)
    } catch (error) {
      console.error("[Chat] Error:", error)
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), text: "Connection error. Please check if your backend is running.", sender: "agent", timestamp: new Date() }])
    } finally { setIsLoading(false) }
  }

  const handleWebcamCapture = (imageData: string) => {
    const byteString = atob(imageData.split(',')[1])
    const mimeString = imageData.split(',')[0].split(':')[1].split(';')[0]
    const ab = new ArrayBuffer(byteString.length)
    const ia = new Uint8Array(ab)
    for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i)
    const blob = new Blob([ab], { type: mimeString })
    setSelectedFile(new File([blob], "webcam-capture.jpg", { type: mimeString }))
    setShowWebcam(false)
  }

  return (
    <ChatLayout sidebar={<ChatSidebar />}>
      {/* AI Status Bar */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur-xl px-6 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2"><div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div><span className="text-blue-600 text-xs font-semibold">AI Active</span></div>
            <div className="flex items-center gap-2"><Shield className="w-3.5 h-3.5 text-emerald-500" /><span className="text-slate-500 text-xs">Triage Enabled</span></div>
            <div className="flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-amber-500" /><span className="text-slate-500 text-xs">Real-time Analysis</span></div>
          </div>
          <div className="flex items-center gap-2"><Activity className="w-4 h-4 text-blue-600" /><span className="text-slate-500 text-xs">{agentId.replace("-", " ")}</span></div>
        </div>
      </div>

      {/* File Preview */}
      {selectedFile && (
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-3">
          <div className="max-w-4xl mx-auto flex items-center gap-3">
            <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-2.5 flex-1 border border-slate-200 shadow-soft">
              <div className="w-5 h-5 text-blue-600">📎</div>
              <div className="flex-1 min-w-0">
                <p className="text-slate-900 font-medium truncate">{selectedFile.name}</p>
                <p className="text-xs text-slate-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            <button onClick={() => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = "" }} className="text-slate-400 hover:text-red-500 transition-colors">✕</button>
          </div>
        </div>
      )}

      {/* Drug Checker Modal */}
      {showDrugChecker && (<div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4"><div className="max-w-md w-full"><DrugInteractionChecker onClose={() => setShowDrugChecker(false)} /></div></div>)}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 bg-gradient-to-b from-slate-50 to-white">
        {messages.map((msg) => (<ChatMessage key={msg.id} message={msg} onSpeak={speak} isSpeaking={isSpeaking} onStopSpeaking={stopSpeaking} />))}
        {isLoading && (<div className="flex justify-start mb-4"><div className="bg-white px-5 py-4 rounded-2xl border border-slate-200 shadow-soft"><div className="flex items-center gap-2"><div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div><div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100"></div><div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200"></div></div></div></div>)}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} selectedFile={selectedFile} onFileSelect={setSelectedFile} onRemoveFile={() => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = "" }} fileInputRef={fileInputRef} isListening={isListening} onStartListening={startListening} onStopListening={stopListening} transcript={transcript} onOpenWebcam={() => setShowWebcam(true)} />

      {/* Drug Checker FAB */}
      <Button onClick={() => setShowDrugChecker(true)} className="fixed bottom-24 right-6 rounded-full p-4 bg-blue-600 hover:bg-blue-700 shadow-glow-blue z-40 hover-lift" aria-label="Check Drug Interactions">
        <Pill className="w-6 h-6" />
      </Button>

      {/* Webcam Modal */}
      {showWebcam && (<WebcamCapture onCapture={handleWebcamCapture} onClose={() => setShowWebcam(false)} />)}
    </ChatLayout>
  )
}
