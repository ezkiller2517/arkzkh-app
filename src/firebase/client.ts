// src/firebase/client.ts
'use client';

import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { getFunctions, type Functions } from 'firebase/functions';
import { getFirestore, type Firestore } from 'firebase/firestore';

// Use NEXT_PUBLIC_ vars so this code can run in the browser
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

let app: FirebaseApp;
let auth: Auth;
let storage: FirebaseStorage;
let functions: Functions;
let db: Firestore;

export function initializeFirebase() {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  auth = getAuth(app);
  storage = getStorage(app);
  functions = getFunctions(app);
  db = getFirestore(app);
  return { firebaseApp: app, auth, storage, functions, db };
}

// A convenience getter if you just need pieces
export function getFirebase() {
  if (!getApps().length) initializeFirebase();
  return { app, auth, storage, functions, db };
}
