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
REM 3) JAVA 21 - force un vrai JDK 21 meme si Java 26 existe
REM ============================================================
echo ========================================
echo Verification Java 21
echo ========================================

call :FindJava21

if "!JAVA21_DIR!"=="" (
    echo Java 21 introuvable. Telechargement Eclipse Temurin 21...
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
REM 4) NODE LTS - telechargement dynamique depuis nodejs.org
REM ============================================================
echo ========================================
echo Verification Node.js LTS
echo ========================================

where node >nul 2>&1
if errorlevel 1 (
    echo Node.js introuvable. Recherche de la derniere version LTS officielle...
    set "NODE_MSI=%DOWNLOAD_DIR%\node-lts-x64.msi"

    powershell -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference='Stop'; [Net.ServicePointManager]::SecurityProtocol=[Net.SecurityProtocolType]::Tls12; $idx=Invoke-RestMethod 'https://nodejs.org/dist/index.json'; $rel=$idx | Where-Object { $_.lts -ne $false -and $_.files -contains 'win-x64-msi' } | Select-Object -First 1; if($null -eq $rel){ throw 'Aucune version LTS MSI trouvee' }; $url='https://nodejs.org/dist/' + $rel.version + '/node-' + $rel.version + '-x64.msi'; Write-Host 'Node URL:' $url; Invoke-WebRequest -Uri $url -OutFile '!NODE_MSI!'"
    if errorlevel 1 (
        echo.
        echo ERREUR: telechargement Node.js impossible.
        echo Installe manuellement Node.js LTS depuis nodejs.org, puis relance ce script.
        pause
        exit /b 1
    )

    echo Installation Node.js LTS en cours...
    msiexec /i "!NODE_MSI!" /quiet /norestart
    if errorlevel 1 (
        echo ERREUR: installation Node.js impossible.
        pause
        exit /b 1
    )

    set "PATH=%ProgramFiles%\nodejs;!PATH!"
)

where node >nul 2>&1
if errorlevel 1 (
    echo.
    echo ERREUR: Node.js reste introuvable.
    echo Ferme et rouvre le terminal, puis relance ce script.
    pause
    exit /b 1
)

node -v
npm -v
echo.

REM ============================================================
REM 5) MYSQL SERVER - TELECHARGEMENT + CONFIGURATEUR GUI
REM ============================================================
echo ========================================
echo MySQL Server - installation/configuration guidee
echo ========================================
echo.

echo Verification du port 3306...
netstat -ano | findstr /R /C:":3306 .*LISTENING" >nul 2>&1
if not errorlevel 1 (
    echo ATTENTION: le port 3306 est deja utilise.
    echo Si c'est un ancien MySQL ou XAMPP, stoppe-le avant de continuer.
    echo Commandes utiles si besoin:
    echo   net stop MySQL80
    echo   net stop MySQL84
    echo   net stop MySQL
    echo.
    pause
)

call :FindMySQLClient

if "!MYSQL_EXE!"=="" (
    call :FindMySQLInstaller

    if "!MYSQL_INSTALLER_EXE!"=="" (
        echo MySQL Installer introuvable. Telechargement...
        set "MYSQL_MSI=%DOWNLOAD_DIR%\mysql-installer-community-8.0.40.0.msi"
        set "MYSQL_URL=https://dev.mysql.com/get/Downloads/MySQLInstaller/mysql-installer-community-8.0.40.0.msi"
        call :DownloadFile "!MYSQL_URL!" "!MYSQL_MSI!"
        if errorlevel 1 (
            echo.
            echo ERREUR: telechargement MySQL Installer impossible.
            echo Telecharge MySQL Installer manuellement depuis dev.mysql.com, installe MySQL Server, puis relance ce script.
            pause
            exit /b 1
        )

        echo Lancement MySQL Installer...
        start /wait msiexec /i "!MYSQL_MSI!"
    )
)

call :FindMySQLInstaller

