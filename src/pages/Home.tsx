import { Link, useNavigate } from "react-router-dom"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
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
import {
  Activity, Eye, Mic, Scan, Shield, Brain, Heart, AlertTriangle,
  CheckCircle, ArrowRight, Zap, ChevronDown, Play, Star, Users, Award,
  TrendingUp, Droplets, Wind, Target
} from "lucide-react"
import { useState, useEffect, useRef } from "react"

const agents = [
  { name: "Cardiologist", icon: <FaHeartbeat size={28} />, link: "/chat?agent=cardiologist-specialist", specialty: "Cardiology", desc: "Heart & cardiovascular care", exp: "15+ years" },
  { name: "Dermatologist", icon: <FaSpa size={28} />, link: "/chat?agent=dermatologist-specialist", specialty: "Dermatology", desc: "Skin, hair & nail care", exp: "12+ years" },
  { name: "ENT Specialist", icon: <FaAssistiveListeningSystems size={28} />, link: "/chat?agent=ent-specialist", specialty: "ENT", desc: "Ear, nose & throat", exp: "10+ years" },
  { name: "Eye Specialist", icon: <FaEye size={28} />, link: "/chat?agent=eye-specialist", specialty: "Ophthalmology", desc: "Vision & eye care", exp: "14+ years" },
  { name: "Orthopedic", icon: <FaXRay size={28} />, link: "/chat?agent=orthopedic-specialist", specialty: "Orthopedics", desc: "Bones & joints", exp: "16+ years" },
  { name: "Dentist", icon: <FaTooth size={28} />, link: "/chat?agent=dentist-specialist", specialty: "Dental", desc: "Oral health care", exp: "11+ years" },
  { name: "Pediatrician", icon: <FaBaby size={28} />, link: "/chat?agent=pediatrician-specialist", specialty: "Pediatrics", desc: "Child health", exp: "13+ years" },
  { name: "Pharmacy", icon: <FaPrescriptionBottle size={28} />, link: "/chat?agent=pharmacy-assistant", specialty: "Pharmacy", desc: "Medication guidance", exp: "9+ years" },
  { name: "Nutritionist", icon: <FaApple size={28} />, link: "/chat?agent=nutritionist-specialist", specialty: "Nutrition", desc: "Diet & wellness", exp: "10+ years" },
  { name: "General Physician", icon: <FaUserMd size={28} />, link: "/chat?agent=general-physician", specialty: "General", desc: "Primary care", exp: "18+ years" },
]

const services = [
  { icon: <Scan size={32} />, title: "AI Diagnosis", desc: "Real-time multimodal diagnostics with advanced pattern recognition" },
  { icon: <AlertTriangle size={32} />, title: "AI Triage", desc: "Emergency detection with intelligent risk classification" },
  { icon: <Activity size={32} />, title: "Remote Monitoring", desc: "Continuous health tracking with predictive analytics" },
  { icon: <Brain size={32} />, title: "Predictive Health", desc: "AI-powered risk assessment and early disease detection" },
]

const technologies = [
  { icon: <Scan size={40} />, title: "Face-based Vitals", desc: "Extract heart rate, BP, and stress from facial video analysis", stat: "98% accuracy", link: "/bp-estimation" },
  { icon: <Eye size={40} />, title: "Eye Analysis", desc: "Detect fatigue, liver issues, and neurological signals", stat: "Real-time", link: "/eye-scan" },
  { icon: <Mic size={40} />, title: "Voice Diagnostics", desc: "Lung and stress assessment through voice patterns", stat: "AI-powered", link: "/chat?agent=general-physician" },
  { icon: <Heart size={40} />, title: "BP Estimation", desc: "Non-contact blood pressure from 30-second face video", stat: "No cuff needed", link: "/bp-estimation" },
]

