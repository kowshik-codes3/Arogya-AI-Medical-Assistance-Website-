// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCcEBPPiufYWBUhGcmi_i7C-HStbeAUg7Q",
    authDomain: "arogya-ai-pwa-v1.firebaseapp.com",
    projectId: "arogya-ai-pwa-v1",
    storageBucket: "arogya-ai-pwa-v1.firebasestorage.app",
    messagingSenderId: "39775890411",
    appId: "1:39775890411:web:7bf58175b68751f5d787ae"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
