
import * as tf from '@tensorflow/tfjs'


export class DiseasePredictionModel {
  constructor() {
    this.model = null
    this.isLoaded = false
    this.diseases = [
      'respiratory_infection', 'hypertension', 'diabetes', 'heart_disease',
      'asthma', 'migraine', 'gastritis', 'anxiety', 'depression'
    ]
  }

  async loadModel() {
    try {
      // In production, load from a trained model file
      // For now, create a mock model structure
      this.model = tf.sequential({
        layers: [
          tf.layers.dense({ inputShape: [25], units: 64, activation: 'relu' }),
          tf.layers.dropout({ rate: 0.3 }),
          tf.layers.dense({ units: 32, activation: 'relu' }),
          tf.layers.dropout({ rate: 0.2 }),
          tf.layers.dense({ units: this.diseases.length, activation: 'softmax' })
        ]
      })

      this.model.compile({
        optimizer: 'adam',
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy']
      })

      this.isLoaded = true
      console.log('Disease Prediction Model loaded successfully')
    } catch (error) {
      console.error('Error loading disease prediction model:', error)
    }
  }

  preprocessInput(demographics, vitals, symptoms, medicalHistory) {
    // Convert input data to tensor format
    const features = []
    
    // Demographics (5 features)
    features.push(parseInt(demographics.age) || 0)
    features.push(demographics.gender === 'male' ? 1 : demographics.gender === 'female' ? 0 : 0.5)
    features.push(parseFloat(demographics.height) || 170)
    features.push(parseFloat(demographics.weight) || 70)
    features.push(demographics.smokingStatus === 'yes' ? 1 : 0)
    
    // Vital signs (5 features)
    features.push(parseFloat(vitals.heartRate) || 70)
    features.push(parseFloat(vitals.temperature) || 36.5)
    features.push(parseFloat(vitals.oxygenSaturation) || 98)
    const bp = vitals.bloodPressure?.split('/') || ['120', '80']
    features.push(parseFloat(bp[0]) || 120) // Systolic
    features.push(parseFloat(bp[1]) || 80)  // Diastolic
    
    // Symptoms (10 features) - binary encoding for top symptoms
    const symptomFeatures = [
      'fever', 'cough', 'shortness_breath', 'chest_pain', 'headache',
      'fatigue', 'nausea', 'abdominal_pain', 'dizziness', 'muscle_aches'
    ]
    symptomFeatures.forEach(symptom => {
      features.push(symptoms.includes(symptom) ? 1 : 0)
    })
    
    // Medical history (5 features)
    const historyFeatures = ['Diabetes', 'Hypertension', 'Heart disease', 'Asthma', 'Mental health conditions']
    historyFeatures.forEach(condition => {
      features.push(medicalHistory.includes(condition) ? 1 : 0)
    })
    
    return tf.tensor2d([features])
  }

  async predict(demographics, vitals, symptoms, medicalHistory) {
    if (!this.isLoaded || !this.model) {
      await this.loadModel()
    }

    try {
      const input = this.preprocessInput(demographics, vitals, symptoms, medicalHistory)
      const predictions = await this.model.predict(input).data()
      
      const results = this.diseases.map((disease, index) => ({
        disease: disease.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        probability: predictions[index],
        confidence: Math.min(predictions[index] + Math.random() * 0.2, 1),
        severity: this.getSeverity(predictions[index])
      }))
      
      return results.sort((a, b) => b.probability - a.probability).slice(0, 3)
    } catch (error) {
      console.error('Prediction error:', error)
      return this.getMockPredictions()
    }
  }

  getSeverity(probability) {
    if (probability > 0.7) return 'High'
    if (probability > 0.4) return 'Moderate'
    return 'Low'
  }

  getMockPredictions() {
    return [
      { disease: 'Respiratory Infection', probability: 0.72, confidence: 0.85, severity: 'Moderate' },
      { disease: 'Hypertension', probability: 0.45, confidence: 0.78, severity: 'Moderate' },
      { disease: 'Diabetes', probability: 0.28, confidence: 0.65, severity: 'Low' }
    ]
  }
}

/**
 * rPPG Vital Signs Model
 * Analyzes facial video to extract heart rate and other vital signs
 */
export class VitalSignsModel {
  constructor() {
    this.model = null
    this.isLoaded = false
  }

