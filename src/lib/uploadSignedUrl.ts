import { httpsCallable } from "firebase/functions";
import { ref as storageRef, getDownloadURL, FirebaseStorage } from "firebase/storage";
import { Functions } from "firebase/functions";

export async function uploadViaSignedUrl(opts: {
  file: File;
  orgId: string;
  draftId: string;
  functions: Functions;
  storage: FirebaseStorage;
  onProgress?: (pct: number) => void;
}) {
  const { file, orgId, draftId, functions, storage, onProgress } = opts;

  // 1) exact type we’ll send
  const contentType = file.type || "application/octet-stream";

  // 2) get signed v4 URL
  const getUrl = httpsCallable(functions, "getSignedUploadUrl");
  const resp = await getUrl({ orgId, draftId, fileName: file.name, contentType });
  const { url, objectPath } = resp.data as { url: string; objectPath: string };

  // 3) PUT with matching Content-Type (no other headers)
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url, true);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.upload.onprogress = (evt) => {
      if (evt.lengthComputable && onProgress) onProgress((evt.loaded / evt.total) * 100);
    };
    xhr.onerror = () => reject(new Error("Network error during upload."));
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Signed URL upload failed: ${xhr.status} ${xhr.statusText}`));
    };
    xhr.send(file);
  });

  // 4) return a standard download URL for the UI
  const sdkRef = storageRef(storage, objectPath);
  const downloadURL = await getDownloadURL(sdkRef);
  return { objectPath, downloadURL, contentType };
}
