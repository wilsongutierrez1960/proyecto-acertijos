@echo off
REM start.bat — Arranque del proyecto Acertijos en Windows
REM Levanta Ollama (si no esta corriendo), el servidor HTTP local,
REM abre el navegador, y deja ambos procesos identificados para poder cerrarlos.

setlocal enabledelayedexpansion

set PORT=8000
set OLLAMA_STARTED=0

echo.
echo Verificando Ollama...

REM Verifica si Ollama ya esta corriendo (responde en el puerto 11434)
curl -s http://localhost:11434/api/tags >nul 2>&1
if %errorlevel%==0 (
    echo Ollama ya esta corriendo.
) else (
    echo Iniciando Ollama...
    start "Ollama (Acertijos)" /min ollama serve
    set OLLAMA_STARTED=1

    REM Espera hasta que Ollama responda (maximo ~15 segundos)
    set count=0
    :waitloop
    timeout /t 1 /nobreak >nul
    curl -s http://localhost:11434/api/tags >nul 2>&1
    if %errorlevel%==0 goto ollamaready
    set /a count+=1
    if !count! lss 15 goto waitloop

    :ollamaready
    echo Ollama listo.
)

REM Verifica que el modelo de embeddings este disponible
ollama list 2>nul | findstr /C:"nomic-embed-text" >nul
if errorlevel 1 (
    echo ADVERTENCIA: no se encontro el modelo 'nomic-embed-text'.
    echo Corre: ollama pull nomic-embed-text
)

echo.
echo Iniciando servidor HTTP en el puerto %PORT%...
start "Servidor HTTP (Acertijos)" /min python -m http.server %PORT%

timeout /t 1 /nobreak >nul

set URL=http://localhost:%PORT%/index.html
echo Abriendo %URL%
start "" "%URL%"

echo.
echo ============================================
echo  Todo listo.
echo  Se abrieron dos ventanas minimizadas:
echo    - "Ollama (Acertijos)"
echo    - "Servidor HTTP (Acertijos)"
echo  Para cerrar todo, cerra esas dos ventanas
echo  desde la barra de tareas (o Administrador
echo  de tareas) cuando termines de usar el proyecto.
echo ============================================
echo.
pause