if not "!MYSQL_INSTALLER_EXE!"=="" (
    echo.
    echo MySQL Installer va s'ouvrir pour configurer correctement le serveur.
    echo.
    echo PARAMETRES A METTRE DANS L'ASSISTANT:
    echo   1. Setup Type        : Server Only ^(ou Developer Default si Server Only absent^)
    echo   2. Product           : MySQL Server 8.x
    echo   3. Config Type       : Development Computer
    echo   4. Connectivity      : TCP/IP active, Port 3306, Open Firewall coche
    echo   5. Authentication    : Strong Password Encryption
    echo   6. Root password     : notez-le, il sera demande juste apres
    echo   7. Windows Service   : MySQL80 ou MySQL84
    echo   8. Start at System Startup : coche
    echo   9. Execute puis Finish
    echo.
    echo CONSEIL EQUIPE: root comme mot de passe local simplifie les choses,
    echo mais le script accepte n'importe quel mot de passe : il sera ecrit
    echo automatiquement dans application.properties pour Spring Boot.
    echo.
    start "" "!MYSQL_INSTALLER_EXE!"
    echo Quand la configuration MySQL est terminee, reviens ici puis appuie sur une touche.
    pause >nul
) else (
    echo.
    echo MySQL Installer non trouve automatiquement.
    echo Ouvre-le manuellement depuis le menu Demarrer, configure MySQL Server,
    echo puis reviens ici et appuie sur une touche.
    pause >nul
)

REM Redetection apres configuration
call :FindMySQLClient

if "!MYSQL_EXE!"=="" (
    echo.
    echo ERREUR: mysql.exe introuvable apres configuration.
    echo MySQL Server n'a probablement pas ete ajoute dans MySQL Installer.
    echo Relance MySQL Installer et ajoute "MySQL Server".
    pause
    exit /b 1
)

for %%I in ("!MYSQL_EXE!") do set "MYSQL_BIN=%%~dpI"
set "PATH=!MYSQL_BIN!;!PATH!"
powershell -NoProfile -ExecutionPolicy Bypass -Command "$bin='%MYSQL_BIN%'; $p=[Environment]::GetEnvironmentVariable('Path','Machine'); if($null -eq $p){$p=''}; $parts=$p -split ';' | Where-Object { $_ -and ($_ -ne $bin) }; [Environment]::SetEnvironmentVariable('Path', ($bin + ';' + ($parts -join ';')), 'Machine')" >nul 2>&1

echo Client MySQL detecte:
echo !MYSQL_EXE!
echo.

echo Tentative de demarrage du service MySQL...
net start MySQL80 >nul 2>&1
net start MySQL84 >nul 2>&1
net start MySQL >nul 2>&1

REM ------------------------------------------------------------
REM Le mot de passe root N'EST PAS le meme sur tous les postes
REM (root, admin, autre...). On le demande a l'utilisateur, on teste
REM la connexion, et on ecrira CE mot de passe dans
REM application.properties : MySQL et Spring Boot restent ainsi
REM synchronises sur chaque machine. C'est ce qui causait les
REM "Access denied" / "ERREUR MySQL" sur les autres ordinateurs.
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
        echo   - le service MySQL n'est pas demarre ^(net start MySQL80 ou MySQL84^)
        echo   - le port 3306 est occupe par une autre installation
        echo   - MySQL Server n'a pas ete configure dans MySQL Installer
        echo.
        echo Solution la plus propre:
        echo   MySQL Installer ^> Reconfigure MySQL Server ^> port 3306 ^> nouveau root password.
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
    >> "!APP_PROPS!.tmp" echo spring.datasource.url=jdbc:mysql://localhost:3306/whoopstack?useSSL=false^&serverTimezone=UTC^&allowPublicKeyRetrieval=true
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

REM Installation des libs utilisees par le projet. Pas de ng add ici: trop interactif.
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
for /f "delims=" %%I in ('dir "%ProgramFiles%\MySQL\MySQL Server *\bin\mysql.exe" /b /s 2^>nul') do if not defined MYSQL_EXE set "MYSQL_EXE=%%I"
for /f "delims=" %%I in ('dir "%ProgramFiles(x86)%\MySQL\MySQL Server *\bin\mysql.exe" /b /s 2^>nul') do if not defined MYSQL_EXE set "MYSQL_EXE=%%I"
exit /b 0

:FindMySQLInstaller
set "MYSQL_INSTALLER_EXE="
if exist "%ProgramFiles(x86)%\MySQL\MySQL Installer for Windows\MySQLInstaller.exe" set "MYSQL_INSTALLER_EXE=%ProgramFiles(x86)%\MySQL\MySQL Installer for Windows\MySQLInstaller.exe"
if exist "%ProgramFiles%\MySQL\MySQL Installer for Windows\MySQLInstaller.exe" set "MYSQL_INSTALLER_EXE=%ProgramFiles%\MySQL\MySQL Installer for Windows\MySQLInstaller.exe"
exit /b 0
