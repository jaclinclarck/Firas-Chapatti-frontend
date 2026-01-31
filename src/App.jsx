"use client"

import { useState, useEffect } from "react"
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { ChefHat, History, ShoppingCart, BarChart3, SettingsIcon, LogOut } from "lucide-react"
import OrderEntry from "./components/OrderEntry"
import OrderHistory from "./components/OrderHistory"
import Statistics from "./components/Statistics"
import Settings from "./components/Settings"
import Cart from "./components/Cart"
import { translations } from "./i18n/translations"
import Login from "./components/Login"

function App() {
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState("order")
  const [cart, setCart] = useState([])
  const [language, setLanguage] = useState(localStorage.getItem("appLanguage") || "fr")
  const t = translations[language]

  useEffect(() => {
    const savedUser = localStorage.getItem("user")
    if (savedUser) setUser(JSON.parse(savedUser))
  }, [])

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang)
    localStorage.setItem("appLanguage", newLang)
  }

  const addToCart = (item) => setCart([...cart, item])
  const removeFromCart = (index) => setCart(cart.filter((_, i) => i !== index))
  const clearCart = () => setCart([])

  // ---------------- LOGOUT ----------------
  const handleLogout = () => {
    localStorage.removeItem("user")
    setUser(null)
  }

  // ---------------- PROTECTED APP UI ----------------
  const AppContent = () => (
    <div className="min-h-screen bg-background" dir={language === "ar" ? "rtl" : "ltr"}>
      {/* Header */}
      <header className="bg-primary text-white shadow-lg">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <ChefHat size={40} />
            <div>
              <h1 className="text-3xl font-bold">{t.appTitle}</h1>
              <p className="text-sm text-blue-100">{t.appSubtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
              <ShoppingCart size={20} />
              <span className="font-semibold">{cart.length} {t.items}</span>
            </div>
            <button
              onClick={handleLogout}
              className="ml-4 flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
            >
              <LogOut size={18} />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="border-b bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab("order")}
              className={`px-6 py-4 font-medium transition-colors relative whitespace-nowrap ${activeTab === "order" ? "text-primary border-b-2 border-primary" : "text-gray-600 hover:text-primary"}`}
            >
              <div className="flex items-center gap-2">
                <ShoppingCart size={20} />
                <span>{t.newOrder}</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-6 py-4 font-medium transition-colors relative whitespace-nowrap ${activeTab === "history" ? "text-primary border-b-2 border-primary" : "text-gray-600 hover:text-primary"}`}
            >
              <div className="flex items-center gap-2">
                <History size={20} />
                <span>{t.history}</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("statistics")}
              className={`px-6 py-4 font-medium transition-colors relative whitespace-nowrap ${activeTab === "statistics" ? "text-primary border-b-2 border-primary" : "text-gray-600 hover:text-primary"}`}
            >
              <div className="flex items-center gap-2">
                <BarChart3 size={20} />
                <span>{t.statistics}</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`px-6 py-4 font-medium transition-colors relative whitespace-nowrap ${activeTab === "settings" ? "text-primary border-b-2 border-primary" : "text-gray-600 hover:text-primary"}`}
            >
              <div className="flex items-center gap-2">
                <SettingsIcon size={20} />
                <span>{t.settings}</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {activeTab === "statistics" || activeTab === "settings" ? (
          <div>
            {activeTab === "statistics" && <Statistics t={t} />}
            {activeTab === "settings" && <Settings t={t} language={language} setLanguage={handleLanguageChange} />}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {activeTab === "order" && <OrderEntry addToCart={addToCart} t={t} />}
              {activeTab === "history" && <OrderHistory t={t} />}
            </div>
            <div className="lg:col-span-1">
              <Cart cart={cart} removeFromCart={removeFromCart} clearCart={clearCart} t={t} />
            </div>
          </div>
        )}
      </main>
    </div>
  )

  // ---------------- ROUTAGE LOGIN ----------------
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/app" element={user ? <AppContent /> : <Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to={user ? "/app" : "/login"} replace />} />
      </Routes>
    </Router>
  )
}

export default App
