import type { Request } from "express";
import { bucket } from "./objectStorage";

export interface ObjectAclRule {
  path: string;
  isPublic: boolean;
  ownerId?: string;
}

export interface AclContext {
  userId?: string;
}

export function toBucketPath(path: string) {
  return path.replace(/^\/objects\//, "");
}

export async function setObjectAcl(rule: ObjectAclRule) {
  if (!bucket) return;
  const file = bucket.file(toBucketPath(rule.path));
  if (rule.isPublic) {
    await file.makePublic();
  } else if (rule.ownerId) {
    await file.acl.add({
      entity: `user-${rule.ownerId}`,
      role: "OWNER"
    });
  }
}

export function normalizeObjectPath(rawUrl: string) {
  try {
    const url = new URL(rawUrl);
    const pathname = url.pathname.replace(/^\//, "");
    const [, ...rest] = pathname.split("/");
    return `/objects/${rest.join("/")}`;
  } catch {
    return rawUrl.startsWith("/objects/") ? rawUrl : `/objects/${rawUrl}`;
  }
}

export async function authorizeObjectRequest(req: Request, normalizedPath: string) {
  const publicPaths = (process.env.PUBLIC_OBJECT_SEARCH_PATHS ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

  if (publicPaths.some((path) => normalizedPath.startsWith(path))) {
    return true;
  }

  const userId = req.user && (req.user as any).claims?.sub;
  return Boolean(userId);
}
