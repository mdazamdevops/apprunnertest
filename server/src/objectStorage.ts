import { Storage } from "@google-cloud/storage";
import { randomUUID } from "node:crypto";

const defaultBucketId = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;

export const storageClient = new Storage();

export const bucket = defaultBucketId
  ? storageClient.bucket(defaultBucketId)
  : undefined;

export interface SignedUpload {
  uploadUrl: string;
  objectPath: string;
  normalizedPath: string;
  expiresAt: Date;
}

export async function createSignedUploadUrl(
  opts: { contentType: string; isPublic: boolean },
  userId: string
): Promise<SignedUpload> {
  if (!bucket) {
    throw new Error("Object storage bucket is not configured");
  }

  const privateDir = process.env.PRIVATE_OBJECT_DIR ?? "private";
  const objectPath = `${privateDir}/uploads/${userId}/${randomUUID()}`;

  const [url] = await bucket.file(objectPath).getSignedUrl({
    action: "write",
    version: "v4",
    expires: Date.now() + 15 * 60 * 1000,
    contentType: opts.contentType
  });

  return {
    uploadUrl: url,
    objectPath,
    normalizedPath: `/objects/${objectPath}`,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000)
  };
}
