import type React from "react"
import { useState } from "react"
import { Menu, X, Activity } from "lucide-react"

interface ChatLayoutProps {
  sidebar: React.ReactNode
  children: React.ReactNode
}

const ChatLayout: React.FC<ChatLayoutProps> = ({ sidebar, children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900 overflow-hidden">
      {/* Mobile Sidebar Toggle */}
      <button
        className="fixed bottom-6 left-6 z-40 p-3 rounded-xl bg-blue-600 hover:bg-blue-700 md:hidden shadow-glow-blue transition-all duration-500 hover-lift"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        aria-label="Toggle sidebar"
      >
        {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex md:w-72 bg-white border-r border-slate-200 shadow-soft flex-col">
        <div className="overflow-y-auto flex-1">{sidebar}</div>
      </aside>

      {/* Sidebar - Mobile */}
      <div className={`fixed inset-y-0 left-0 w-72 bg-white border-r border-slate-200 z-30 transform transition-transform duration-700 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:hidden shadow-large`}>
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <span className="text-slate-900 font-bold">AI Specialists</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="text-slate-400 hover:text-slate-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto h-[calc(100%-60px)]">{sidebar}</div>
      </div>

      {/* Overlay */}
      {isSidebarOpen && <div className="fixed inset-0 bg-slate-900/30 z-20 md:hidden" onClick={() => setIsSidebarOpen(false)} />}

      {/* Main Area */}
      <main className="flex-1 flex flex-col bg-transparent overflow-hidden">{children}</main>
    </div>
  )
}

export default ChatLayout