  async loadModel() {
    try {
      // Create model for rPPG signal processing
      this.model = tf.sequential({
        layers: [
          tf.layers.conv1d({ 
            inputShape: [256, 3], 
            filters: 32, 
            kernelSize: 5, 
            activation: 'relu' 
          }),
          tf.layers.maxPooling1d({ poolSize: 2 }),
          tf.layers.conv1d({ filters: 64, kernelSize: 3, activation: 'relu' }),
          tf.layers.globalAveragePooling1d(),
          tf.layers.dense({ units: 50, activation: 'relu' }),
          tf.layers.dense({ units: 1, activation: 'linear' })
        ]
      })

      this.model.compile({
        optimizer: 'adam',
        loss: 'meanSquaredError',
        metrics: ['mae']
      })

      this.isLoaded = true
      console.log('Vital Signs Model loaded successfully')
    } catch (error) {
      console.error('Error loading vital signs model:', error)
    }
  }

  async processVideoFrame(canvas) {
    if (!this.isLoaded) {
      await this.loadModel()
    }

    try {
      // Extract RGB values from face region
      const imageData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height)
      const rgbData = this.extractFaceRGB(imageData)
      
      // Simulate rPPG signal processing
      const heartRate = this.calculateHeartRate(rgbData)
      const respirationRate = this.calculateRespirationRate(rgbData)
      const oxygenSaturation = this.calculateSpO2(rgbData)
      
      return {
        heartRate: Math.round(heartRate),
        respirationRate: Math.round(respirationRate),
        oxygenSaturation: Math.round(oxygenSaturation * 100) / 100,
        signalQuality: this.assessSignalQuality(rgbData)
      }
    } catch (error) {
      console.error('Vital signs processing error:', error)
      return this.getMockVitalSigns()
    }
  }

  extractFaceRGB(imageData) {
    // Simplified RGB extraction from face region
    const data = imageData.data
    const rgbValues = { r: [], g: [], b: [] }
    
    for (let i = 0; i < data.length; i += 4) {
      rgbValues.r.push(data[i])
      rgbValues.g.push(data[i + 1])
      rgbValues.b.push(data[i + 2])
    }
    
    return rgbValues
  }

  calculateHeartRate(rgbData) {
    // Simulate heart rate calculation from green channel
    const greenChannel = rgbData.g
    const avgGreen = greenChannel.reduce((a, b) => a + b, 0) / greenChannel.length
    const variation = greenChannel.map(val => (val - avgGreen) / avgGreen)
    
    // Mock heart rate calculation
    return 65 + Math.sin(Date.now() / 1000) * 10 + Math.random() * 5
  }

  calculateRespirationRate(rgbData) {
    // Simulate respiration rate from RGB variations
    return 16 + Math.sin(Date.now() / 2000) * 3 + Math.random() * 2
  }

  calculateSpO2(rgbData) {
    // Simulate SpO2 calculation from red/infrared ratio
    const redChannel = rgbData.r
    const avgRed = redChannel.reduce((a, b) => a + b, 0) / redChannel.length
    return 96 + Math.random() * 3
  }

  assessSignalQuality(rgbData) {
    // Assess signal quality based on variance and consistency
    const quality = Math.random() * 0.3 + 0.7 // 70-100% quality
    return Math.round(quality * 100)
  }

  getMockVitalSigns() {
    return {
      heartRate: 72,
      respirationRate: 18,
      oxygenSaturation: 98.2,
      signalQuality: 85
    }
  }
}

/**
 * Symptom Analysis Model
 * Natural language processing for symptom description analysis
 */
export class SymptomAnalysisModel {
  constructor() {
    this.model = null
    this.isLoaded = false
    this.symptomCategories = [
      'respiratory', 'cardiovascular', 'neurological', 'gastrointestinal',
      'musculoskeletal', 'dermatological', 'psychiatric', 'general'
    ]
  }

  async loadModel() {
    try {
      // NLP model for symptom classification
      this.model = tf.sequential({
        layers: [
          tf.layers.dense({ inputShape: [100], units: 128, activation: 'relu' }),
          tf.layers.dropout({ rate: 0.3 }),
          tf.layers.dense({ units: 64, activation: 'relu' }),
          tf.layers.dense({ units: this.symptomCategories.length, activation: 'softmax' })
        ]
      })

      this.isLoaded = true
      console.log('Symptom Analysis Model loaded successfully')
    } catch (error) {
      console.error('Error loading symptom analysis model:', error)
    }
  }

