// WebAssembly Signal Processing Module - JavaScript Glue Code
// This file provides the interface between JavaScript and the compiled WASM module

let wasmModule = null
let memory = null
let allocateMemory = null
let freeMemory = null

/**
 * Initialize the WebAssembly module
 */
export async function initializeWASM() {
  if (wasmModule) return wasmModule

  try {
    // Load the WebAssembly module
    const wasmResponse = await fetch('/wasm/signal_processing.wasm')
    const wasmBytes = await wasmResponse.arrayBuffer()
    
    // Compile and instantiate
    const wasmInstance = await WebAssembly.instantiate(wasmBytes, {
      env: {
        // Import functions that WASM can call (if needed)
        consoleLog: (ptr, len) => {
          const str = new TextDecoder().decode(new Uint8Array(memory.buffer, ptr, len))
          console.log('[WASM]', str)
        }
      }
    })

    wasmModule = wasmInstance.instance.exports
    memory = wasmModule.memory

    // Get memory management functions
    allocateMemory = wasmModule.malloc || wasmModule.allocate
    freeMemory = wasmModule.free || wasmModule.deallocate

    console.log('✅ WebAssembly signal processing module loaded')
    return wasmModule
  } catch (error) {
    console.error('❌ Failed to load WASM module:', error)
    throw error
  }
}

/**
 * Process rPPG signals using high-performance WASM implementation
 * @param {Float32Array} signals - Raw green channel signals
 * @param {number} sampleRate - Signal sample rate (fps)
 * @returns {Float32Array} Processed signals
 */
export function processSignals(signals, sampleRate) {
  if (!wasmModule) {
    throw new Error('WASM module not initialized')
  }

  const signalLength = signals.length
  const bytesPerFloat = 4
  
  // Allocate memory in WASM
  const inputPtr = allocateMemory(signalLength * bytesPerFloat)
  const outputPtr = allocateMemory(signalLength * bytesPerFloat)
  
  try {
    // Copy input data to WASM memory
    const inputView = new Float32Array(memory.buffer, inputPtr, signalLength)
    inputView.set(signals)
    
    // Call WASM function for signal processing
    // This would include: detrending, filtering, normalization
    const success = wasmModule.process_rppg_signals(
      inputPtr,
      outputPtr,
      signalLength,
      sampleRate
    )
    
    if (!success) {
      throw new Error('WASM signal processing failed')
    }
    
    // Copy result back to JavaScript
    const outputView = new Float32Array(memory.buffer, outputPtr, signalLength)
    return new Float32Array(outputView)
    
  } finally {
    // Clean up memory
    if (inputPtr) freeMemory(inputPtr)
    if (outputPtr) freeMemory(outputPtr)
  }
}

/**
 * Calculate heart rate using FFT-based frequency analysis
 * @param {Float32Array} processedSignals - Filtered signals
 * @param {number} sampleRate - Sample rate
 * @returns {number} Heart rate in BPM
 */
export function calculateHeartRate(processedSignals, sampleRate) {
  if (!wasmModule) {
    throw new Error('WASM module not initialized')
  }

  const signalLength = processedSignals.length
  const bytesPerFloat = 4
  
  const inputPtr = allocateMemory(signalLength * bytesPerFloat)
  
  try {
    // Copy data to WASM
    const inputView = new Float32Array(memory.buffer, inputPtr, signalLength)
    inputView.set(processedSignals)
    
    // Call WASM FFT-based heart rate calculation
    const heartRate = wasmModule.calculate_heart_rate_fft(
      inputPtr,
      signalLength,
      sampleRate,
      50,  // minBPM
      180  // maxBPM
    )
    
    return heartRate
    
  } finally {
    if (inputPtr) freeMemory(inputPtr)
  }
}

/**
 * Calculate respiration rate from the same signal
 * @param {Float32Array} processedSignals - Filtered signals
 * @param {number} sampleRate - Sample rate
 * @returns {number} Respiration rate in breaths per minute
 */
export function calculateRespirationRate(processedSignals, sampleRate) {
  if (!wasmModule) {
    throw new Error('WASM module not initialized')
  }

  const signalLength = processedSignals.length
  const bytesPerFloat = 4
  
  const inputPtr = allocateMemory(signalLength * bytesPerFloat)
  
  try {
    const inputView = new Float32Array(memory.buffer, inputPtr, signalLength)
    inputView.set(processedSignals)
    
    // Respiration rate is typically in a lower frequency band
    const respirationRate = wasmModule.calculate_respiration_rate(
      inputPtr,
      signalLength,
      sampleRate,
      8,   // minBrPM
      40   // maxBrPM
    )
    
    return respirationRate
    
  } finally {
    if (inputPtr) freeMemory(inputPtr)
  }
}

/**
 * Apply band-pass filter to isolate heart rate frequencies
 * @param {Float32Array} signals - Raw signals
 * @param {number} sampleRate - Sample rate
 * @param {number} lowCutoff - Low frequency cutoff (Hz)
 * @param {number} highCutoff - High frequency cutoff (Hz)
 * @returns {Float32Array} Filtered signals
 */
export function bandPassFilter(signals, sampleRate, lowCutoff = 0.8, highCutoff = 3.0) {
  if (!wasmModule) {
    // Fallback to JavaScript implementation
    return bandPassFilterJS(signals, sampleRate, lowCutoff, highCutoff)
  }

  const signalLength = signals.length
  const bytesPerFloat = 4
  
  const inputPtr = allocateMemory(signalLength * bytesPerFloat)
  const outputPtr = allocateMemory(signalLength * bytesPerFloat)
  
  try {
    const inputView = new Float32Array(memory.buffer, inputPtr, signalLength)
    inputView.set(signals)
    
    const success = wasmModule.bandpass_filter(
      inputPtr,
      outputPtr,
      signalLength,
      sampleRate,
      lowCutoff,
      highCutoff
    )
    
    if (!success) {
      throw new Error('WASM bandpass filter failed')
    }
    
    const outputView = new Float32Array(memory.buffer, outputPtr, signalLength)
    return new Float32Array(outputView)
    
  } finally {
    if (inputPtr) freeMemory(inputPtr)
    if (outputPtr) freeMemory(outputPtr)
  }
}

/**
 * JavaScript fallback for band-pass filtering (simple implementation)
 */
function bandPassFilterJS(signals, sampleRate, lowCutoff, highCutoff) {
  console.warn('Using JavaScript fallback for bandpass filter')
  
  // Simple moving average-based filter (placeholder)
  const windowSize = Math.floor(sampleRate / 2)
  const filtered = new Float32Array(signals.length)
  
  for (let i = 0; i < signals.length; i++) {
    let sum = 0
    let count = 0
    
    for (let j = Math.max(0, i - windowSize); j <= Math.min(signals.length - 1, i + windowSize); j++) {
      sum += signals[j]
      count++
    }
    
    filtered[i] = signals[i] - (sum / count) // High-pass component
  }
  
  return filtered
}

/**
 * Get module information
 */
export function getModuleInfo() {
  return {
    loaded: wasmModule !== null,
    memory: memory ? memory.buffer.byteLength : 0,
    functions: wasmModule ? Object.keys(wasmModule) : []
  }
}

// Default export for convenient importing
export default {
  initializeWASM,
  processSignals,
  calculateHeartRate,
  calculateRespirationRate,
  bandPassFilter,
  getModuleInfo
}