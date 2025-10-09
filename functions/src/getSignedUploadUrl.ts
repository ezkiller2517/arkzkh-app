
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { getStorage } from 'firebase-admin/storage';

try {
  admin.initializeApp();
} catch (e) {
  // This can happen with multiple function definitions
}

export const getSignedUploadUrl = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Sign in required.');
  }

  const { orgId, draftId, fileName, contentType } = data || {};
  if (!orgId || !draftId || !fileName) {
    throw new functions.https\
.HttpsError('invalid-argument', 'orgId, draftId, and fileName are required.');
  }

  // Optionally enforce org claim on server side
  const claimOrg = (context.auth.token as any).organizationId;
  if (claimOrg && claimOrg !== orgId) {
    throw new functions.https\
.HttpsError('permission-denied', 'Wrong organization.');
  }

  const bucket = getStorage().bucket(); // default bucket from your project
  const safeName = `${Date.now()}-${String(fileName).replace(/\s+/g, '_')}`;
  const objectPath = `organizations/${orgId}/drafts/${draftId}/${safeName}`;
  const file = bucket.file(objectPath);

  // V4 signed URL for PUT (10 minutes)
  const [url] = await file.getSignedUrl({
    version: 'v4',
    action: 'write',
    expires: Date.now() + 10 * 60 * 1000,
    contentType: contentType || 'application/octet-stream',
  });

  return { url, objectPath, bucket: bucket.name };
});
