import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = { 
  apiKey: "AIzaSyDAxGzWWJ67PN3xdOo58qt3UJDmqHkPd7M",
  authDomain: "chaek-in-abd48.firebaseapp.com",
  projectId: "chaek-in-abd48",
  storageBucket: "chaek-in-abd48.firebasestorage.app",
  messagingSenderId: "438673335568",
  appId: "1:438673335568:web:843234f9e37c59fc75f195",
  measurementId: "G-LYWX9SKBHP"
  
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
export const db = getFirestore(app)
export default app