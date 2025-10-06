'use client';
import { Auth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

export async function signInWithGoogle(auth: Auth) {
  const provider = new GoogleAuthProvider();
  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    console.error("Error signing in with Google", error);
    // Optionally, handle specific error codes
  }
}
