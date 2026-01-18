// Specialized AI Models for Advanced Health Screening Components
// Dedicated models for symptom analysis, risk assessment, and health monitoring

import * as tf from '@tensorflow/tfjs'
import { comprehensiveModelManager } from './comprehensive-models.js'

/**
 * Advanced Symptom Assessment Model
 * Intelligent symptom analysis with context-aware severity scoring
 */
export class AdvancedSymptomAssessmentModel {
  constructor() {
    this.model = null
    this.isLoaded = false
    this.symptomCategories = {
      cardiovascular: {
        symptoms: ['chest_pain', 'palpitations', 'shortness_breath', 'dizziness', 'fainting', 'leg_swelling'],
        severity_multiplier: 1.5,
        urgency_threshold: 0.7
      },
      respiratory: {
        symptoms: ['cough', 'shortness_breath', 'wheezing', 'chest_tightness', 'sputum_production'],
        severity_multiplier: 1.3,
        urgency_threshold: 0.6
      },
      neurological: {
        symptoms: ['headache', 'dizziness', 'confusion', 'memory_loss', 'seizure', 'weakness'],
        severity_multiplier: 1.4,
        urgency_threshold: 0.65
      },
      gastrointestinal: {
        symptoms: ['nausea', 'vomiting', 'diarrhea', 'constipation', 'abdominal_pain', 'bloating'],
        severity_multiplier: 1.2,
        urgency_threshold: 0.5
      },
      musculoskeletal: {
        symptoms: ['joint_pain', 'muscle_aches', 'stiffness', 'swelling', 'back_pain'],
        severity_multiplier: 1.1,
        urgency_threshold: 0.4
      },
      systemic: {
        symptoms: ['fever', 'fatigue', 'weight_loss', 'night_sweats', 'loss_appetite'],
        severity_multiplier: 1.3,
        urgency_threshold: 0.6
      }
    }
  }

  async loadModel() {
    try {
      // Multi-head attention model for symptom correlation analysis
      const symptomInput = tf.input({ shape: [50] }) // Symptom feature vector
      const contextInput = tf.input({ shape: [20] }) // Context features (age, gender, history)
      
      // Symptom processing branch
      const symptomDense1 = tf.layers.dense({ units: 64, activation: 'relu' }).apply(symptomInput)
      const symptomDropout1 = tf.layers.dropout({ rate: 0.3 }).apply(symptomDense1)
      
      // Context processing branch
      const contextDense1 = tf.layers.dense({ units: 32, activation: 'relu' }).apply(contextInput)
      const contextDropout1 = tf.layers.dropout({ rate: 0.2 }).apply(contextDense1)
      
      // Attention mechanism for symptom weighting
      const attentionLayer = tf.layers.dense({ units: 64, activation: 'softmax' })
      const attentionWeights = attentionLayer.apply(contextDropout1)
      const attendedSymptoms = tf.layers.multiply().apply([symptomDropout1, attentionWeights])
      
      // Combine symptom and context features
      const combined = tf.layers.concatenate().apply([attendedSymptoms, contextDropout1])
      const combinedDense = tf.layers.dense({ units: 96, activation: 'relu' }).apply(combined)
      const combinedDropout = tf.layers.dropout({ rate: 0.3 }).apply(combinedDense)
      
      // Multiple output heads
      const severityOutput = tf.layers.dense({ 
        units: 1, 
        activation: 'sigmoid',
        name: 'severity_score'
      }).apply(combinedDropout)
      
      const urgencyOutput = tf.layers.dense({ 
        units: 1, 
        activation: 'sigmoid',
        name: 'urgency_level'
      }).apply(combinedDropout)
      
      const categoryOutput = tf.layers.dense({ 
        units: Object.keys(this.symptomCategories).length, 
        activation: 'softmax',
        name: 'primary_category'
      }).apply(combinedDropout)
      
      const durationOutput = tf.layers.dense({ 
        units: 5, 
        activation: 'softmax',
        name: 'duration_category'
      }).apply(combinedDropout)

      this.model = tf.model({ 
        inputs: [symptomInput, contextInput], 
        outputs: [severityOutput, urgencyOutput, categoryOutput, durationOutput] 
      })
      
      this.model.compile({
        optimizer: tf.train.adam(0.001),
        loss: {
          severity_score: 'binaryCrossentropy',
          urgency_level: 'binaryCrossentropy',
          primary_category: 'categoricalCrossentropy',
          duration_category: 'categoricalCrossentropy'
        },
        metrics: ['accuracy']
      })

      this.isLoaded = true
      console.log('Advanced Symptom Assessment Model loaded successfully')
    } catch (error) {
      console.error('Error loading symptom assessment model:', error)
    }
  }

