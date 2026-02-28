import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, updateDoc, arrayUnion } from "firebase/firestore";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDt8jX6BVWa2cdY66zYBlSXP_3LiV8l3QQ",
  authDomain: "billing-f186b.firebaseapp.com",
  projectId: "billing-f186b",
  storageBucket: "billing-f186b.firebasestorage.app",
  messagingSenderId: "487097927220",
  appId: "1:487097927220:web:00d8dc675cc779c7f16c61",
  measurementId: "G-YXM49VRQN0"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const messaging = getMessaging(app);

export const VAPID_KEY = "BAdbh57jKtC3gMA69BcIAGMFu4j80l3ll5lFrQ5pPa-RQSGj3b9cSp1cM7jZf453FlVO0VeOGmfJXzfZzickG1c";

export const requestForToken = async (restaurantId: string) => {
  try {
    let registration;
    if ('serviceWorker' in navigator) {
      registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    }
    const currentToken = await getToken(messaging, { 
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration
    });
    if (currentToken) {
      console.log('FCM Token:', currentToken);
      // Save token to Firestore
      const restaurantRef = doc(db, 'restaurants', restaurantId);
      await updateDoc(restaurantRef, {
        fcmTokens: arrayUnion(currentToken)
      });
      return currentToken;
    } else {
      console.log('No registration token available. Request permission to generate one.');
      return null;
    }
  } catch (err) {
    console.log('An error occurred while retrieving token. ', err);
    return null;
  }
};

export { onMessage };
