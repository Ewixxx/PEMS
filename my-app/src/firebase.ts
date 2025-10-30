import admin from "firebase-admin";
import path from "path";
import { fileURLToPath } from "url";

// Required to resolve __dirname in ES Modules (since you’re using "type": "module")
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serviceAccountPath = path.resolve(__dirname, "../iot-poultry-10f80-firebase-adminsdk-fbsvc-46856e1945.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountPath),
  });
}

export const db = admin.firestore();
export const auth = admin.auth();
