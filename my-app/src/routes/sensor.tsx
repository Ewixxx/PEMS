import { Hono } from "hono";
import { db } from "../firebase.ts";

const TANK_HEIGHT_CM = 50; // set to your tank's actual height

const sensor = new Hono();

/* -------------------------------------------------------------
   POST /sensor
   → Receive ESP32 sensor data and save to Firestore
------------------------------------------------------------- */
sensor.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const temperature = Number(body.temperature) || 0;
    const waterLevel = Number(body.waterLevel) || 0;
    const fanSpeed = body.fanSpeed || {};
    const mistOn = body.mistOn === true || body.mistOn === "true";
    const ledOn = body.ledOn === true || body.ledOn === "true";

    // Calculate water level percentage
    const waterLevelPercent = Math.max(
      0,
      Math.min(100, (waterLevel / TANK_HEIGHT_CM) * 100)
    );

    const payload = {
      temperature,
      waterLevel,
      waterLevelPercent,
      fanSpeed,
      mistOn,
      ledOn,
      createdAt: new Date(),
    };

    await db.collection("sensor_data").add(payload);
    console.log("✅ Sensor data saved:", payload);

    return c.json({ success: true });
  } catch (err) {
    console.error("❌ Error saving sensor data:", err);
    return c.json(
      { error: "Invalid JSON or server error", details: String(err) },
      400
    );
  }
});

/* -------------------------------------------------------------
   GET /sensor/latest
   → Fetch latest valid sensor reading (skip old string timestamps)
------------------------------------------------------------- */
sensor.get("/latest", async (c) => {
  try {
    const snapshot = await db
      .collection("sensor_data")
      .orderBy("createdAt", "desc")
      .limit(50) // fetch last 50 entries to skip old invalid ones
      .get();

    if (snapshot.empty) {
      return c.json(
        {
          temperature: null,
          waterLevel: null,
          waterLevelPercent: null,
          message: "No data available",
        },
        404
      );
    }

    // Find the first document where createdAt is a valid Date
    const latestDoc = snapshot.docs.find((doc) => {
      const createdAt = doc.data().createdAt;
      return createdAt instanceof Date || typeof createdAt?.toDate === "function";
    });

    if (!latestDoc) {
      return c.json(
        {
          temperature: null,
          waterLevel: null,
          waterLevelPercent: null,
          message: "No valid data found",
        },
        404
      );
    }

    const data = latestDoc.data();
    const createdAt =
      data.createdAt instanceof Date ? data.createdAt : data.createdAt.toDate();

    return c.json({
      ...data,
      createdAt: createdAt.toISOString(),
    });
  } catch (err) {
    console.error("❌ Error fetching latest sensor data:", err);
    return c.json(
      { error: "Failed to fetch latest sensor data", details: String(err) },
      500
    );
  }
});

/* -------------------------------------------------------------
   GET /sensor/status
   → Returns if sensor is connected based on latest timestamp
------------------------------------------------------------- */
sensor.get("/status", async (c) => {
  try {
    const snapshot = await db
      .collection("sensor_data")
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();

    if (snapshot.empty) return c.json({ status: "disconnected" });

    const latestDoc = snapshot.docs.find((doc) => {
      const createdAt = doc.data().createdAt;
      return createdAt instanceof Date || typeof createdAt?.toDate === "function";
    });

    if (!latestDoc) return c.json({ status: "disconnected" });

    const latest = latestDoc.data();
    const lastTimestamp =
      latest.createdAt instanceof Date ? latest.createdAt : latest.createdAt.toDate();

    const now = new Date();
    const diffSec = (now.getTime() - lastTimestamp.getTime()) / 1000;

    // Consider sensor disconnected if last reading older than 15 seconds
    if (diffSec > 15 || (!latest.waterLevel && latest.waterLevel !== 0)) {
      return c.json({ status: "disconnected" });
    }

    return c.json({ status: "connected" });
  } catch (err) {
    console.error("❌ Error fetching sensor status:", err);
    return c.json({ status: "disconnected", error: String(err) }, 500);
  }
});

/* -------------------------------------------------------------
   GET /sensor/schedule
   → Fetch scheduled hourly readings (0, 3, 6, 9, 12, 15, 18, 21)
------------------------------------------------------------- */
sensor.get("/schedule", async (c) => {
  try {
    const now = new Date();
    const hours = [0, 3, 6, 9, 12, 15, 18, 21];
    const result: { label: string; temperature: number; waterLevelPercent: number }[] =
      [];

    for (const h of hours) {
      const start = new Date(now);
      start.setHours(h, 0, 0, 0);
      const end = new Date(start);
      end.setMinutes(end.getMinutes() + 30);

      const snapshot = await db
        .collection("sensor_data")
        .where("createdAt", ">=", start)
        .where("createdAt", "<=", end)
        .orderBy("createdAt", "asc")
        .limit(1)
        .get();

      const label = start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      const entry = snapshot.empty
        ? { temperature: 0, waterLevelPercent: 0 }
        : {
            temperature: snapshot.docs[0].data().temperature || 0,
            waterLevelPercent: snapshot.docs[0].data().waterLevelPercent || 0,
          };

      result.push({
        label,
        temperature: entry.temperature,
        waterLevelPercent: entry.waterLevelPercent,
      });
    }

    console.log("✅ Schedule data prepared:", result.length, "entries");
    return c.json(result);
  } catch (err) {
    console.error("❌ Error fetching scheduled sensor data:", err);
    return c.json(
      { error: "Failed to fetch scheduled data", details: String(err) },
      500
    );
  }
});

// --- Toggle mist manually ---
sensor.post("/mist", async (c) => {
  try {
    const { mistOn } = await c.req.json();
    await db.collection("sensor_control").doc("mist").set({
      mistOn,
      updatedAt: new Date().toISOString(),
    });
    return c.json({ success: true, mistOn });
  } catch (err) {
    console.error("❌ Error toggling mist:", err);
    return c.json({ error: "Failed to toggle mist" }, 500);
  }
});

export default sensor;
