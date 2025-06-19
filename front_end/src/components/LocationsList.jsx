// src/components/LocationsList.jsx

import React from "react";
import { pickColor } from "../styles/mapStyles";

const LocationsList = ({
  orderedLocations,
  locations,
  locationInsights,
  onRemoveLocation,
  onFetchLocationInsight,
}) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-white border-2 border-[#B4CCFF] rounded-2xl p-4 col-span-1">
        <h2 className="text-gray-700 text-lg font-bold mb-4">
          Added Locations ({locations.length}):
        </h2>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {orderedLocations.length > 0 ? (
            orderedLocations.map((loc, idx) => (
              <div
                key={loc.id}
                className="flex items-center gap-2 p-2 bg-gray-50 rounded group hover:bg-gray-100 transition-colors"
              >
                <div
                  className="w-4 h-4 flex items-center justify-center rounded-full text-white text-xs font-semibold flex-shrink-0"
                  style={{ backgroundColor: pickColor(idx) }}
                >
                  {String.fromCharCode(65 + idx)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-700 truncate">
                    {loc.name.split(",")[0]}
                  </div>
                  {locationInsights[loc.id] && (
                    <div className="text-xs text-gray-500 mt-1 leading-tight">
                      {locationInsights[loc.id]}
                    </div>
                  )}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() =>
                      onFetchLocationInsight(loc.name.split(",")[0], loc.id)
                    }
                    className="text-blue-500 hover:text-blue-700 transition-colors text-xs px-1"
                    title="Get insights"
                  >
                    💡
                  </button>
                  <button
                    onClick={() =>
                      onRemoveLocation(
                        locations.findIndex((l) => l.id === loc.id)
                      )
                    }
                    className="text-red-500 hover:text-red-700 transition-colors text-xs px-1"
                    title="Remove location"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-gray-500 text-sm text-center py-4">
              No locations added yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationsList;
