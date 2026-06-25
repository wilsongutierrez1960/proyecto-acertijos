#!/bin/bash
# start.sh — Arranque del proyecto Acertijos en Linux Mint
# Levanta Ollama (si no está corriendo), el servidor HTTP local,
# abre el navegador, y limpia los procesos al cerrar.

set -e

PORT=8000
OLLAMA_STARTED_BY_SCRIPT=0

echo "🔧 Verificando Ollama..."

# Verifica si Ollama ya está corriendo (responde en el puerto 11434)
if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "✅ Ollama ya está corriendo."
else
    echo "🚀 Iniciando Ollama..."
    ollama serve > /tmp/ollama_acertijos.log 2>&1 &
    OLLAMA_PID=$!
    OLLAMA_STARTED_BY_SCRIPT=1

    # Espera hasta que Ollama responda (máx 15 segundos)
    for i in $(seq 1 15); do
        if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
            echo "✅ Ollama listo."
            break
        fi
        sleep 1
    done
fi

# Verifica que el modelo de embeddings esté disponible
if ! ollama list 2>/dev/null | grep -q "nomic-embed-text"; then
    echo "⚠️  No se encontró el modelo 'nomic-embed-text'. Corré: ollama pull nomic-embed-text"
fi

echo "🌐 Iniciando servidor HTTP en el puerto $PORT..."
python3 -m http.server $PORT > /tmp/http_acertijos.log 2>&1 &
HTTP_PID=$!

sleep 1

URL="http://localhost:$PORT/index.html"
echo "📖 Abriendo $URL"

# Intenta abrir el navegador por defecto (varios fallbacks según el entorno)
if command -v xdg-open > /dev/null; then
    xdg-open "$URL" > /dev/null 2>&1
elif command -v gio > /dev/null; then
    gio open "$URL" > /dev/null 2>&1
else
    echo "No se pudo abrir el navegador automáticamente. Abrí manualmente: $URL"
fi

echo ""
echo "✅ Todo listo. Presioná Ctrl+C en esta terminal para cerrar el servidor HTTP."
if [ "$OLLAMA_STARTED_BY_SCRIPT" -eq 1 ]; then
    echo "   (Ollama también se cerrará, porque lo inició este script)"
else
    echo "   (Ollama seguirá corriendo, porque ya estaba activo antes de este script)"
fi
echo ""

# Función de limpieza al cerrar (Ctrl+C)
cleanup() {
    echo ""
    echo "🛑 Cerrando servidor HTTP..."
    kill $HTTP_PID 2>/dev/null

    if [ "$OLLAMA_STARTED_BY_SCRIPT" -eq 1 ]; then
        echo "🛑 Cerrando Ollama..."
        kill $OLLAMA_PID 2>/dev/null
    fi

    echo "👋 Listo."
    exit 0
}

trap cleanup INT TERM

# Mantiene el script corriendo hasta que el usuario presione Ctrl+C
wait $HTTP_PID
