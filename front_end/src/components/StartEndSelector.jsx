// src/components/StartEndSelector.jsx

import React from "react";
import { MapPin, Home, Plane, Building } from "lucide-react";

const StartEndSelector = ({
  locations,
  startIndex,
  endIndex,
  onStartChange,
  onEndChange,
  isClosedLoop,
  onClosedLoopChange,
}) => {
  if (locations.length < 2) return null;

  const getLocationIcon = (location) => {
    const name = location.name?.toLowerCase() || "";
    if (name.includes("airport")) return <Plane className="w-4 h-4" />;
    if (name.includes("hotel") || name.includes("home"))
      return <Home className="w-4 h-4" />;
    if (name.includes("office") || name.includes("building"))
      return <Building className="w-4 h-4" />;
    return <MapPin className="w-4 h-4" />;
  };

  return (
    <div className="bg-[#384344] rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[#89ECDB]">
          Route Configuration
        </h3>

        {/* Closed Loop Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-300">Round Trip</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isClosedLoop}
              onChange={(e) => onClosedLoopChange(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#89ECDB]"></div>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Start Point Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <Home className="w-4 h-4 inline mr-1" />
            Start Point
          </label>
          <select
            value={startIndex}
            onChange={(e) => onStartChange(parseInt(e.target.value))}
            className="w-full bg-[#2B3638] border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#89ECDB] focus:ring-1 focus:ring-[#89ECDB]"
          >
            {locations.map((location, index) => (
              <option key={index} value={index}>
                {location.name || `Location ${index + 1}`}
              </option>
            ))}
          </select>
        </div>

        {/* End Point Selector - only show if not closed loop */}
        {!isClosedLoop && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              End Point
            </label>
            <select
              value={endIndex ?? ""}
              onChange={(e) =>
                onEndChange(
                  e.target.value === "" ? null : parseInt(e.target.value)
                )
              }
              className="w-full bg-[#2B3638] border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#89ECDB] focus:ring-1 focus:ring-[#89ECDB]"
            >
              <option value="">Same as start (round trip)</option>
              {locations.map((location, index) => (
                <option
                  key={index}
                  value={index}
                  disabled={index === startIndex}
                >
                  {location.name || `Location ${index + 1}`}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Location Preview */}
      <div className="mt-4 p-3 bg-[#2B3638] rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-green-400">
            {getLocationIcon(locations[startIndex])}
            <span>
              Start:{" "}
              {locations[startIndex]?.name || `Location ${startIndex + 1}`}
            </span>
          </div>

          {!isClosedLoop && endIndex !== null && endIndex !== startIndex && (
            <div className="flex items-center gap-2 text-red-400">
              {getLocationIcon(locations[endIndex])}
              <span>
                End: {locations[endIndex]?.name || `Location ${endIndex + 1}`}
              </span>
            </div>
          )}

          {(isClosedLoop || endIndex === null || endIndex === startIndex) && (
            <div className="flex items-center gap-2 text-blue-400">
              <Home className="w-4 h-4" />
              <span>Returns to start</span>
            </div>
          )}
        </div>
      </div>

      {/* Route Type Description */}
      <div className="mt-2 text-xs text-gray-400">
        {isClosedLoop || endIndex === null || endIndex === startIndex
          ? "Round trip: Route will return to the starting point"
          : "One-way trip: Route will end at the selected destination"}
      </div>
    </div>
  );
};

export default StartEndSelector;
