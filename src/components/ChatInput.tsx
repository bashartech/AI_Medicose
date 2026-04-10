import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Send, Paperclip, X, FileText, Image, Mic, MicOff, Camera } from "lucide-react"

interface ChatInputProps {
  onSendMessage: (message: string, file?: File) => void
  isLoading: boolean
  selectedFile?: File | null
  onFileSelect?: (file: File) => void
  onRemoveFile?: () => void
  fileInputRef?: React.RefObject<HTMLInputElement>
  isListening?: boolean
  onStartListening?: () => void
  onStopListening?: () => void
  transcript?: string
  onOpenWebcam?: () => void
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, isLoading, selectedFile, onFileSelect, onRemoveFile, fileInputRef: externalFileInputRef, isListening = false, onStartListening, onStopListening, transcript = "", onOpenWebcam
}) => {
  const [message, setMessage] = useState("")
  const internalFileInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = externalFileInputRef || internalFileInputRef

  useEffect(() => { if (transcript) setMessage(transcript) }, [transcript])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if ((message.trim() || selectedFile) && !isLoading) {
      onSendMessage(message, selectedFile || undefined)
      setMessage("")
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files && e.target.files[0] && onFileSelect) onFileSelect(e.target.files[0]) }
  const handleAttachClick = () => { fileInputRef?.current?.click() }

  return (
    <div className="relative border-t border-slate-200 bg-white/80 backdrop-blur-xl px-6 py-4">
      {/* File Preview */}
      {selectedFile && (
        <div className="mb-3 max-w-4xl mx-auto">
          <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-slate-200 shadow-soft">
            {selectedFile.type.startsWith("image/") ? (<Image className="w-8 h-8 text-blue-600 flex-shrink-0" />) : (<FileText className="w-8 h-8 text-blue-600 flex-shrink-0" />)}
            <div className="flex-1 min-w-0">
              <p className="text-slate-900 font-medium truncate">{selectedFile.name}</p>
              <p className="text-sm text-slate-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            {onRemoveFile && (<button onClick={onRemoveFile} className="text-slate-400 hover:text-red-500 transition-colors"><X className="w-5 h-5" /></button>)}
          </div>
        </div>
      )}

      {/* Voice Listening Indicator */}
      {isListening && (
        <div className="mb-3 max-w-4xl mx-auto">
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <p className="text-red-600 font-medium">Listening... Speak now</p>
            {onStopListening && (<button onClick={onStopListening} className="ml-auto text-red-500 hover:text-red-600"><MicOff className="w-5 h-5" /></button>)}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-center gap-3 max-w-4xl mx-auto">
        {/* Attachment Button */}
        <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} accept="image/*,application/pdf" />
        <button type="button" onClick={handleAttachClick} className="flex-shrink-0 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition-all duration-500 border border-slate-200 hover:border-blue-300" disabled={isLoading || isListening} aria-label="Attach file">
          <Paperclip className="w-5 h-5" />
        </button>

        {/* Webcam Button */}
        {onOpenWebcam && (
          <button type="button" onClick={onOpenWebcam} className="flex-shrink-0 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition-all duration-500 border border-slate-200 hover:border-blue-300" disabled={isLoading || isListening} aria-label="Open webcam">
            <Camera className="w-5 h-5" />
          </button>
        )}

        {/* Voice/Mic Button */}
        {onStartListening && (
          <button type="button" onClick={isListening ? onStopListening : onStartListening} className={`flex-shrink-0 p-3 rounded-xl transition-all duration-500 border ${isListening ? "bg-red-50 border-red-200 text-red-500 animate-pulse" : "bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-blue-600 border-slate-200 hover:border-blue-300"}`} disabled={isLoading} aria-label={isListening ? "Stop listening" : "Start listening"}>
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
        )}

        {/* Message Input */}
        <input type="text" className="flex-1 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-500 shadow-soft hover:border-slate-300" placeholder={isLoading ? "Specialist is analyzing..." : isListening ? "Listening..." : "Type your health question..."} value={message} onChange={(e) => setMessage(e.target.value)} disabled={isLoading || isListening} />

        {/* Send Button */}
        <button type="submit" className="flex-shrink-0 p-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all duration-500 shadow-glow-blue hover:shadow-medium disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={isLoading || isListening || (!message.trim() && !selectedFile)} aria-label="Send message">
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  )
}

export default ChatInput