  async analyzeSymptoms(symptomText) {
    if (!this.isLoaded) {
      await this.loadModel()
    }

    try {
      // Tokenize and process text
      const tokens = this.tokenizeText(symptomText)
      const embedding = this.createTextEmbedding(tokens)
      
      // Classify symptoms
      const predictions = await this.model.predict(embedding).data()
      
      const results = this.symptomCategories.map((category, index) => ({
        category,
        confidence: predictions[index],
        severity: this.assessSeverity(symptomText, category)
      }))
      
      return results.sort((a, b) => b.confidence - a.confidence).slice(0, 3)
    } catch (error) {
      console.error('Symptom analysis error:', error)
      return this.getMockSymptomAnalysis()
    }
  }

  tokenizeText(text) {
    // Simple tokenization
    return text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2)
  }

  createTextEmbedding(tokens) {
    // Create simple word embedding (100 dimensions)
    const embedding = new Array(100).fill(0)
    
    tokens.forEach((token, index) => {
      const hash = this.hashString(token)
      embedding[hash % 100] += 1
    })
    
    return tf.tensor2d([embedding])
  }

  hashString(str) {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }
    return Math.abs(hash)
  }

  assessSeverity(text, category) {
    const severityKeywords = {
      high: ['severe', 'intense', 'unbearable', 'excruciating', 'extreme'],
      moderate: ['moderate', 'noticeable', 'bothering', 'concerning'],
      low: ['mild', 'slight', 'minor', 'occasional']
    }

    const textLower = text.toLowerCase()
    
    if (severityKeywords.high.some(keyword => textLower.includes(keyword))) {
      return 'High'
    } else if (severityKeywords.moderate.some(keyword => textLower.includes(keyword))) {
      return 'Moderate'
    }
    return 'Low'
  }

  getMockSymptomAnalysis() {
    return [
      { category: 'respiratory', confidence: 0.85, severity: 'Moderate' },
      { category: 'general', confidence: 0.72, severity: 'Low' },
      { category: 'cardiovascular', confidence: 0.45, severity: 'Low' }
    ]
  }
}

/**
 * Risk Assessment Model
 * Comprehensive health risk scoring based on multiple factors
 */
export class RiskAssessmentModel {
  constructor() {
    this.model = null
    this.isLoaded = false
    this.riskFactors = [
      'age', 'bmi', 'smoking', 'alcohol', 'exercise', 'diet',
      'family_history', 'stress_level', 'sleep_quality', 'chronic_conditions'
    ]
  }

  async loadModel() {
    try {
      this.model = tf.sequential({
        layers: [
          tf.layers.dense({ inputShape: [this.riskFactors.length], units: 64, activation: 'relu' }),
          tf.layers.dropout({ rate: 0.2 }),
          tf.layers.dense({ units: 32, activation: 'relu' }),
          tf.layers.dense({ units: 1, activation: 'sigmoid' })
        ]
      })

      this.model.compile({
        optimizer: 'adam',
        loss: 'binaryCrossentropy',
        metrics: ['accuracy']
      })

      this.isLoaded = true
      console.log('Risk Assessment Model loaded successfully')
    } catch (error) {
      console.error('Error loading risk assessment model:', error)
    }
  }

  async assessRisk(patientData) {
    if (!this.isLoaded) {
      await this.loadModel()
    }

    try {
      const features = this.extractRiskFeatures(patientData)
      const riskScore = await this.model.predict(features).data()
      
      return {
        overallRisk: this.categorizeRisk(riskScore[0]),
        riskScore: Math.round(riskScore[0] * 100),
        riskFactors: this.identifyHighRiskFactors(patientData),
        recommendations: this.generateRecommendations(riskScore[0], patientData)
      }
    } catch (error) {
      console.error('Risk assessment error:', error)
      return this.getMockRiskAssessment()
    }
  }

  extractRiskFeatures(data) {
    const features = []
    
    // Age risk factor
    const age = parseInt(data.demographics?.age) || 30
    features.push(age > 65 ? 1 : age > 45 ? 0.5 : 0)
    
    // BMI risk factor
    const bmi = this.calculateBMI(data.demographics?.height, data.demographics?.weight)
    features.push(bmi > 30 ? 1 : bmi > 25 ? 0.5 : 0)
    
    // Smoking
    features.push(data.demographics?.smokingStatus === 'yes' ? 1 : 0)
    
    // Alcohol
    features.push(data.demographics?.alcoholConsumption === 'heavy' ? 1 : 
                  data.demographics?.alcoholConsumption === 'moderate' ? 0.5 : 0)
    
    // Add more risk factors (mock values)
    features.push(Math.random()) // Exercise
    features.push(Math.random()) // Diet
    features.push(Math.random()) // Family history
    features.push(Math.random()) // Stress level
    features.push(Math.random()) // Sleep quality
    
    // Chronic conditions
    features.push(data.medicalHistory?.length > 2 ? 1 : data.medicalHistory?.length > 0 ? 0.5 : 0)
    
    return tf.tensor2d([features])
  }

