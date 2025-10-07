'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getFunctions, Functions } from 'firebase/functions';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';

// Store SDK instances
let firebaseApp: FirebaseApp;
let auth: Auth;
let firestore: Firestore;
let storage: FirebaseStorage;
let functions: Functions;

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  if (getApps().length === 0) {
    firebaseApp = initializeApp(firebaseConfig);
    // Initialize App Check only on the client
    if (typeof window !== 'undefined') {
      // Pass your reCAPTCHA v3 site key (public key) to activate().
      // You can get this key from the Google Cloud console.
      initializeAppCheck(firebaseApp, {
        provider: new ReCaptchaEnterpriseProvider('6Ld-8RwqAAAAAN0zO9lS8z5i4sXma5aB2Y_wz-eG' /* reCAPTCHA enterprise site key */),
        isTokenAutoRefreshEnabled: true
      });
    }
  } else {
    firebaseApp = getApp();
  }

  // Get SDK instances, creating them if they don't exist.
  auth = getAuth(firebaseApp);
  firestore = getFirestore(firebaseApp);
  storage = getStorage(firebaseApp);
  // us-central1 is the default region for functions
  functions = getFunctions(firebaseApp, 'us-central1');

  return { firebaseApp, auth, firestore, storage, functions };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';