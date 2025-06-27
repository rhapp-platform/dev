# Rhappsody Development Tools Justfile
# Use 'just --list' to see available commands

# Default recipe - show available commands
default:
    @just --list

# Setup development environment
setup:
    @echo "Setting up development environment..."
    @echo "RH environment: $RH"
    
# Clean all build artifacts
clean:
    @echo "Cleaning build artifacts..."
    find . -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null || true
    find . -name "dist" -type d -exec rm -rf {} + 2>/dev/null || true
    find . -name "build" -type d -exec rm -rf {} + 2>/dev/null || true
    find . -name "*.tsbuildinfo" -delete 2>/dev/null || true
    @echo "Clean complete"

# Install dependencies for all tools
install:
    @echo "Installing dependencies for all tools..."
    @find tools -name "package.json" -execdir bun install \;
    @find scripts -name "package.json" -execdir bun install \;
    @find experiments -name "package.json" -execdir bun install \;

# Build all tools
build:
    @echo "Building all tools..."
    @find tools -name "package.json" -execdir bun run build \; 2>/dev/null || true
    @find scripts -name "package.json" -execdir bun run build \; 2>/dev/null || true
    @find experiments -name "package.json" -execdir bun run build \; 2>/dev/null || true

# Run tests for all tools
test:
    @echo "Running tests for all tools..."
    @find tools -name "package.json" -execdir bun test \; 2>/dev/null || true
    @find scripts -name "package.json" -execdir bun test \; 2>/dev/null || true
    @find experiments -name "package.json" -execdir bun test \; 2>/dev/null || true

# Lint all code
lint:
    @echo "Linting all code..."
    @find . -name "*.ts" -not -path "./node_modules/*" -not -path "./dist/*" | head -10

# Format all code
format:
    @echo "Formatting all code..."
    @find . -name "*.ts" -not -path "./node_modules/*" -not -path "./dist/*" -exec npx prettier --write {} \; 2>/dev/null || true
    @find . -name "*.js" -not -path "./node_modules/*" -not -path "./dist/*" -exec npx prettier --write {} \; 2>/dev/null || true
    @find . -name "*.json" -not -path "./node_modules/*" -not -path "./dist/*" -exec npx prettier --write {} \; 2>/dev/null || true

# Create a new tool template
new-tool name:
    @echo "Creating new tool: {{name}}"
    @mkdir -p tools/{{name}}/src
    @echo '{"name":"{{name}}","version":"1.0.0","type":"module","scripts":{"build":"bun build src/index.ts --outdir dist --target bun","dev":"bun --watch src/index.ts","start":"bun src/index.ts","test":"bun test"},"dependencies":{},"devDependencies":{"bun-types":"latest"}}' | jq . > tools/{{name}}/package.json
    @echo 'console.log("Hello from {{name}}!");' > tools/{{name}}/src/index.ts
    @echo "# {{name}}\n\nDescription of {{name}} tool.\n\n## Usage\n\n\`\`\`bash\nbun install\nbun start\n\`\`\`" > tools/{{name}}/README.md
    @echo "Created new tool: tools/{{name}}"

# Create a new script template  
new-script name:
    @echo "Creating new script: {{name}}"
    @mkdir -p scripts/{{name}}
    @echo '#!/usr/bin/env node\nconsole.log("Hello from {{name}} script!");' > scripts/{{name}}/{{name}}.js
    @chmod +x scripts/{{name}}/{{name}}.js
    @echo "# {{name}} Script\n\nDescription of {{name}} script.\n\n## Usage\n\n\`\`\`bash\n./{{name}}.js\n\`\`\`" > scripts/{{name}}/README.md
    @echo "Created new script: scripts/{{name}}"

# List all tools
list-tools:
    @echo "Available tools:"
    @find tools -maxdepth 1 -type d -not -path tools | sort

# List all scripts
list-scripts:
    @echo "Available scripts:"
    @find scripts -maxdepth 1 -type d -not -path scripts | sort

# List all experiments
list-experiments:
    @echo "Available experiments:"
    @find experiments -maxdepth 1 -type d -not -path experiments | sort

# Git shortcuts
commit message:
    git add .
    git commit -m "{{message}}\n\n🤖 Generated with [Claude Code](https://claude.ai/code)\n\nCo-Authored-By: Claude <noreply@anthropic.com>"

push:
    git push

pull:
    git pull

status:
    git status

# Development workflow
dev: install build
    @echo "Development environment ready"

# Full workflow
all: clean install build test
    @echo "Full build and test complete"

# Show environment info
env:
    @echo "Environment Information:"
    @echo "RH: $RH"
    @echo "PWD: $(pwd)"
    @echo "Node: $(node --version 2>/dev/null || echo 'not installed')"
    @echo "NPM: $(npm --version 2>/dev/null || echo 'not installed')"
    @echo "Just: $(just --version 2>/dev/null || echo 'not installed')"
    @echo "Git: $(git --version 2>/dev/null || echo 'not installed')"