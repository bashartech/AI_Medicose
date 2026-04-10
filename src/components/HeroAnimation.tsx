import { FaHeartbeat } from "react-icons/fa"
import { Activity, Brain, Heart, Scan } from "lucide-react"

export default function HeroAnimation() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Central icon */}
      <div className="relative z-10 flex items-center justify-center w-28 h-28 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-200 shadow-soft animate-pulse-soft">
        <FaHeartbeat className="text-blue-600 text-6xl" />
      </div>

      {/* Concentric circles */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="absolute w-44 h-44 border-2 border-blue-200 rounded-full animate-[ping_3s_ease-in-out_infinite]" />
        <div className="absolute w-72 h-72 border-2 border-blue-100 rounded-full animate-[ping_4s_ease-in-out_infinite]" />
        <div className="absolute w-96 h-96 border border-blue-50 rounded-full animate-[ping_5s_ease-in-out_infinite]" />
      </div>

      {/* Rotating icons */}
      <div className="absolute inset-0 flex items-center justify-center animate-[spin_30s_linear_infinite]">
        <div className="absolute top-6 w-10 h-10 bg-white rounded-xl border border-blue-200 flex items-center justify-center shadow-soft">
          <Heart className="w-5 h-5 text-red-500" />
        </div>
        <div className="absolute right-6 w-10 h-10 bg-white rounded-xl border border-purple-200 flex items-center justify-center shadow-soft">
          <Brain className="w-5 h-5 text-purple-600" />
        </div>
        <div className="absolute bottom-6 w-10 h-10 bg-white rounded-xl border border-emerald-200 flex items-center justify-center shadow-soft">
          <Activity className="w-5 h-5 text-emerald-600" />
        </div>
        <div className="absolute left-6 w-10 h-10 bg-white rounded-xl border border-amber-200 flex items-center justify-center shadow-soft">
          <Scan className="w-5 h-5 text-amber-600" />
        </div>
      </div>

      {/* Glow effect */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-40 h-40 bg-blue-100 rounded-full blur-3xl animate-pulse opacity-50" />
      </div>

      {/* Scanning line */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="w-full h-16 bg-scan-line animate-scan opacity-20" />
      </div>
    </div>
  )
}
