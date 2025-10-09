'use client';
// src/firebase/auth.ts
import {
  getAuth,
  GoogleAuthProvider,
  signInWithRedirect,
  signOut,
  Auth,
} from 'firebase/auth';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { firebaseConfig } from './config';

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export function signInWithGoogle(auth: Auth) {
  // Redirect flow works reliably inside Studio preview
  return signInWithRedirect(auth, provider);
}

export function signOutUser() {
  return signOut(auth);
}
