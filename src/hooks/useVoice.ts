import { useState, useEffect, useCallback, useRef } from "react"

// Type definitions for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionResultList {
  length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  isFinal: boolean
  length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  abort(): void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onend: (() => void) | null
  onerror: ((event: any) => void) | null
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition
    webkitSpeechRecognition: new () => SpeechRecognition
  }
}

export const useVoice = () => {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const finalTranscriptRef = useRef("")

  // Detect Language (Used for fallback)
  const detectLanguage = (text: string): string => {
    const urduRegex = /[\u0600-\u06FF]/
    return urduRegex.test(text) ? "ur-PK" : "en-US"
  }

  // Initialize Speech Recognition & Voices
  useEffect(() => {
    // 1. Load Voices
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices()
      if (v.length > 0) {
        console.log("Voices loaded:", v.map(voice => `${voice.name} (${voice.lang})`))
      }
    }
    
    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices

    // 2. Initialize Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = "en-US"

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)

        let interimTranscript = ""
        let currentFinal = ""

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            currentFinal += event.results[i][0].transcript
          } else {
            interimTranscript += event.results[i][0].transcript
          }
        }

        const fullText = finalTranscriptRef.current + currentFinal + interimTranscript
        setTranscript(fullText)

        // Silence Timer: 4 seconds
        silenceTimerRef.current = setTimeout(() => {
          if (isListening) {
            finalTranscriptRef.current = fullText
            recognition.stop()
          }
        }, 4000)
      }

      recognition.onend = () => {
        setIsListening(false)
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
      }

      recognition.onerror = (event: any) => {
        if (event.error === 'not-allowed') {
          setError("Microphone access denied.")
        } else if (event.error !== 'aborted') {
          setError(`Voice error: ${event.error}`)
        }
        setIsListening(false)
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
      }

      recognitionRef.current = recognition
    } else {
      setError("Speech recognition not supported.")
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.abort()
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
      window.speechSynthesis.onvoiceschanged = null
    }
  }, [])

  // Start Listening
  const startListening = useCallback(() => {
    if (recognitionRef.current) {
      setTranscript("")
      finalTranscriptRef.current = ""
      setError(null)
      try {
        recognitionRef.current.start()
        setIsListening(true)
      } catch (err) {
        console.error("Failed to start recognition", err)
      }
    }
  }, [])

  // Stop Listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }, [])

  // Speak Text (Text-to-Speech) - PRIORITIZING HINDI FOR ROMAN URDU
  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      
      // Select Best Voice
      const voices = window.speechSynthesis.getVoices()
      console.log("Available voices:", voices.map(v => `${v.name} (${v.lang})`))

      // Priority: Hindi (India) > Hindi (Generic) > Urdu (Pakistan) > Urdu (Generic)
      // We prioritize Hindi because it reads Roman Urdu perfectly with the correct accent.
      let selectedVoice = voices.find(v => v.lang === 'hi-IN') || 
                          voices.find(v => v.lang.startsWith('hi')) ||
                          voices.find(v => v.name.toLowerCase().includes('hindi')) ||
                          voices.find(v => v.lang === 'ur-PK') || 
                          voices.find(v => v.lang.startsWith('ur')) ||
                          voices.find(v => v.name.toLowerCase().includes('urdu'))
      
      if (selectedVoice) {
        utterance.voice = selectedVoice
        // Force the language tag to match the voice for better pronunciation
        if (selectedVoice.lang.startsWith('hi')) {
            utterance.lang = 'hi-IN'
        } else if (selectedVoice.lang.startsWith('ur')) {
            utterance.lang = 'ur-PK'
        }
        console.log(`Selected voice: ${selectedVoice.name} (${selectedVoice.lang})`)
      } else {
        console.warn("No Hindi/Urdu voice found. Using default.")
        utterance.lang = detectLanguage(text)
      }

      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)

      window.speechSynthesis.speak(utterance)
    }
  }, [])

  // Stop Speaking
  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }, [])

  return {
    isListening,
    transcript,
    isSpeaking,
    error,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    setTranscript
  }
}
