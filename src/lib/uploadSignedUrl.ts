import { httpsCallable, Functions } from "firebase/functions";
import { ref as storageRef, getDownloadURL, FirebaseStorage } from "firebase/storage";

type UploadOpts = {
  file: File;
  orgId: string;
  draftId: string;
  functions: Functions;
  storage: FirebaseStorage;
  onProgress?: (pct: number) => void;
};

export default async function uploadViaSignedUrl(opts: UploadOpts) {
  const { file, orgId, draftId, functions, storage, onProgress } = opts;

  // 1) exact type we’ll send
  const contentType = file.type || "application/octet-stream";

  // 2) get signed v4 URL from the callable
  const getUrl = httpsCallable(functions, "getSignedUploadUrl");
  const resp: any = await getUrl({
    orgId,
    draftId,
    fileName: file.name,
    contentType,
  });

  // Defensive: make sure the function returned a proper HTTPS signed URL
  const url: string | undefined = resp?.data?.url;
  const objectPath: string | undefined = resp?.data?.objectPath;

  if (!url || !url.startsWith("http")) {
    console.error("Bad getSignedUploadUrl response:", resp?.data);
    throw new Error("Signed URL missing or invalid. Check Cloud Function return shape.");
  }
  if (!objectPath) {
    console.error("Bad getSignedUploadUrl response (no objectPath):", resp?.data);
    throw new Error("objectPath missing from function response.");
  }

  console.log("[upload] signed URL:", url);
  console.log("[upload] objectPath:", objectPath);

  // 3) PUT with matching Content-Type; no Authorization or custom headers
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url, true);
    xhr.setRequestHeader("Content-Type", contentType);

    xhr.upload.onprogress = (evt) => {
      if (evt.lengthComputable && onProgress) {
        onProgress((evt.loaded / evt.total) * 100);
      }
    };
    xhr.onerror = () => reject(new Error("Network error during upload."));
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) return resolve();
      reject(new Error(`Signed URL upload failed: ${xhr.status} ${xhr.statusText}`));
    };
    xhr.send(file);
  });

  // 4) return a standard download URL for your UI (SDK call, not signed)
  const sdkRef = storageRef(storage, objectPath);
  const downloadURL = await getDownloadURL(sdkRef);

  return { objectPath, downloadURL, contentType };
}
