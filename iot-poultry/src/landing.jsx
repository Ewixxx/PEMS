// src/Landing.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

import CameraFeed from "./components/CameraFeed";
import TemperatureMonitor from "./components/TemperatureMonitor";
import HistoryModal from "./components/HistoryModal";
import WaterLevel from "./components/WaterLevel";
import FanAnimation from "./components/FanAnimation";
import MistingControl from "./components/MistingControl";

import {
  fetchScheduled,
  fetchLatest,
  fetchHistory,
  fetchLocation,
  fetchFanStatus,
  updateFanSpeed,
  fetchMistStatus,
  toggleMist,
} from "./api";

export default function Landing() {
  const [userLoaded, setUserLoaded] = useState(false);
  const [currentTemp, setCurrentTemp] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [location, setLocation] = useState("Loading...");
  const [showHistory, setShowHistory] = useState(false);
  const [activeTab, setActiveTab] = useState("today");
  const [historyData, setHistoryData] = useState([]);
  const [temps, setTemps] = useState([]);
  const [fanStatus, setFanStatus] = useState({
    exhaust: { isOn: false, speed: "off", rpm: 0, power: 0, mode: "auto", manualOverride: false },
    intake: { isOn: false, speed: "off", rpm: 0, power: 0, mode: "auto", manualOverride: false },
  });
  const [sensorData, setSensorData] = useState({ waterLevel: 0, waterLevelPercent: 0 });
  const [sensorConnected, setSensorConnected] = useState(false);
  const [mistOn, setMistOn] = useState(false);

  const navigate = useNavigate();
  const fanSpeedValues = ["off", "slow", "medium", "fast"];

  // ----------------- Firebase Auth -----------------
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        localStorage.removeItem("accessToken");
        navigate("/", { replace: true });
      } else {
        setUserLoaded(true);
        user.getIdToken().then((token) =>
          localStorage.setItem("accessToken", token)
        );
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // ----------------- Open history modal -----------------
  const openHistory = async (tab) => {
    setActiveTab(tab);
    const data = await fetchHistory(tab);
    setHistoryData(data);
    setShowHistory(true);
  };

  // ----------------- Load initial data -----------------
  useEffect(() => {
    if (!userLoaded) return;

    const init = async () => {
      try {
        const [scheduled, latest, loc, fans, mist] = await Promise.all([
          fetchScheduled(),
          fetchLatest(),
          fetchLocation(),
          fetchFanStatus(),
          fetchMistStatus(),
        ]);

        setTemps(scheduled);

        // Proper sensorConnected logic
        const connected =
          latest &&
          latest.createdAt &&
          latest.waterLevel !== null &&
          latest.waterLevel !== undefined;
        setSensorConnected(connected);

        setCurrentTemp(latest?.temperature ?? 0);
        setSensorData({
          waterLevel: latest?.waterLevel ?? 0,
          waterLevelPercent: latest?.waterLevelPercent ?? 0,
        });
        setLocation(loc);

        setFanStatus({
          exhaust: { ...fanStatus.exhaust, ...fans.exhaust, manualOverride: false },
          intake: { ...fanStatus.intake, ...fans.intake, manualOverride: false },
        });

        setMistOn(mist?.isOn ?? false);
      } catch (err) {
        console.error("Failed to load initial data:", err);
        setSensorConnected(false);
      }
    };

    init();
  }, [userLoaded]);

  // ----------------- Periodic updates -----------------
  useEffect(() => {
    if (!userLoaded) return;

    const interval = setInterval(async () => {
      try {
        const latest = await fetchLatest();
        setSensorConnected(
          latest &&
          latest.createdAt &&
          latest.waterLevel !== null &&
          latest.waterLevel !== undefined
        );

        if (latest?.temperature !== undefined) setCurrentTemp(latest.temperature);
        setSensorData({
          waterLevel: latest?.waterLevel ?? 0,
          waterLevelPercent: latest?.waterLevelPercent ?? 0,
        });

        const fans = await fetchFanStatus();
        setFanStatus((prev) => ({
          exhaust: prev.exhaust.manualOverride ? prev.exhaust : { ...prev.exhaust, ...fans.exhaust },
          intake: prev.intake.manualOverride ? prev.intake : { ...prev.intake, ...fans.intake },
        }));

        const mist = await fetchMistStatus();
        setMistOn(mist?.isOn ?? false);
      } catch (err) {
        console.error("Periodic update failed:", err);
        setSensorConnected(false);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [userLoaded]);

  // ----------------- Update current time -----------------
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // ----------------- Logout -----------------
  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("accessToken");
      navigate("/", { replace: true });
    } catch (error) {
      console.error(error);
      alert("Logout failed");
    }
  };

  if (!userLoaded) return null;

  return (
    <div className="min-h-screen flex flex-col bg-black/70 text-white">
      {/* Navbar */}
      <nav className="bg-gray-800 px-6 py-3 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold text-green-400">
          Poultry Environment Monitoring System
        </h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg transition"
        >
          Logout
        </button>
      </nav>

      {/* Main Content */}
      <main className="flex-grow p-4">
        <div className="flex flex-col md:flex-row gap-6">
          <CameraFeed />
          <TemperatureMonitor
            currentTemp={currentTemp}
            currentTime={currentTime}
            location={location}
            temps={temps}
            openHistory={openHistory}
          />
        </div>

        {/* Water + Misting + Fans Section */}
        <div className="mt-10 flex flex-col md:flex-row items-start gap-10">
          {/* Water Info */}
          <div className="flex flex-col md:flex-row items-center gap-10 bg-gray-800/40 p-6 rounded-2xl shadow-lg w-full md:max-w-5xl mx-auto">
            <WaterLevel
              latestSensor={sensorData}
              sensorConnected={sensorConnected}
            />

            <div className="flex-1 text-left space-y-4">
              <h3 className="text-2xl font-bold text-green-400 mb-2">
                Water Tank Information
              </h3>

              {!sensorConnected && (
                <p className="text-red-400 font-semibold text-lg">
                  ⚠️ Sensor Disconnected
                </p>
              )}

              <p className="text-lg">
                <span className="font-semibold text-gray-300">Capacity:</span> 5 Liters
              </p>
              <p className="text-lg">
                <span className="font-semibold text-gray-300">Height:</span> 50 cm
              </p>
              <div className="space-y-1">
                <p className="font-semibold text-gray-300">Markings:</p>
                <ul className="list-disc list-inside text-gray-400">
                  <li>
                    <span className="text-green-400 font-semibold">Full</span> — 80–100%
                  </li>
                  <li>
                    <span className="text-yellow-400 font-semibold">Critical</span> — 20–49%
                  </li>
                  <li>
                    <span className="text-red-400 font-semibold">Empty</span> — below 20%
                  </li>
                </ul>
              </div>

              <MistingControl mistOn={mistOn} setMistOn={setMistOn} toggleMist={toggleMist} />
            </div>
          </div>

          {/* Fans Section */}
          <div className="flex justify-center items-start gap-10 w-full py-6">
            {["exhaust", "intake"].map((type) => (
              <div
                key={type}
                className="flex flex-col items-center justify-between bg-gray-800/50 p-8 rounded-2xl shadow-2xl w-[260px] h-[480px] transition-transform hover:scale-105"
              >
                <div className="flex justify-center mb-6 scale-[1.4]">
                  <FanAnimation
                    isOn={fanStatus[type].isOn || fanStatus[type].speed !== "off"}
                    speed={fanStatus[type].speed}
                  />
                </div>

                <div className="text-left space-y-3 w-full">
                  <h3 className="font-bold text-green-400 text-xl text-center">
                    {type.charAt(0).toUpperCase() + type.slice(1)} Fan
                  </h3>
                  <p className="text-sm text-center">Speed: {fanStatus[type].speed}</p>
                  <p className="text-sm text-center">Mode: {fanStatus[type].mode}</p>
                </div>

                <div className="w-full mt-6">
                  <input
                    type="range"
                    min="0"
                    max="3"
                    value={fanSpeedValues.indexOf(fanStatus[type].speed)}
                    className="w-full accent-green-400 h-3 rounded-lg"
                    onChange={async (e) => {
                      const newSpeed = fanSpeedValues[parseInt(e.target.value)];
                      setFanStatus((prev) => ({
                        ...prev,
                        [type]: {
                          ...prev[type],
                          speed: newSpeed,
                          isOn: newSpeed !== "off",
                          mode: "manual",
                          manualOverride: true,
                        },
                      }));
                      try {
                        await updateFanSpeed(type, newSpeed, "manual");
                      } catch (err) {
                        console.error("Failed to update fan speed:", err);
                      }
                    }}
                  />
                  <div className="flex justify-between w-full text-xs mt-2 text-gray-300">
                    {fanSpeedValues.map((s) => (
                      <span key={s}>{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

        <HistoryModal
          showHistory={showHistory}
          setShowHistory={setShowHistory}
          activeTab={activeTab}
          openHistory={openHistory}
          historyData={historyData}
        />
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-6 mt-auto">
        <div className="flex flex-col md:flex-row justify-between items-center max-w-6xl mx-auto px-4">
          <p className="text-sm text-center md:text-left mb-3 md:mb-0">
            © {new Date().getFullYear()} Pateros Technological College. All rights reserved.
          </p>
          <div className="flex space-x-5">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition">
              <i className="fab fa-facebook-f text-xl"></i>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-sky-400 transition">
              <i className="fab fa-twitter text-xl"></i>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-pink-500 transition">
              <i className="fab fa-instagram text-xl"></i>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
