/**
 * SENGUNTHAR ML Controllers
 * Controllers for ML-powered personalized medicine endpoints
 */

const mlService = require('../services/mlService');
const User = require('../models/User');
const HealthScreening = require('../models/HealthScreening');

/**
 * Disease Prediction Controller
 */
exports.predictDisease = async (req, res) => {
    try {
        const { symptoms, patientInfo = {}, options = {} } = req.body;
        const userId = req.user?.id;

        // Validate input
        if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Symptoms are required and must be a non-empty array',
                error: 'INVALID_INPUT'
            });
        }

        // Prepare prediction data
        const predictionData = {
            symptoms: symptoms.map(s => s.toLowerCase().trim()),
            patient_id: patientInfo.patientId || `patient_${userId}_${Date.now()}`,
            user_id: userId,
            model: options.model || 'ensemble',
            confidence_threshold: options.confidenceThreshold || 0.3
        };

        console.log(`Disease prediction request for user ${userId} with symptoms:`, symptoms);

        // Get prediction from ML service
        const result = await mlService.predictDisease(predictionData);

        if (!result.success) {
            console.error('ML Service prediction failed:', result);
            return res.status(500).json({
                success: false,
                message: 'Disease prediction failed',
                error: result.error || 'ML_SERVICE_ERROR',
                details: result.message
            });
        }

        // Save prediction to database if user is authenticated
        if (userId && result.data.prediction_result.status === 'success') {
            try {
                const healthScreening = new HealthScreening({
                    userId: userId,
                    type: 'disease_prediction',
                    data: {
                        symptoms: symptoms,
                        prediction: result.data.prediction_result,
                        confidence: result.data.prediction_result.primary_prediction?.confidence,
                        model_used: result.data.model_info?.model_used
                    },
                    result: result.data.prediction_result.primary_prediction?.disease_name,
                    recommendations: result.data.recommendations,
                    date: new Date()
                });

                await healthScreening.save();
                console.log(`Saved health screening for user ${userId}`);
            } catch (dbError) {
                console.error('Failed to save health screening:', dbError);
                // Don't fail the request if DB save fails
            }
        }

        res.json({
            success: true,
            data: result.data,
            message: 'Disease prediction completed successfully'
        });

    } catch (error) {
        console.error('Error in disease prediction controller:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during disease prediction',
            error: 'INTERNAL_ERROR'
        });
    }
};

/**
 * Medication Recommendations Controller
 */
exports.getMedicationRecommendations = async (req, res) => {
    try {
        const { disease, patientInfo = {} } = req.body;
        const userId = req.user?.id;

        // Validate input
        if (!disease) {
            return res.status(400).json({
                success: false,
                message: 'Disease name is required',
                error: 'INVALID_INPUT'
            });
        }

        // Prepare medication data
        const medicationData = {
            disease: disease.trim(),
            age: patientInfo.age,
            weight: patientInfo.weight,
            allergies: patientInfo.allergies || [],
            current_medications: patientInfo.currentMedications || []
        };

        console.log(`Medication recommendation request for disease: ${disease}`);

        // Get recommendations from ML service
        const result = await mlService.getMedicationRecommendations(medicationData);

        if (!result.success) {
            console.error('ML Service medication recommendation failed:', result);
            return res.status(500).json({
                success: false,
                message: 'Medication recommendation failed',
                error: result.error || 'ML_SERVICE_ERROR',
                details: result.message
            });
        }

        res.json({
            success: true,
            data: result.data,
            message: 'Medication recommendations retrieved successfully'
        });

    } catch (error) {
        console.error('Error in medication recommendations controller:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during medication recommendation',
            error: 'INTERNAL_ERROR'
        });
    }
};

/**
 * Symptom Suggestions Controller
 */
exports.getSymptomSuggestions = async (req, res) => {
    try {
        const { query } = req.query;

        // Validate input
        if (!query || query.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Query parameter is required and must be at least 2 characters',
                error: 'INVALID_INPUT'
            });
        }

        const queryData = {
            query: query.trim().toLowerCase()
        };

        console.log(`Symptom suggestions request for query: ${query}`);

        // Get suggestions from ML service
        const result = await mlService.getSymptomSuggestions(queryData);

        if (!result.success) {
            console.error('ML Service symptom suggestions failed:', result);
            return res.status(500).json({
                success: false,
                message: 'Symptom suggestions failed',
                error: result.error || 'ML_SERVICE_ERROR',
                details: result.message
            });
        }

        res.json({
            success: true,
            data: result.data,
            message: 'Symptom suggestions retrieved successfully'
        });

    } catch (error) {
        console.error('Error in symptom suggestions controller:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during symptom suggestions',
            error: 'INTERNAL_ERROR'
        });
    }
};

/**
 * Comprehensive Health Analysis Controller
 */
