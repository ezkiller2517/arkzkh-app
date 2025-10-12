
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { getStorage } from 'firebase-admin/storage';

admin.initializeApp();

export const getSignedUploadUrl = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Sign in required.');
  }

  const { orgId, draftId, fileName, contentType } = data || {};
  if (!orgId || !draftId || !fileName || !contentType) {
    throw new functions.https.HttpsError('invalid-argument', 'orgId, draftId, fileName, and contentType are required.');
  }

  const bucket = getStorage().bucket(); // default bucket
  const safeName = `${Date.now()}-${String(fileName).replace(/\s+/g, '-')}`;
  const objectPath = `organizations/${orgId}/drafts/${draftId}/${safeName}`;
  const file = bucket.file(objectPath);

  // Sign for PUT with **exact** contentType
  const [url] = await file.getSignedUrl({
    version: 'v4',
    action: 'write',
    expires: Date.now() + 10 * 60 * 1000, // 10 minutes
    contentType, // <— match the client header exactly
  });

  return { url, objectPath, bucket: bucket.name };
});


If you see any old contentType: 'application/octet-stream', replace it with the contentType from the request as above.

Save the file.

Redeploy only this function (still in the Terminal at the bottom of Studio):

cd functions
npm ci
firebase deploy --only functions:getSignedUploadUrl


(If the CLI says “no active project”, run the same command with the project id flag you used earlier:)

firebase deploy --project studio-2410503780-807e6 --only functions:getSignedUploadUrl

2) Make the browser send the exact same Content-Type

Where you do the actual PUT to the signed URL, ensure you set that same header:

// file is a File/Blob from the <input>
const contentType = file.type || 'application/octet-stream';

// 1) ask the function for a URL (and pass contentType)
const { data } = await httpsCallable(getSignedUploadUrl)({
  orgId, draftId, fileName: file.name, contentType
});

// 2) PUT with matching header
await fetch(data.url, {
  method: 'PUT',
  headers: { 'Content-Type': contentType },
  body: file
});


The value in headers['Content-Type'] must equal the value you passed to the function. For a JPEG it will be image/jpeg; for PNG image/png; for PDFs application/pdf, etc.

3) Quick sanity test (optional but great for your demo)

Still in Firebase Studio Terminal (or Windows CMD):

# Replace with a real signed URL you just got back
curl -X PUT \
  -H "Content-Type: image/jpeg" \
  --upload-file ./some-local.jpg \
  "https://storage.googleapis.com/…(your signed url)…"


If that returns 200 OK, you’re golden. (If you try the same command with Content-Type: application/octet-stream, you’ll see the 403 that used to cause the retries — that proves the root cause.)

4) Clear cache and record the demo

Open your app (the Studio web preview is fine).

Open DevTools (F12) → Network → check Disable cache.

Start a new draft → Upload Media → pick a small JPG/PNG.

You should see:

organizations/.../yourfile.jpg PUT → 200

No CORS error rows

The file appears in your “Attachments” list

That’s your clean demo run.

Why this fixes the “max retry time exceeded”

Your trace showed the browser sending Content-Type: image/jpeg while the server signed for application/octet-stream. v4 signing treats the content type as part of the signature. GCS rejects each attempt with 403, the client retries, then throws storage/retry-limit-exceeded. Making the two values identical removes the 403s and the retries.

If anything still hiccups

If you see 404 Preflight rows, keep using the bucket CORS you already set (yours looked correct).

If you ever enable App Check in “enforced” mode for Storage, the Firebase SDK uploads require a valid App Check token. The signed-URL route you’re using bypasses App Check, so it’s unaffected — just F