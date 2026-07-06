@echo off
setlocal EnableExtensions EnableDelayedExpansion
chcp 65001 >nul

title WhoopStack - Installation (winget)

REM ============================================================
REM Installation de WhoopStack via winget.
REM
REM Prerequis : Windows 10/11 avec winget disponible.
REM Si winget n'existe pas sur le poste (ou echoue), utiliser
REM install_requirements_mysql_no_winget.bat qui telecharge
REM directement les installeurs officiels.
REM
REM Corrections apportees par rapport a l'ancienne version :
REM  - detection d'un JDK 21 PRECIS (avant : n'importe quel Java
REM    faisait passer le test, puis le build Maven echouait)
REM  - le mot de passe root MySQL est demande puis ecrit dans
REM    application.properties (avant : jamais synchronise ->
REM    "Access denied" au demarrage du backend sur les autres PC)
REM  - suppression de `setx PATH ...` qui tronquait le PATH a
REM    1024 caracteres et pouvait casser durablement le poste
REM  - remplacement de `ng add @angular/material` (interactif,
REM    bloquait le script) par un simple npm install
REM ============================================================

echo ========================================
echo Installation de WhoopStack
echo ========================================
echo.

REM ============================================================
REM 0) VERIFICATION WINGET
REM ============================================================
where winget >nul 2>&1
if errorlevel 1 (
    echo ERREUR: winget n'est pas disponible sur ce poste.
    echo Utilisez install_requirements_mysql_no_winget.bat a la place.
    pause
    exit /b 1
)

REM ============================================================
REM 1) RACINE PROJET
REM Le script vit dans insrall_&_run-WhoopStack\ : la racine est
REM le dossier parent. Toujours entre guillemets (le nom du
REM dossier contient un "&").
REM ============================================================
set "PROJECT_ROOT=%~dp0.."
cd /d "%PROJECT_ROOT%" 2>nul
if not exist "%PROJECT_ROOT%\backend\springboot\devis" (
    echo ERREUR: racine du projet introuvable ^(backend\springboot\devis absent^).
    pause
    exit /b 1
)

echo Racine projet detectee:
echo %CD%
echo.

REM ============================================================
REM 2) JAVA 21
REM Logique "verifier avant d'installer" :
REM   - on cherche un JDK 21 DEJA present sur le disque ;
REM   - s'il existe, on SWITCHE dessus (JAVA_HOME) meme si le Java
REM     par defaut du poste est plus recent (26) ou plus ancien ;
REM   - on n'installe QUE si aucun JDK 21 n'est trouve.
REM Le projet exige Java 21 (voir pom.xml) : un Java 8/17/26 par
REM defaut ferait echouer le build Maven.
REM ============================================================
echo ========================================
echo Verification Java 21
echo ========================================

REM Info : quel Java est actuellement par defaut sur le poste ?
for /f "tokens=*" %%j in ('java -version 2^>^&1 ^| findstr /i "version"') do echo Java par defaut du poste : %%j

call :FindJava21

if not "!JAVA21_DIR!"=="" (
    echo JDK 21 deja present -^> on l'utilise ^(pas de reinstallation^).
) else (
    echo JDK 21 absent. Installation via winget...
    winget install EclipseAdoptium.Temurin.21.JDK --silent --accept-package-agreements --accept-source-agreements
    call :FindJava21
)

if "!JAVA21_DIR!"=="" (
    echo.
    echo ERREUR: Java 21 reste introuvable apres installation.
    echo Verifiez dans "C:\Program Files\Eclipse Adoptium\".
    pause
    exit /b 1
)

REM On "switche" sur le JDK 21 pour CE script et de facon persistante.
set "JAVA_HOME=!JAVA21_DIR!"
set "PATH=!JAVA_HOME!\bin;!PATH!"
REM JAVA_HOME persistant pour l'utilisateur courant. On ne touche PAS
REM au PATH persistant : les installeurs MSI le font proprement, et
REM `setx PATH` tronque a 1024 caracteres (danger).
setx JAVA_HOME "!JAVA_HOME!" >nul

echo JDK 21 utilise : !JAVA_HOME!
"!JAVA_HOME!\bin\java.exe" -version
echo.

REM ============================================================
REM 3) NODE.JS
REM Logique "verifier avant d'installer" : on lit la version
REM DEJA installee. Si elle est compatible Angular 22
REM (20.19+ / 22.12+ / 24+), on la garde. Sinon (absente, trop
REM vieille, ou ligne non supportee) on installe/met a jour la LTS.
REM ============================================================
echo ========================================
echo Verification Node.js
echo ========================================

