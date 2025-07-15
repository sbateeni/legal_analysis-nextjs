import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { put } from "@vercel/blob";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) return res.status(401).json({ error: "Unauthorized" });

  if (req.method !== "POST") return res.status(405).end();

  const { name, email, image, provider, apiKey } = req.body;
  const userId = email.replace(/[^a-zA-Z0-9]/g, "_");
  const blobName = `users/${userId}.json`;

  const data = JSON.stringify({ name, email, image, provider, apiKey, updatedAt: new Date().toISOString() });
  const result = await put(blobName, data, { access: "public" });

  return res.status(200).json({ success: true, url: result.url });
} 