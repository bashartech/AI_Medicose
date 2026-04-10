import { Link } from "react-router-dom"
import { useState, useEffect } from "react"
import { Menu, X, Activity, Shield, Zap } from "lucide-react"

const Header = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-700 ${
      scrolled 
        ? "bg-white/90 backdrop-blur-xl border-b border-slate-200/50 shadow-soft py-3" 
        : "bg-transparent py-5"
    }`}>
      <nav className="container mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-slate-900 text-2xl font-bold tracking-tighter hover:text-blue-600 transition-colors duration-300 flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-glow-blue">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white animate-pulse"></div>
          </div>
          <div>
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">BT MedAI</span>
            <span className="block text-[10px] text-slate-500 font-normal -mt-1">AI Hospital System</span>
          </div>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          {["Home", "Specialists", "AI Chat", "Upload Image", "Upload Report"].map((item, i) => (
            <Link
              key={i}
              to={item === "Home" ? "/" : item === "Specialists" ? "/#specialists" : item === "AI Chat" ? "/chat" : item === "Upload Image" ? "/upload-image" : "/upload-report"}
              className="text-slate-600 hover:text-blue-600 transition-colors duration-300 text-sm font-medium relative group"
            >
              {item}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-500 group-hover:w-full"></span>
            </Link>
          ))}

          {/* Status Indicators */}
          <div className="flex items-center gap-3 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 shadow-soft">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-slate-600 text-xs font-medium">AI Active</span>
            </div>
            <div className="w-px h-4 bg-slate-200"></div>
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-slate-600 text-xs font-medium">Secure</span>
            </div>
          </div>

          <Link to="/chat">
            <button className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 shadow-glow-blue hover:shadow-medium transition-all duration-500 text-sm flex items-center gap-2 hover:-translate-y-0.5">
              <Zap className="w-4 h-4" />
              Get Started
            </button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-slate-600 hover:text-blue-600 transition-colors p-2">
          {isOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-700 ease-in-out ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="px-6 py-4 space-y-3 bg-white/95 backdrop-blur-xl border-t border-slate-200">
          {["Home", "Specialists", "AI Chat", "Upload Image", "Upload Report"].map((item, i) => (
            <Link
              key={i}
              to={item === "Home" ? "/" : item === "Specialists" ? "/#specialists" : item === "AI Chat" ? "/chat" : item === "Upload Image" ? "/upload-image" : "/upload-report"}
              className="block text-slate-600 hover:text-blue-600 transition-colors duration-300 text-sm font-medium py-2"
              onClick={() => setIsOpen(false)}
            >
              {item}
            </Link>
          ))}
          <Link to="/chat" onClick={() => setIsOpen(false)}>
            <button className="w-full mt-2 px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 shadow-glow-blue transition-all duration-500 text-sm flex items-center justify-center gap-2">
              <Zap className="w-4 h-4" />
              Get Started
            </button>
          </Link>
        </div>
      </div>
    </header>
  )
}

export default Header
