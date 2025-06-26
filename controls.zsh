OLLAMA_CUSTOM_CONTROLS_DIR="$(cd -- "$(dirname -- "${(%):-%N}")" && pwd)"

start_ollama() {
  echo "Starting ollama..."
  OLLAMA_FLASH_ATTENTION="1" OLLAMA_KV_CACHE_TYPE="q8_0" ollama serve > /tmp/ollama.log 2>&1 &
  sleep 2  # Give it time to initialize
}

stop_ollama() {
  echo "Stopping ollama..."
  ollama stop mixtral
  ollama stop phi3:mini
  killall ollama
}

function summarize_commits() {
  node "$OLLAMA_CUSTOM_CONTROLS_DIR/summarizer.js"
}