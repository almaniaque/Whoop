@echo off
setlocal EnableExtensions EnableDelayedExpansion
chcp 65001 >nul

title WhoopStack - Installation

REM ============================================================
REM 0) ADMIN OBLIGATOIRE
REM ============================================================
net session >nul 2>&1
if errorlevel 1 (
    echo ERREUR: lance ce fichier en ADMINISTRATEUR.
    echo Clic droit sur le .bat ^> Executer en tant qu'administrateur.
    pause
    exit /b 1
)

REM ============================================================
REM 1) RACINE PROJET
REM Le script peut etre place soit a la racine du projet,
REM soit dans un dossier scripts/.
REM ============================================================
set "SCRIPT_DIR=%~dp0"
set "PROJECT_ROOT=%SCRIPT_DIR%"

if exist "%SCRIPT_DIR%backend\springboot\devis" set "PROJECT_ROOT=%SCRIPT_DIR%"
if exist "%SCRIPT_DIR%..\backend\springboot\devis" set "PROJECT_ROOT=%SCRIPT_DIR%.."

cd /d "%PROJECT_ROOT%" 2>nul
if errorlevel 1 (
    echo ERREUR: impossible de trouver la racine du projet.
    pause
    exit /b 1
)

echo Racine projet detectee:
echo %CD%
echo.

REM ============================================================
REM 2) VERIFICATION OUTILS WINDOWS DE BASE
REM ============================================================
where powershell >nul 2>&1
if errorlevel 1 (
    echo ERREUR: PowerShell est introuvable. Impossible de telecharger automatiquement.
    pause
    exit /b 1
)

set "DOWNLOAD_DIR=%TEMP%\whoopstack-installers"
if not exist "%DOWNLOAD_DIR%" mkdir "%DOWNLOAD_DIR%" >nul 2>&1

REM ============================================================
REM 3) JAVA 21 - "verifier avant d'installer"
REM   - on cherche un JDK 21 DEJA present sur le disque ;
REM   - s'il existe, on SWITCHE dessus (JAVA_HOME) meme si le Java
REM     par defaut du poste est plus recent (26) ou plus ancien ;
REM   - on ne telecharge QUE si aucun JDK 21 n'est trouve.
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
    echo JDK 21 absent. Telechargement Eclipse Temurin 21...
    set "JAVA_MSI=%DOWNLOAD_DIR%\temurin21-jdk.msi"
    set "JAVA_URL=https://github.com/adoptium/temurin21-binaries/releases/download/jdk-21.0.11%%2B10/OpenJDK21U-jdk_x64_windows_hotspot_21.0.11_10.msi"

    call :DownloadFile "!JAVA_URL!" "!JAVA_MSI!"
    if errorlevel 1 (
        echo.
        echo ERREUR: telechargement Java impossible.
        echo Telecharge manuellement Temurin JDK 21 depuis adoptium.net, installe-le, puis relance ce script.
        pause
        exit /b 1
    )

    echo Installation Java 21 en cours...
    msiexec /i "!JAVA_MSI!" /quiet /norestart
    if errorlevel 1 (
        echo ERREUR: installation Java 21 impossible.
        pause
        exit /b 1
    )

    call :FindJava21
)

if "!JAVA21_DIR!"=="" (
    echo.
    echo ERREUR: Java 21 reste introuvable apres installation.
    echo Verifie dans C:\Program Files\Eclipse Adoptium\
    pause
    exit /b 1
)

set "JAVA_HOME=!JAVA21_DIR!"
set "PATH=!JAVA_HOME!\bin;!PATH!"

setx JAVA_HOME "!JAVA_HOME!" /M >nul
powershell -NoProfile -ExecutionPolicy Bypass -Command "$bin='%JAVA_HOME%\bin'; $p=[Environment]::GetEnvironmentVariable('Path','Machine'); if($null -eq $p){$p=''}; $parts=$p -split ';' | Where-Object { $_ -and ($_ -ne $bin) -and ($_ -notlike '*jdk-26*') }; [Environment]::SetEnvironmentVariable('Path', ($bin + ';' + ($parts -join ';')), 'Machine')" >nul 2>&1

echo JAVA_HOME = !JAVA_HOME!
"!JAVA_HOME!\bin\java.exe" -version
"!JAVA_HOME!\bin\javac.exe" -version
echo.

REM ============================================================
REM 4) NODE.JS - "verifier avant d'installer"
REM On lit la version DEJA installee. Si elle est compatible
REM Angular 22 (20.19+ / 22.12+ / 24+), on la garde. Sinon
REM (absente, trop vieille, ou ligne non supportee) on telecharge
REM la derniere LTS depuis nodejs.org.
REM ============================================================
echo ========================================
echo Verification Node.js
echo ========================================

