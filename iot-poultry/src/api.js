// src/api.js
const LAN_IP = "192.168.1.2"; // ⚙️ Replace with your LAN IP
const BASE_URL = `http://${LAN_IP}:3000`;

/* ---------------------------------------------------
 * 🌡️ SENSOR DATA
 * --------------------------------------------------- */

// Fetch scheduled (hourly) sensor readings
export const fetchScheduled = async () => {
  try {
    const res = await fetch(`${BASE_URL}/sensor/schedule`);
    if (!res.ok) throw new Error("Failed to fetch scheduled sensor data");
    return await res.json();
  } catch (err) {
    console.error("❌ fetchScheduled error:", err);
    return [];
  }
};

// Fetch latest sensor readings
export const fetchLatest = async () => {
  try {
    const res = await fetch(`${BASE_URL}/sensor/latest`);
    if (!res.ok) throw new Error("Failed to fetch latest sensor data");
    return await res.json();
  } catch (err) {
    console.error("❌ fetchLatest error:", err);
    return null;
  }
};

// Fetch sensor history by type (temperature, humidity, etc.)
export const fetchHistory = async (type) => {
  try {
    const res = await fetch(`${BASE_URL}/sensor/history/${type}`);
    if (!res.ok) throw new Error(`Failed to fetch ${type} history`);
    return await res.json();
  } catch (err) {
    console.error(`❌ fetchHistory (${type}) error:`, err);
    return [];
  }
};

/* ---------------------------------------------------
 * 📍 LOCATION
 * --------------------------------------------------- */

export const fetchLocation = async () => {
  try {
    const res = await fetch("https://ipinfo.io/json?token=9752b318290855");
    const data = await res.json();
    return `${data.city}, ${data.region}`;
  } catch (err) {
    console.error("❌ fetchLocation error:", err);
    return "Unknown location";
  }
};

/* ---------------------------------------------------
 * 💡 CAMERA & LED
 * --------------------------------------------------- */

// Toggle ESP32-CAM LED
export const toggleLED = async (state) => {
  try {
    await fetch(`${BASE_URL}/camera/led/${state ? "on" : "off"}`, {
      method: "POST",
    });
  } catch (err) {
    console.error("❌ toggleLED error:", err);
  }
};

/* ---------------------------------------------------
 * 🌬️ FAN CONTROL
 * --------------------------------------------------- */

// Fetch current fan status (both exhaust & intake)
export const fetchFanStatus = async () => {
  try {
    const res = await fetch(`${BASE_URL}/fan`);
    if (!res.ok) throw new Error("Failed to fetch fan status");
    return await res.json();
  } catch (err) {
    console.error("❌ fetchFanStatus error:", err);
    // Default fallback
    return {
      exhaust: { speed: 0, mode: "auto", isOn: false },
      intake: { speed: 0, mode: "auto", isOn: false },
    };
  }
};

// Update fan speed manually
export const updateFanSpeed = async (type, speed, mode = "manual") => {
  try {
    if (!["exhaust", "intake"].includes(type)) {
      throw new Error(`Invalid fan type: ${type}`);
    }

    const res = await fetch(`${BASE_URL}/fan/${type}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ speed, mode }),
    });

    if (!res.ok) throw new Error(`Failed to update ${type} fan speed`);
    return await res.json();
  } catch (err) {
    console.error("❌ updateFanSpeed error:", err);
  }
};

/* ---------------------------------------------------
 * 💧 MISTING CONTROL
 * --------------------------------------------------- */

// Fetch current misting status
export const fetchMistStatus = async () => {
  try {
    const res = await fetch(`${BASE_URL}/misting`);
    if (!res.ok) throw new Error("Failed to fetch mist status");
    return await res.json();
  } catch (err) {
    console.error("❌ fetchMistStatus error:", err);
    return { mistOn: false, mode: "auto" };
  }
};

// Toggle misting state (on/off)
export const toggleMist = async (state, mode = "manual") => {
  try {
    const res = await fetch(`${BASE_URL}/misting`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mistOn: state, mode }),
    });

    if (!res.ok) throw new Error("Failed to toggle mist");
    return await res.json();
  } catch (err) {
    console.error("❌ toggleMist error:", err);
  }
};


