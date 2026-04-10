import { Link, useSearchParams } from "react-router-dom"
import {
  FaHeartbeat,
  FaSpa,
  FaAssistiveListeningSystems,
  FaEye,
  FaXRay,
  FaTooth,
  FaBaby,
  FaPrescriptionBottle,
  FaApple,
  FaUserMd,
} from "react-icons/fa"
import { Bot, Activity, Shield } from "lucide-react"

const agents = [
  { name: "Cardiologist", icon: <FaHeartbeat size={18} />, link: "/chat?agent=cardiologist-specialist", id: "cardiologist-specialist", specialty: "Cardiology" },
  { name: "Dermatologist", icon: <FaSpa size={18} />, link: "/chat?agent=dermatologist-specialist", id: "dermatologist-specialist", specialty: "Dermatology" },
  { name: "ENT Specialist", icon: <FaAssistiveListeningSystems size={18} />, link: "/chat?agent=ent-specialist", id: "ent-specialist", specialty: "ENT" },
  { name: "Eye Specialist", icon: <FaEye size={18} />, link: "/chat?agent=eye-specialist", id: "eye-specialist", specialty: "Ophthalmology" },
  { name: "Orthopedic", icon: <FaXRay size={18} />, link: "/chat?agent=orthopedic-specialist", id: "orthopedic-specialist", specialty: "Orthopedics" },
  { name: "Dentist", icon: <FaTooth size={18} />, link: "/chat?agent=dentist-specialist", id: "dentist-specialist", specialty: "Dental" },
  { name: "Pediatrician", icon: <FaBaby size={18} />, link: "/chat?agent=pediatrician-specialist", id: "pediatrician-specialist", specialty: "Pediatrics" },
  { name: "Pharmacy", icon: <FaPrescriptionBottle size={18} />, link: "/chat?agent=pharmacy-assistant", id: "pharmacy-assistant", specialty: "Pharmacy" },
  { name: "Nutritionist", icon: <FaApple size={18} />, link: "/chat?agent=nutritionist-specialist", id: "nutritionist-specialist", specialty: "Nutrition" },
  { name: "General Physician", icon: <FaUserMd size={18} />, link: "/chat?agent=general-physician", id: "general-physician", specialty: "General Medicine" },
]

const ChatSidebar = () => {
  const [searchParams] = useSearchParams()
  const activeAgentId = searchParams.get("agent")

  return (
    <div className="flex flex-col h-full p-6 bg-white">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold text-slate-900">AI Specialists</h2>
        </div>
        <div className="h-1 w-12 bg-gradient-to-r from-blue-600 to-cyan-500 rounded shadow-glow-blue"></div>
        <div className="flex items-center gap-2 mt-3">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-slate-500 text-xs">10 AI Doctors Available</span>
        </div>
      </div>

      {/* Agents List */}
      <nav className="flex-1 overflow-y-auto space-y-2">
        <ul>
          {agents.map((agent) => (
            <li key={agent.id}>
              <Link to={agent.link}>
                <div className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-500 group hover-lift ${
                  activeAgentId === agent.id
                    ? "bg-blue-50 border-2 border-blue-200 text-blue-700 shadow-soft"
                    : "text-slate-700 hover:bg-slate-50 hover:text-blue-600 hover:border-slate-200 border-2 border-transparent"
                }`}>
                  <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                    activeAgentId === agent.id ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500 group-hover:text-blue-600"
                  }`}>
                    {agent.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium truncate block">{agent.name}</span>
                    <span className="text-[10px] text-slate-400">{agent.specialty}</span>
                  </div>
                  {activeAgentId === agent.id && (
                    <div className="flex items-center gap-1">
                      <Bot className="w-3 h-3 text-blue-600" />
                      <span className="text-[10px] text-blue-600 font-medium">AI</span>
                    </div>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Trust Badges */}
      <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <span>Secure</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-blue-600" />
            <span>24/7 Active</span>
          </div>
        </div>
      </div>

      {/* Back to Home */}
      <div className="mt-4 pt-4 border-t border-slate-200">
        <Link to="/">
          <button className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl transition-all duration-500 border border-slate-200 hover:border-blue-300 text-sm font-medium flex items-center justify-center gap-2 hover:-translate-y-0.5">
            ← Back to Home
          </button>
        </Link>
      </div>
    </div>
  )
}

export default ChatSidebar
