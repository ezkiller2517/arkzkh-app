// src/firebase/auth.ts
import { getAuth, GoogleAuthProvider, signInWithRedirect, signOut } from "firebase/auth";
import { app } from "./config"; // keep your existing app import

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export function signInWithGoogle() {
  // Redirect flow works reliably inside Studio preview
  return signInWithRedirect(auth, provider);
}

export function signOutUser() {
  return signOut(auth);
}
