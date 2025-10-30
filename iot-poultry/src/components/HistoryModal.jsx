export default function HistoryModal({ showHistory, setShowHistory, activeTab, openHistory, historyData }) {
  if (!showHistory) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-5 rounded-lg w-96">
        <div className="flex justify-between mb-4 border-b border-gray-700">
          {["today", "weekly", "monthly"].map((tab) => (
            <button
              key={tab}
              onClick={() => openHistory(tab)}
              className={`px-3 py-2 ${
                activeTab === tab
                  ? "text-green-400 border-b-2 border-green-400"
                  : "text-gray-400"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="max-h-60 overflow-y-auto">
          {historyData.length > 0 ? (
            historyData.map((item, idx) => (
              <div key={idx} className="p-2 border-b border-gray-700">
                <div className="font-bold">{item.temperature}°C</div>
                <div className="text-sm text-gray-400">{item.time || item.date}</div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-400">No data available</div>
          )}
        </div>

        <div className="mt-4 text-right">
          <button
            onClick={() => setShowHistory(false)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
