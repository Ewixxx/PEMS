import { Hono } from "hono";
import { db } from "../firebase.ts"; // your Firebase instance

const fan = new Hono();

// Map string speeds to numeric PWM duty for ESP32
const speedMap: Record<string, number> = { off: 0, slow: 85, medium: 170, fast: 255 };

// --- Get fan status ---
fan.get("/", async (c) => {
  try {
    const snapshot = await db
      .collection("fan_status")
      .orderBy("updatedAt", "desc")
      .limit(2)
      .get();

    const status: any = { exhaust: {}, intake: {} };

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      if (data.type === "exhaust") status.exhaust = { 
        speed: data.speed, 
        mode: data.mode,
        rpm: data.rpm ?? 0,
        power: data.power ?? 0,
      };
      if (data.type === "intake") status.intake = { 
        speed: data.speed, 
        mode: data.mode,
        rpm: data.rpm ?? 0,
        power: data.power ?? 0,
      };
    });

    if (!status.exhaust.speed) status.exhaust = { speed: "off", mode: "auto", rpm: 0, power: 0 };
    if (!status.intake.speed) status.intake = { speed: "off", mode: "auto", rpm: 0, power: 0 };

    return c.json(status);
  } catch (err) {
    console.error("Error fetching fan status:", err);
    return c.json({ error: "Failed to fetch fan status" }, 500);
  }
});

// --- Update fan speed ---
fan.post("/:type", async (c) => {
  const type = c.req.param("type");
  try {
    const body = await c.req.json();
    const speed: string = body.speed || "off";
    const mode: string = body.mode || "manual";

    if (!["exhaust", "intake"].includes(type)) {
      return c.json({ error: "Invalid fan type" }, 400);
    }

    // Convert speed string to numeric duty for ESP32
    const espSpeed = speedMap[speed] ?? 0;

    // Send POST to ESP32
    const espUrl = "http://192.168.1.20:81/fan"; // <-- your Arduino IP
    const params = new URLSearchParams();
    params.append("type", type);
    params.append("speed", String(espSpeed));

    let rpm = 0;
    let power = 0;

    try {
      const res = await fetch(espUrl, {
        method: "POST",
        body: params,
      });
      if (!res.ok) console.error("ESP32 fan update failed:", res.status);
      else {
        const data = await res.json();
        // Expect ESP32 to return { rpm: number, watt: number }
        rpm = data.rpm ?? 0;
        power = data.watt ?? 0;
      }
    } catch (err) {
      console.error("Could not reach ESP32:", err);
    }

    // Save to Firestore
    await db.collection("fan_status").add({
      type,
      speed,
      mode,
      rpm,
      power,
      updatedAt: new Date().toISOString(),
    });

    return c.json({ success: true, type, speed, mode, rpm, power });
  } catch (err) {
    console.error("Error updating fan speed:", err);
    return c.json({ error: "Failed to update fan speed", details: String(err) }, 500);
  }
});

export default fan;
