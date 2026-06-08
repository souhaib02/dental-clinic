# AI Handoff Document — Cabinet Dentaire

## Project Overview

**Purpose:** Application web moderne de gestion de cabinet dentaire destinée aux dentistes, secrétaires et administrateurs. Elle permet la gestion complète des patients, rendez-vous, dossiers médicaux (avec odontogramme interactif), facturation, stocks, rapports et utilisateurs.

**Target Users:**
- **Administrateur** — accès complet, gestion des utilisateurs, paramétrage
- **Dentiste** — patients, rendez-vous, dossiers médicaux, diagnostics, traitements, prescriptions
- **Secrétaire** — rendez-vous, patients, encaissements, facturation, consultation limitée des dossiers

**Main Features:**
- Tableau de bord avec widgets statistiques en temps réel
- Gestion des patients (CRUD, recherche multicritère, historique complet)
- Agenda interactif (FullCalendar avec vues jour/semaine/mois, Drag & Drop)
- Dossier médical avec odontogramme interactif (32 dents, codage FDI)
- Prescriptions et traitements
- Facturation et paiements (partiel/total, multiple modes)
- Gestion des stocks avec alertes de seuil
- Rapports financiers, patients, rendez-vous, traitements
- Gestion des utilisateurs et rôles
- Dark mode, responsive, validation Zod

---

## Tech Stack

| Composant | Technologie | Version |
|---|---|---|
| Framework | Next.js | 16.2.7 |
| Langage | TypeScript | ~5.x |
| CSS | Tailwind CSS | v4 |
| UI Components | Shadcn/ui (Radix primitives) | — |
| Backend/Database | Convex | 1.40.0 |
| Auth | Convex custom auth (SHA-256) | — |
| Forms | React Hook Form + Zod | 7.77 / 4.4 |
| Calendar | FullCalendar | 6.1.20 |
| Charts | Recharts (installé, non utilisé) + div/css charts | 3.8.1 |
| Icons | Lucide React | 1.17 |
| Date | date-fns | 4.4 |
| Table | TanStack Table | 8.21 |
| Hashing | Web Crypto API (SHA-256) | natif |
| Deployment (frontend) | Vercel (recommandé) | — |
| Deployment (backend) | Convex Cloud | — |

---

## Architecture

### Frontend Structure (Next.js App Router)

```
src/
├── app/                          # Pages (App Router)
│   ├── layout.tsx                # Root layout (polices + Providers)
│   ├── page.tsx                  # Root → redirect vers /dashboard ou /login
│   ├── globals.css               # Styles globaux + variables CSS dark mode
│   ├── (auth)/
│   │   └── login/
│   │       ├── page.tsx          # Login page (demo mode)
│   │       └── convex-login.tsx  # Login page (Convex mode, lazy-loaded)
│   └── (dashboard)/
│       ├── layout.tsx            # Auth guard + AppShell wrapper
│       ├── dashboard/page.tsx    # Tableau de bord
│       ├── patients/page.tsx     # Liste patients
│       ├── patients/[id]/page.tsx# Détail patient (5 onglets)
│       ├── patients/new/page.tsx # Nouveau patient
│       ├── appointments/page.tsx # Agenda FullCalendar
│       ├── medical-records/page.tsx # Dossier médical + odontogramme
│       ├── billing/page.tsx      # Facturation & paiements
│       ├── stock/page.tsx        # Gestion des stocks
│       ├── reports/page.tsx      # Rapports & statistiques
│       └── users/page.tsx        # Gestion des utilisateurs
├── components/
│   ├── ui/                       # Shadcn/UI components (23 composants)
│   ├── layout/
│   │   ├── app-shell.tsx         # Layout principal (sidebar + header + main)
│   │   ├── sidebar.tsx           # Navigation latérale
│   │   └── header.tsx            # En-tête (search, notifs, user menu, dark mode)
│   ├── medical/
│   │   └── odontogram.tsx        # Odontogramme interactif
│   └── appointments/
│       └── appointment-form.tsx  # Formulaire rendez-vous réutilisable
├── hooks/
│   └── use-auth.ts               # Hook d'authentification (localStorage)
├── lib/
│   ├── types.ts                  # Types TypeScript (toutes les entités)
│   ├── utils.ts                  # Utilitaires (cn, formatCurrency, etc.)
│   ├── zod-schemas.ts            # Schémas Zod pour validation
│   └── toast.tsx                 # Système de notifications (Context)
└── convex/                       # Generated Convex client code
```

