import React from "react";
import "./FanAnimation.css"; // Ensure your spin classes are defined here

export default function FanAnimation({ isOn, speed }) {
  let spinClass = "";
  if (isOn) {
    if (speed === "slow") spinClass = "spin-slow";
    else if (speed === "medium") spinClass = "spin-medium";
    else if (speed === "fast") spinClass = "spin-fast";
  }

  return (
    <div className="fan-container">
      <img
        src="/fan.png"
        alt="Fan"
        className={`fan-blades ${spinClass}`}
      />
    </div>
  );
}
