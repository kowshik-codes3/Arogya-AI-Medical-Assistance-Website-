# 🏥 Arogya AI - Advanced Biometric Health Screening

![Arogya AI Banner](C:/Users/gvair/.gemini/antigravity/brain/3696324c-3445-4109-84fc-1ca2c18e929d/homepage_overview_1768749221906.png)

> **Next-Generation Telemedicine Platform** powered by Computer Vision, Voice Biomarkers, and Predictive AI.

Arogya AI is a comprehensive Progressive Web Application (PWA) that transforms any device with a camera and microphone into a medical-grade diagnostic tool. It provides real-time health analysis, symptom checking, and personalized medical assistants without the need for wearable hardware.

---

## 🌟 Key Features

### 🩺 1. Contactless Vital Signs Monitoring (rPPG)
Using advanced **remote Photoplethysmography (rPPG)** technology, Arogya AI extracts vital signs from facial video streams in real-time.
- **Heart Rate (BPM)**
- **Respiration Rate**
- **Oxygen Saturation (SpO2)**
- **Stress Level Analysis**

![Vital Signs Analysis](C:/Users/gvair/.gemini/antigravity/brain/3696324c-3445-4109-84fc-1ca2c18e929d/vital_signs_analysis_page_1768743484852.png)

### 👁️ 2. AI Eye Screening
Detects early signs of systemic conditions through computer vision analysis of the eye.
- **Anemia Detection** (Conjunctival Pallor)
- **Jaundice Screening** (Scleral Icterus)
- **Cataract Risk Assessment**

### 🗣️ 3. Voice Biomarker Analysis
Analyzes voice samples to detect subtle physiological changes linked to:
- **Respiratory Health** (COPD, Asthma)
- **Neurological Conditions** (Parkinson's, Alzheimer's)
- **Mood & Stress Indicators**

### 🤖 4. MedAI Assistant
An intelligent medical chatbot powered by LLMs and domain-specific medical knowledge.
- **Symptom Assessment** & Triage
- **24/7 Health Consultation**
- **Personalized Recommendations**

![MedAI Chatbot](C:/Users/gvair/.gemini/antigravity/brain/3696324c-3445-4109-84fc-1ca2c18e929d/medai_assistant_chat_window_1768748658978.png)

---

## 💻 Tech Stack

- **Frontend**: React.js, Vite, PWA (Progressive Web App)
- **Styling**: Modern CSS3, Glassmorphism UI
- **AI/ML Engine**: TensorFlow.js (Browser-side inference), WebGL
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (User Data, Health Records)
- **Authentication**: Firebase Auth (Google & Email/Password)
- **Hosting**: Firebase Hosting (Frontend), Cloud Integration

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- Firebase Project

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/arogya-ai.git
   cd arogya-ai
   ```

2. **Frontend Setup**
   ```bash
   cd pwa_frontend
   npm install
   npm run dev
   ```

3. **Backend Setup**
   ```bash
   cd backend
   npm install
   # Configure .env with MONGODB_URI and Firebase Creds
   npm run dev
   ```

4. **Access the App**
   Open `http://localhost:5173` to view the application.

---

## 📱 Dashboard Preview

A sleek, intuitive dashboard allows users to track their health trends over time, view screening history, and access quick actions.

![User Dashboard](C:/Users/gvair/.gemini/antigravity/brain/3696324c-3445-4109-84fc-1ca2c18e929d/dashboard_full_width_1768739690340.png)

---

## 🔒 Privacy & Security

- **HIPAA Compliant Design**: Health data is encrypted and stored securely.
- **On-Device Processing**: Vital signs and video analysis run locally in the browser using TensorFlow.js for maximum privacy.
- **Secure Auth**: Powered by Google Firebase Authentication.

---

## 🤝 Contributing

Contributions are welcome! Please run the test suite and linting before submitting a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">
  Built with ❤️ for better global health accessibility.
</p>
