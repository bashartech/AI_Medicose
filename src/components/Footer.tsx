import { Link } from "react-router-dom"
import { FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa"
import { Activity, Shield, Zap, Heart, Brain, Scan, ArrowRight } from "lucide-react"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white border-t border-slate-200 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-transparent to-transparent"></div>
      </div>
      
      <div className="container mx-auto px-6 py-20 relative z-10">
        {/* CTA Section */}
        <div className="mb-20 p-12 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-[2rem] text-center shadow-soft hover:shadow-medium transition-all duration-700 hover:-translate-y-1">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl mb-6 shadow-soft animate-pulse-soft">
            <Activity className="w-10 h-10 text-blue-600" />
          </div>
          <h3 className="text-3xl font-bold text-slate-900 mb-3">Ready to Experience AI-Powered Healthcare?</h3>
          <p className="text-slate-600 mb-8 max-w-2xl mx-auto">Join thousands of patients using our intelligent diagnostic system for accurate, real-time health insights</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/chat">
              <button className="group px-8 py-4 bg-blue-600 text-white font-semibold rounded-2xl hover:bg-blue-700 shadow-glow-blue hover:shadow-medium transition-all duration-500 hover:-translate-y-1 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Start AI Consultation
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <Link to="/bp-estimation">
              <button className="group px-8 py-4 bg-white text-slate-900 font-semibold rounded-2xl hover:bg-slate-50 border-2 border-slate-200 hover:border-blue-300 shadow-soft hover:shadow-medium transition-all duration-500 hover:-translate-y-1 flex items-center gap-2">
                <Scan className="w-4 h-4" />
                Free Health Scan
              </button>
            </Link>
          </div>
        </div>

        {/* Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-glow-blue">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">BT MedAI</h3>
                <span className="text-[10px] text-slate-500">AI Hospital System</span>
              </div>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">Advanced AI-powered medical consultation platform delivering specialized health guidance.</p>
            <div className="flex flex-wrap gap-2">
              {["Secure", "Trusted", "AI-Powered"].map((badge, i) => (
                <span key={i} className={`px-3 py-1.5 ${i === 0 ? "bg-blue-50 border-blue-200 text-blue-600" : i === 1 ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "bg-cyan-50 border-cyan-200 text-cyan-600"} border rounded-lg text-xs font-medium flex items-center gap-1.5`}>
                  {i === 0 ? <Shield className="w-3 h-3" /> : i === 1 ? <Heart className="w-3 h-3" /> : <Brain className="w-3 h-3" />}
                  {badge}
                </span>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div className="space-y-5">
            <h4 className="text-slate-900 font-semibold text-sm uppercase tracking-wide">Platform</h4>
            <ul className="space-y-3">
              {[
                { label: "Medical Specialists", href: "/#specialists" },
                { label: "AI Consultations", href: "/chat" },
                { label: "Image Analysis", href: "/upload-image" },
                { label: "Report Analysis", href: "/upload-report" },
                { label: "BP Estimation", href: "/bp-estimation" },
                { label: "Eye Health Scan", href: "/eye-scan" },
              ].map((link, i) => (
                <li key={i}>
                  <Link to={link.href} className="text-slate-600 hover:text-blue-600 transition-colors duration-300 text-sm flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full group-hover:scale-150 transition-transform"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-5">
            <h4 className="text-slate-900 font-semibold text-sm uppercase tracking-wide">Company</h4>
            <ul className="space-y-3">
              {[
                { label: "AI Agents", href: "/#specialists" },
                { label: "Contact Us", href: "/#contact" },
                { label: "Privacy Policy", href: "#" },
                { label: "Terms of Service", href: "#" },
              ].map((link, i) => (
                <li key={i}>
                  <a href={link.href} className="text-slate-600 hover:text-blue-600 transition-colors duration-300 text-sm flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full group-hover:scale-150 transition-transform"></span>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div className="space-y-5">
            <h4 className="text-slate-900 font-semibold text-sm uppercase tracking-wide">Connect</h4>
            <div className="flex gap-3">
              {[
                { icon: <FaGithub size={18} />, href: "https://github.com/bashartech", label: "GitHub" },
                { icon: <FaLinkedin size={18} />, href: "https://www.linkedin.com/in/m-bashar-sheikh/", label: "LinkedIn" },
                { icon: <FaEnvelope size={18} />, href: "mailto:bashartc13@gmail.com", label: "Email" },
              ].map((social, i) => (
                <a key={i} href={social.href} target="_blank" rel="noopener noreferrer" className="w-11 h-11 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-slate-600 hover:text-blue-600 hover:border-blue-300 hover:shadow-soft transition-all duration-500 hover:-translate-y-1" aria-label={social.label}>
                  {social.icon}
                </a>
              ))}
            </div>
            <div className="pt-3">
              <p className="text-slate-500 text-xs">Email: bashartc13@gmail.com</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">© {currentYear} BT MedAI. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-slate-500 text-xs">AI System Active</span>
              </div>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500 text-xs">Powered by Google Gemini AI</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