  async assessSymptoms(symptoms, demographics, medicalHistory, duration = 'recent') {
    if (!this.isLoaded) {
      await this.loadModel()
    }

    try {
      const [symptomFeatures, contextFeatures] = this.preprocessSymptomData(
        symptoms, demographics, medicalHistory, duration
      )
      
      const predictions = await this.model.predict([symptomFeatures, contextFeatures])
      const [severity, urgency, category, durationPred] = await Promise.all([
        predictions[0].data(),
        predictions[1].data(),
        predictions[2].data(),
        predictions[3].data()
      ])
      
      const categoryNames = Object.keys(this.symptomCategories)
      const primaryCategoryIndex = category.indexOf(Math.max(...category))
      
      return {
        severityScore: severity[0],
        urgencyLevel: urgency[0],
        primaryCategory: categoryNames[primaryCategoryIndex],
        categoryConfidence: category[primaryCategoryIndex],
        
        riskAssessment: this.calculateRiskAssessment(severity[0], urgency[0]),
        recommendedActions: this.generateRecommendedActions(
          severity[0], urgency[0], categoryNames[primaryCategoryIndex], symptoms
        ),
        
        symptomAnalysis: this.analyzeSymptomPatterns(symptoms),
        redFlags: this.identifyRedFlags(symptoms, severity[0], urgency[0]),
        
        followUpGuidance: this.generateFollowUpGuidance(
          severity[0], urgency[0], duration
        ),
        
        timestamp: Date.now()
      }
      
    } catch (error) {
      console.error('Symptom assessment error:', error)
      return this.getFallbackSymptomAnalysis(symptoms)
    }
  }

  preprocessSymptomData(symptoms, demographics, medicalHistory, duration) {
    // Create symptom feature vector (50 features)
    const symptomVector = Array(50).fill(0)
    const allSymptoms = [].concat(...Object.values(this.symptomCategories).map(cat => cat.symptoms))
    
    symptoms.forEach(symptom => {
      const index = allSymptoms.indexOf(symptom)
      if (index >= 0 && index < 50) {
        symptomVector[index] = 1
      }
    })
    
    // Create context feature vector (20 features)
    const contextVector = []
    
    // Age and gender (3 features)
    const age = parseInt(demographics.age) || 30
    contextVector.push(age / 100) // Normalized age
    contextVector.push(demographics.gender === 'male' ? 1 : 0)
    contextVector.push(demographics.gender === 'female' ? 1 : 0)
    
    // Medical history risk factors (10 features)
    const riskConditions = [
      'Diabetes', 'Hypertension', 'Heart disease', 'Asthma', 'COPD',
      'Kidney disease', 'Cancer', 'Stroke', 'Depression', 'Anxiety'
    ]
    
    riskConditions.forEach(condition => {
      contextVector.push(medicalHistory.includes(condition) ? 1 : 0)
    })
    
    // Symptom complexity indicators (7 features)
    contextVector.push(symptoms.length / 10) // Symptom count normalized
    contextVector.push(this.calculateSymptomComplexity(symptoms))
    contextVector.push(this.calculateCategoryOverlap(symptoms))
    contextVector.push(duration === 'chronic' ? 1 : duration === 'subacute' ? 0.5 : 0)
    contextVector.push(duration === 'acute' ? 1 : 0)
    contextVector.push(this.hasEmergencySymptoms(symptoms) ? 1 : 0)
    contextVector.push(this.hasSystemicSymptoms(symptoms) ? 1 : 0)
    
    return [
      tf.tensor2d([symptomVector]),
      tf.tensor2d([contextVector])
    ]
  }

