import type React from "react"
import { Link } from "react-router-dom"
import { ArrowRight, Bot } from "lucide-react"

interface AgentCardProps {
  name: string
  description: string
  icon: React.ReactNode
  link: string
  specialty?: string
}

const AgentCard: React.FC<AgentCardProps> = ({ name, description, icon, link, specialty }) => {
  return (
    <Link to={link} className="block group">
      <div className="relative p-6 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 transition-all duration-700 overflow-hidden shadow-soft hover-lift">
        {/* Hover Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-cyan-50 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

        <div className="relative z-10 space-y-4">
          {/* Icon & AI Badge */}
          <div className="flex items-start justify-between">
            <div className="text-blue-600 group-hover:text-blue-700 transition-colors duration-500 group-hover:scale-110 transform flex items-center justify-center w-14 h-14 rounded-xl bg-blue-50 border border-blue-100 group-hover:border-blue-200">
              {icon}
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 rounded-lg border border-slate-200">
              <Bot className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-[10px] text-blue-600 font-semibold">AI</span>
            </div>
          </div>

          {/* Content */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors duration-500 mb-1">{name}</h3>
            {specialty && (
              <span className="inline-block px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-600 font-medium mb-2">{specialty}</span>
            )}
            <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">{description}</p>
          </div>

          {/* CTA */}
          <div className="flex items-center gap-2 text-blue-600 text-sm font-semibold pt-2">
            <span>Consult AI Doctor</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  )
}

export default AgentCard
