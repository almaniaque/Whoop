# WhoopStack

Application de gestion de devis pour freelances : comptes utilisateurs, clients, devis, prestations et tableau de bord statistique.

## Architecture

```
Whoop/
├── backend/springboot/devis/        # API REST Spring Boot (port 8080)
│   └── src/main/java/com/whoopstack/devis/
│       ├── controller/              # Endpoints REST (clients, devis, dashboard)
│       ├── service/                 # Logique métier
│       ├── model/                   # Entités JPA (Client, Devis, Prestation)
│       ├── repository/              # Accès base (Spring Data JPA)
│       ├── ressource/               # DTOs du dashboard
│       └── userAuth/                # Authentification complète :
│           ├── auth/                #   register / login / gestion compte
│           ├── security/            #   JWT (génération + filtre)
│           ├── config/              #   Spring Security, CORS, BCrypt
│           ├── passwordReset/       #   mot de passe oublié (token hashé)
│           ├── exception/           #   erreurs métier -> codes HTTP
│           └── user/                #   entité AppUser
├── frontend/angular/my-app/         # Frontend Angular (port 4200)
│   └── src/app/
│       ├── auth/                    # Login, register, guards, intercepteur JWT
│       ├── dashboard/               # Tableau de bord (Chart.js)
│       ├── menu-devis/              # Liste + création de devis
│       ├── client-list/             # Liste des clients
│       └── accueil/, topbar/        # Navigation
├── insrall_&_run-WhoopStack/        # Scripts d'installation et de lancement
└── base de donnée fictive/          # (réservé aux jeux de données de test)
```

| Brique | Technologie |
|---|---|
| Backend | Spring Boot 4 (Java 21), Spring Security + JWT (JJWT), Spring Data JPA / Hibernate |
| Base de données | MySQL 8.x — base `whoopstack` |
| Frontend | Angular (standalone components), Angular Material, Chart.js / ng2-charts, Bootstrap |
| Build | Maven Wrapper (`mvnw`), npm |

## Prérequis

- Windows 10/11
- **Java 21** (JDK Temurin recommandé) — le projet ne compile pas avec un autre Java
- **Node.js LTS** + npm
- **MySQL Server 8.x** sur le port 3306, avec une base `whoopstack`

## Installation

### Option A — Script automatique (recommandé)

Dans `insrall_&_run-WhoopStack/` :

