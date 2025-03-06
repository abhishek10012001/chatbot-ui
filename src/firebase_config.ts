import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

/**
 * Firebase configuration object containing credentials and project-specific details.
 *
 * This object is used to initialize the Firebase application in the project.
 * The values are sourced from environment variables to maintain security.
 *
 * @constant {Object} firebaseConfig
 * @property {string | undefined} apiKey - API key for Firebase authentication.
 * @property {string} authDomain - Firebase authentication domain.
 * @property {string} projectId - Firebase project ID.
 * @property {string} storageBucket - Firebase storage bucket URL.
 * @property {string | undefined} messagingSenderId - Firebase messaging sender ID.
 * @property {string | undefined} appId - Firebase application ID.
 *
 * @example
 * ```ts
 * import firebase from "firebase/app";
 * import "firebase/auth";
 *
 * firebase.initializeApp(firebaseConfig);
 * ```
 */
const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_CONFIG_API_KEY,
    authDomain: "artisan-chatbot.firebaseapp.com",
    projectId: "artisan-chatbot",
    storageBucket: "artisan-chatbot.firebasestorage.app",
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGE_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_CONFIG_APP_ID
};

/**
 * Initializes the Firebase application with the provided configuration.
 *
 * @constant {FirebaseApp} app - The initialized Firebase application instance.
 *
 * @example
 * ```ts
 * import { app } from "./firebase";
 * ```
 */
const app = initializeApp(firebaseConfig);

/**
 * Firebase Authentication instance for handling user authentication.
 *
 * @constant {Auth} auth - The authentication instance initialized with Firebase.
 *
 * @example
 * ```ts
 * import { auth } from "./firebase";
 * import { signInWithEmailAndPassword } from "firebase/auth";
 *
 * signInWithEmailAndPassword(auth, email, password);
 * ```
 */
export const auth = getAuth(app);

/**
 * Firestore database instance for storing and retrieving data.
 *
 * @constant {Firestore} db - The Firestore instance initialized with Firebase.
 *
 * @example
 * ```ts
 * import { db } from "./firebase";
 * import { collection, getDocs } from "firebase/firestore";
 *
 * const querySnapshot = await getDocs(collection(db, "users"));
 * ```
 */
export const db = getFirestore(app); 
