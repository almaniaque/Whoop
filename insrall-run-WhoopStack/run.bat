@echo off
setlocal EnableExtensions EnableDelayedExpansion
title WhoopStack

REM ============================================================
REM Lancement de WhoopStack : backend Spring Boot + frontend Angular
REM dans deux fenetres separees.
REM
REM Le script vit dans insrall_&_run-WhoopStack\ : la racine du
REM projet est le dossier parent.
REM ============================================================
set "PROJECT_ROOT=%~dp0.."
cd /d "%PROJECT_ROOT%"

if not exist "backend\springboot\devis\mvnw.cmd" (
    echo ERREUR: projet introuvable. Lancez d'abord l'installation.
    pause
    exit /b 1
)

REM ------------------------------------------------------------
REM On force le JDK 21 pour le backend : si le poste a un autre
REM Java par defaut (17, 26...), le build Maven echoue. On fixe
REM JAVA_HOME dans CET environnement ; les fenetres lancees via
REM `start` en heritent automatiquement.
REM ------------------------------------------------------------
call :FindJava21
if "!JAVA21_DIR!"=="" (
    echo ATTENTION: JDK 21 introuvable. Le backend utilisera le Java par defaut du poste.
    echo Si le backend ne demarre pas, relancez l'installation.
    echo.
) else (
    set "JAVA_HOME=!JAVA21_DIR!"
    set "PATH=!JAVA21_DIR!\bin;%PATH%"
    echo JDK 21 utilise pour le backend : !JAVA21_DIR!
    echo.
)

REM On utilise des chemins RELATIFS (les fenetres lancees par `start`
REM heritent du repertoire courant, deja positionne sur la racine).
REM Cela evite les guillemets imbriques autour d'un chemin contenant
REM des espaces / un "&", source classique d'erreurs en batch.
echo Demarrage du Backend ^(port 8080^)...
start "WhoopStack Backend" cmd /k "cd /d backend\springboot\devis && mvnw.cmd spring-boot:run"

REM Laisser le backend demarrer avant le frontend.
timeout /t 8 >nul

echo Demarrage du Frontend ^(port 4200^)...
start "WhoopStack Frontend" cmd /k "cd /d frontend\angular\my-app && npx ng serve --open"

echo.
echo WhoopStack en cours de lancement.
echo   Backend  : http://localhost:8080
echo   Frontend : http://localhost:4200
echo.
echo Fermez les deux fenetres pour arreter l'application.
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