REM IMPORTANT : structure "a plat" avec des goto, SANS gros bloc
REM parenthese autour de la commande PowerShell. cmd.exe compte les
REM parentheses de PowerShell ( ( ) { } ) comme si elles fermaient
REM le bloc - la fenetre se fermait direct. On evite donc les
REM `if (...) else (...)` imbriques autour de PowerShell.
call :CheckNode

if "!NODE_OK!"=="1" goto NodeReady

if "!NODE_VER!"=="" echo Node.js introuvable. Recherche de la derniere LTS officielle...
if not "!NODE_VER!"=="" echo Node !NODE_VER! incompatible avec Angular 22. Telechargement de la LTS...

set "NODE_MSI=%DOWNLOAD_DIR%\node-lts-x64.msi"
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference='Stop'; [Net.ServicePointManager]::SecurityProtocol=[Net.SecurityProtocolType]::Tls12; $idx=Invoke-RestMethod 'https://nodejs.org/dist/index.json'; $rel=$idx | Where-Object { $_.lts -ne $false -and $_.files -contains 'win-x64-msi' } | Select-Object -First 1; if($null -eq $rel){ throw 'Aucune version LTS MSI trouvee' }; $url='https://nodejs.org/dist/' + $rel.version + '/node-' + $rel.version + '-x64.msi'; Write-Host 'Node URL:' $url; Invoke-WebRequest -Uri $url -OutFile '!NODE_MSI!'"
if errorlevel 1 goto NodeDownloadError

echo Installation Node.js LTS en cours...
msiexec /i "!NODE_MSI!" /quiet /norestart
if errorlevel 1 goto NodeInstallError

set "PATH=%ProgramFiles%\nodejs;!PATH!"
call :CheckNode

:NodeReady
if "!NODE_VER!"=="" goto NodeMissing

if "!NODE_OK!"=="1" echo Node !NODE_VER! present et compatible.
if not "!NODE_OK!"=="1" (
    echo ERREUR: Node !NODE_VER! non conforme apres installation.
    echo Ferme/rouvre le terminal ou installe une version compatible.
    pause
    exit /b 1
)

echo Verification commande node...
node -v
if errorlevel 1 (
    echo ERREUR: node -v a echoue.
    pause
    exit /b 1
)

echo Verification commande npm...
call npm -v
if errorlevel 1 (
    echo ERREUR: npm -v a echoue.
    echo Node est installe mais npm ne repond pas correctement.
    pause
    exit /b 1
)

echo.
goto NodeDone

:NodeDownloadError
echo.
echo ERREUR: telechargement Node.js impossible.
echo Installe manuellement Node.js LTS depuis nodejs.org, puis relance ce script.
pause
exit /b 1

:NodeInstallError
echo ERREUR: installation Node.js impossible.
pause
exit /b 1

:NodeMissing
echo.
echo ERREUR: Node.js reste introuvable dans ce terminal.
echo Ferme ce terminal, rouvre-en un nouveau et relance ce script.
pause
exit /b 1

:NodeDone

REM ============================================================
REM 5) MYSQL SERVER - DETECTION + CONFIGURATION SPRING
REM ============================================================
echo ========================================
echo MySQL Server - detection/configuration
echo ========================================
echo.

set "MYSQL_PORT_3306_USED=0"
set "MYSQL_CLIENT_AVAILABLE=0"

echo Verification du port 3306...
netstat -ano | findstr /R /C:":3306 .*LISTENING" >nul 2>&1
if not errorlevel 1 (
    set "MYSQL_PORT_3306_USED=1"
    echo MySQL semble deja present : le port 3306 est utilise.
    echo On ne telecharge pas MySQL Installer.
    echo.
) else (
    echo Port 3306 libre.
    echo.
)

call :FindMySQLClient

if not "!MYSQL_EXE!"=="" (
    set "MYSQL_CLIENT_AVAILABLE=1"

    for %%I in ("!MYSQL_EXE!") do set "MYSQL_BIN=%%~dpI"
    set "PATH=!MYSQL_BIN!;!PATH!"

    powershell -NoProfile -ExecutionPolicy Bypass -Command "$bin='!MYSQL_BIN!'; $p=[Environment]::GetEnvironmentVariable('Path','Machine'); if($null -eq $p){$p=''}; $parts=$p -split ';' | Where-Object { $_ -and ($_ -ne $bin) }; [Environment]::SetEnvironmentVariable('Path', ($bin + ';' + ($parts -join ';')), 'Machine')" >nul 2>&1

    echo Client MySQL detecte:
    echo !MYSQL_EXE!
    echo.
) else (
    set "MYSQL_CLIENT_AVAILABLE=0"

    if "!MYSQL_PORT_3306_USED!"=="1" (
        echo ATTENTION: serveur MySQL detecte sur le port 3306, mais mysql.exe est introuvable.
        echo Ce n'est pas bloquant.
        echo On va configurer Spring Boot avec le mot de passe saisi et continuer.
        echo.
        goto MySQLServerReady
    )

    echo ERREUR: MySQL ne semble pas actif sur le port 3306 et mysql.exe est introuvable.
    echo.
    echo Installe ou configure MySQL Server manuellement, puis relance ce script.
    pause
    exit /b 1
)

