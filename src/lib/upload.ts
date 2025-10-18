'use client';

import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { getFirebase } from '@/firebase/client';

type UploadArgs = {
  userId: string;
  file: File;
  onProgress?: (pct: number) => void;
};

export async function uploadUserImage({ userId, file, onProgress }: UploadArgs) {
  const { storage } = getFirebase();

  // Keep path aligned with your Storage Rules:
  // match /uploads/{userId}/{fileId}
  const fileId = crypto.randomUUID();
  const path = `uploads/${userId}/${fileId}-${file.name}`;
  const r = ref(storage, path);

  const task = uploadBytesResumable(r, file, { contentType: file.type });

  return await new Promise<{
    objectPath: string;
    downloadURL: string;
    contentType: string;
  }>((resolve, reject) => {
    task.on(
      'state_changed',
      (s) => {
        if (s.total) onProgress?.((s.bytesTransferred / s.total) * 100);
      },
      reject,
      async () => {
        const downloadURL = await getDownloadURL(r);
        resolve({ objectPath: path, downloadURL, contentType: file.type });
      }
    );
  });
}
