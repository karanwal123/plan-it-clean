// src/components/RouteSummary.jsx

import React from "react";
import { pickColor } from "../styles/mapStyles";

const RouteSummary = ({
  orderedLocations,
  directionsResult,
  routeSummary,
  summaryType,
  isGeneratingSummary,
  onGenerateSummary,
}) => {
  return (
    <div className="bg-white rounded-2xl p-6 mt-4 shadow-md border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl text-gray-800 font-semibold">Route Summary</h3>
        {orderedLocations.length >= 2 && (
          <div className="flex gap-2">
            <button
              onClick={() => onGenerateSummary("standard")}
              disabled={isGeneratingSummary}
              className={`px-3 py-1 rounded-lg transition-colors text-sm font-medium border ${
                summaryType === "standard"
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300"
              }`}
            >
              Standard
            </button>
            <button
              onClick={() => onGenerateSummary("detailed")}
              disabled={isGeneratingSummary}
              className={`px-3 py-1 rounded-lg transition-colors text-sm font-medium border ${
                summaryType === "detailed"
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300"
              }`}
            >
              Detailed
            </button>
          </div>
        )}
      </div>

      {orderedLocations.length < 2 ? (
        <div className="text-center text-gray-500 italic">
          Add at least 2 locations to see the optimized route
        </div>
      ) : isGeneratingSummary ? (
        <div className="text-center text-gray-500 italic">
          Generating AI route summary...
        </div>
      ) : routeSummary ? (
        <div className="text-gray-800 leading-relaxed whitespace-pre-line">
          {routeSummary}
        </div>
      ) : (
        <div className="text-center text-gray-500 italic">
          Click "Standard" or "Detailed" to create an AI-powered route summary
        </div>
      )}

      {/* Route Sequence */}
      {orderedLocations.length >= 2 && directionsResult && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex justify-center flex-wrap gap-4">
            {orderedLocations.map((loc, i) => (
              <div key={i} className="flex items-center gap-2 text-gray-800">
                <span className="text-sm text-gray-500">{i + 1}.</span>
                <div
                  className="w-5 h-5 rounded-full border border-gray-300"
                  style={{ backgroundColor: pickColor(i) }}
                />
                <span className="text-sm">{loc.name.split(",")[0]}</span>
                {i < orderedLocations.length - 1 && (
                  <span className="mx-1 text-gray-400">→</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteSummary;