// Animated ECG Component
const ECGAnimation = () => (
  <svg className="w-full h-20" viewBox="0 0 600 80" preserveAspectRatio="none">
    <defs>
      <linearGradient id="ecgGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#0A66C2" stopOpacity="0.3" />
        <stop offset="50%" stopColor="#00C2FF" stopOpacity="1" />
        <stop offset="100%" stopColor="#0A66C2" stopOpacity="0.3" />
      </linearGradient>
    </defs>
    <path
      d="M0,40 L50,40 L60,40 L70,10 L80,70 L90,25 L100,55 L110,40 L150,40 L160,40 L170,15 L180,65 L190,30 L200,50 L210,40 L250,40 L260,40 L270,10 L280,70 L290,25 L300,55 L310,40 L350,40 L360,40 L370,15 L380,65 L390,30 L400,50 L410,40 L450,40 L460,40 L470,10 L480,70 L490,25 L500,55 L510,40 L550,40 L560,40 L570,15 L580,65 L590,30 L600,50"
      fill="none"
      stroke="url(#ecgGrad)"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="animate-pulse-soft"
    />
  </svg>
)

// Circular Progress Component
const CircularProgress = ({ value, label, color = "#0A66C2" }: { value: number; label: string; color?: string }) => {
  const radius = 45
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-28 h-28">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="56" cy="56" r={radius} stroke="#E2E8F0" strokeWidth="6" fill="none" />
          <circle cx="56" cy="56" r={radius} stroke={color} strokeWidth="6" fill="none"
            strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
            className="transition-all duration-1000 ease-out" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-slate-900">{value}%</span>
        </div>
      </div>
      <span className="text-sm text-slate-500 mt-2 font-medium">{label}</span>
    </div>
  )
}

// Floating Particle
const Particle = ({ delay, left, top, size = 2 }: { delay: number; left: string; top: string; size?: number }) => (
  <div
    className="absolute bg-blue-400/20 rounded-full animate-float"
    style={{ left, top, width: size, height: size, animationDelay: `${delay}s`, animationDuration: `${6 + delay}s` }}
  />
)

// Scroll Animation Hook
const useScrollAnimation = () => {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true) },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return { ref, isVisible }
}

