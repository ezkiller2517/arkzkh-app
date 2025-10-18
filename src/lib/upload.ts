'use client';

// /src/lib/uploads.ts
import { uploadBytesResumable, ref, getDownloadURL } from 'firebase/storage';
import { getFirebase } from '@/firebase/client';

export async function uploadUserImage({
  userId,
  file,
  onProgress,
}: {
  userId: string;
  file: File;
  onProgress?: (pct: number) => void;
}) {
  const { storage } = getFirebase();

  // keep path consistent with your Storage Rules
  const fileId = `${crypto.randomUUID()}-${file.name}`;
  const path = `uploads/${userId}/${fileId}`;
  const r = ref(storage, path);

  const task = uploadBytesResumable(r, file, { contentType: file.type });

  return await new Promise<{ path: string; downloadURL: string; contentType: string }>(
    (resolve, reject) => {
      task.on(
        'state_changed',
        snapshot => {
          const pct = snapshot.totalBytes
            ? (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            : 0;
          onProgress?.(pct);
        },
        reject,
        async () => {
          const downloadURL = await getDownloadURL(r);
          resolve({ path, downloadURL, contentType: file.type });
        }
      );
    }
  );
}
