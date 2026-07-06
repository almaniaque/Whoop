@echo off
title WhoopStack

cd /d "%~dp0.."

echo Demarrage du Backend...
start cmd /k "cd /d backend/springboot/devis && .\mvnw spring-boot:run"

timeout /t 5 > nul

echo Demarrage du Frontend...
start cmd /k "cd /d frontend/angular/my-app && npx ng serve --open"

echo WhoopStack en cours de lancement
pause