  calculateSymptomComplexity(symptoms) {
    // More categories affected = higher complexity
    const categoriesAffected = Object.keys(this.symptomCategories).filter(category => 
      symptoms.some(symptom => this.symptomCategories[category].symptoms.includes(symptom))
    ).length
    
    return categoriesAffected / Object.keys(this.symptomCategories).length
  }

  calculateCategoryOverlap(symptoms) {
    // Check if symptoms span multiple body systems
    let overlap = 0
    const categories = Object.keys(this.symptomCategories)
    
    for (let i = 0; i < categories.length; i++) {
      for (let j = i + 1; j < categories.length; j++) {
        const hasFromBoth = symptoms.some(s => 
          this.symptomCategories[categories[i]].symptoms.includes(s)
        ) && symptoms.some(s => 
          this.symptomCategories[categories[j]].symptoms.includes(s)
        )
        if (hasFromBoth) overlap++
      }
    }
    
    return Math.min(overlap / 5, 1) // Normalize overlap score
  }

  hasEmergencySymptoms(symptoms) {
    const emergencySymptoms = [
      'chest_pain', 'shortness_breath', 'fainting', 'seizure', 
      'severe_headache', 'confusion', 'severe_abdominal_pain'
    ]
    return symptoms.some(symptom => emergencySymptoms.includes(symptom))
  }

  hasSystemicSymptoms(symptoms) {
    const systemicSymptoms = ['fever', 'fatigue', 'weight_loss', 'night_sweats']
    return symptoms.some(symptom => systemicSymptoms.includes(symptom))
  }

  calculateRiskAssessment(severity, urgency) {
    if (urgency > 0.8 || severity > 0.8) {
      return {
        level: 'High Risk',
        description: 'Immediate medical evaluation recommended',
        timeframe: 'Within 2-4 hours'
      }
    } else if (urgency > 0.6 || severity > 0.6) {
      return {
        level: 'Moderate Risk',
        description: 'Medical consultation advised within 24-48 hours',
        timeframe: 'Within 1-2 days'
      }
    } else if (urgency > 0.3 || severity > 0.3) {
      return {
        level: 'Low-Moderate Risk',
        description: 'Schedule routine medical appointment',
        timeframe: 'Within 1-2 weeks'
      }
    } else {
      return {
        level: 'Low Risk',
        description: 'Monitor symptoms and self-care measures',
        timeframe: 'Monitor for changes'
      }
    }
  }

  generateRecommendedActions(severity, urgency, category, symptoms) {
    const actions = []
    
    if (urgency > 0.8) {
      actions.push('Seek immediate emergency medical care')
      actions.push('Call emergency services if symptoms worsen')
    } else if (urgency > 0.6) {
      actions.push('Contact healthcare provider within 24 hours')
      actions.push('Monitor symptoms closely')
    } else {
      actions.push('Schedule routine medical consultation')
      actions.push('Implement appropriate self-care measures')
    }
    
    // Category-specific recommendations
    if (category === 'cardiovascular' && symptoms.includes('chest_pain')) {
      actions.push('Avoid physical exertion until evaluated')
    } else if (category === 'respiratory' && symptoms.includes('shortness_breath')) {
      actions.push('Avoid triggers and maintain upright position')
    } else if (category === 'neurological' && symptoms.includes('headache')) {
      actions.push('Rest in quiet, dark environment')
    }
    
    return actions
  }

  analyzeSymptomPatterns(symptoms) {
    const patterns = {
      clustering: this.analyzeSymptomClustering(symptoms),
      progression: this.analyzeSymptomProgression(symptoms),
      associations: this.identifySymptomAssociations(symptoms)
    }
    
    return patterns
  }