### Backend Structure (Convex)

```
convex/
├── schema.ts                     # Schéma de la base de données (15 tables)
├── auth.ts                       # Mutation login + query getCurrentUser
├── users.ts                      # CRUD utilisateurs + getActiveDentists
├── patients.ts                   # CRUD patients + count
├── appointments.ts               # CRUD rendez-vous + listes par date/dentiste/statut
├── medicalRecords.ts             # Dossiers médicaux, odontogramme, traitements, prescriptions
├── invoices.ts                   # CRUD factures + stats
├── payments.ts                   # CRUD paiements + mise à jour statut facture
├── stock.ts                      # CRUD articles + mouvements + alertes
├── suppliers.ts                  # CRUD fournisseurs
├── dashboard.ts                  # Statistiques dashboard, revenus, traitements
├── seed.ts                       # Données de démonstration (4 users, 10 patients, etc.)
├── auth/
│   └── config.ts                 # Config Convex Auth (providers vides)
└── _generated/                   # Code généré par Convex (ne pas modifier)
```

### Data Flow

```
Browser → Convex React Client → Convex Backend (WebSocket)
  ↓                                ↓
React State ← useQuery/useMutation ← Convex Database (SQLite-like)
  ↓
localStorage (auth user session)
```

### Authentication Flow

1. L'utilisateur soumet email + mot de passe
2. `login` mutation Convex : hash SHA-256 du mot de passe, compare avec `passwordHash` stocké
3. Renvoie les infos utilisateur (sauf le hash)
4. Le frontend stocke l'utilisateur dans `localStorage` via le hook `useAuth`
5. Le layout `(dashboard)/layout.tsx` vérifie `useAuth().isAuthenticated` et redirige vers `/login` si faux
6. Mode démo : sans `NEXT_PUBLIC_CONVEX_URL`, connexion accepte n'importe quel email (6+ car.)

---

## Convex Backend

### Schema Definitions (15 tables)

**users**
- `email` (string), `name` (string), `role` ("admin"|"dentist"|"secretary"), `phone` (optional string), `isActive` (boolean), `lastLogin` (optional number), `passwordHash` (string)
- Index: `by_email`

**patients**
- `firstName`, `lastName`, `dateOfBirth`, `gender`, `phone`, `email?`, `address?`, `profession?`, `bloodGroup?`, `allergies?`, `medicalHistory?`, `ongoingTreatments?`, `insuranceCompany?`, `insuranceNumber?`, `avatar?`, `createdBy`
- Indexes: `by_name`, `by_phone`, `by_createdBy`

**appointments**
- `patientId`, `dentistId`, `date`, `startTime`, `endTime`, `status` (scheduled|confirmed|pending|cancelled|completed), `reason?`, `notes?`, `createdBy`
- Indexes: `by_date`, `by_patient`, `by_dentist`, `by_status`, `by_dentist_date`

**odontogramEntries**
- `patientId`, `toothNumber`, `status` (healthy|decayed|filled|crowned|extracted|root_canal|implant|bridge|missing), `notes?`, `treatment?`, `date`, `createdBy`
- Indexes: `by_patient`, `by_patient_tooth`

**medicalRecords**
- `patientId`, `type` (diagnosis|clinical_note|prescription|treatment_plan), `title`, `description?`, `doctorId`, `date`, `attachments?`
- Indexes: `by_patient`, `by_patient_date`

**treatments**
- `patientId`, `name`, `description?`, `toothNumber?`, `cost`, `status` (planned|in_progress|completed|cancelled), `startDate`, `endDate?`, `doctorId`, `notes?`
- Indexes: `by_patient`, `by_doctor`, `by_status`

**prescriptions**
- `patientId`, `doctorId`, `medication`, `dosage`, `frequency`, `duration`, `notes?`, `date`
- Indexes: `by_patient`, `by_doctor`

**invoices**
- `patientId`, `invoiceNumber`, `items[]` ({description, quantity, unitPrice, total}), `subtotal`, `tax`, `total`, `paidAmount`, `status` (partial|paid|unpaid), `dueDate`, `issuedDate`, `notes?`, `createdBy`
- Indexes: `by_patient`, `by_status`, `by_number`, `by_issuedDate`

**payments**
- `invoiceId`, `patientId`, `amount`, `method` (cash|card|transfer|insurance), `date`, `reference?`, `notes?`, `receivedBy`
- Indexes: `by_invoice`, `by_patient`, `by_date`

