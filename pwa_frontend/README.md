# Arogya AI Frontend v0.4.0 - Advanced Biometric Screening

A Progressive Web Application for browser-based vital sign monitoring and health screening using rPPG, advanced ocular analysis, and multi-modal AI.

## Quick Start (Windows PowerShell)

1. Install dependencies

```powershell
cd "d:\Desktop\Other\Projects\General Project\SENGUNTHAR 2\pwa_frontend"
npm install
```

2. Set up model directories

```powershell
npm run setup:models
```

3. Run development server

```powershell
npm run dev
```

## Features

### ✅ Implemented (V4)
- **rPPG Vital Signs Monitor**: Heart rate, respiration rate, and SpO2 estimation from camera feed
- **Web Workers Architecture**: Background AI processing for responsive UI
- **WebAssembly Signal Processing**: High-performance FFT and filtering
- **Progressive Web App**: Offline-capable with service worker caching
- **Advanced Camera Capture**: MediaPipe integration ready
- **Modular Component System**: Reusable screening components

### 🚧 Requires Setup
- **TensorFlow.js Models**: Place trained models in `public/models/`
  - `ocular_static/` - Static eye analysis (anemia, jaundice)
  - `ocular_dynamic/` - Eye tracking analysis
  - `fusion_model/` - Multi-modal result fusion
  - `vocal/` - Audio biomarker analysis
  - `symptom/` - Symptom correlation

- **WebAssembly Module**: Build signal processing WASM
  ```powershell
  cd ..\ml_models\signal_processing_wasm
  ./build.sh  # Requires Emscripten SDK
  ```

## Architecture

### Web Workers
- `src/workers/rppg.worker.js` - rPPG signal processing pipeline
- `src/workers/ocular.worker.js` - Eye analysis and tracking
- `src/services/WebWorkerService.js` - Worker lifecycle management

### Components
- `VitalSignsCapture.jsx` - Main rPPG interface with real-time display
- `CameraCapture.jsx` - Basic camera and frame capture
- `App.jsx` - Tab-based interface for different screening modes

### Performance Optimizations
- WebAssembly for signal processing (FFT, filtering)
- Transferable objects for zero-copy worker communication
- MediaPipe.js for efficient face/eye detection
- Service worker caching for offline operation

## Browser Requirements

- Modern browser with WebRTC support (Chrome 88+, Firefox 90+, Safari 14+)
- Camera access permission
- WebAssembly support (enabled by default in modern browsers)
- Minimum 1GB RAM for smooth rPPG processing

## Development Notes

### Adding New Models
1. Convert TensorFlow/Keras models to TensorFlow.js format
2. Place model files in `public/models/{model_name}/`
3. Update worker scripts to load and use models

### Performance Tuning
- Adjust `CAPTURE_FPS` in VitalSignsCapture.jsx for different devices
- Modify WebAssembly compilation flags in `build.sh` for optimization
- Use different MediaPipe models for accuracy vs. performance trade-offs

### PWA Features
- App installable on mobile devices
- Offline core functionality (post-first visit)
- Background sync for data uploads when connectivity returns

## Security & Privacy

- All AI processing happens client-side (no health data sent to servers)
- Optional data sync requires explicit user consent
- All synced data is anonymized before transmission
- HTTPS required for camera access in production

## Next Steps

1. **Train and Deploy Models**: Create TensorFlow.js models for ocular analysis
2. **WebAssembly Integration**: Install Emscripten and build signal processing module
3. **MediaPipe Setup**: Configure face mesh and eye landmark detection
4. **Firebase Integration**: Set up authentication and optional data sync
5. **Testing**: Cross-browser and device compatibility testing

## Troubleshooting

### Camera Issues
- Ensure HTTPS in production (required for getUserMedia)
- Check browser permissions for camera access
- Verify camera not in use by other applications

### Performance Issues
- Reduce capture FPS for slower devices
- Check available system memory during processing
- Ensure WebAssembly module loads successfully

### Build Issues
- Install Emscripten SDK for WebAssembly compilation
- Verify Node.js version compatibility (16+)
- Check that all dependencies installed correctly