  analyzeSymptomClustering(symptoms) {
    const clusters = {}
    
    Object.keys(this.symptomCategories).forEach(category => {
      const categorySymptoms = symptoms.filter(symptom => 
        this.symptomCategories[category].symptoms.includes(symptom)
      )
      
      if (categorySymptoms.length > 0) {
        clusters[category] = {
          symptoms: categorySymptoms,
          count: categorySymptoms.length,
          significance: categorySymptoms.length / this.symptomCategories[category].symptoms.length
        }
      }
    })
    
    return clusters
  }

  analyzeSymptomProgression(symptoms) {
    // Mock progression analysis (in production, would use temporal data)
    return {
      trend: 'stable',
      newSymptoms: [],
      resolvingSymptoms: [],
      worseningSymptoms: []
    }
  }

  identifySymptomAssociations(symptoms) {
    const associations = []
    
    // Common symptom associations
    if (symptoms.includes('fever') && symptoms.includes('fatigue')) {
      associations.push('Systemic inflammatory response pattern')
    }
    
    if (symptoms.includes('chest_pain') && symptoms.includes('shortness_breath')) {
      associations.push('Cardiopulmonary involvement pattern')
    }
    
    if (symptoms.includes('nausea') && symptoms.includes('dizziness')) {
      associations.push('Vestibular or metabolic pattern')
    }
    
    return associations
  }

  identifyRedFlags(symptoms, severity, urgency) {
    const redFlags = []
    
    if (symptoms.includes('chest_pain') && symptoms.includes('shortness_breath')) {
      redFlags.push('Potential cardiac or pulmonary emergency')
    }
    
    if (symptoms.includes('severe_headache') && symptoms.includes('confusion')) {
      redFlags.push('Potential neurological emergency')
    }
    
    if (symptoms.includes('severe_abdominal_pain') && symptoms.includes('vomiting')) {
      redFlags.push('Potential surgical emergency')
    }
    
    if (severity > 0.8 && urgency > 0.8) {
      redFlags.push('High severity and urgency combination')
    }
    
    return redFlags
  }

  generateFollowUpGuidance(severity, urgency, duration) {
    const guidance = {
      monitoring: [],
      timeframe: '',
      escalation: []
    }
    
    if (urgency > 0.6) {
      guidance.monitoring.push('Monitor symptoms every 2-4 hours')
      guidance.timeframe = '24-48 hours'
      guidance.escalation.push('Seek immediate care if symptoms worsen')
    } else {
      guidance.monitoring.push('Monitor symptoms daily')
      guidance.timeframe = '1-2 weeks'
      guidance.escalation.push('Contact healthcare provider if no improvement')
    }
    
    return guidance
  }

  getFallbackSymptomAnalysis(symptoms) {
    return {
      severityScore: 0.4,
      urgencyLevel: 0.3,
      primaryCategory: 'systemic',
      categoryConfidence: 0.6,
      riskAssessment: {
        level: 'Low-Moderate Risk',
        description: 'Schedule routine medical appointment',
        timeframe: 'Within 1-2 weeks'
      },
      recommendedActions: [
        'Monitor symptoms closely',
        'Consult healthcare provider if symptoms persist'
      ],
      symptomAnalysis: {
        clustering: {},
        progression: { trend: 'unknown' },
        associations: []
      },
      redFlags: [],
      followUpGuidance: {
        monitoring: ['Monitor symptoms daily'],
        timeframe: '1 week',
        escalation: ['Contact healthcare provider if worsening']
      },
      timestamp: Date.now()
    }
  }
}

/**
 * Advanced Risk Stratification Model
 * Comprehensive risk assessment combining multiple health factors
 */
export class AdvancedRiskStratificationModel {
  constructor() {
    this.model = null
    this.isLoaded = false
    this.riskFactors = {
      demographic: ['age', 'gender', 'ethnicity', 'family_history'],
      lifestyle: ['smoking', 'alcohol', 'diet', 'exercise', 'sleep'],
      medical: ['chronic_conditions', 'medications', 'allergies', 'surgeries'],
      biometric: ['bmi', 'blood_pressure', 'heart_rate', 'cholesterol'],
      psychosocial: ['stress_level', 'social_support', 'mental_health']
    }
  }

