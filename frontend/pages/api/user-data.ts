import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { put } from "@vercel/blob";
import { encrypt, decrypt } from "../../utils/crypto";

const BLOB_PREFIX = "users/";
// ضع معرف مشروعك في Vercel Blob هنا أو استخرجه ديناميكياً
const PROJECT_ID = process.env.VERCEL_BLOB_PROJECT_ID || "YOUR_PROJECT_ID";
const BLOB_BASE_URL = `https://blob.vercel-storage.com/${PROJECT_ID}/`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) return res.status(401).json({ error: "Unauthorized" });

  const userId = session.user.email.replace(/[^a-zA-Z0-9]/g, "_");
  const blobName = `${BLOB_PREFIX}${userId}.json`;

  if (req.method === "POST") {
    const { apiKey, history } = req.body;
    const encryptedKey = encrypt(apiKey);
    const data = JSON.stringify({ apiKey: encryptedKey, history: history || [] });
    const result = await put(blobName, data, { access: "public" });
    // result.url هو رابط blob المباشر
    return res.status(200).json({ success: true, url: result.url });
  }

  if (req.method === "GET") {
    try {
      // استخدم رابط blob المباشر
      const blobUrl = `${BLOB_BASE_URL}${blobName}`;
      const response = await fetch(blobUrl);
      if (!response.ok) throw new Error("Blob not found");
      const json = await response.text();
      const { apiKey, history } = JSON.parse(json);
      return res.status(200).json({ apiKey: decrypt(apiKey), history: history || [] });
    } catch {
      return res.status(200).json({ apiKey: "", history: [] });
    }
  }

  res.status(405).end();
} 