# Scripts d'installation et de lancement

## Quel script utiliser ?

| Script | Quand l'utiliser |
|---|---|
| **`install_requirements_mysql_no_winget.bat`** | **Recommandé.** Fonctionne sur tous les postes : télécharge Java 21, Node LTS et MySQL directement depuis les sites officiels. À lancer **en administrateur**. |
| `install_requiement.bat` | Variante plus rapide si **winget** est disponible sur le poste (`winget --version` pour vérifier). |
| `run.bat` | Lance l'application une fois l'installation faite (backend + frontend dans deux consoles). |

## Ce que fait l'installation

Le principe est **« vérifier avant d'installer »** : pour chaque outil, le script regarde ce qui est déjà présent sur le poste et n'installe que si nécessaire.

1. **Java 21** — le script cherche un JDK 21 déjà installé sur le disque. S'il existe, il **l'utilise** (via `JAVA_HOME`) même si le Java par défaut du poste est plus récent (ex. Java 26) ou plus ancien — pas de réinstallation. Il ne télécharge/installe le JDK 21 que s'il est totalement absent.
2. **Node.js** — le script lit la version installée. Si elle est **compatible Angular 22** (20.19+ / 22.12+ / 24+), il la garde. Sinon (absente, trop ancienne, ou ligne non supportée) il installe/met à jour la LTS.
3. Vérifie/installe **MySQL Server** et démarre le service.
4. **Demande le mot de passe root MySQL du poste** (Entrée = `root`), teste la connexion (3 essais) et crée la base `whoopstack`.
5. Écrit ce mot de passe dans `backend/springboot/devis/src/main/resources/application.properties` (une sauvegarde `.bak` est créée) → le backend et MySQL sont toujours synchronisés, quel que soit le poste.
6. Build le backend (`mvnw clean package`) et installe les dépendances frontend avec **un seul `npm install`** — toutes les librairies (Angular, Material, Chart.js, Bootstrap, jsPDF…) sont déjà déclarées dans `package.json`.

## Installation des dépendances Angular

Le frontend s'installe avec **une seule commande** : `npm install` (le script s'en charge). Tout est déjà listé dans `frontend/angular/my-app/package.json`.

⚠️ Ne **jamais** rajouter de `npm install @angular/material` (ou autre) à la main : cela modifie `package-lock.json`, peut tirer une version incompatible avec Angular 22 et casse l'installation des coéquipiers (conflit de *peer dependencies*). C'était le bug historique « les dépendances Angular ne s'installent pas ».

Si l'install échoue quand même :
- Vérifier la version de Node : `node -v` doit être **20.19+ / 22.12+ / 24+** (Angular 22).
- En dernier recours : supprimer `node_modules` et `package-lock.json`, puis relancer `npm install`.

## Pourquoi le mot de passe est demandé

Chaque poste peut avoir un mot de passe root MySQL différent (`root`, `admin`, autre).
L'ancienne version des scripts supposait un mot de passe fixe : sur les autres ordinateurs, cela produisait `ERREUR MySQL` à l'installation ou `Access denied for user 'root'` au démarrage du backend. Désormais le script s'adapte au poste.

## Problèmes connus / erreurs fréquentes

- **« winget n'est pas disponible »** → utiliser `install_requirements_mysql_no_winget.bat`.
- **Les dépendances Angular ne s'installent pas / erreur `ERESOLVE`** → vérifier `node -v` (doit être 20.19+/22.12+/24+) ; supprimer `node_modules` + `package-lock.json` puis relancer. Ne pas installer de paquet Angular à la main.
- **« Connexion refusée » 3 fois** → le service MySQL est peut-être arrêté : `net start MySQL80` (ou `MySQL84`), puis relancer le script.
- **Java/Node introuvable juste après installation** → fermer le terminal et relancer le script dans un nouveau terminal (le PATH n'est rechargé qu'à l'ouverture).
- **Le port 3306 est déjà occupé** → un ancien MySQL/XAMPP tourne : l'arrêter avant d'installer.
- Après un changement de mot de passe MySQL, relancer simplement le script d'installation : il remettra `application.properties` à jour.