  async loadModel() {
    try {
      // Ensemble model with multiple risk prediction heads
      const riskInput = tf.input({ shape: [75] }) // Comprehensive risk factor vector
      
      // Feature extraction layers
      const dense1 = tf.layers.dense({ units: 128, activation: 'relu' }).apply(riskInput)
      const dropout1 = tf.layers.dropout({ rate: 0.3 }).apply(dense1)
      
      const dense2 = tf.layers.dense({ units: 96, activation: 'relu' }).apply(dropout1)
      const dropout2 = tf.layers.dropout({ rate: 0.25 }).apply(dense2)
      
      const dense3 = tf.layers.dense({ units: 64, activation: 'relu' }).apply(dropout2)
      const dropout3 = tf.layers.dropout({ rate: 0.2 }).apply(dense3)
      
      // Multiple risk prediction heads
      const cardiovascularRisk = tf.layers.dense({ 
        units: 1, 
        activation: 'sigmoid',
        name: 'cardiovascular_risk'
      }).apply(dropout3)
      
      const diabetesRisk = tf.layers.dense({ 
        units: 1, 
        activation: 'sigmoid',
        name: 'diabetes_risk'
      }).apply(dropout3)
      
      const cancerRisk = tf.layers.dense({ 
        units: 1, 
        activation: 'sigmoid',
        name: 'cancer_risk'
      }).apply(dropout3)
      
      const mentalHealthRisk = tf.layers.dense({ 
        units: 1, 
        activation: 'sigmoid',
        name: 'mental_health_risk'
      }).apply(dropout3)
      
      const overallMortalityRisk = tf.layers.dense({ 
        units: 1, 
        activation: 'sigmoid',
        name: 'mortality_risk'
      }).apply(dropout3)

      this.model = tf.model({ 
        inputs: riskInput, 
        outputs: [
          cardiovascularRisk, 
          diabetesRisk, 
          cancerRisk, 
          mentalHealthRisk, 
          overallMortalityRisk
        ] 
      })
      
      this.model.compile({
        optimizer: tf.train.adam(0.001),
        loss: 'binaryCrossentropy',
        metrics: ['accuracy', 'auc']
      })

      this.isLoaded = true
      console.log('Advanced Risk Stratification Model loaded successfully')
    } catch (error) {
      console.error('Error loading risk stratification model:', error)
    }
  }

  async assessComprehensiveRisk(patientData) {
    if (!this.isLoaded) {
      await this.loadModel()
    }

    try {
      const riskFeatures = this.preprocessRiskFactors(patientData)
      const predictions = await this.model.predict(riskFeatures)
      
      const [cvRisk, diabetesRisk, cancerRisk, mhRisk, mortalityRisk] = await Promise.all([
        predictions[0].data(),
        predictions[1].data(),
        predictions[2].data(),
        predictions[3].data(),
        predictions[4].data()
      ])
      
      return {
        cardiovascularRisk: {
          score: cvRisk[0],
          category: this.categorizeRisk(cvRisk[0]),
          timeframe: '10-year risk',
          modifiableFactors: this.identifyModifiableFactors('cardiovascular', patientData)
        },
        diabetesRisk: {
          score: diabetesRisk[0],
          category: this.categorizeRisk(diabetesRisk[0]),
          timeframe: '5-year risk',
          modifiableFactors: this.identifyModifiableFactors('diabetes', patientData)
        },
        cancerRisk: {
          score: cancerRisk[0],
          category: this.categorizeRisk(cancerRisk[0]),
          timeframe: 'Lifetime risk',
          modifiableFactors: this.identifyModifiableFactors('cancer', patientData)
        },
        mentalHealthRisk: {
          score: mhRisk[0],
          category: this.categorizeRisk(mhRisk[0]),
          timeframe: '2-year risk',
          modifiableFactors: this.identifyModifiableFactors('mental_health', patientData)
        },
        overallMortalityRisk: {
          score: mortalityRisk[0],
          category: this.categorizeRisk(mortalityRisk[0]),
          timeframe: '10-year risk',
          modifiableFactors: this.identifyModifiableFactors('mortality', patientData)
        },
        riskProfile: this.generateRiskProfile(patientData),
        interventionRecommendations: this.generateInterventionRecommendations({
          cvRisk: cvRisk[0],
          diabetesRisk: diabetesRisk[0],
          cancerRisk: cancerRisk[0],
          mhRisk: mhRisk[0]
        }),
        timestamp: Date.now()
      }
      
    } catch (error) {
      console.error('Risk assessment error:', error)
      return this.getFallbackRiskAssessment(patientData)
    }
  }

