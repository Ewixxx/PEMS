// cleanupOldSensorData.js
import { db } from "../my-app/src/firebase.ts"; // adjust path if needed

async function cleanupOldSensorData() {
  try {
    const snapshot = await db.collection("sensor_data").get();
    let deletedCount = 0;

    for (const doc of snapshot.docs) {
      const data = doc.data();

      // Check if createdAt is a string (old document)
      if (typeof data.createdAt === "string") {
        console.log(`Deleting old doc: ${doc.id}, createdAt: ${data.createdAt}`);
        await db.collection("sensor_data").doc(doc.id).delete();
        deletedCount++;
      }
    }

    console.log(`✅ Cleanup complete. Deleted ${deletedCount} old documents.`);
  } catch (err) {
    console.error("❌ Error cleaning up old sensor data:", err);
  }
}

cleanupOldSensorData();