call :CheckNode
if "!NODE_OK!"=="1" (
    echo Node !NODE_VER! deja present et compatible -^> on l'utilise.
) else (
    if "!NODE_VER!"=="" (
        echo Node.js introuvable. Installation de la LTS via winget...
    ) else (
        echo Node !NODE_VER! incompatible avec Angular 22. Installation de la LTS via winget...
    )
    winget install OpenJS.NodeJS.LTS --silent --accept-package-agreements --accept-source-agreements
    REM le MSI met a jour le PATH persistant ; pour CE terminal on l'ajoute a la main
    set "PATH=%ProgramFiles%\nodejs;!PATH!"
    call :CheckNode
    if "!NODE_OK!"=="1" (
        echo Node !NODE_VER! installe.
    ) else (
        echo.
        echo ATTENTION: Node !NODE_VER! toujours non conforme dans ce terminal.
        echo Fermez ce terminal, rouvrez-en un nouveau et relancez ce script.
        echo ^(ou installez une LTS recente depuis nodejs.org^)
    )
)

node -v
npm -v
echo.

REM ============================================================
REM 4) MYSQL SERVER
REM ============================================================
echo ========================================
echo Verification MySQL Server
echo ========================================

call :FindMySQLClient

if "!MYSQL_EXE!"=="" (
    echo MySQL Server introuvable. Installation via winget...
    winget install Oracle.MySQL --accept-package-agreements --accept-source-agreements
    call :FindMySQLClient
)

if "!MYSQL_EXE!"=="" (
    echo.
    echo ERREUR: MySQL Server reste introuvable.
    echo Installez-le manuellement ^(ou via install_requirements_mysql_no_winget.bat^)
    echo puis relancez ce script.
    pause
    exit /b 1
)

for %%I in ("!MYSQL_EXE!") do set "MYSQL_BIN=%%~dpI"
set "PATH=!MYSQL_BIN!;!PATH!"

echo Client MySQL detecte:
echo !MYSQL_EXE!
echo.

echo Tentative de demarrage du service MySQL...
net start MySQL80 >nul 2>&1
net start MySQL84 >nul 2>&1
net start MySQL >nul 2>&1

REM ------------------------------------------------------------
REM Le mot de passe root N'EST PAS le meme sur tous les postes.
REM On le demande, on teste la connexion, puis on ecrira CE mot
REM de passe dans application.properties pour que Spring Boot
REM reste synchronise avec le MySQL du poste.
REM ------------------------------------------------------------
set "MYSQL_TRIES=0"

:AskMySQLPassword
set "MYSQL_ROOT_PASSWORD=root"
set /p "MYSQL_ROOT_PASSWORD=Mot de passe root MySQL de CE poste [Entree = root] : "

echo.
echo Test connexion + creation base whoopstack...
"!MYSQL_EXE!" -u root -p"!MYSQL_ROOT_PASSWORD!" -e "SELECT VERSION(); CREATE DATABASE IF NOT EXISTS whoopstack CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

if errorlevel 1 (
    set /a MYSQL_TRIES+=1
    if !MYSQL_TRIES! GEQ 3 (
        echo.
        echo ERREUR MySQL apres 3 tentatives.
        echo Causes probables:
        echo   - mot de passe root incorrect
        echo   - service MySQL arrete ^(net start MySQL80 ou MySQL84^)
        echo   - installation MySQL pas encore configuree ^(mot de passe root non defini^)
        pause
        exit /b 1
    )
    echo.
    echo Connexion refusee. Nouvelle tentative !MYSQL_TRIES!/3...
    goto AskMySQLPassword
)

echo.
echo Base whoopstack OK.
echo.

REM ============================================================
REM 5) MISE A JOUR application.properties
REM ============================================================
set "APP_PROPS=%PROJECT_ROOT%\backend\springboot\devis\src\main\resources\application.properties"

if exist "!APP_PROPS!" (
    echo Mise a jour Spring application.properties...
    copy "!APP_PROPS!" "!APP_PROPS!.bak" >nul

    findstr /v /b /c:"spring.datasource.url=" /c:"spring.datasource.username=" /c:"spring.datasource.password=" "!APP_PROPS!" > "!APP_PROPS!.tmp"
    >> "!APP_PROPS!.tmp" echo spring.datasource.url=jdbc:mysql://localhost:3306/whoopstack?useSSL=false^&serverTimezone=UTC^&allowPublicKeyRetrieval=true
    >> "!APP_PROPS!.tmp" echo spring.datasource.username=root
    >> "!APP_PROPS!.tmp" echo spring.datasource.password=!MYSQL_ROOT_PASSWORD!
    move /y "!APP_PROPS!.tmp" "!APP_PROPS!" >nul

    echo application.properties configure avec le mot de passe saisi.
) else (
    echo ATTENTION: application.properties introuvable ici:
    echo !APP_PROPS!
)

echo.

REM ============================================================
REM 6) BACKEND SPRING BOOT
REM ============================================================
echo ========================================
echo Build backend Spring Boot
echo ========================================

cd /d "%PROJECT_ROOT%\backend\springboot\devis"

call mvnw.cmd clean package -DskipTests
if errorlevel 1 (
    echo.
    echo ERREUR build backend Spring Boot.
    pause
    exit /b 1
)

echo.

