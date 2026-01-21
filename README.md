# Jam-Jem Chapatti - Frontend

Application React pour la gestion des commandes du restaurant Jam-Jem Chapatti.

## Installation

1. Installer les dépendances :
```bash
cd frontend
npm install
```

2. Créer un fichier `.env` :
```bash
cp .env.example .env
```

3. Configurer l'URL de l'API dans `.env` :
```
VITE_API_URL=http://localhost:5000/api
```

## Démarrage

### Important : Démarrer le backend d'abord

Assurez-vous que le backend est démarré avant le frontend :

```bash
# Terminal 1 - Backend
cd backend
npm run dev
```

Ensuite, démarrer le frontend :

```bash
# Terminal 2 - Frontend
cd frontend
npm run dev
```

L'application sera accessible sur http://localhost:3000

## Fonctionnalités

- Interface de prise de commande rapide
- Sélection de produits (Chapattis) avec chargement depuis l'API
- Ajout de suppléments
- Gestion du panier
- Création de commandes en base de données
- Génération de 2 reçus (cuisine + client) avec numéro de commande unique
- Historique des commandes en temps réel
- Mise à jour du statut des commandes
- Recherche et filtrage
- Suppression de commandes

## Structure

```
src/
  ├── components/
  │   ├── OrderEntry.jsx      # Saisie de commande (connecté à l'API)
  │   ├── Cart.jsx             # Panier (création commande API)
  │   ├── OrderHistory.jsx     # Historique (lecture/mise à jour API)
  │   └── Receipt.jsx          # Reçus imprimables
  ├── services/
  │   └── api.js               # Service API centralisé
  ├── App.jsx                  # Composant principal
  └── main.jsx                 # Point d'entrée
```

## Technologies

- React 18
- Vite
- Tailwind CSS
- Lucide React (icônes)
- Axios (API calls)

## API Endpoints utilisés

- `GET /api/menu` - Récupérer le menu
- `POST /api/orders` - Créer une commande
- `GET /api/orders` - Récupérer les commandes
- `PUT /api/orders/:id` - Mettre à jour une commande
- `DELETE /api/orders/:id` - Supprimer une commande
