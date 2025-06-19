// src/components/DashboardControls.jsx

import React from "react";
import SearchBox from "./SearchBox";

const DashboardControls = ({
  selectedPlace,
  onPlaceSelect,
  onAddLocation,
  isOptimizing,
  totalDistance,
  totalDuration,
  locationsCount,
  error,
}) => {
  return (
    <>
      {/* Error Display */}
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Controls */}
      <div className="grid grid-cols-6 gap-4 mb-4">
        <div className="col-span-2">
          <SearchBox
            onPlaceSelect={onPlaceSelect}
            selectedPlace={selectedPlace}
          />
        </div>
        <button
          onClick={onAddLocation}
          disabled={!selectedPlace || isOptimizing}
          className={`col-span-1 rounded-2xl p-3 transition-colors font-medium ${
            selectedPlace && !isOptimizing
              ? "bg-[#DFEABD] text-gray-700 hover:bg-[#D0DB9E]"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {isOptimizing ? "Optimizing..." : "Add Location"}
        </button>
        <div className="col-span-1 bg-[#CDDFFF] rounded-2xl p-3">
          <h2 className="text-gray-700 text-sm font-medium mb-1">Distance</h2>
          <div className="text-4xl font-bold text-[#7B68EE]">
            {totalDistance} km
          </div>
        </div>
        <div className="col-span-1 bg-[#CDDFFF] rounded-2xl p-3">
          <h2 className="text-gray-700 text-sm font-medium mb-1">Trip Time</h2>
          <div className="text-4xl font-bold text-[#7B68EE]">
            {totalDuration} min
          </div>
        </div>
        <div className="col-span-1 bg-[#DFEABD] rounded-2xl p-3">
          <h2 className="text-gray-700 text-sm font-medium mb-1">Locations</h2>
          <div className="text-4xl font-bold text-gray-700">
            {locationsCount}
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardControls;