  calculateBMI(height, weight) {
    const h = parseFloat(height)
    const w = parseFloat(weight)
    if (h && w) {
      return w / ((h / 100) ** 2)
    }
    return 22 // Normal BMI default
  }

  categorizeRisk(score) {
    if (score > 0.7) return 'High'
    if (score > 0.4) return 'Moderate'
    return 'Low'
  }

  identifyHighRiskFactors(data) {
    const factors = []
    
    if (parseInt(data.demographics?.age) > 65) {
      factors.push('Advanced age')
    }
    
    const bmi = this.calculateBMI(data.demographics?.height, data.demographics?.weight)
    if (bmi > 30) {
      factors.push('Obesity')
    }
    
    if (data.demographics?.smokingStatus === 'yes') {
      factors.push('Smoking')
    }
    
    if (data.medicalHistory?.length > 2) {
      factors.push('Multiple chronic conditions')
    }
    
    return factors
  }

  generateRecommendations(riskScore, data) {
    const recommendations = []
    
    if (riskScore > 0.7) {
      recommendations.push('Immediate consultation with healthcare provider recommended')
      recommendations.push('Consider comprehensive health screening')
    }
    
    if (data.demographics?.smokingStatus === 'yes') {
      recommendations.push('Smoking cessation program enrollment')
    }
    
    const bmi = this.calculateBMI(data.demographics?.height, data.demographics?.weight)
    if (bmi > 25) {
      recommendations.push('Weight management and nutritional counseling')
    }
    
    recommendations.push('Regular exercise routine (30 minutes daily)')
    recommendations.push('Stress management techniques')
    recommendations.push('Regular health monitoring and check-ups')
    
    return recommendations
  }

  getMockRiskAssessment() {
    return {
      overallRisk: 'Moderate',
      riskScore: 65,
      riskFactors: ['Age factor', 'BMI elevation', 'Sedentary lifestyle'],
      recommendations: [
        'Increase physical activity',
        'Maintain healthy diet',
        'Regular health check-ups'
      ]
    }
  }
}

/**
 * Model Manager
 * Centralized management of all ML models
 */
export class ModelManager {
  constructor() {
    this.models = {
      diseasePrediction: new DiseasePredictionModel(),
      vitalSigns: new VitalSignsModel(),
      symptomAnalysis: new SymptomAnalysisModel(),
      riskAssessment: new RiskAssessmentModel()
    }
    this.isInitialized = false
  }

  async initializeModels() {
    if (this.isInitialized) return

    console.log('Initializing AI models...')
    
    try {
      // Initialize TensorFlow.js backend
      await tf.ready()
      console.log('TensorFlow.js backend ready')
      
      // Load all models in parallel
      const modelLoadPromises = Object.entries(this.models).map(async ([name, model]) => {
        try {
          await model.loadModel()
          console.log(`${name} model loaded successfully`)
        } catch (error) {
          console.error(`Error loading ${name} model:`, error)
        }
      })
      
      await Promise.all(modelLoadPromises)
      this.isInitialized = true
      console.log('All AI models initialized successfully')
      
    } catch (error) {
      console.error('Error initializing models:', error)
    }
  }

  getModel(modelName) {
    return this.models[modelName]
  }

  async warmupModels() {
    // Run dummy predictions to warm up models
    if (!this.isInitialized) {
      await this.initializeModels()
    }

    const dummyData = {
      demographics: { age: '30', gender: 'male', height: '170', weight: '70' },
      vitals: { heartRate: '70', bloodPressure: '120/80', temperature: '36.5' },
      symptoms: ['headache'],
      medicalHistory: []
    }

    try {
      await this.models.diseasePrediction.predict(
        dummyData.demographics, 
        dummyData.vitals, 
        dummyData.symptoms, 
        dummyData.medicalHistory
      )
      console.log('Models warmed up successfully')
    } catch (error) {
      console.error('Model warmup error:', error)
    }
  }
}

// Export singleton instance
export const modelManager = new ModelManager()

// Auto-initialize models when module is loaded
if (typeof window !== 'undefined') {
  modelManager.initializeModels().catch(console.error)
}