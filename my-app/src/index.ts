import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { db } from "./firebase.ts";
import users from "./routes/users.tsx";
import sensor from "./routes/sensor.tsx";
import fan from "./routes/fan.tsx";
import misting from "./routes/misting.tsx";
import camera from "./routes/camera.tsx";
import notify from "./routes/notify.tsx";

const app = new Hono();

// ✅ CORS Middleware (must come before routes)
app.use("*", async (c, next) => {
  c.header("Access-Control-Allow-Origin", c.req.header("origin") || "*");
  c.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  c.header("Access-Control-Allow-Headers", "Content-Type");

  if (c.req.method === "OPTIONS") {
    return c.text("ok", 200);
  }

  await next();
});

// ✅ Firestore connection test
(async () => {
  try {
    const collections = await db.listCollections();
    console.log("✅ Available Collections:", collections.map((c) => c.id));
  } catch (error) {
    console.error("❌ Firestore connection failed:", error);
  }
})();

// --- Mount Routes ---
app.route("/users", users);
app.route("/sensor", sensor);
app.route("/fan", fan);
app.route("/misting", misting);
app.route("/camera", camera);
app.route("/notify", notify);

// --- Start Server ---
serve({
  fetch: app.fetch,
  port: 3000,
  hostname: "0.0.0.0",
});

console.log("🚀 Hono server running at http://192.168.1.2:3000");
