import { useState, useEffect } from "react";
import "../App.css"; // Ensure path is correct

export default function CameraFeed() {
  const [cameraLoading, setCameraLoading] = useState(true);
  const [cameraError, setCameraError] = useState(false);
  const [ledOn, setLedOn] = useState(false);
  const [cameraKey, setCameraKey] = useState(Date.now());

  const CAMERA_URL = "http://192.168.1.2:3000/camera/stream";

  const handleLEDChange = async (state) => {
    setLedOn(state);
    try {
      await fetch(`http://192.168.1.2:3000/led/${state ? "on" : "off"}`);
    } catch (err) {
      console.error("Error toggling LED:", err);
    }
  };

  useEffect(() => {
    if (cameraError) {
      const retry = setTimeout(() => {
        setCameraKey(Date.now());
        setCameraLoading(true);
        setCameraError(false);
      }, 5000);
      return () => clearTimeout(retry);
    }
  }, [cameraError]);

  return (
    <div className="w-full md:w-1/2 flex flex-col gap-4 px-4">
      <h3 className="text-lg font-semibold text-green-200 text-center md:text-left">
        Camera Feed
      </h3>

      {/* Camera Container */}
      <div className="relative bg-black flex items-center justify-center w-full h-64 sm:h-72 md:h-[420px] rounded-xl overflow-hidden border border-gray-700 shadow-lg">
        {cameraLoading && !cameraError && (
          <div className="absolute flex flex-col items-center gap-4 text-white">
            <div className="fan-container">
              <div className="pivot-with-blades">
                <div className="fan-blade blade1"></div>
                <div className="fan-blade blade2"></div>
                <div className="fan-blade blade3"></div>
                <div className="fan-blade blade4"></div>
                <div className="fan-center"></div>
              </div>
            </div>
            <span className="text-lg font-bold animate-pulse">Connecting...</span>
          </div>
        )}

        {cameraError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-14 h-14 text-red-500 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25m-7.5 3.75V5.25m12 13.5v-6m-16.5 6v-6M3 19.5h18M3 4.5h18"
              />
            </svg>
            <div className="text-red-500 text-xl font-bold mb-1">No Signal</div>
            <div className="text-gray-400 text-sm">Camera not detected</div>
          </div>
        )}

        <img
          key={cameraKey}
          src={CAMERA_URL}
          alt="ESP32-CAM Stream"
          onLoad={() => {
            setCameraLoading(false);
            setCameraError(false);
          }}
          onError={() => {
            setCameraLoading(false);
            setCameraError(true);
          }}
          className={`w-full h-full object-contain transition-opacity duration-700 ${
            cameraLoading || cameraError ? "opacity-0" : "opacity-100"
          }`}
        />
      </div>

      {/* ✅ Smooth Sliding & Glowing LED Toggle */}
      <div className="flex flex-col sm:flex-row justify-center md:justify-start items-center gap-3">
        <span className="text-gray-300 font-medium">LED Light</span>

        <label className="relative inline-flex items-center cursor-pointer select-none">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={ledOn}
            onChange={(e) => handleLEDChange(e.target.checked)}
          />

          {/* Track + Knob */}
          <div
            className={`relative w-16 h-8 rounded-full transition-colors duration-500 ease-in-out
              ${ledOn ? "bg-yellow-400 shadow-[0_0_15px_#facc15]" : "bg-gray-600"}
              ${ledOn ? "animate-pulse-glow" : ""}
            `}
          >
            <div
              className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full flex items-center justify-center text-xs font-bold shadow-md
                transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] transform
                ${ledOn ? "translate-x-8 rotate-45" : "translate-x-0 rotate-0"}
              `}
            >
              {ledOn ? "💡" : "❌"}
            </div>
          </div>
        </label>
      </div>
    </div>
  );
}
