#!/bin/bash

# Build script for WebAssembly signal processing module
# This script compiles the C++ code to WebAssembly using Emscripten

set -e

echo "🔧 Building WebAssembly Signal Processing Module..."

# Check if Emscripten is available
if ! command -v emcc &> /dev/null; then
    echo "❌ Emscripten not found. Please install Emscripten SDK first:"
    echo "   https://emscripten.org/docs/getting_started/downloads.html"
    exit 1
fi

# Create output directory
mkdir -p dist

# Compile C++ to WebAssembly
echo "📦 Compiling C++ to WebAssembly..."
emcc src/signal_processing.cpp \
    -o dist/signal_processing.wasm \
    -s EXPORTED_FUNCTIONS="['_malloc','_free','_process_rppg_signals','_calculate_heart_rate_fft','_calculate_respiration_rate','_bandpass_filter']" \
    -s EXPORTED_RUNTIME_METHODS="['ccall','cwrap']" \
    -s MODULARIZE=1 \
    -s EXPORT_NAME="SignalProcessingModule" \
    -s ALLOW_MEMORY_GROWTH=1 \
    -s INITIAL_MEMORY=16777216 \
    -O3 \
    -s NO_EXIT_RUNTIME=1 \
    --no-entry

# Generate JavaScript glue code
echo "🔗 Generating JavaScript wrapper..."
emcc src/signal_processing.cpp \
    -o dist/signal_processing.js \
    -s EXPORTED_FUNCTIONS="['_malloc','_free','_process_rppg_signals','_calculate_heart_rate_fft','_calculate_respiration_rate','_bandpass_filter']" \
    -s EXPORTED_RUNTIME_METHODS="['ccall','cwrap']" \
    -s MODULARIZE=1 \
    -s EXPORT_NAME="SignalProcessingModule" \
    -s ALLOW_MEMORY_GROWTH=1 \
    -s INITIAL_MEMORY=16777216 \
    -O3 \
    -s NO_EXIT_RUNTIME=1

echo "✅ WebAssembly build complete!"
echo "📁 Output files:"
echo "   - dist/signal_processing.wasm"
echo "   - dist/signal_processing.js"

# Copy to frontend public directory
FRONTEND_WASM_DIR="../../pwa_frontend/public/wasm"
if [ -d "$FRONTEND_WASM_DIR" ]; then
    echo "📋 Copying files to frontend..."
    cp dist/signal_processing.wasm "$FRONTEND_WASM_DIR/"
    cp dist/signal_processing.js "$FRONTEND_WASM_DIR/"
    echo "✅ Files copied to $FRONTEND_WASM_DIR"
else
    echo "⚠️  Frontend WASM directory not found: $FRONTEND_WASM_DIR"
    echo "   Please copy files manually or ensure correct path"
fi

echo "🎉 Build process complete!"