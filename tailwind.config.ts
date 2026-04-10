import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "#FFFFFF",
        foreground: "#0F172A",
        primary: {
          DEFAULT: "#0A66C2",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#00C2FF",
          foreground: "#0F172A",
        },
        accent: {
          DEFAULT: "#F5F7FA",
          foreground: "#0F172A",
        },
        muted: {
          DEFAULT: "#F1F5F9",
          foreground: "#64748B",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#0F172A",
        },
        alert: {
          emergency: "#FF6B6B",
          warning: "#F59E0B",
          info: "#3B82F6",
          success: "#10B981",
        },
        destructive: {
          DEFAULT: "#FF6B6B",
          foreground: "#FFFFFF",
        },
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#0F172A",
        },
        sidebar: {
          DEFAULT: "#F8FAFC",
          foreground: "#0F172A",
          primary: "#0A66C2",
          "primary-foreground": "#FFFFFF",
          accent: "#00C2FF",
          "accent-foreground": "#0F172A",
          border: "#E2E8F0",
          ring: "#0A66C2",
        },
      },
      borderRadius: {
        lg: "24px",
        md: "16px",
        sm: "12px",
      },
      boxShadow: {
        'soft': '0 2px 12px rgba(10, 102, 194, 0.06)',
        'medium': '0 8px 24px rgba(10, 102, 194, 0.12)',
        'large': '0 16px 48px rgba(10, 102, 194, 0.16)',
        'glow-blue': '0 0 30px rgba(10, 102, 194, 0.25)',
        'glow-cyan': '0 0 30px rgba(0, 194, 255, 0.2)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-gradient': 'linear-gradient(135deg, #FFFFFF 0%, #F5F7FA 50%, #E8F4FD 100%)',
        'scan-line': 'linear-gradient(180deg, transparent 0%, rgba(0, 194, 255, 0.15) 50%, transparent 100%)',
        'glass': 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.85", transform: "scale(1.02)" },
        },
        "scan": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "33%": { transform: "translateY(-8px) rotate(1deg)" },
          "66%": { transform: "translateY(-4px) rotate(-1deg)" },
        },
        "ecg": {
          "0%, 100%": { transform: "scaleX(1)" },
          "50%": { transform: "scaleX(1.05)" },
        },
        "count-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-left": {
          "0%": { opacity: "0", transform: "translateX(-50px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(50px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "rotate-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "breathe": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.03)" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(10, 102, 194, 0.2)" },
          "50%": { boxShadow: "0 0 40px rgba(10, 102, 194, 0.4)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
        "scan": "scan 3s linear infinite",
        "float": "float 6s ease-in-out infinite",
        "ecg": "ecg 1.5s ease-in-out infinite",
        "count-up": "count-up 0.8s ease-out forwards",
        "fade-in": "fade-in 0.8s ease-out forwards",
        "slide-in-left": "slide-in-left 0.8s ease-out forwards",
        "slide-in-right": "slide-in-right 0.8s ease-out forwards",
        "rotate-slow": "rotate-slow 20s linear infinite",
        "breathe": "breathe 4s ease-in-out infinite",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    function({ addUtilities }: any) {
      addUtilities({
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
      })
    },
  ],
} satisfies Config;
