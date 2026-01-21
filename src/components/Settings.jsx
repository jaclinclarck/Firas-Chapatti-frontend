"use client"

import { useState, useEffect } from "react"
import { SettingsIcon, Save, Lock, Globe } from "lucide-react"
import axios from "axios"

function Settings({ t, language, setLanguage }) {
  const [settings, setSettings] = useState({
    restaurantName: "Jam-Jem Chapatti",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [message, setMessage] = useState("")

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem("appSettings")
    if (savedSettings) {
      setSettings({ ...settings, ...JSON.parse(savedSettings) })
    }
  }, [])

  const handleChange = (field, value) => {
    setSettings({ ...settings, [field]: value })
  }

  const handleSaveSettings = () => {
    const { currentPassword, newPassword, confirmPassword, ...settingsToSave } = settings

    // Save general settings
    localStorage.setItem("appSettings", JSON.stringify(settingsToSave))
    setMessage("Paramètres enregistrés avec succès!")
    setTimeout(() => setMessage(""), 3000)
  }

const handlePasswordChange = async () => {
  if (!settings.currentPassword || !settings.newPassword || !settings.confirmPassword) {
    setMessage("Veuillez remplir tous les champs")
    return
  }

  if (settings.newPassword !== settings.confirmPassword) {
    setMessage("Les mots de passe ne correspondent pas")
    return
  }

  try {
    const user = JSON.parse(localStorage.getItem("user"))

    await axios.post("http://localhost:5000/api/auth/change-password", {
      email: user.email,
      currentPassword: settings.currentPassword,
      newPassword: settings.newPassword,
    })

    setMessage("Mot de passe modifié avec succès")
    setSettings({
      ...settings,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    })
  } catch (err) {
    setMessage(err.response?.data?.message || "Erreur serveur")
  }
}


  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <SettingsIcon className="text-primary" size={32} />
        <h2 className="text-2xl font-bold text-gray-800">{t.appSettings}</h2>
      </div>

      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">{message}</div>
      )}

      {/* General Settings */}
      <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Globe size={20} />
          Paramètres généraux
        </h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t.restaurantName}</label>
          <input
            type="text"
            value={settings.restaurantName}
            onChange={(e) => handleChange("restaurantName", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t.language}</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="fr">{t.french}</option>
            <option value="ar">{t.arabic}</option>
          </select>
        </div>

        <button
          onClick={handleSaveSettings}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Save size={20} />
          {t.saveSettings}
        </button>
      </div>

      {/* Password Settings */}
      <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Lock size={20} />
          {t.changePassword}
        </h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t.currentPassword}</label>
          <input
            type="password"
            value={settings.currentPassword}
            onChange={(e) => handleChange("currentPassword", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t.newPassword}</label>
          <input
            type="password"
            value={settings.newPassword}
            onChange={(e) => handleChange("newPassword", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t.confirmPassword}</label>
          <input
            type="password"
            value={settings.confirmPassword}
            onChange={(e) => handleChange("confirmPassword", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <button
          onClick={handlePasswordChange}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Lock size={20} />
          {t.updatePassword}
        </button>
      </div>
    </div>
  )
}

export default Settings
