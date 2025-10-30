import { Hono } from "hono";
import { db } from "../firebase.ts";

const misting = new Hono();

/* ---------------------------------------------------
 * 💧 GET MISTING STATUS
 * --------------------------------------------------- */
misting.get("/", async (c) => {
  try {
    const doc = await db.collection("deviceState").doc("misting").get();

    if (!doc.exists) {
      // Default if document doesn’t exist yet
      return c.json({ mistOn: false, mode: "auto" });
    }

    const data = doc.data();
    return c.json({
      mistOn: data?.mistOn ?? false,
      mode: data?.mode ?? "auto",
      updatedAt: data?.updatedAt ?? null,
    });
  } catch (err) {
    console.error("❌ Error fetching misting state:", err);
    return c.json({ error: "Failed to fetch misting state" }, 500);
  }
});

/* ---------------------------------------------------
 * 💧 UPDATE MISTING STATE
 * --------------------------------------------------- */
misting.post("/", async (c) => {
  try {
    const { mistOn, mode } = await c.req.json();

    // Validate request body
    if (typeof mistOn !== "boolean" || !["auto", "manual"].includes(mode)) {
      return c.json({ error: "Invalid misting parameters" }, 400);
    }

    const data = {
      mistOn,
      mode,
      updatedAt: new Date().toISOString(),
    };

    await db.collection("deviceState").doc("misting").set(data, { merge: true });

    console.log(`💧 Misting updated → ${mistOn ? "ON" : "OFF"} (${mode})`);
    return c.json({ success: true, ...data });
  } catch (err) {
    console.error("❌ Error updating misting state:", err);
    return c.json({ error: "Failed to update misting state" }, 500);
  }
});

export default misting;
