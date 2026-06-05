# Guide d'Installation - Cabinet Dentaire

## Prérequis

- Node.js 18+
- npm
- Compte Convex (gratuit) : https://convex.dev

## Installation Rapide

```bash
# 1. Cloner le projet
cd dental-clinic

# 2. Installer les dépendances
npm install

# 3. Lancer Convex (configure le backend local)
npx convex dev

# 4. Démarrer l'application
npm run dev
```

## Configuration

### Variables d'environnement

Créez un fichier `.env.local` à la racine :

```env
# Convex
NEXT_PUBLIC_CONVEX_URL=http://127.0.0.1:3210
CONVEX_DEPLOYMENT=local
```

Ces variables sont automatiquement créées lors de `npx convex dev`.

## Mode Démonstration (sans Convex)

Si vous souhaitez tester l'application sans configurer Convex :

1. Commentez ou supprimez `NEXT_PUBLIC_CONVEX_URL` dans `.env.local`
2. L'application démarre en mode démonstration avec des données mockées
3. Connectez-vous avec n'importe quel email (mot de passe 6+ caractères)

## Mode Production (avec Convex)

```bash
# 1. Déployer le backend Convex
npx convex deploy

# 2. Amorcer les données de démonstration
npx convex run seed:seed '{}'

# 3. Construire le frontend
npm run build

# 4. Démarrer
npm start
```

## Comptes de démonstration

| Rôle | Email | Mot de passe |
|------|-------|-------------|
| Administrateur | admin@cabinet.com | admin123 |
| Dentiste | dentist@cabinet.com | admin123 |
| Dentiste | dentiste2@cabinet.com | admin123 |
| Secrétaire | secretaire@cabinet.com | admin123 |

## Structure du Projet

```
dental-clinic/
├── convex/                    # Backend Convex
│   ├── schema.ts             # Schéma de la base de données
│   ├── auth.ts               # Authentification
│   ├── users.ts              # Gestion des utilisateurs
│   ├── patients.ts           # CRUD patients
│   ├── appointments.ts       # Gestion des rendez-vous
│   ├── medicalRecords.ts     # Dossiers médicaux & odontogramme
│   ├── invoices.ts           # Facturation
│   ├── payments.ts           # Paiements
│   ├── stock.ts              # Gestion des stocks
│   ├── suppliers.ts          # Fournisseurs
│   ├── dashboard.ts          # Statistiques & rapports
│   ├── seed.ts               # Données de démonstration
│   └── _generated/           # Code généré par Convex
├── src/
│   ├── app/                  # Pages Next.js (App Router)
│   │   ├── (auth)/login/    # Page de connexion
│   │   └── (dashboard)/     # Pages protégées
│   │       ├── dashboard/   # Tableau de bord
│   │       ├── patients/    # Gestion des patients
│   │       ├── appointments/ # Agenda & rendez-vous
│   │       ├── medical-records/ # Dossiers médicaux
│   │       ├── billing/     # Facturation & paiements
│   │       ├── stock/       # Gestion des stocks
│   │       ├── reports/     # Rapports & statistiques
│   │       └── users/       # Gestion des utilisateurs
│   ├── components/          # Composants réutilisables
│   │   ├── ui/              # Composants shadcn/ui
│   │   ├── layout/          # Header, Sidebar, AppShell
│   │   ├── dashboard/       # Widgets du tableau de bord
│   │   ├── patients/        # Composants patients
│   │   ├── appointments/    # Composants rendez-vous
│   │   ├── medical/         # Odontogramme
│   │   ├── billing/         # Facturation
│   │   ├── stock/           # Stock
│   │   ├── reports/         # Rapports
│   │   └── users/           # Utilisateurs
│   ├── hooks/               # Hooks personnalisés
│   ├── lib/                 # Utilitaires
│   │   ├── types.ts         # Types TypeScript
│   │   ├── utils.ts         # Fonctions utilitaires
│   │   ├── toast.tsx        # Système de notifications
│   │   └── zod-schemas.ts   # Schémas de validation
│   └── convex/              # Code généré Convex
├── public/                   # Fichiers statiques
└── package.json
```

## Fonctionnalités

### Modules Principaux

1. **Tableau de Bord** - Widgets statistiques en temps réel
2. **Patients** - Gestion complète avec recherche multicritère
3. **Rendez-vous** - Calendrier interactif avec Drag & Drop
4. **Dossier Médical** - Odontogramme interactif, prescriptions, traitements
5. **Facturation** - Factures, paiements partiels/totaux, assurance
6. **Stock** - Gestion des produits avec alertes de seuil
7. **Rapports** - Statistiques financières et médicales
8. **Utilisateurs** - Gestion des rôles et permissions

### Sécurité

- Authentification sécurisée (SHA-256)
- Contrôle d'accès par rôle (Admin/Dentiste/Secrétaire)
- Validation Zod côté client et serveur
- Dark Mode
- Responsive (mobile/tablette/desktop)

## Déploiement

### Frontend (Vercel)

```bash
npx vercel deploy
```

### Backend (Convex Cloud)

```bash
npx convex deploy --prod
```
