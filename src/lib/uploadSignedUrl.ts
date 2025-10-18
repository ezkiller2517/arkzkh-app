import * as admin from 'firebase-admin';
import { onCall } from 'firebase-functions/v2/https';

if (!admin.apps.length) {
  admin.initializeApp();
}

export const getSignedUploadUrl = onCall(async (req) => {
  const { orgId, draftId, fileName, contentType } = req.data;

  if (!orgId || !draftId || !fileName) {
    throw new Error('Missing required fields.');
  }

  const bucket = admin.storage().bucket();
  const objectPath = `uploads/${orgId}/${draftId}/${fileName}`;

  const [url] = await bucket.file(objectPath).getSignedUrl({
    version: 'v4',
    action: 'write',
    expires: Date.now() + 10 * 60 * 1000,
    contentType,
  });

  return { url, objectPath };
});