**insuranceClaims**
- `patientId`, `invoiceId`, `insuranceCompany`, `claimAmount`, `coveredAmount`, `remainingAmount`, `status` (submitted|approved|rejected|paid), `submissionDate`, `approvalDate?`, `notes?`
- Indexes: `by_patient`, `by_status`

**stockItems**
- `name`, `reference`, `category`, `quantity`, `minThreshold`, `unitPrice`, `supplierId?`, `description?`
- Indexes: `by_reference`, `by_category`, `by_quantity`

**stockMovements**
- `itemId`, `type` (purchase|return|consumption|loss), `quantity`, `date`, `notes?`, `userId`
- Indexes: `by_item`, `by_date`

**suppliers**
- `name`, `contact`, `phone`, `email?`, `address?`
- (no indexes)

**notifications**
- `type` (stock_alert|payment|appointment|system), `title`, `message`, `read`, `userId?`, `link?`
- Indexes: `by_user`, `by_read`, `by_type`

**auditLogs**
- `userId`, `action`, `resource`, `resourceId?`, `details?`, `ip?`
- Indexes: `by_user`, `by_action`, `by_resource`

### Key Relationships
- `appointments.patientId` → `patients._id`
- `appointments.dentistId` → `users._id`
- `payments.invoiceId` → `invoices._id`
- `stockItems.supplierId` → `suppliers._id`
- `medicalRecords.doctorId` → `users._id`

### Queries/Mutations Pattern
Tous les modules suivent le même pattern CRUD :
- `list` / `getById` → queries
- `create` / `update` / `remove` → mutations
- Des fonctions spécifiques par module : `getUpcoming`, `getTodayAppointments`, `getLowStockItems`, etc.

### Password Hashing
Utilise `crypto.subtle.digest("SHA-256", ...)` avec un salt fixe `"dental-clinic-salt"`. Pas de bcrypt (non supporté par le runtime Convex).

---

## Next.js Frontend

### App Router Structure

Route groups :
- `(auth)/` — pages publiques (login)
- `(dashboard)/` — pages protégées (layout avec AppShell, sidebar, header)

Toutes les pages sont en `"use client"`. La page de login Convex est importée dynamiquement avec `ssr: false` pour éviter les erreurs de rendu serveur.

### State Management
- **Auth** : localStorage + hook `useAuth()` — pas de Convex Auth SDK, implémentation maison
- **Formulaires** : React Hook Form avec Zod resolver
- **Toast/Notifications** : Context React personnalisé (`useToast`)
- **Données** : Convex React hooks (`useQuery`, `useMutation`) ou mock data
- **Thème** : dark mode via classe CSS `.dark` sur `<html>`, toggle via bouton dans le header

### Mock Data Fallback
Quand `NEXT_PUBLIC_CONVEX_URL` n'est pas défini, chaque page utilise des données mockées statiques (tableaux en mémoire). Cela permet de développer et démontrer sans backend Convex.

### Key Components
- **AppShell** → sidebar + header + main + Toaster
- **Sidebar** → navigation avec icônes Lucide, lien actif via usePathname(), responsive
- **Header** → titre de page, recherche, notifications, dark mode toggle, menu utilisateur
- **Odontogram** → 32 dents en 4 quadrants, code couleur par statut, clic pour modifier

---