REM ============================================================
REM 7) FRONTEND ANGULAR
REM
REM package.json declare DEJA toutes les dependances (Angular 22,
REM Material, Chart.js, Bootstrap, jsPDF, html2canvas, zone.js...).
REM => une SEULE commande `npm install` installe absolument tout.
REM
REM On ne rajoute plus AUCUN `npm install <paquet>` a la main :
REM ces lignes (ancienne version) modifiaient package-lock.json a
REM chaque execution -> le lock derivait et `npm ci` cassait chez
REM les coequipiers ; et `npm install @angular/material` NON epingle
REM pouvait tirer une version incompatible avec Angular 22
REM (conflit de peer dependencies -> ECHEC TOTAL de l'install).
REM C'etait la cause du "les dependances Angular ne s'installent pas".
REM ============================================================
echo ========================================
echo Installation frontend Angular
echo ========================================

cd /d "%PROJECT_ROOT%\frontend\angular\my-app"
if not exist "package.json" (
    echo ERREUR: package.json introuvable dans %CD%
    pause
    exit /b 1
)

REM Angular 22 exige Node 20.19+, 22.12+ ou 24+. On previent si trop vieux.
set "NODE_MAJOR=0"
for /f "tokens=1 delims=." %%v in ('node -p "process.versions.node" 2^>nul') do set "NODE_MAJOR=%%v"
if !NODE_MAJOR! LSS 20 (
    echo ATTENTION: Node !NODE_MAJOR! detecte. Angular 22 exige Node 20.19+ / 22.12+ / 24+.
    echo Le build risque d'echouer : installez une version LTS recente de Node.js.
    echo.
)

echo Installation des dependances ^(npm install^)...
call npm install --no-fund --no-audit
if errorlevel 1 (
    echo.
    echo Echec. Nouvelle tentative en ignorant les conflits de
    echo peer dependencies ^(--legacy-peer-deps^)...
    call npm install --no-fund --no-audit --legacy-peer-deps
)
if errorlevel 1 (
    echo.
    echo ERREUR: installation des dependances frontend impossible.
    echo Verifiez la connexion internet et la version de Node.js ^(node -v^).
    pause
    exit /b 1
)

REM Verification que la chaine Angular repond (non bloquant).
call npx --no-install ng version >nul 2>&1
if errorlevel 1 (
    echo ATTENTION: Angular CLI ne repond pas. Supprimez node_modules puis relancez si besoin.
) else (
    echo Chaine Angular operationnelle.
)

cd /d "%PROJECT_ROOT%"

echo.
echo ========================================
echo Installation terminee avec succes
echo ========================================
echo.
echo Standard equipe:
echo   Java      : JDK 21 ^(Temurin^)
echo   Node      : LTS officiel
echo   MySQL     : MySQL Server, port 3306
echo   Database  : whoopstack
echo   User      : root
echo   Password  : celui saisi ^(reporte dans application.properties^)
echo.
echo Lancement de l'application : run.bat
echo.
pause
exit /b 0

REM ============================================================
REM FONCTIONS
REM ============================================================
:FindJava21
set "JAVA21_DIR="
for /d %%D in ("%ProgramFiles%\Eclipse Adoptium\jdk-21*") do if not defined JAVA21_DIR set "JAVA21_DIR=%%~fD"
for /d %%D in ("%ProgramFiles%\Java\jdk-21*") do if not defined JAVA21_DIR set "JAVA21_DIR=%%~fD"
for /d %%D in ("%ProgramFiles%\Microsoft\jdk-21*") do if not defined JAVA21_DIR set "JAVA21_DIR=%%~fD"
exit /b 0

:FindMySQLClient
set "MYSQL_EXE="
for /f "delims=" %%I in ('dir "%ProgramFiles%\MySQL\MySQL Server *\bin\mysql.exe" /b /s 2^>nul') do if not defined MYSQL_EXE set "MYSQL_EXE=%%I"
for /f "delims=" %%I in ('dir "%ProgramFiles(x86)%\MySQL\MySQL Server *\bin\mysql.exe" /b /s 2^>nul') do if not defined MYSQL_EXE set "MYSQL_EXE=%%I"
exit /b 0

:CheckNode
REM Sortie : NODE_VER = version installee (vide si absente),
REM          NODE_OK  = 1 si compatible Angular 22 (20.19+ / 22.12+ / 24+), sinon 0.
set "NODE_OK=0"
set "NODE_VER="
for /f "delims=" %%v in ('node -v 2^>nul') do set "NODE_VER=%%v"
if "!NODE_VER!"=="" exit /b 0
set "NV=!NODE_VER:v=!"
for /f "tokens=1,2 delims=." %%a in ("!NV!") do (
    set "NMAJ=%%a"
    set "NMIN=%%b"
)
if !NMAJ! GEQ 24 set "NODE_OK=1"
if !NMAJ! EQU 22 if !NMIN! GEQ 12 set "NODE_OK=1"
if !NMAJ! EQU 20 if !NMIN! GEQ 19 set "NODE_OK=1"
exit /b 0
