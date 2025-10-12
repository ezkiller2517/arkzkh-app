
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { getStorage } from "firebase-admin/storage";

admin.initializeApp();

export const getSignedUploadUrl = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Sign in required.");
  }

  const { orgId, draftId, fileName, contentType } = data || {};
  if (!orgId || !draftId || !fileName || !contentType) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "orgId, draftId, fileName, and contentType are required."
    );
  }

  const bucket = getStorage().bucket(); // default bucket
  const safeName = `${Date.now()}-${String(fileName).replace(/\s+/g, "-")}`;
  const objectPath = `organizations/${orgId}/drafts/${draftId}/${safeName}`;
  const file = bucket.file(objectPath);

  const [url] = await file.getSignedUrl({
    version: "v4",
    action: "write",
    expires: Date.now() + 10 * 60 * 1000, // 10 minutes
    contentType, // must match client PUT
  });

  return { url, objectPath, bucket: bucket.name };
});