1. **`install_requirements_mysql_no_winget.bat`** *(recommandé — clic droit → Exécuter en tant qu'administrateur)*
   Télécharge et installe Java 21, Node LTS et MySQL depuis les sites officiels, crée la base `whoopstack`, configure `application.properties` et build le projet.
2. `install_requiement.bat` — variante utilisant **winget** (plus rapide si winget est disponible sur le poste).

⚠️ Pendant l'installation, le script **demande le mot de passe root MySQL de votre poste** (Entrée = `root` par défaut) et l'écrit automatiquement dans `application.properties`. C'est ce qui garantit que le backend démarre sur n'importe quelle machine, quel que soit le mot de passe MySQL local.

### Option B — Installation manuelle

```bat
REM 1. Créer la base
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS whoopstack CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

REM 2. Configurer backend/springboot/devis/src/main/resources/application.properties
REM    spring.datasource.username / spring.datasource.password = vos identifiants MySQL

REM 3. Build backend
cd backend\springboot\devis
mvnw.cmd clean package -DskipTests

REM 4. Dépendances frontend
cd ..\..\..\frontend\angular\my-app
npm install
```

## Lancement

### Avec le script

Double-cliquer sur `insrall_&_run-WhoopStack/run.bat` : il ouvre deux consoles (backend Maven + frontend Angular) et lance le navigateur.

### À la main

```bat
REM Console 1 — backend (http://localhost:8080)
cd backend\springboot\devis
mvnw.cmd spring-boot:run

REM Console 2 — frontend (http://localhost:4200)
cd frontend\angular\my-app
npx ng serve --open
```

Le backend doit afficher `Started DevisApplication` ; l'application est ensuite disponible sur **http://localhost:4200**.

## Fonctionnement

### Authentification (JWT)

1. **Inscription** : `POST /api/auth/register` — crée le compte (mot de passe hashé BCrypt) mais **ne connecte pas** : il faut ensuite se connecter.
2. **Connexion** : `POST /api/auth/login` — renvoie un **token JWT** (valable 24 h) que le frontend stocke en localStorage (`userId`, `token`).
3. **Requêtes protégées** : toute autre route exige le header `Authorization: Bearer <token>` — sinon le backend répond **403**.
4. **Mot de passe oublié** : `POST /api/auth/forgot-password` génère un token de réinitialisation (20 min, usage unique). Sans serveur mail, **le lien s'affiche dans la console du backend**.

### Endpoints principaux

| Méthode | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Inscription |
| POST | `/api/auth/login` | Connexion → JWT |
| POST | `/api/auth/forgot-password` / `reset-password` | Mot de passe oublié |
| PUT | `/api/auth/user/{id}/email` / `password` | Modification du compte |
| DELETE | `/api/auth/user/{id}` | Suppression du compte |
| GET | `/api/clients/users/{userId}/clients` | Clients de l'utilisateur |
| POST | `/api/clients/users/{userId}/clients` | Créer un client |
| GET | `/api/devis/users/{userId}/devis` | Devis de l'utilisateur (client + prestations inclus) |
| POST | `/api/devis/users/{userId}/clients/{clientId}/devis` | Créer un devis |
| PUT / DELETE | `/api/devis/{id}` | Modifier / supprimer un devis |
| GET | `/api/dashboard/users/{userId}/dashboard` | Statistiques agrégées du dashboard |

### Dashboard

Un seul appel API renvoie tout : compteurs par statut, chiffre d'affaires (devis acceptés), montant potentiel (en attente/en cours), taux de conversion, séries sur 6 mois (CA et nombre de devis) et les 10 derniers devis. Les statuts sont normalisés côté backend (accents/casse ignorés) : `Accepté` en base et `ACCEPTE` dans le code désignent la même chose.

### Conventions de données

- **Statuts de devis** : `BROUILLON`, `EN_ATTENTE`, `EN_COURS`, `ACCEPTE`, `REFUSE`, `ANNULE` (le dashboard tolère les variantes accentuées présentes en base : `Accepté`, `En_attente`…).
- **Dates de devis** : sérialisées en français lisible (`08 janvier 2026`) via `@JsonFormat` — le même format est attendu en entrée sur les PUT/POST de devis.
- **Contrat backend ↔ frontend** : les noms de champs de `DashboardStatsDto` (Java) et `DashboardStats` (TypeScript) doivent rester identiques, sinon les valeurs arrivent `undefined` sans erreur.

## Dépannage

| Symptôme | Cause probable | Solution |
|---|---|---|
| Toutes les cartes/tableaux à 0 ou vides + `ERR_CONNECTION_REFUSED` dans la console du navigateur (F12) | Le backend n'est pas lancé | Relancer le backend (`run.bat` ou `mvnw.cmd spring-boot:run`) |
| Backend ne démarre pas : `Access denied for user 'root'` | Mot de passe MySQL de `application.properties` ≠ celui du poste | Relancer le script d'installation (il redemande le mot de passe), ou corriger `spring.datasource.password` |
| `Communications link failure` | Service MySQL arrêté | `net start MySQL80` (ou `MySQL84`) |
| Réponses **403** sur toutes les routes API | Token absent/expiré (24 h) | Se reconnecter ; vérifier le header `Authorization` |
| **500** `Une erreur interne est survenue.` | Bug backend — la stack trace complète est maintenant loggée dans la console du backend | Lire la console backend (GlobalExceptionHandler) |
| Le build Maven échoue (`release 21`) | Mauvaise version de Java dans le PATH | Installer/forcer un JDK 21 (`JAVA_HOME`) |
| Port 8080 ou 4200 déjà utilisé | Ancienne instance encore lancée | Fermer les consoles, ou `netstat -ano \| findstr :8080` puis `taskkill /PID <pid> /F` |
| Dashboard à zéro alors qu'il y a des devis | Montants à 0 dans les données de test | Mettre des montants réels dans la table `devis` |