exports.analyzeHealthSymptoms = async (req, res) => {
    try {
        const { symptoms, patientInfo = {}, options = {} } = req.body;
        const userId = req.user?.id;

        // Validate input
        if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Symptoms are required and must be a non-empty array',
                error: 'INVALID_INPUT'
            });
        }

        // Prepare analysis data
        const analysisData = {
            symptoms: symptoms.map(s => s.toLowerCase().trim()),
            patientInfo: {
                ...patientInfo,
                userId: userId,
                patientId: patientInfo.patientId || `patient_${userId}_${Date.now()}`
            },
            options: {
                model: options.model || 'ensemble',
                confidenceThreshold: options.confidenceThreshold || 0.3,
                ...options
            }
        };

        console.log(`Comprehensive health analysis request for user ${userId} with ${symptoms.length} symptoms`);

        // Get comprehensive analysis from ML service
        const result = await mlService.analyzeHealthSymptoms(analysisData);

        if (!result.success) {
            console.error('ML Service health analysis failed:', result);
            return res.status(500).json({
                success: false,
                message: 'Health analysis failed',
                error: result.error || 'ML_SERVICE_ERROR',
                details: result.message
            });
        }

        // Save comprehensive analysis to database if user is authenticated
        if (userId && result.data.disease_prediction?.status === 'success') {
            try {
                const healthScreening = new HealthScreening({
                    userId: userId,
                    type: 'comprehensive_health_analysis',
                    data: {
                        symptoms: symptoms,
                        patient_info: patientInfo,
                        disease_prediction: result.data.disease_prediction,
                        medication_recommendations: result.data.medication_recommendations,
                        risk_assessment: result.data.risk_assessment,
                        analysis_id: result.data.analysis_id
                    },
                    result: result.data.disease_prediction.primary_prediction?.disease_name,
                    recommendations: result.data.recommendations,
                    riskLevel: result.data.risk_assessment?.level,
                    date: new Date()
                });

                await healthScreening.save();
                console.log(`Saved comprehensive health analysis for user ${userId}`);
            } catch (dbError) {
                console.error('Failed to save health analysis:', dbError);
                // Don't fail the request if DB save fails
            }
        }

        res.json({
            success: true,
            data: result.data,
            message: 'Comprehensive health analysis completed successfully'
        });

    } catch (error) {
        console.error('Error in health analysis controller:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during health analysis',
            error: 'INTERNAL_ERROR'
        });
    }
};

/**
 * ML Model Performance Controller
 */
exports.getModelPerformance = async (req, res) => {
    try {
        console.log('Model performance request');

        // Get model performance from ML service
        const result = await mlService.getModelPerformance();

        if (!result.success) {
            console.error('ML Service model performance failed:', result);
            return res.status(500).json({
                success: false,
                message: 'Failed to retrieve model performance',
                error: result.error || 'ML_SERVICE_ERROR',
                details: result.message
            });
        }

        res.json({
            success: true,
            data: result.data,
            message: 'Model performance data retrieved successfully'
        });

    } catch (error) {
        console.error('Error in model performance controller:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while retrieving model performance',
            error: 'INTERNAL_ERROR'
        });
    }
};

/**
 * ML Service Health Check Controller
 */
exports.mlHealthCheck = async (req, res) => {
    try {
        console.log('ML service health check request');

        // Get health status from ML service
        const result = await mlService.healthCheck();

        const status = result.success ? 200 : 503;

        res.status(status).json({
            success: result.success,
            data: {
                ml_service_status: result.success ? 'healthy' : 'unhealthy',
                timestamp: new Date().toISOString(),
                ...result.data
            },
            message: result.success ? 'ML service is healthy' : 'ML service is unavailable'
        });

    } catch (error) {
        console.error('Error in ML health check controller:', error);
        res.status(503).json({
            success: false,
            data: {
                ml_service_status: 'error',
                timestamp: new Date().toISOString()
            },
            message: 'ML service health check failed',
            error: 'HEALTH_CHECK_ERROR'
        });
    }
};

/**
 * User's Health History Controller
 */
exports.getHealthHistory = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { limit = 10, offset = 0, type } = req.query;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
                error: 'UNAUTHORIZED'
            });
        }

        // Build query
        const query = { userId };
        if (type) {
            query.type = type;
        }

        // Get health screenings with pagination
        const healthScreenings = await HealthScreening.find(query)
            .sort({ date: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(offset))
            .lean();

        // Get total count
        const totalCount = await HealthScreening.countDocuments(query);

        res.json({
            success: true,
            data: {
                screenings: healthScreenings,
                pagination: {
                    total: totalCount,
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                    hasMore: (parseInt(offset) + parseInt(limit)) < totalCount
                }
            },
            message: 'Health history retrieved successfully'
        });

    } catch (error) {
        console.error('Error in health history controller:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while retrieving health history',
            error: 'INTERNAL_ERROR'
        });
    }
};

/**
 * Initialize ML Service Controller
 */
exports.initializeMLService = async (req, res) => {
    try {
        console.log('ML service initialization request');

        // Initialize ML service
        await mlService.initialize();

        res.json({
            success: true,
            data: {
                status: 'initialized',
                timestamp: new Date().toISOString()
            },
            message: 'ML service initialized successfully'
        });

    } catch (error) {
        console.error('Error initializing ML service:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to initialize ML service',
            error: 'INITIALIZATION_ERROR',
            details: error.message
        });
    }
};