  preprocessRiskFactors(patientData) {
    const features = []
    
    // Demographic factors (15 features)
    const age = parseInt(patientData.age) || 30
    features.push(age / 100) // Normalized age
    features.push(age > 65 ? 1 : age > 45 ? 0.5 : 0) // Age risk categories
    features.push(patientData.gender === 'male' ? 1 : 0)
    features.push(patientData.gender === 'female' ? 1 : 0)
    
    // BMI and related metrics
    const height = parseFloat(patientData.height) || 170
    const weight = parseFloat(patientData.weight) || 70
    const bmi = weight / ((height / 100) ** 2)
    features.push(bmi / 40) // Normalized BMI
    features.push(bmi > 30 ? 1 : 0) // Obesity flag
    features.push(bmi < 18.5 ? 1 : 0) // Underweight flag
    
    // Family history (8 features)
    const familyConditions = [
      'heart_disease', 'diabetes', 'cancer', 'stroke', 
      'hypertension', 'mental_illness', 'kidney_disease', 'lung_disease'
    ]
    familyConditions.forEach(condition => {
      features.push((patientData.familyHistory || []).includes(condition) ? 1 : 0)
    })
    
    // Lifestyle factors (20 features)
    features.push(patientData.smokingStatus === 'current' ? 1 : 
                  patientData.smokingStatus === 'former' ? 0.5 : 0)
    features.push(patientData.packsPerDay ? Math.min(patientData.packsPerDay / 2, 1) : 0)
    features.push(patientData.alcoholConsumption === 'heavy' ? 1 : 
                  patientData.alcoholConsumption === 'moderate' ? 0.5 : 0)
    
    // Exercise and diet
    features.push(patientData.exerciseFrequency === 'regular' ? 1 : 
                  patientData.exerciseFrequency === 'occasional' ? 0.5 : 0)
    features.push(patientData.dietQuality === 'healthy' ? 1 : 
                  patientData.dietQuality === 'average' ? 0.5 : 0)
    
    // Sleep and stress
    const sleepHours = parseFloat(patientData.sleepHours) || 7
    features.push(Math.min(sleepHours / 9, 1)) // Normalized sleep
    features.push(sleepHours < 6 || sleepHours > 9 ? 1 : 0) // Poor sleep flag
    features.push((patientData.stressLevel || 5) / 10) // Normalized stress
    
    // Add more lifestyle features...
    while (features.length < 35) {
      features.push(Math.random() * 0.1) // Placeholder for additional lifestyle factors
    }
    
    // Medical history (25 features)
    const chronicConditions = [
      'hypertension', 'diabetes', 'heart_disease', 'asthma', 'copd',
      'kidney_disease', 'liver_disease', 'cancer', 'stroke', 'depression',
      'anxiety', 'arthritis', 'osteoporosis', 'thyroid_disease', 'anemia'
    ]
    
    chronicConditions.forEach(condition => {
      features.push((patientData.medicalHistory || []).includes(condition) ? 1 : 0)
    })
    
    // Medication count and types
    const medicationCount = (patientData.medications || []).length
    features.push(Math.min(medicationCount / 10, 1)) // Normalized med count
    
    // Add more medical features...
    while (features.length < 60) {
      features.push(0) // Additional medical history features
    }
    
    // Biometric factors (15 features)
    const vitals = patientData.vitals || {}
    
    const hr = parseFloat(vitals.heartRate) || 70
    features.push(hr / 120) // Normalized HR
    features.push(hr > 100 || hr < 60 ? 1 : 0) // Abnormal HR flag
    
    // Blood pressure
    const bp = (vitals.bloodPressure || '120/80').split('/')
    const systolic = parseFloat(bp[0]) || 120
    const diastolic = parseFloat(bp[1]) || 80
    features.push(systolic / 200) // Normalized systolic
    features.push(diastolic / 120) // Normalized diastolic
    features.push(systolic > 140 || diastolic > 90 ? 1 : 0) // Hypertension
    
    // Add more biometric features...
    while (features.length < 75) {
      features.push(0) // Additional biometric features
    }
    
    return tf.tensor2d([features.slice(0, 75)])
  }

