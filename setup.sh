#!/bin/bash

# Gist Clone - One-Command Setup
# ==============================

set -e

echo ""
echo "⚡ Gist Clone Setup"
echo "==================="
echo ""

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed."
    echo "   Please install it from https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18+ is required (you have $(node -v))"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install --silent
echo "✅ Dependencies installed"
echo ""

# Check for .env.local
if [ ! -f .env.local ]; then
    echo "🔑 Setting up environment..."
    echo ""
    
    # Check if OPENAI_API_KEY is already in environment
    if [ -n "$OPENAI_API_KEY" ]; then
        echo "   Found OPENAI_API_KEY in your environment"
        read -p "   Use this key? [Y/n] " USE_ENV_KEY
        if [ "$USE_ENV_KEY" != "n" ] && [ "$USE_ENV_KEY" != "N" ]; then
            echo "OPENAI_API_KEY=$OPENAI_API_KEY" > .env.local
            echo "✅ Created .env.local with your key"
        fi
    fi
    
    # If still no .env.local, prompt for key
    if [ ! -f .env.local ]; then
        echo "   You need an OpenAI API key to run Gist Clone."
        echo "   Get one at: https://platform.openai.com/api-keys"
        echo ""
        read -p "   Enter your OpenAI API key (sk-...): " API_KEY
        
        if [ -z "$API_KEY" ]; then
            echo ""
            echo "⚠️  No API key provided."
            echo "   Create .env.local manually with:"
            echo "   OPENAI_API_KEY=sk-your-key-here"
            echo ""
            cp .env.example .env.local
        else
            echo "OPENAI_API_KEY=$API_KEY" > .env.local
            echo "✅ Created .env.local"
        fi
    fi
else
    echo "✅ Found existing .env.local"
fi

echo ""
echo "🚀 Starting dev server..."
echo ""
echo "   Open http://localhost:3000 in your browser"
echo "   Press Ctrl+C to stop"
echo ""
echo "==========================================="
echo ""

npm run dev
