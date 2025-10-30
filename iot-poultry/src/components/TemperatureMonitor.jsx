import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// ✅ Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function TemperatureMonitor({ currentTemp, currentTime, location, temps, openHistory }) {
  const chartData = {
    labels: temps.map((t) => t.label),
    datasets: [
      {
        label: "Scheduled Temp (°C)",
        data: temps.map((t) => t.temperature),
        borderColor: "lime",
        backgroundColor: "rgba(0,255,0,0.2)",
        tension: 0.4,
      },
    ],
  };

  const formatDateTime = (date) =>
    date.toLocaleString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

  return (
    <div className="md:w-1/2">
      <h3 className="text-lg font-semibold mb-3 text-green-200">Temperature Monitoring</h3>

      {currentTemp !== null && (
        <div className="mb-3 p-3 bg-green-700 rounded text-center text-2xl font-bold">
          <div>Current Temp: {currentTemp}°C</div>
          <div className="text-sm text-gray-200 mt-1">{formatDateTime(currentTime)}</div>
          <div className="text-sm text-gray-200 mt-1">Location: {location}</div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4">
        <div className="md:w-1/2 h-64 md:h-auto">
          <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
        <div className="md:w-1/2 grid grid-cols-2 md:grid-cols-3 gap-3">
          {temps.map((t) => {
            const now = new Date();
            let hour = now.getHours();
            const isPM = hour >= 12;
            hour = hour % 12 || 12;

            const [time, period] = t.label.split(" ");
            const cardHour = parseInt(time.split(":")[0], 10);
            const cardIsPM = period === "PM";

            const isCurrent = cardHour === hour && cardIsPM === isPM;

            return (
              <div
                key={t.label}
                className={`p-3 rounded text-center ${
                  isCurrent ? "bg-green-600 border-2 border-green-400" : "bg-gray-800"
                }`}
              >
                <div className="text-sm text-gray-300">{t.label}</div>
                <div className="mt-2 text-xl font-bold text-green-300">{t.temperature}°C</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex justify-center">
        <button
          onClick={() => openHistory("today")}
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white font-semibold"
        >
          View History
        </button>
      </div>
    </div>
  );
}