:MySQLServerReady
echo Tentative de demarrage du service MySQL...
net start MySQL80 >nul 2>&1
net start MySQL84 >nul 2>&1
net start MySQL >nul 2>&1
net start MariaDB >nul 2>&1

REM ------------------------------------------------------------
REM Le mot de passe root N'EST PAS le meme sur tous les postes.
REM On le demande, puis :
REM - si mysql.exe existe : on teste et on cree la base ;
REM - si mysql.exe est introuvable mais serveur detecte : on continue.
REM ------------------------------------------------------------
set "MYSQL_TRIES=0"

:AskMySQLPassword
set "MYSQL_ROOT_PASSWORD=root"
set /p "MYSQL_ROOT_PASSWORD=Mot de passe root MySQL de CE poste [Entree = root] : "

echo.

if "!MYSQL_CLIENT_AVAILABLE!"=="1" goto MySQLCliTest
goto MySQLCliUnavailable


:MySQLCliTest
echo Test connexion + creation base whoopstack...

"!MYSQL_EXE!" -u root -p"!MYSQL_ROOT_PASSWORD!" -e "SELECT VERSION(); CREATE DATABASE IF NOT EXISTS whoopstack CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

if errorlevel 1 goto MySQLCliFailed

echo.
echo Base whoopstack OK.
echo.
goto MySQLPasswordDone


:MySQLCliFailed
echo.
echo ATTENTION: le test avec mysql.exe a echoue.
echo Cause probable: client MySQL incompatible ou mysql.exe mal detecte.
echo Ce n'est pas bloquant pour Spring Boot.
echo On continue avec le mot de passe saisi.
echo.
goto MySQLPasswordDone


:MySQLCliUnavailable
echo mysql.exe introuvable : test de connexion ignore.
echo On continue avec le mot de passe saisi.
echo Spring Boot utilisera application.properties.
echo.
goto MySQLPasswordDone


:MySQLPasswordDone

REM ============================================================
REM 6) MISE A JOUR application.properties
REM ============================================================
set "APP_PROPS=%PROJECT_ROOT%\backend\springboot\devis\src\main\resources\application.properties"

if exist "!APP_PROPS!" (
    echo Mise a jour Spring application.properties...
    copy "!APP_PROPS!" "!APP_PROPS!.bak" >nul

    REM On reporte le mot de passe SAISI (et valide juste avant) dans
    REM application.properties, au lieu d'une valeur codee en dur qui ne
    REM correspondait pas forcement au MySQL du poste.
    findstr /v /b /c:"spring.datasource.url=" /c:"spring.datasource.username=" /c:"spring.datasource.password=" "!APP_PROPS!" > "!APP_PROPS!.tmp"
    >> "!APP_PROPS!.tmp" echo spring.datasource.url=jdbc:mysql://localhost:3306/whoopstack?createDatabaseIfNotExist=true^&useSSL=false^&serverTimezone=UTC^&allowPublicKeyRetrieval=true
    >> "!APP_PROPS!.tmp" echo spring.datasource.username=root
    >> "!APP_PROPS!.tmp" echo spring.datasource.password=!MYSQL_ROOT_PASSWORD!
    move /y "!APP_PROPS!.tmp" "!APP_PROPS!" >nul

    echo application.properties configure avec le mot de passe saisi.
) else (
    echo ATTENTION: application.properties introuvable ici:
    echo !APP_PROPS!
    echo Mets manuellement ces lignes dans Spring Boot:
    echo spring.datasource.url=jdbc:mysql://localhost:3306/whoopstack?useSSL=false^&serverTimezone=UTC^&allowPublicKeyRetrieval=true
    echo spring.datasource.username=root
    echo spring.datasource.password=^<ton mot de passe root MySQL^>
)

echo.

REM ============================================================
REM 7) BACKEND SPRING BOOT
REM ============================================================
echo ========================================
echo Build backend Spring Boot
echo ========================================

cd /d "%PROJECT_ROOT%\backend\springboot\devis" 2>nul
if errorlevel 1 (
    echo ERREUR: dossier backend introuvable.
    pause
    exit /b 1
)

if not exist "mvnw.cmd" (
    echo ERREUR: mvnw.cmd introuvable dans:
    echo %CD%
    pause
    exit /b 1
)

