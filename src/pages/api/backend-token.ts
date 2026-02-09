import { NextApiRequest, NextApiResponse } from "next";

// Proxy endpoint to fetch token from backend
// This avoids CORS and loopback restrictions when frontend is accessed via ngrok
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).end("Method Not Allowed");
    return;
  }

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
  const { room, user } = req.query;

  if (!room || !user) {
    res.status(400).json({
      error: "Missing required parameters: room and user are required",
    });
    return;
  }

  try {
    // Server-side fetch can access localhost without browser restrictions
    const response = await fetch(
      `${backendUrl}/token?room=${encodeURIComponent(room as string)}&user=${encodeURIComponent(user as string)}`
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      res.status(response.status).json({
        error: errorData.error || `Failed to fetch token: ${response.statusText}`,
      });
      return;
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    console.error("Error proxying token request:", err);
    res.status(500).json({
      error: "Failed to fetch token from backend",
      message: err instanceof Error ? err.message : "Unknown error",
    });
  }
}
