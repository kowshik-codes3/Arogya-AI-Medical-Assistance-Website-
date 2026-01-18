/**
 * Ocular Analysis Web Worker - Advanced Eye-based Health Screening
 * 
 * This worker handles:
 * 1. Static ocular analysis (anemia, jaundice detection)
 * 2. Dynamic eye tracking for neurological screening
 * 3. TensorFlow.js model inference
 */

import * as tf from '@tensorflow/tfjs'

// Global state
let staticModel = null
let eyeTrackingModel = null
let isInitialized = false

/**
 * Initialize TensorFlow.js models and MediaPipe
 */
async function initializeModels() {
  try {
    // Set TensorFlow.js backend
    await tf.setBackend('webgl')
    await tf.ready()

    // Load static ocular analysis model
    staticModel = await tf.loadLayersModel('/models/ocular_static/model.json')
    
    // Load eye tracking analysis model (if available)
    try {
      eyeTrackingModel = await tf.loadLayersModel('/models/ocular_dynamic/model.json')
    } catch (e) {
      console.warn('Eye tracking model not available:', e.message)
    }

    isInitialized = true
    return { success: true, message: 'Ocular analysis models initialized' }
  } catch (error) {
    console.error('Failed to initialize ocular models:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Analyze static eye image for anemia and jaundice
 * @param {ImageData} eyeImageData - Eye region image
 */
async function analyzeStaticImage(eyeImageData) {
  if (!isInitialized || !staticModel) {
    throw new Error('Static ocular model not initialized')
  }

  try {
    // Preprocess image for model input
    const tensor = preprocessEyeImage(eyeImageData)
    
    // Run inference
    const predictions = await staticModel.predict(tensor).data()
    
    // Interpret results (model-specific)
    const results = {
      anemia: {
        probability: predictions[0],
        detected: predictions[0] > 0.7,
        confidence: predictions[0]
      },
      jaundice: {
        probability: predictions[1] || 0,
        detected: (predictions[1] || 0) > 0.6,
        confidence: predictions[1] || 0
      },
      overallHealth: calculateOverallHealthScore(predictions)
    }

    // Cleanup tensor
    tensor.dispose()

    return { success: true, results }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

/**
 * Analyze eye tracking data for neurological indicators
 * @param {Array} trackingData - Array of gaze points with timestamps
 */
async function analyzeEyeTracking(trackingData) {
  if (!eyeTrackingModel) {
    // Fallback to rule-based analysis if model not available
    return analyzeTrackingRuleBased(trackingData)
  }

  try {
    // Convert tracking data to tensor format
    const tensor = preprocessTrackingData(trackingData)
    
    // Run inference
    const predictions = await eyeTrackingModel.predict(tensor).data()
    
    const results = {
      saccadicMovement: {
        stability: predictions[0],
        normal: predictions[0] > 0.7
      },
      fixationQuality: {
        score: predictions[1] || 0.8,
        normal: (predictions[1] || 0.8) > 0.6
      },
      cognitiveLoad: {
        indicator: predictions[2] || 0.5,
        elevated: (predictions[2] || 0.5) > 0.7
      }
    }

    tensor.dispose()
    return { success: true, results }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

/**
 * Rule-based eye tracking analysis (fallback)
 */
function analyzeTrackingRuleBased(trackingData) {
  if (trackingData.length < 10) {
    return { success: false, error: 'Insufficient tracking data' }
  }

  // Calculate metrics
  const velocities = calculateSaccadicVelocities(trackingData)
  const fixationStability = calculateFixationStability(trackingData)
  const smoothnessScore = calculateSmoothness(trackingData)

  const results = {
    saccadicMovement: {
      averageVelocity: velocities.average,
      stability: smoothnessScore,
      normal: smoothnessScore > 0.7 && velocities.average < 300
    },
    fixationQuality: {
      score: fixationStability,
      normal: fixationStability > 0.6
    },
    cognitiveLoad: {
      indicator: 1 - smoothnessScore,
      elevated: smoothnessScore < 0.5
    }
  }

  return { success: true, results }
}

/**
 * Preprocess eye image for TensorFlow.js model
 */
function preprocessEyeImage(imageData) {
  // Convert ImageData to tensor and normalize
  const tensor = tf.browser.fromPixels(imageData)
    .resizeNearestNeighbor([224, 224]) // Resize to model input size
    .cast('float32')
    .div(255.0) // Normalize to [0,1]
    .expandDims(0) // Add batch dimension
  
  return tensor
}

/**
 * Preprocess tracking data for model input
 */
function preprocessTrackingData(trackingData) {
  // Convert tracking points to feature vector
  const features = []
  
  for (let i = 0; i < trackingData.length - 1; i++) {
    const current = trackingData[i]
    const next = trackingData[i + 1]
    
    // Calculate velocity and acceleration features
    const dx = next.x - current.x
    const dy = next.y - current.y
    const dt = next.timestamp - current.timestamp
    const velocity = Math.sqrt(dx*dx + dy*dy) / dt
    
    features.push(dx, dy, velocity)
  }

  // Pad or truncate to fixed size (e.g., 300 features)
  const fixedSize = 300
  while (features.length < fixedSize) features.push(0)
  if (features.length > fixedSize) features.splice(fixedSize)

  return tf.tensor2d([features], [1, fixedSize])
}

/**
 * Calculate overall health score from model predictions
 */
function calculateOverallHealthScore(predictions) {
  const anemiaScore = 1 - predictions[0] // Lower anemia = better health
  const jaundiceScore = 1 - (predictions[1] || 0)
  
  const overall = (anemiaScore + jaundiceScore) / 2
  
  return {
    score: overall,
    category: overall > 0.8 ? 'good' : overall > 0.6 ? 'moderate' : 'concerning'
  }
}

/**
 * Calculate saccadic velocities from tracking data
 */
function calculateSaccadicVelocities(trackingData) {
  const velocities = []
  
  for (let i = 1; i < trackingData.length; i++) {
    const prev = trackingData[i-1]
    const curr = trackingData[i]
    
    const dx = curr.x - prev.x
    const dy = curr.y - prev.y
    const dt = curr.timestamp - prev.timestamp
    
    if (dt > 0) {
      const velocity = Math.sqrt(dx*dx + dy*dy) / dt * 1000 // px/second
      velocities.push(velocity)
    }
  }
  
  return {
    average: velocities.reduce((sum, v) => sum + v, 0) / velocities.length,
    max: Math.max(...velocities),
    min: Math.min(...velocities)
  }
}

/**
 * Calculate fixation stability
 */
function calculateFixationStability(trackingData) {
  if (trackingData.length < 5) return 0
  
  // Calculate variance in gaze position
  const xPositions = trackingData.map(d => d.x)
  const yPositions = trackingData.map(d => d.y)
  
  const xVar = calculateVariance(xPositions)
  const yVar = calculateVariance(yPositions)
  
  // Lower variance = higher stability
  const totalVar = Math.sqrt(xVar + yVar)
  return Math.max(0, 1 - (totalVar / 100)) // Normalize
}

/**
 * Calculate smoothness of eye movement
 */
function calculateSmoothness(trackingData) {
  if (trackingData.length < 3) return 0
  
  let jerk = 0
  for (let i = 2; i < trackingData.length; i++) {
    const p1 = trackingData[i-2]
    const p2 = trackingData[i-1] 
    const p3 = trackingData[i]
    
    // Calculate jerk (third derivative of position)
    const jerkX = Math.abs(p3.x - 2*p2.x + p1.x)
    const jerkY = Math.abs(p3.y - 2*p2.y + p1.y)
    jerk += Math.sqrt(jerkX*jerkX + jerkY*jerkY)
  }
  
  // Lower jerk = smoother movement
  const avgJerk = jerk / (trackingData.length - 2)
  return Math.max(0, 1 - (avgJerk / 50)) // Normalize
}

function calculateVariance(arr) {
  const mean = arr.reduce((sum, val) => sum + val, 0) / arr.length
  return arr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / arr.length
}

/**
 * Extract eye region from full face image using landmarks
 */
function extractEyeRegion(faceImageData, eyeLandmarks) {
  // Create canvas to extract eye region
  const canvas = new OffscreenCanvas(100, 60)
  const ctx = canvas.getContext('2d')
  
  // Calculate eye bounding box from landmarks
  let minX = Infinity, minY = Infinity, maxX = 0, maxY = 0
  eyeLandmarks.forEach(point => {
    minX = Math.min(minX, point.x * faceImageData.width)
    maxX = Math.max(maxX, point.x * faceImageData.width)
    minY = Math.min(minY, point.y * faceImageData.height)
    maxY = Math.max(maxY, point.y * faceImageData.height)
  })
  
  // Add padding
  const padding = 10
  minX = Math.max(0, minX - padding)
  minY = Math.max(0, minY - padding)
  maxX = Math.min(faceImageData.width, maxX + padding)
  maxY = Math.min(faceImageData.height, maxY + padding)
  
  // Extract region (simplified - would need proper canvas manipulation)
  const eyeWidth = maxX - minX
  const eyeHeight = maxY - minY
  
  return {
    x: minX, y: minY, width: eyeWidth, height: eyeHeight
  }
}

// Worker message handler
self.onmessage = async function(event) {
  const { id, command, data } = event.data

  try {
    let result = null

    switch (command) {
      case 'initialize':
        result = await initializeModels()
        break

      case 'analyzeStatic':
        result = await analyzeStaticImage(data.imageData)
        break

      case 'analyzeTracking':
        result = await analyzeEyeTracking(data.trackingData)
        break

      case 'extractEyeRegion':
        const eyeRegion = extractEyeRegion(data.faceImageData, data.eyeLandmarks)
        result = { success: true, eyeRegion }
        break

      default:
        throw new Error(`Unknown command: ${command}`)
    }

    self.postMessage({ id, success: true, result })
  } catch (error) {
    self.postMessage({ 
      id, 
      success: false, 
      error: error.message 
    })
  }
}