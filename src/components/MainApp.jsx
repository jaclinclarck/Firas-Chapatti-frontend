"use client"

function MainApp({ user, onLogout }) {
  return (
    <div>
      <header className="bg-primary text-white p-4 flex justify-between">
        <h1>Bienvenue {user.email}</h1>
        <button
          className="bg-red-500 px-4 py-2 rounded"
          onClick={onLogout}
        >
          Déconnexion
        </button>
      </header>

      <main className="p-4">
        {/* Ici ton contenu principal de l'application */}
        <p>Interface principale de l'application</p>
      </main>
    </div>
  )
}

export default MainApp
