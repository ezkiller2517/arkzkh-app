'use client';

import {
  doc,
  setDoc,
  addDoc,
  updateDoc,
  collection,
  serverTimestamp,
  DocumentReference,
  CollectionReference,
  SetOptions,
  UpdateData,
  WithFieldValue,
  Firestore,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * A non-blocking version of setDoc that uses the global error emitter for permission errors.
 * It performs an upsert (merge) by default.
 */
export function setDocumentNonBlocking<T>(
  reference: DocumentReference<T>,
  data: WithFieldValue<T>,
  options: SetOptions = { merge: true }
) {
  setDoc(reference, data, options).catch(serverError => {
    const permissionError = new FirestorePermissionError({
      path: reference.path,
      operation: options.merge ? 'update' : 'create',
      requestResourceData: data,
    });
    errorEmitter.emit('permission-error', permissionError);
  });
}

/**
 * A non-blocking version of addDoc that uses the global error emitter for permission errors.
 */
export function addDocumentNonBlocking<T>(
  reference: CollectionReference<T>,
  data: WithFieldValue<T>
) {
  addDoc(reference, data).catch(serverError => {
    const permissionError = new FirestorePermissionError({
      path: reference.path,
      operation: 'create',
      requestResourceData: data,
    });
    errorEmitter.emit('permission-error', permissionError);
  });
}

/**
 * A non-blocking version of updateDoc that uses the global error emitter for permission errors.
 */
export function updateDocumentNonBlocking<T>(
  reference: DocumentReference<T>,
  data: UpdateData<T>
) {
  updateDoc(reference, data).catch(serverError => {
    const permissionError = new FirestorePermissionError({
      path: reference.path,
      operation: 'update',
      requestResourceData: data,
    });
    errorEmitter.emit('permission-error', permissionError);
  });
}