```bash
#!/usr/bin/env bash
set -euo pipefail

# Detect privilege level
if [ "$(id -u)" -eq 0 ]; then
    SUDO=""
else
    SUDO="sudo"
fi

# Set workspace path
WORKSPACE="/home/kavia/workspace/code-generation/food-delivery-app-14946-15107/PartnerPortal"
cd "$WORKSPACE"

# === COMMAND: INSTALL ===
# Ensure Node.js >=18, npm/yarn, create-react-app, jest are present (all preinstalled per container baseline)
node_version=$(node --version | grep -oE '[0-9]+' | head -1)
if [ "$node_version" -lt 18 ]; then
    echo "Node.js >= 18 is required." >&2; exit 1
fi
# Set global env vars for headless testing
echo "export CHROME_BIN=$(command -v google-chrome || command -v chromium-browser || echo '/usr/bin/chromium-browser')" | $SUDO tee /etc/profile.d/chrome_bin.sh >/dev/null
echo 'export NODE_ENV=development' | $SUDO tee /etc/profile.d/node_env.sh >/dev/null

# === COMMAND: SCAFFOLD ===
# Scaffold React app with create-react-app in workspace if package.json does not exist
if [ ! -f "$WORKSPACE/package.json" ]; then
    npx --yes create-react-app "$WORKSPACE" --use-npm --template cra-template --quiet
fi

# === COMMAND: DEPS ===
# Install minimal React dependencies and lockfiles; ensure consistency
cd "$WORKSPACE"
npm install --quiet
npm install react react-dom react-scripts --save --quiet

# === COMMAND: BUILD ===
npm run build --if-present --quiet

# === COMMAND: TEST ===
npm test -- --watchAll=false --ci --passWithNoTests

# === COMMAND: START ===
# Launch development server (background, logs redirected)
npm start -- --host 0.0.0.0 > "$WORKSPACE/devserver.log" 2>&1 & echo $! > "$WORKSPACE/.devserver.pid"

# === COMMAND: VALIDATE ===
sleep 8
status=1
for i in {1..6}; do
    if curl -fs http://localhost:3000/ >/dev/null 2>&1; then status=0; break; fi
    sleep 2
done
if [ $status -ne 0 ]; then
    echo "ERROR: React dev server not responding on http://localhost:3000/" >&2
    exit 1
fi

# === COMMAND: STOP ===
if [ -f "$WORKSPACE/.devserver.pid" ]; then
    kill -TERM "$(cat "$WORKSPACE/.devserver.pid")" 2>/dev/null || true
    rm -f "$WORKSPACE/.devserver.pid"
fi
```