
import * as functions from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import { getStorage } from 'firebase-admin/storage';

if (!admin.apps.length) {
  admin.initializeApp();
}

functions.setGlobalOptions({ region: 'us-central1' });

export const getSignedUploadUrl = functions.https.onCall(async (req) => {
  if (!req.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Sign in required.');
  }

  const { orgId, draftId, fileName, contentType } = (req.data || {}) as {
      orgId: string;
      draftId: string;
      fileName: string;
      contentType?: string;
  };

  if (!orgId || !draftId || !fileName) {
      throw new functions.https.HttpsError('invalid-argument', 'Missing fields: orgId, draftId, and fileName are required.');
  }

  // Optional: You can enforce that the user belongs to the orgId they are uploading to
  // const userOrgClaim = (req.auth.token as any).organizationId;
  // if (userOrgClaim !== orgId) {
  //   throw new functions.https.HttpsError('permission-denied', 'You do not have permission to upload to this organization.');
  // }

  const bucket = getStorage().bucket();
  const safeName = `${Date.now()}-${fileName.replace(/[^\w.\-]+/g, '-')}`;
  const objectPath = `organizations/${orgId}/drafts/${draftId}/${safeName}`;
  const file = bucket.file(objectPath);

  try {
    const [url] = await file.getSignedUrl({
        version: 'v4',
        action: 'write',
        expires: Date.now() + 15 * 60 * 1000, // 15 minutes
        contentType: contentType || 'application/octet-stream',
    });

    return { url, objectPath, bucket: bucket.name };
  } catch (error) {
    console.error("Error creating signed URL: ", error);
    throw new functions.https.HttpsError('internal', 'Could not create upload URL.');
  }
});