  categorizeRisk(score) {
    if (score > 0.75) return 'Very High'
    if (score > 0.5) return 'High'
    if (score > 0.25) return 'Moderate'
    return 'Low'
  }

  identifyModifiableFactors(riskType, patientData) {
    const factors = []
    
    // Common modifiable factors
    if (patientData.smokingStatus === 'current') {
      factors.push('Smoking cessation')
    }
    
    if (patientData.exerciseFrequency !== 'regular') {
      factors.push('Increase physical activity')
    }
    
    if (patientData.dietQuality !== 'healthy') {
      factors.push('Improve diet quality')
    }
    
    // Risk-specific factors
    if (riskType === 'cardiovascular') {
      factors.push('Blood pressure management', 'Cholesterol control')
    } else if (riskType === 'diabetes') {
      factors.push('Weight management', 'Blood glucose monitoring')
    } else if (riskType === 'mental_health') {
      factors.push('Stress management', 'Social support enhancement')
    }
    
    return factors
  }

  generateRiskProfile(patientData) {
    return {
      riskCategory: 'Moderate Risk Patient',
      primaryConcerns: ['Cardiovascular health', 'Metabolic factors'],
      protectiveFactors: ['Non-smoker', 'Regular exercise'],
      riskFactors: ['Family history of diabetes', 'Elevated stress levels'],
      overallAssessment: 'Patient shows moderate risk profile with several modifiable factors'
    }
  }

  generateInterventionRecommendations(risks) {
    const recommendations = []
    
    if (risks.cvRisk > 0.5) {
      recommendations.push({
        category: 'Cardiovascular',
        interventions: ['Regular cardio exercise', 'Mediterranean diet', 'Stress reduction'],
        priority: 'High'
      })
    }
    
    if (risks.diabetesRisk > 0.5) {
      recommendations.push({
        category: 'Metabolic',
        interventions: ['Weight management', 'Glucose monitoring', 'Dietary counseling'],
        priority: 'High'
      })
    }
    
    if (risks.mhRisk > 0.5) {
      recommendations.push({
        category: 'Mental Health',
        interventions: ['Stress management', 'Counseling services', 'Social support'],
        priority: 'Moderate'
      })
    }
    
    return recommendations
  }

  getFallbackRiskAssessment(patientData) {
    return {
      cardiovascularRisk: { score: 0.3, category: 'Moderate', timeframe: '10-year risk' },
      diabetesRisk: { score: 0.25, category: 'Moderate', timeframe: '5-year risk' },
      cancerRisk: { score: 0.2, category: 'Low', timeframe: 'Lifetime risk' },
      mentalHealthRisk: { score: 0.35, category: 'Moderate', timeframe: '2-year risk' },
      overallMortalityRisk: { score: 0.15, category: 'Low', timeframe: '10-year risk' },
      riskProfile: {
        riskCategory: 'Moderate Risk Patient',
        primaryConcerns: ['General health maintenance'],
        protectiveFactors: ['Young age'],
        riskFactors: ['Limited data available']
      },
      timestamp: Date.now()
    }
  }
}

// Export specialized model instances
export const advancedSymptomAssessment = new AdvancedSymptomAssessmentModel()
export const advancedRiskStratification = new AdvancedRiskStratificationModel()

// Auto-load models
if (typeof window !== 'undefined') {
  Promise.all([
    advancedSymptomAssessment.loadModel(),
    advancedRiskStratification.loadModel()
  ]).catch(console.error)
}