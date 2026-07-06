# Scripts d'installation et de lancement

## Quel script utiliser ?

| Script | Quand l'utiliser |
|---|---|
| **`install_requirements_mysql_no_winget.bat`** | **Recommandé.** Fonctionne sur tous les postes : télécharge Java 21, Node LTS et MySQL directement depuis les sites officiels. À lancer **en administrateur**. |
| `install_requiement.bat` | Variante plus rapide si **winget** est disponible sur le poste (`winget --version` pour vérifier). |
| `run.bat` | Lance l'application une fois l'installation faite (backend + frontend dans deux consoles). |

## Ce que fait l'installation

1. Vérifie/installe **Java 21** (Temurin) — un JDK 21 précis, pas n'importe quel Java.
2. Vérifie/installe **Node.js LTS**.
3. Vérifie/installe **MySQL Server** et démarre le service.
4. **Demande le mot de passe root MySQL du poste** (Entrée = `root`), teste la connexion (3 essais) et crée la base `whoopstack`.
5. Écrit ce mot de passe dans `backend/springboot/devis/src/main/resources/application.properties` (une sauvegarde `.bak` est créée) → le backend et MySQL sont toujours synchronisés, quel que soit le poste.
6. Build le backend (`mvnw clean package`) et installe les dépendances frontend (`npm install` + librairies du projet).

## Pourquoi le mot de passe est demandé

Chaque poste peut avoir un mot de passe root MySQL différent (`root`, `admin`, autre).
L'ancienne version des scripts supposait un mot de passe fixe : sur les autres ordinateurs, cela produisait `ERREUR MySQL` à l'installation ou `Access denied for user 'root'` au démarrage du backend. Désormais le script s'adapte au poste.

## Problèmes connus / erreurs fréquentes

- **« winget n'est pas disponible »** → utiliser `install_requirements_mysql_no_winget.bat`.
- **« Connexion refusée » 3 fois** → le service MySQL est peut-être arrêté : `net start MySQL80` (ou `MySQL84`), puis relancer le script.
- **Java/Node introuvable juste après installation** → fermer le terminal et relancer le script dans un nouveau terminal (le PATH n'est rechargé qu'à l'ouverture).
- **Le port 3306 est déjà occupé** → un ancien MySQL/XAMPP tourne : l'arrêter avant d'installer.
- Après un changement de mot de passe MySQL, relancer simplement le script d'installation : il remettra `application.properties` à jour.