## Environment Variables

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_CONVEX_URL` | URL du déploiement Convex (http://127.0.0.1:3210 en local). Si absent, mode démo. |
| `CONVEX_DEPLOYMENT` | Nom du déploiement Convex (ex: anonymous:anonymous-dental-clinic) |
| `NEXT_PUBLIC_CONVEX_SITE_URL` | URL du site Convex (http://127.0.0.1:3211 en local) |

Ces variables sont générées par `npx convex dev` dans `.env.local`.

---

## File Structure

### Fichiers Racine
| File | Purpose |
|---|---|
| `convex/schema.ts` | Définition du schéma de base de données |
| `convex/*.ts` | Fonctions Convex (queries/mutations) |
| `src/app/layout.tsx` | Root layout |
| `src/app/page.tsx` | Page racine (redirection) |
| `src/app/globals.css` | Styles globaux avec variables CSS |
| `src/lib/types.ts` | Types TypeScript |
| `src/lib/zod-schemas.ts` | Schémas de validation |
| `src/lib/utils.ts` | Fonctions utilitaires |
| `src/lib/toast.tsx` | Système de notifications |
| `src/hooks/use-auth.ts` | Hook d'authentification |
| `src/components/providers.tsx` | Providers (Convex, Tooltip, Toast) |
| `INSTALLATION.md` | Guide d'installation |
| `AI_HANDOFF.md` | Ce document |

---

## Completed Features

### Fully Implemented
- [x] Authentification (Convex + mode démo)
- [x] Dashboard avec widgets statistiques (7 cartes + paiements récents + graphique revenus)
- [x] Patients (liste, recherche, création, édition, suppression, détail avec 5 onglets)
- [x] Rendez-vous (FullCalendar vues jour/semaine/mois, Drag & Drop, filtres, CRUD)
- [x] Odontogramme interactif (32 dents, 9 statuts, code couleur, clic pour modifier)
- [x] Dossier médical (notes cliniques, diagnostics, traitements, prescriptions)
- [x] Facturation (création avec articles dynamiques, statuts, détail, historique paiements)
- [x] Paiements (création avec validation, mise à jour statut facture)
- [x] Stocks (CRUD produits, mouvements, fournisseurs, alertes seuil)
- [x] Rapports (4 onglets : financier, patients, rendez-vous, traitements avec graphiques)
- [x] Utilisateurs (CRUD, rôles, permissions, activation/désactivation)
- [x] Dark mode
- [x] Données de démonstration (seed)
- [x] Mode démonstration (sans Convex)
- [x] Responsive (sidebar mobile, grilles adaptatives)
- [x] Validation Zod (formulaires)

### Partially Implemented
- [ ] Convex Auth SDK (config présent mais providers vides — auth custom via mutation)
- [ ] Upload fichiers (radiographies, photos) — `avatar` et `attachments` dans le schéma mais UI non implémentée
- [ ] Assurance (table `insuranceClaims` définie mais UI non branchée)
- [ ] Audit logs (table définie mais aucun enregistrement)
- [ ] Notifications en temps réel (table définie mais UI de notification basique)
- [ ] Recherche avancée patients (filtres combinés)
- [ ] Pagination sur toutes les listes
- [ ] Tests (unitaires, E2E)

---

## Known Issues

### Bugs
1. **SockJS 404 errors** — Le dashboard Convex tente des connexions WebSocket via `/sockjs/info`, sans impact fonctionnel
2. **LF/CRLF warnings** sur Windows (normal, sans impact)

### Technical Debt
1. Pas de `Convex Auth SDK` — l'authentification est custom (hash SHA-256, stockage localStorage). Migrer vers `@convex-dev/auth` recommandé
2. Mock data duplicate dans chaque page — les pages ont leur propre tableau de données mockées. Refactoriser en un module partagé
3. Tous les composants sont `"use client"` — optimisable avec Server Components
4. Les graphiques sont en div/css — Recharts installé mais non utilisé. Migrer quand les problèmes de dépendances seront résolus
5. Pas de SSR pour les pages dashboard (tout est client-side)
6. Gestion d'erreurs Convex basique — les erreurs sont catchées mais pourraient être plus granulaires

### Performance Concerns
1. Les listes chargent toutes les données sans pagination — problématique avec +1000 entrées
2. L'odontogramme pourrait être lent si beaucoup d'entrées par patient
3. FullCalendar charge tous les événements en mémoire

---

## Development Decisions

### Why not Convex Auth SDK ?
Le SDK `@convex-dev/auth` était installé mais l'authentification custom a été choisie pour :
- Simplicité de mise en œuvre
- Pas de dépendance à un fournisseur OAuth
- Contrôle total sur le flux d'authentification
- Mode démonstration sans backend

### Why SHA-256 instead of bcrypt ?
Le runtime Convex ne supporte pas les imports dynamiques (`require`/`import`) pour les modules natifs comme bcryptjs. `crypto.subtle.digest` est l'API native disponible dans le runtime.

### Why lazy import for Convex login page ?
`useMutation` de Convex lance une erreur si utilisé hors du `ConvexProvider`. En SSR, le provider n'est pas monté. Le lazy loading avec `ssr: false` contourne ce problème.

### Why mock data fallback ?
Permet le développement frontend indépendamment du backend Convex. Chaque page détecte `NEXT_PUBLIC_CONVEX_URL` et utilise des données statiques si absent.

### Why `moduleResolution: "bundler"` in tsconfig ?
Nécessaire pour la compatibilité avec les exports de packages ESM modernes (Convex, Radix UI).

---

## Current Task

Déploiement réussi sur GitHub. Projet fonctionnel en local. En attente de développement de nouvelles fonctionnalités ou corrections.

---

## Next Steps (Prioritized)

### High Priority
1. **Upload de fichiers** — Implémenter l'upload de radiographies et photos via Convex File Storage. Brancher sur le formulaire patient et les dossiers médicaux
2. **Module Assurance** — UI pour les `insuranceClaims` : soumission, statut, montants couverts
3. **Pagination** — Implémenter la pagination côté serveur sur toutes les listes (patients, rendez-vous, factures, etc.)

### Medium Priority
4. **Notifications temps réel** — Brancher le tableau des notifications sur les événements (création facture, stock faible, etc.)
5. **Audit logs** — Enregistrer les actions sensibles (création/modification/suppression)
6. **Tests** — Ajouter des tests unitaires (Vitest) et E2E (Playwright)

### Low Priority
7. **Server Components** — Migrer les pages purement présentatives vers Server Components
8. **Recharts** — Remplacer les graphiques div/css par Recharts
9. **Mode hors-ligne** — PWA avec Service Worker pour consultation sans connexion

---

## Instructions For Future AI

### Coding Conventions
- **Langue** : Interface utilisateur en français (labels, messages, notifications). Code en anglais (variables, fonctions, commentaires)
- **Imports** : Utiliser les alias `@/` pour `src/`
- **Composants** : Toujours `"use client"` en haut si interactif. `export default function`
- **Types** : Définir dans `@/lib/types.ts`. Utiliser `type` plutôt que `interface` sauf pour les types d'export Convex
- **Validation** : Schémas Zod dans `@/lib/zod-schemas.ts`. Utiliser `z.infer<typeof schema>` pour les types de formulaire
- **Conventions Convex** : Utiliser `query/mutation` depuis `./_generated/server`. Nommer les fonctions en camelCase
- **CSS** : Tailwind v4 avec `@theme inline`. Utiliser `cn()` de `@/lib/utils` pour les classes conditionnelles. Dark mode via `dark:` variants
- **Icons** : Lucide React uniquement. Toujours utiliser l'icône exacte, pas de <svg> custom

### Design Patterns
- **Modules** : Un fichier Convex par domaine (patients.ts, appointments.ts...). Un dossier de page Next.js par module
- **Formulaires** : React Hook Form + Zod. Toujours typer les données avec `z.infer`
- **Mock data** : Quand Convex n'est pas connecté, chaque page doit avoir un fallback mocké complet
- **Auth guard** : Le layout `(dashboard)/layout.tsx` protège toutes les pages du groupe
- **Toast** : Utiliser `useToast()` pour tous les retours utilisateur (succès/erreur)

### Things That Must Not Be Changed
- **Schema Convex** : Ne pas supprimer ou renommer des tables/index existants sans migration
- **Types d'entités** : `Role`, `AppointmentStatus`, `PaymentMethod`, `ToothStatus` sont utilisés partout. Les modifier requiert une mise à jour globale
- **Hook useAuth** : Basé sur localStorage. Changer le mécanisme de stockage impacterait toutes les sessions
- **Fonctions Convex seed** : La seed crée des comptes de démonstration. Ne pas la modifier sans mettre à jour la documentation
- **Variables d'env** : `NEXT_PUBLIC_CONVEX_URL` est le point d'entrée pour le mode Convex. Sa logique de détection est critique
- **Route groups** : `(auth)` et `(dashboard)` ont des layouts spécifiques. Ne pas déplacer les pages entre les groupes sans adapter les guards

### Before Making Changes
1. Vérifier si le backend Convex est accessible (port 3210)
2. Lire la fonction Convex pertinente avant de modifier son appelant frontend
3. Vérifier que les types Zod et TypeScript sont synchronisés
4. Tester avec `npx next build` après les modifications
5. Si modification du schéma Convex, re-exécuter `npx convex dev`

### Running the Project
```powershell
# Terminal 1 : Backend Convex
cd dental-clinic
npx convex dev          # Port 3210

# Terminal 2 : Frontend Next.js
npx next dev -p 3001    # Port 3001 (3000 souvent occupé)
```

### Accounts de démonstration
| Rôle | Email | Mot de passe |
|---|---|---|
| Admin | admin@cabinet.com | admin123 |
| Dentiste | dentist@cabinet.com | admin123 |
| Secrétaire | secretaire@cabinet.com | admin123 |

---

*Document généré le 05/06/2026 — Dernière build réussie : ✅ 14 pages, 0 erreur TypeScript*
