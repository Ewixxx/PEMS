import { Hono } from "hono";
import { db } from "../firebase.ts";

const users = new Hono();

// --- Get all users ---
users.get("/", async (c) => {
  try {
    const snapshot = await db.collection("users").get();
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return c.json(data);
  } catch (err) {
    console.error(err);
    return c.json({ error: "Failed to fetch users", details: String(err) }, 500);
  }
});

export default users;
