// src/lib/upload.ts
'use client';

import { uploadBytesResumable, ref } from 'firebase/storage';
import { getFirebase } from '@/firebase/client';

export function uploadUserImage(
  userId: string,
  file: File,
  onProgress?: (pct: number) => void
): Promise<string> {
  const { storage } = getFirebase();
  // keep path consistent with your Storage rules: /uploads/{userId}/{fileId}
  const path = `uploads/${userId}/${crypto.randomUUID()}-${file.name}`;
  const r = ref(storage, path);

  const task = uploadBytesResumable(r, file, { contentType: file.type });

  return new Promise((resolve, reject) => {
    task.on(
      'state_changed',
      snap => {
        const pct = (snap.bytesTransferred / snap.totalBytes) * 100;
        onProgress?.(pct);
      },
      reject,
      async () => {
        // Return the gs:// path or the full path; you can later call getDownloadURL(r) if needed
        resolve(path);
      }
    );
  });
}
