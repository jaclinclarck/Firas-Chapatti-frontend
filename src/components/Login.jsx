"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { UtensilsCrossed } from "lucide-react"
import { login } from "../services/api"

export default function Login({ setUser }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()
  
    const handleSubmit = async (e) => {
      e.preventDefault()
      setError("")

      try {
        const userData = await login(email.trim(), password.trim())
        localStorage.setItem("user", JSON.stringify(userData))
        setUser(userData)
        navigate("/app")
      } catch (err) {
        setError(err?.response?.data?.message || "Erreur de connexion")
      }
    }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden flex">

        {/* 🔵 LEFT – BRAND JAM-JEM */}
        <div className="hidden md:flex w-1/2 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-500 text-white p-10 flex-col justify-center">
          <div className="flex items-center gap-3 mb-6">
            <UtensilsCrossed size={32} />
            <h1 className="text-3xl font-bold">Jam-Jem Chapatti</h1>
          </div>

          <h2 className="text-2xl font-semibold mb-4">
            Bienvenue 👋
          </h2>

          <p className="text-sm leading-relaxed opacity-95">
            Connectez-vous pour gérer vos commandes, produits,
            statistiques et performances de votre fast-food
            en toute simplicité.
          </p>

          <p className="mt-8 text-xs opacity-80">
            © {new Date().getFullYear()} Jam-Jem Chapatti
          </p>
        </div>

        {/* ⬜ RIGHT – LOGIN FORM */}
        <div className="w-full md:w-1/2 p-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Connexion
          </h2>
          <p className="text-sm text-gray-500 mb-8">
            Accédez à votre espace d’administration
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* EMAIL */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Adresse email
              </label>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full p-2 border rounded"
                />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Mot de passe
              </label>
                <input
                    type="password"
                    placeholder="Mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full p-2 border rounded"
                />
            </div>

            {/* ERROR MESSAGE */}
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}

            {/* BUTTON */}
            <button
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition shadow-md"
            >
              Se connecter
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
