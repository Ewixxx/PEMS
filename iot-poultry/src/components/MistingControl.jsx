// src/components/MistingControl.jsx
import { useEffect, useState } from "react";
import { fetchMistStatus, toggleMist } from "../api";

export default function MistingControl() {
  const [mistOn, setMistOn] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch misting status on mount
  useEffect(() => {
    const loadStatus = async () => {
      try {
        const data = await fetchMistStatus();
        if (data) setMistOn(data.mistOn || data.isOn || false);
      } catch (err) {
        console.error("Error fetching mist status:", err);
      } finally {
        setLoading(false);
      }
    };
    loadStatus();
  }, []);

  // Toggle mist ON/OFF
  const handleToggle = async () => {
    const newState = !mistOn;
    setMistOn(newState);
    try {
      await toggleMist(newState); // simplified API call
    } catch (err) {
      console.error("Failed to toggle mist:", err);
    }
  };

  if (loading) return <p className="text-gray-400">Loading mist status...</p>;

  return (
    <div className="bg-gray-800/40 p-6 rounded-2xl shadow-lg text-center space-y-4 w-full md:w-auto">
      <h3 className="text-2xl font-bold text-blue-400 mb-2">💧 Misting Control</h3>

      <button
        onClick={handleToggle}
        className={`px-6 py-3 rounded-2xl font-semibold text-white transition-all duration-200 ${
          mistOn
            ? "bg-red-600 hover:bg-red-700"
            : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {mistOn ? "Turn OFF" : "Turn ON"}
      </button>

      <p className="text-gray-300">
        Status:{" "}
        <span
          className={`font-semibold ${
            mistOn ? "text-green-400" : "text-red-400"
          }`}
        >
          {mistOn ? "ON" : "OFF"}
        </span>
      </p>
    </div>
  );
}
