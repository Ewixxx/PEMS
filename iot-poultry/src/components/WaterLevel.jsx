import { useEffect, useState, useRef } from "react";

export default function WaterLevel({ sensorConnected, latestSensor }) {
  const [level, setLevel] = useState(0); // percentage
  const [cmLevel, setCmLevel] = useState(0); // cm
  const [status, setStatus] = useState("Loading...");
  const hasSentEmail = useRef(false);

  const TANK_HEIGHT_CM = 50; // total height of your tank

  // Update water level whenever sensor data changes
  useEffect(() => {
    if (!sensorConnected || !latestSensor || latestSensor.waterLevel == null) {
      setLevel(0);
      setCmLevel(0);
      setStatus("Sensor Disconnected");
      return;
    }

    const cm = Number(latestSensor.waterLevel);
    if (isNaN(cm)) {
      setLevel(0);
      setCmLevel(0);
      setStatus("Sensor Disconnected");
      return;
    }

    const percent = Math.max(0, Math.min(100, (cm / TANK_HEIGHT_CM) * 100));
    setLevel(Math.round(percent));
    setCmLevel(cm);

    // Determine status based on percentage
    let newStatus = "";
    if (percent >= 80) newStatus = "Full";
    else if (percent >= 50) newStatus = "Normal";
    else if (percent >= 20) newStatus = "Low";
    else newStatus = "Empty";
    setStatus(newStatus);

    // Send email alert if level below 10%
    const sendEmailAlert = async () => {
      if (percent < 10 && !hasSentEmail.current) {
        hasSentEmail.current = true;
        try {
          const res = await fetch("http://192.168.1.2:3000/notify/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ level: Math.round(percent) }),
          });
          const data = await res.json();
          console.log("📧 Email notification sent:", data);
        } catch (err) {
          console.error("❌ Failed to send email:", err);
        }
      } else if (percent > 15) {
        hasSentEmail.current = false;
      }
    };

    sendEmailAlert();
  }, [latestSensor, sensorConnected]);

  // Determine fill gradient based on status
  const getFillColor = () => {
    switch (status) {
      case "Full":
        return "linear-gradient(180deg, rgba(0,200,255,0.9), rgba(0,120,255,0.95))";
      case "Normal":
        return "linear-gradient(180deg, rgba(60,150,255,0.9), rgba(10,90,200,0.95))";
      case "Low":
        return "linear-gradient(180deg, rgba(255,200,40,0.9), rgba(200,150,0,0.95))";
      case "Empty":
        return "linear-gradient(180deg, rgba(255,70,70,0.9), rgba(200,0,0,0.95))";
      default:
        return "linear-gradient(180deg, rgba(120,120,120,0.6), rgba(80,80,80,0.7))";
    }
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-lg font-semibold mb-3 text-center">Water Level</h2>

      <div className="relative w-48 h-64">
        {/* Tank background */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            background:
              "linear-gradient(145deg, rgba(180,180,180,0.25), rgba(100,100,100,0.35))",
            border: "2px solid rgba(255,255,255,0.3)",
            boxShadow:
              "inset 0 0 15px rgba(253, 253, 253, 0.15), 0 8px 20px rgba(14, 14, 14, 0.5)",
            borderRadius: "200px / 50px",
          }}
        >
          {/* Water fill */}
          <div
            className="absolute bottom-0 left-0 w-full transition-all duration-1000 ease-in-out"
            style={{
              height: `${level}%`,
              background: getFillColor(),
              borderRadius: "200px / 40px",
              overflow: "hidden",
            }}
          >
            {/* Wave overlays */}
            <div
              className="absolute w-[200%] h-10 animate-waveSlow opacity-50"
              style={{
                top: "-10px",
                left: "-50%",
                background:
                  "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.5) 25%, rgba(255,255,255,0) 70%)",
                borderRadius: "50%",
                filter: "blur(3px)",
              }}
            />
            <div
              className="absolute w-[200%] h-8 animate-waveFast opacity-40"
              style={{
                top: "-8px",
                left: "-60%",
                background:
                  "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.6) 25%, rgba(255,255,255,0) 70%)",
                borderRadius: "50%",
                filter: "blur(2px)",
              }}
            />
          </div>
        </div>
      </div>

      <p className="mt-3 text-xl font-medium text-center">
        {status === "Sensor Disconnected"
          ? status
          : `${level}% — ${status} (${cmLevel.toFixed(1)} cm)`}
      </p>
    </div>
  );
}
