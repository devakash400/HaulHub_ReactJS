import { API_BASE_URL } from "../api/api.ts";

const CLOUDINARY_BASE = "https://res.cloudinary.com/dpsy0wq7d/image/upload";

/**
 * Resolves a media path or publicId to a usable URL.
 * - If `p` is a full URL (http/https/data) it is returned unchanged.
 * - If `p` looks like a Cloudinary publicId (contains 'haulhub/uploads' or otherwise not starting with '/'), build a Cloudinary URL.
 * - Otherwise, assume it's a server-relative path and prefix API_BASE_URL.
 */
export function resolveMediaUrl(p?: string | null, fallback = ""): string {
  if (!p?.toString().trim()) return fallback;
  const s = p.toString().trim();
  if (/^https?:\/\//i.test(s) || /^data:/i.test(s)) return s;

  // remove surrounding quotes and %22 residues
  const cleaned = s.replace(/^\s*["']+|["']+\s*$/g, "").replace(/%22/g, "").replace(/^\/+|\/+$/g, "");

  // If the path looks like a Cloudinary publicId (our uploads folder), build a Cloudinary URL
  if (/haulhub\//i.test(cleaned) || cleaned.split("/").length > 1) {
    return `${CLOUDINARY_BASE}/${cleaned}.jpg`;
  }

  // Fallback to API server path
  return `${API_BASE_URL}/${cleaned.replace(/^\//, "")}`;
}

export default resolveMediaUrl;
