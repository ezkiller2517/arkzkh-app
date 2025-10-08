// src/components/firebase/functions.ts
import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "./config";   // 👈 uses your existing config.ts file right here

export const functions = getFunctions(app, "us-central1");  // same region you deployed to
export const getSignedUploadUrl = httpsCallable(functions, "getSignedUploadUrl");
