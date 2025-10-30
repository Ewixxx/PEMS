import { Hono } from "hono";

const camera = new Hono();

camera.get("/stream", async (c) => {
  const espStreamUrl = "http://192.168.1.19:81/stream";
  try {
    const response = await fetch(espStreamUrl, { method: "GET" });
    if (!response.ok) {
      console.error("ESP32 responded with status:", response.status);
      return c.text("ESP32 stream unreachable", 500);
    }
    return new Response(response.body, {
      headers: {
        "Content-Type":
          response.headers.get("Content-Type") || "multipart/x-mixed-replace",
      },
    });
  } catch (err) {
    console.error("❌ Proxy connection error:", err);
    return c.text("Could not connect to ESP32 stream", 500);
  }
});

export default camera;
