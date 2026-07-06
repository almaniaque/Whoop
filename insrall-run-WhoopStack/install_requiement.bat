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
REM On cherche un vrai JDK 21 sur disque au lieu de tester
REM "java -version" : un Java 8/17/26 present sur le poste ferait
REM croire que tout va bien, puis le build Maven echouerait
REM (le projet exige Java 21, voir pom.xml).
REM ============================================================
echo ========================================
echo Verification Java 21
echo ========================================

call :FindJava21

if "!JAVA21_DIR!"=="" (
    echo Java 21 introuvable. Installation via winget...
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

set "JAVA_HOME=!JAVA21_DIR!"
set "PATH=!JAVA_HOME!\bin;!PATH!"
REM JAVA_HOME persistant pour l'utilisateur courant. On ne touche PAS
REM au PATH persistant : les installeurs MSI le font proprement, et
REM `setx PATH` tronque a 1024 caracteres (danger).
setx JAVA_HOME "!JAVA_HOME!" >nul

echo JAVA_HOME = !JAVA_HOME!
"!JAVA_HOME!\bin\java.exe" -version
echo.

REM ============================================================
REM 3) NODE.JS LTS
REM ============================================================
echo ========================================
echo Verification Node.js
echo ========================================

where node >nul 2>&1
if errorlevel 1 (
    echo Node.js introuvable. Installation via winget...
    winget install OpenJS.NodeJS.LTS --silent --accept-package-agreements --accept-source-agreements
    REM le MSI met a jour le PATH persistant ; pour CE terminal on ajoute a la main
    set "PATH=%ProgramFiles%\nodejs;!PATH!"
)

where node >nul 2>&1
if errorlevel 1 (
    echo.
    echo ERREUR: Node.js reste introuvable dans ce terminal.
    echo Fermez ce terminal, rouvrez-en un nouveau et relancez ce script.
    pause
    exit /b 1
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
REM Toutes les commandes sont NON-interactives : pas de "ng add"
REM (il pose des questions et bloque un script batch).
REM ============================================================
echo ========================================
echo Installation frontend Angular
echo ========================================

cd /d "%PROJECT_ROOT%\frontend\angular\my-app"

if exist "package-lock.json" (
    call npm ci
    if errorlevel 1 (
        echo npm ci a echoue, tentative avec npm install...
        call npm install
    )
) else (
    call npm install
)

if errorlevel 1 (
    echo.
    echo ERREUR npm install.
    pause
    exit /b 1
)

call npm install bootstrap bootstrap-icons chart.js ng2-charts chartjs-plugin-datalabels jspdf html2canvas
call npm install --save-dev --save-exact @types/node@20
call npm install --save-dev vitest @types/mocha
call npm install @angular/material @angular/cdk

if errorlevel 1 (
    echo.
    echo ERREUR dependances frontend.
    pause
    exit /b 1
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