call mvnw.cmd clean package -DskipTests
if errorlevel 1 (
    echo.
    echo ERREUR backend Spring Boot.
    pause
    exit /b 1
)

echo.

REM ============================================================
REM 8) FRONTEND ANGULAR
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

cd /d "%PROJECT_ROOT%\frontend\angular\my-app" 2>nul
if errorlevel 1 (
    echo ERREUR: dossier frontend introuvable.
    pause
    exit /b 1
)

if not exist "package.json" (
    echo ERREUR: package.json introuvable dans:
    echo %CD%
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

echo.
echo ========================================
echo Installation terminee avec succes
echo ========================================
echo.
echo Standard equipe retenu:
echo   Java      : JDK 21
echo   Node      : LTS officiel
echo   MySQL     : MySQL Server, port 3306
echo   Database  : whoopstack
echo   User      : root
echo   Password  : celui saisi pendant l'installation ^(reporte dans application.properties^)
echo.
echo Si java -version affiche encore Java 26 dans un ancien terminal:
echo ferme tous les terminaux puis rouvre un nouveau CMD.
echo.
pause
exit /b 0

REM ============================================================
REM FONCTIONS
REM ============================================================
:DownloadFile
set "DL_URL=%~1"
set "DL_OUT=%~2"
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference='Stop'; [Net.ServicePointManager]::SecurityProtocol=[Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri '%DL_URL%' -OutFile '%DL_OUT%'"
if errorlevel 1 exit /b 1
if not exist "%DL_OUT%" exit /b 1
exit /b 0

:FindJava21
set "JAVA21_DIR="
for /d %%D in ("%ProgramFiles%\Eclipse Adoptium\jdk-21*") do if not defined JAVA21_DIR set "JAVA21_DIR=%%~fD"
for /d %%D in ("%ProgramFiles%\Java\jdk-21*") do if not defined JAVA21_DIR set "JAVA21_DIR=%%~fD"
for /d %%D in ("%ProgramFiles%\Microsoft\jdk-21*") do if not defined JAVA21_DIR set "JAVA21_DIR=%%~fD"
exit /b 0

:FindMySQLClient
set "MYSQL_EXE="

REM Priorite au vrai client Oracle MySQL
for /f "delims=" %%I in ('dir "%ProgramFiles%\MySQL\MySQL Server *\bin\mysql.exe" /b /s 2^>nul') do if not defined MYSQL_EXE set "MYSQL_EXE=%%I"
for /f "delims=" %%I in ('dir "%ProgramFiles(x86)%\MySQL\MySQL Server *\bin\mysql.exe" /b /s 2^>nul') do if not defined MYSQL_EXE set "MYSQL_EXE=%%I"

REM MariaDB seulement si aucun vrai client MySQL n'est trouve
for /f "delims=" %%I in ('dir "%ProgramFiles%\MariaDB*\bin\mysql.exe" /b /s 2^>nul') do if not defined MYSQL_EXE set "MYSQL_EXE=%%I"

REM XAMPP en dernier recours uniquement
for /f "delims=" %%I in ('dir "C:\xampp\mysql\bin\mysql.exe" /b /s 2^>nul') do if not defined MYSQL_EXE set "MYSQL_EXE=%%I"

exit /b 0
:FindMySQLInstaller
set "MYSQL_INSTALLER_EXE="
if exist "%ProgramFiles(x86)%\MySQL\MySQL Installer for Windows\MySQLInstaller.exe" set "MYSQL_INSTALLER_EXE=%ProgramFiles(x86)%\MySQL\MySQL Installer for Windows\MySQLInstaller.exe"
if exist "%ProgramFiles%\MySQL\MySQL Installer for Windows\MySQLInstaller.exe" set "MYSQL_INSTALLER_EXE=%ProgramFiles%\MySQL\MySQL Installer for Windows\MySQLInstaller.exe"
exit /b 0



:CheckNode
REM Sortie :
REM   NODE_VER = version installee, vide si absente
REM   NODE_OK  = 1 si compatible, sinon 0

set "NODE_OK=0"
set "NODE_VER="

for /f "delims=" %%v in ('node -v 2^>nul') do set "NODE_VER=%%v"

if "!NODE_VER!"=="" exit /b 0

REM Verification robuste directement avec Node.
REM Evite les comparaisons CMD fragiles avec GEQ/EQU.
node -e "const v=process.versions.node.split('.').map(Number); const ok=(v[0]>=24)||(v[0]===22&&v[1]>=12)||(v[0]===20&&v[1]>=19); process.exit(ok?0:1)" >nul 2>&1

if errorlevel 1 (
    set "NODE_OK=0"
) else (
    set "NODE_OK=1"
)

exit /b 0