export default function Home() {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [activeOrgan, setActiveOrgan] = useState("heart")
  const heroRef = useScrollAnimation()
  const bodyRef = useScrollAnimation()
  const dashboardRef = useScrollAnimation()
  const techRef = useScrollAnimation()
  const doctorsRef = useScrollAnimation()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Auto-rotate organs
  useEffect(() => {
    const organs = ["heart", "brain", "lungs"]
    const interval = setInterval(() => {
      setActiveOrgan(prev => {
        const idx = organs.indexOf(prev)
        return organs[(idx + 1) % organs.length]
      })
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const organs = {
    heart: { icon: <Heart size={48} className="text-red-500" />, label: "Heart", desc: "Cardiovascular analysis", risk: "12%", status: "Normal" },
    brain: { icon: <Brain size={48} className="text-purple-500" />, label: "Brain", desc: "Neurological screening", risk: "8%", status: "Optimal" },
    lungs: { icon: <Wind size={48} className="text-blue-500" />, label: "Lungs", desc: "Respiratory assessment", risk: "15%", status: "Good" },
  }

  return (
    <>
      <Header />

      {/* ===== CINEMATIC HERO SECTION ===== */}
      <section ref={heroRef.ref} className="relative min-h-screen flex items-center bg-gradient-to-br from-white via-blue-50/30 to-cyan-50/50 overflow-hidden">
        {/* Background Layers */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-[300px] sm:w-[400px] md:w-[500px] lg:w-[600px] h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] bg-blue-200/20 rounded-full blur-3xl animate-breathe"></div>
          <div className="absolute bottom-0 right-1/4 w-[250px] sm:w-[350px] md:w-[400px] lg:w-[500px] h-[250px] sm:h-[350px] md:h-[400px] lg:h-[500px] bg-cyan-200/20 rounded-full blur-3xl animate-breathe" style={{ animationDelay: "2s" }}></div>
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(30)].map((_, i) => (
              <Particle key={i} delay={i * 0.3} left={`${Math.random() * 100}%`} top={`${Math.random() * 100}%`} size={Math.random() * 3 + 1} />
            ))}
          </div>
        </div>

        {/* Scan Line Effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="w-full h-20 sm:h-30 md:h-40 bg-gradient-to-b from-transparent via-blue-400/5 to-transparent animate-scan"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 py-16 sm:py-24 md:py-32 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content - Asymmetrical Layout */}
            <div className={`lg:col-span-7 space-y-6 sm:space-y-8 transition-all duration-1000 ${heroRef.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/80 backdrop-blur-md border border-blue-200 rounded-full shadow-soft">
                <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-blue-600 text-[10px] sm:text-xs font-semibold uppercase tracking-wider">AI-Powered Medical Intelligence</span>
              </div>

              {/* Main Heading - Large Typography */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-slate-900 leading-[1] sm:leading-[0.95] tracking-tight">
                Intelligent
                <span className="block bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-clip-text text-transparent">Healthcare</span>
                <span className="block text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl mt-2 sm:mt-4 text-slate-600 font-light">Reimagined</span>
              </h1>

              {/* Subheadline */}
              <p className="text-base sm:text-lg md:text-xl text-slate-600 leading-relaxed max-w-xl font-light">
                Real-time diagnostics, AI doctor consultations, and predictive health monitoring — a live AI system analyzing human health in real time.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4">
                <button onClick={() => navigate("/bp-estimation")} className="group relative px-6 sm:px-8 py-3.5 sm:py-4 bg-blue-600 text-white font-semibold rounded-2xl overflow-hidden shadow-glow-blue hover:shadow-medium transition-all duration-500 hover:-translate-y-1 text-sm sm:text-base">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <span className="relative flex items-center justify-center gap-2 sm:gap-3">
                    <Scan className="w-4 h-4 sm:w-5 sm:h-5" />
                    Start AI Health Scan
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
                <button onClick={() => navigate("/chat")} className="group px-6 sm:px-8 py-3.5 sm:py-4 bg-white/80 backdrop-blur-md text-slate-900 font-semibold rounded-2xl border border-slate-200 hover:border-blue-300 hover:bg-white shadow-soft hover:shadow-medium transition-all duration-500 hover:-translate-y-1 text-sm sm:text-base">
                  <span className="flex items-center justify-center gap-2 sm:gap-3">
                    <Play className="w-3 h-3 sm:w-4 sm:h-4" />
                    Consult AI Doctor
                  </span>
                </button>
              </div>

              {/* Stats Row */}
              <div className="flex gap-4 sm:gap-6 md:gap-8 pt-4 sm:pt-6">
                {[
                  { value: "10+", label: "AI Specialists" },
                  { value: "50K+", label: "Patients Served" },
                  { value: "99%", label: "Accuracy Rate" },
                ].map((stat, i) => (
                  <div key={i} className="text-center">
                    <div className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900">{stat.value}</div>
                    <div className="text-[10px] sm:text-xs text-slate-500 mt-1 font-medium">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Interactive Body Visualization */}
            <div className={`lg:col-span-5 relative transition-all duration-1000 delay-300 ${heroRef.isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
              {/* Main Body Card */}
              <div className="relative bg-white/60 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-white/50 shadow-large p-4 sm:p-6 md:p-8">
                {/* ECG Line */}
                <ECGAnimation />

                {/* Organ Selector */}
                <div className="flex justify-center gap-2 sm:gap-4 mt-4 sm:mt-6 mb-4 sm:mb-8">
                  {Object.entries(organs).map(([key, organ]) => (
                    <button key={key} onClick={() => setActiveOrgan(key)}
                      className={`flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-4 rounded-xl sm:rounded-2xl transition-all duration-500 ${activeOrgan === key ? 'bg-blue-50 border-2 border-blue-200 shadow-soft scale-105' : 'bg-white/50 border-2 border-transparent hover:border-slate-200'}`}>
                      <div className={`transition-transform duration-500 ${activeOrgan === key ? 'scale-110' : ''}`}>{organ.icon}</div>
                      <span className="text-[10px] sm:text-xs font-semibold text-slate-700">{organ.label}</span>
                    </button>
                  ))}
                </div>

                {/* Active Organ Data */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-2 sm:gap-0">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900">{organs[activeOrgan as keyof typeof organs].label} Analysis</h3>
                      <p className="text-xs sm:text-sm text-slate-500">{organs[activeOrgan as keyof typeof organs].desc}</p>
                    </div>
                    <div className="flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-emerald-50 rounded-full border border-emerald-200 w-fit">
                      <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                      <span className="text-[10px] sm:text-xs font-semibold text-emerald-700">{organs[activeOrgan as keyof typeof organs].status}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <CircularProgress value={100 - parseInt(organs[activeOrgan as keyof typeof organs].risk)} label="Health Score" color="#0A66C2" />
                    <div className="flex flex-col justify-center">
                      <div className="text-xs sm:text-sm text-slate-500 mb-1">Risk Level</div>
                      <div className="text-2xl sm:text-3xl font-bold text-slate-900">{organs[activeOrgan as keyof typeof organs].risk}</div>
                      <div className="text-[10px] sm:text-xs text-slate-400 mt-1">AI Assessment</div>
                    </div>
                  </div>
                </div>

                {/* Floating Badge */}
                <div className="absolute -top-2 sm:-top-4 -right-2 sm:-right-4 bg-white rounded-lg sm:rounded-xl p-2 sm:p-3 shadow-medium border border-slate-100 animate-float">
                  <Shield className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <ChevronDown className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400" />
          </div>
        </div>
      </section>

      {/* ===== AI DASHBOARD - FLOATING PANELS ===== */}
      <section ref={dashboardRef.ref} className="py-16 sm:py-24 md:py-32 bg-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 right-0 w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 bg-blue-100 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-0 w-60 sm:w-70 md:w-80 h-60 sm:h-70 md:h-80 bg-cyan-100 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className={`text-center mb-10 sm:mb-16 md:mb-20 transition-all duration-1000 ${dashboardRef.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <span className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-50 border border-blue-200 rounded-full text-blue-600 text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-3 sm:mb-4">Live Intelligence</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-3 sm:mb-4">AI Medical <span className="text-gradient">Dashboard</span></h2>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">Real-time health monitoring with predictive analytics and intelligent insights</p>
          </div>

          {/* Floating Panels - Asymmetrical Layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 max-w-7xl mx-auto">
            {/* Large Panel - ECG */}
            <div className={`md:col-span-8 bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-slate-200 shadow-soft transition-all duration-1000 delay-200 ${dashboardRef.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2 sm:gap-0">
                <div>
                  <h3 className="text-base sm:text-xl font-bold text-slate-900">Cardiac Monitoring</h3>
                  <p className="text-xs sm:text-sm text-slate-500">Real-time ECG analysis</p>
                </div>
                <div className="flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-emerald-50 rounded-full border border-emerald-200 w-fit">
                  <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-[10px] sm:text-xs font-semibold text-emerald-700">Live</span>
                </div>
              </div>
              <ECGAnimation />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mt-4 sm:mt-6">
                <div className="bg-white rounded-xl p-3 sm:p-4 border border-slate-200">
                  <div className="text-xs sm:text-sm text-slate-500 mb-1">Heart Rate</div>
                  <div className="text-xl sm:text-2xl font-bold text-slate-900">72 <span className="text-xs sm:text-sm text-slate-400 font-normal">BPM</span></div>
                </div>
                <div className="bg-white rounded-xl p-3 sm:p-4 border border-slate-200">
                  <div className="text-xs sm:text-sm text-slate-500 mb-1">Blood Pressure</div>
                  <div className="text-xl sm:text-2xl font-bold text-slate-900">120/80</div>
                </div>
                <div className="bg-white rounded-xl p-3 sm:p-4 border border-slate-200">
                  <div className="text-xs sm:text-sm text-slate-500 mb-1">Oxygen Level</div>
                  <div className="text-xl sm:text-2xl font-bold text-slate-900">98<span className="text-xs sm:text-sm text-slate-400 font-normal">%</span></div>
                </div>
              </div>
            </div>

            {/* Side Panel - AI Insights */}
            <div className={`md:col-span-4 space-y-4 sm:space-y-6 transition-all duration-1000 delay-400 ${dashboardRef.isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
              <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-soft hover:shadow-medium transition-all duration-500 hover:-translate-y-1">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-50 rounded-xl flex items-center justify-center"><TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" /></div>
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base">AI Insights</h4>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-blue-50 rounded-xl">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs sm:text-sm text-slate-700">Cardiovascular health optimal</p>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-amber-50 rounded-xl">
                    <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs sm:text-sm text-slate-700">Consider hydration check</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-white shadow-glow-blue">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-xl flex items-center justify-center"><Brain className="w-4 h-4 sm:w-5 sm:h-5" /></div>
                  <h4 className="font-bold text-sm sm:text-base">Neurological Status</h4>
                </div>
                <div className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Low Risk</div>
                <p className="text-xs sm:text-sm text-blue-100">All neurological indicators within normal range</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== AI TECHNOLOGY - VISUAL STORYTELLING ===== */}
      <section ref={techRef.ref} className="py-16 sm:py-24 md:py-32 bg-gradient-to-b from-white to-slate-50 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className={`text-center mb-10 sm:mb-16 md:mb-20 transition-all duration-1000 ${techRef.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <span className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-50 border border-blue-200 rounded-full text-blue-600 text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-3 sm:mb-4">Advanced Technology</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-3 sm:mb-4">Powered by <span className="text-gradient">AI Innovation</span></h2>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">Cutting-edge diagnostics using computer vision and predictive analytics</p>
          </div>

          {/* Split Layout - Visual + Text */}
          <div className="space-y-12 sm:space-y-16 md:space-y-24 max-w-6xl mx-auto">
            {technologies.map((tech, i) => (
              <div key={i} className={`grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 items-center transition-all duration-1000 ${techRef.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: `${i * 200}ms` }}>
                {/* Visual Side */}
                <div className={`order-2 lg:order-${i % 2 === 0 ? '1' : '2'}`}>
                  <div className="relative bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 border border-slate-200 shadow-soft overflow-hidden group hover:shadow-medium transition-all duration-500">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-cyan-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative flex items-center justify-center">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl sm:rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                        <div className="text-blue-600">{tech.icon}</div>
                      </div>
                    </div>
                    <div className="absolute top-2 sm:top-4 right-2 sm:right-4 px-2 sm:px-3 py-1 sm:py-1.5 bg-blue-50 rounded-full border border-blue-200">
                      <span className="text-[10px] sm:text-xs font-semibold text-blue-600">{tech.stat}</span>
                    </div>
                  </div>
                </div>

                {/* Text Side */}
                <div className={`order-1 lg:order-${i % 2 === 0 ? '2' : '1'}`}>
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900">{tech.title}</h3>
                    <p className="text-sm sm:text-base md:text-lg text-slate-600 leading-relaxed">{tech.desc}</p>
                    <button onClick={() => navigate(tech.link)} className="group inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors text-sm sm:text-base">
                      Learn more
                      <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SERVICES - NON-GENERIC ===== */}
      <section className="py-16 sm:py-24 md:py-32 bg-white relative">
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-10 sm:mb-16 md:mb-20">
            <span className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-50 border border-blue-200 rounded-full text-blue-600 text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-3 sm:mb-4">Our Services</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-3 sm:mb-4">Comprehensive <span className="text-gradient">AI Services</span></h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-7xl mx-auto">
            {services.map((service, i) => (
              <div key={i} className="group relative bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-soft hover:shadow-medium transition-all duration-500 hover:-translate-y-2 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-cyan-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-500">
                    <div className="text-blue-600">{service.icon}</div>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2 sm:mb-3 group-hover:text-blue-600 transition-colors">{service.title}</h3>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">{service.desc}</p>
                  <div className="mt-4 sm:mt-6 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-500"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== AI DOCTORS - PREMIUM CAROUSEL ===== */}
      <section ref={doctorsRef.ref} id="specialists" className="py-16 sm:py-24 md:py-32 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className={`text-center mb-10 sm:mb-16 md:mb-20 transition-all duration-1000 ${doctorsRef.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <span className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-50 border border-blue-200 rounded-full text-blue-600 text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-3 sm:mb-4">AI Specialists</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-3 sm:mb-4">Meet Your <span className="text-gradient">AI Doctors</span></h2>
            <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl mx-auto">Consult with AI-powered medical specialists across multiple disciplines</p>
          </div>

          {/* Horizontal Scroll - Premium Layout */}
          <div className="flex overflow-x-auto gap-4 sm:gap-6 pb-6 sm:pb-8 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {agents.map((agent, i) => (
              <Link key={i} to={agent.link} className="group flex-shrink-0 w-64 sm:w-72 snap-start">
                <div className="relative bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200 shadow-soft hover:shadow-medium transition-all duration-500 hover:-translate-y-2">
                  {/* Image Placeholder with Gradient Overlay */}
                  <div className="h-36 sm:h-48 bg-gradient-to-br from-blue-100 to-cyan-100 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/80 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                        <div className="text-blue-600">{agent.icon}</div>
                      </div>
                    </div>
                    <div className="absolute top-2 sm:top-4 right-2 sm:right-4 px-2 sm:px-3 py-1 sm:py-1.5 bg-white/90 backdrop-blur-sm rounded-full border border-white/50">
                      <span className="text-[10px] sm:text-xs font-semibold text-blue-600">{agent.exp}</span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">{agent.name}</h3>
                    <span className="inline-block px-2 sm:px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-lg text-[10px] sm:text-xs text-blue-600 font-medium mb-2 sm:mb-3">{agent.specialty}</span>
                    <p className="text-xs sm:text-sm text-slate-600 mb-3 sm:mb-4">{agent.desc}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-semibold text-blue-600">Consult Now</span>
                      <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="py-16 sm:py-24 md:py-32 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 rounded-2xl sm:rounded-[2rem] p-8 sm:p-12 md:p-16 text-center shadow-glow-blue relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-48 sm:w-56 md:w-64 h-48 sm:h-56 md:h-64 bg-white rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 right-0 w-36 sm:h-40 md:w-48 h-36 sm:h-40 md:h-48 bg-white rounded-full blur-3xl"></div>
            </div>

            <div className="relative">
              <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl mb-6 sm:mb-8">
                <Scan className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6">Start Your AI Health Scan Today</h2>
              <p className="text-sm sm:text-base md:text-lg text-blue-100 mb-6 sm:mb-8 md:mb-10 max-w-2xl mx-auto">Get instant insights into your health with our advanced AI diagnostics — no appointment needed</p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <button onClick={() => navigate("/bp-estimation")} className="group px-6 sm:px-8 py-3.5 sm:py-4 bg-white text-blue-600 font-semibold rounded-xl sm:rounded-2xl hover:bg-blue-50 shadow-medium transition-all duration-500 hover:-translate-y-1 text-sm sm:text-base">
                  <span className="flex items-center justify-center gap-2 sm:gap-3">
                    <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
                    BP Estimation Scan
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
                <button onClick={() => navigate("/eye-scan")} className="group px-6 sm:px-8 py-3.5 sm:py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl sm:rounded-2xl border-2 border-white/30 hover:bg-white/20 hover:border-white/50 transition-all duration-500 hover:-translate-y-1 text-sm sm:text-base">
                  <span className="flex items-center justify-center gap-2 sm:gap-3">
                    <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                    Eye Health Scan
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CONTACT SECTION ===== */}
      <section id="contact" className="py-16 sm:py-24 md:py-32 bg-slate-50 relative">
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-2xl sm:rounded-[2rem] p-6 sm:p-10 md:p-16 shadow-soft">
            <div className="text-center space-y-4 sm:space-y-6">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-blue-50 rounded-xl sm:rounded-2xl mb-3 sm:mb-4">
                <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900">Get in Touch</h2>
              <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-xl mx-auto">Have questions about our services? Our support team is ready to assist you.</p>
              <div className="pt-2 sm:pt-4">
                <a href="mailto:bashartc13@gmail.com" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors text-sm sm:text-base md:text-lg font-medium">
                  <span className="text-lg sm:text-xl">✉</span>
                  bashartc13@gmail.com
                </a>
              </div>
              <div className="pt-4 sm:pt-6">
                <button onClick={() => navigate("/chat")} className="px-6 sm:px-10 py-3 sm:py-4 bg-blue-600 text-white font-semibold rounded-xl sm:rounded-2xl hover:bg-blue-700 shadow-glow-blue hover:shadow-medium transition-all duration-500 hover:-translate-y-1 text-sm sm:text-base">
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
