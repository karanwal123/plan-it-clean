// src/components/Dashboard.jsx

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  GoogleMap,
  Marker,
  DirectionsRenderer,
  useLoadScript,
} from "@react-google-maps/api";
import SearchBox from "./SearchBox";
import { computeOptimalOrder } from "../utils/tsp";
import {
  generateRouteSummary,
  generateDetailedRouteSummary,
  getLocationInsights,
} from "../utils/routeSummary";

const libraries = ["places"]; // load Places library once

export default function Dashboard() {
  // Load Google Maps JS API
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  // Raw and optimized locations
  const [locations, setLocations] = useState([]);
  const [orderedLocations, setOrderedLocations] = useState([]);

  // Selected place from SearchBox
  const [selectedPlace, setSelectedPlace] = useState(null);

  // Directions, distance & duration
  const [directionsResult, setDirectionsResult] = useState(null);
  const [totalDistance, setTotalDistance] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);

  // Loading and error states
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [routeSummary, setRouteSummary] = useState("");
  const [summaryType, setSummaryType] = useState("standard"); // "standard" or "detailed"
  const [locationInsights, setLocationInsights] = useState({});
  const [error, setError] = useState("");

  // Reference to map instance
  const mapRef = useRef(null);

  // On map load
  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  // Handle place selected by SearchBox
  const handlePlaceSelect = (place) => {
    setSelectedPlace(place);
    setError(""); // Clear any previous errors
  };

  // Remove location
  const removeLocation = (indexToRemove) => {
    const updated = locations.filter((_, index) => index !== indexToRemove);
    setLocations(updated);

    if (updated.length < 2) {
      setOrderedLocations([]);
      setDirectionsResult(null);
      setRouteSummary("");
      setTotalDistance(0);
      setTotalDuration(0);
    } else {
      // Recompute optimal order after removal
      optimizeRoute(updated);
    }
  };

  // Optimize route helper function
  async function optimizeRoute() {
    setIsOptimizing(true);
    try {
      const tour = await computeOptimalOrder(locations, {
        startIndex,
        endIndex,
        fixedStart: true,
        fixedEnd: !isClosedLoop && endIndex != null && endIndex !== startIndex,
        isClosedLoop,
      });
      setOrderedLocations(tour.map((i) => locations[i]));
    } finally {
      setIsOptimizing(false);
    }
  }

  // Add selected place to locations and recompute optimal order
  const addLocationToMap = async () => {
    if (!selectedPlace) return;

    // Check for duplicates
    const isDuplicate = locations.some(
      (loc) =>
        loc.position.lat === selectedPlace.position.lat &&
        loc.position.lng === selectedPlace.position.lng
    );

    if (isDuplicate) {
      setError("This location has already been added.");
      return;
    }

    const updated = [...locations, selectedPlace];
    setLocations(updated);
    setSelectedPlace(null);

    if (updated.length >= 2) {
      await optimizeRoute(updated);
    } else {
      setOrderedLocations(updated);
    }
  };

  // Generate AI route summary
  const generateSummary = async (type = summaryType) => {
    if (orderedLocations.length < 2) return;

    setIsGeneratingSummary(true);
    try {
      const summary =
        type === "detailed"
          ? await generateDetailedRouteSummary(orderedLocations)
          : await generateRouteSummary(orderedLocations);
      setRouteSummary(summary);
      setSummaryType(type);
    } catch (err) {
      console.error("Failed to generate summary:", err);
      setRouteSummary("Unable to generate route summary at this time.");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  // Get insights for a specific location
  const fetchLocationInsight = async (locationName, locationId) => {
    if (locationInsights[locationId]) return; // Already fetched

    try {
      const insight = await getLocationInsights(locationName);
      if (insight) {
        setLocationInsights((prev) => ({
          ...prev,
          [locationId]: insight,
        }));
      }
    } catch (err) {
      console.error("Failed to get location insight:", err);
    }
  };

  // When orderedLocations change, compute directions and generate summary
  useEffect(() => {
    if (orderedLocations.length < 2 || !isLoaded) {
      setDirectionsResult(null);
      setTotalDistance(0);
      setTotalDuration(0);
      setRouteSummary("");
      return;
    }

    const service = new window.google.maps.DirectionsService();
    const origin = orderedLocations[0].position;
    const destination = orderedLocations[orderedLocations.length - 1].position;
    const waypoints = orderedLocations
      .slice(1, -1)
      .map((l) => ({ location: l.position, stopover: true }));

    service.route(
      {
        origin,
        destination,
        waypoints,
        travelMode: window.google.maps.TravelMode.DRIVING,
        optimizeWaypoints: false, // already optimized
      },
      (result, status) => {
        if (status === "OK" && result) {
          setDirectionsResult(result);
          const route = result.routes[0];
          let dist = 0;
          let dur = 0;
          route.legs.forEach((leg) => {
            dist += leg.distance.value;
            dur += leg.duration.value;
          });
          setTotalDistance(Math.round(dist / 1000));
          setTotalDuration(Math.round(dur / 60));

          // Auto-generate summary when route is ready
          generateSummary();
        } else {
          console.error("Directions request failed:", status);
          setDirectionsResult(null);
          setError("Failed to calculate route directions.");
        }
      }
    );
  }, [orderedLocations, isLoaded]);

  // Clear all locations
  const clearAllLocations = () => {
    setLocations([]);
    setOrderedLocations([]);
    setDirectionsResult(null);
    setRouteSummary("");
    setTotalDistance(0);
    setTotalDuration(0);
    setError("");
  };

  // Define color palette
  function pickColor(index) {
    const palette = [
      "#EF4444", // red
      "#10B981", // green
      "#3B82F6", // blue
      "#F59E0B", // amber
      "#8B5CF6", // violet
      "#14B8A6", // teal
      "#DB2777", // pink
      "#F97316", // orange
      "#06B6D4", // cyan
      "#84CC16", // lime
    ];
    return palette[index % palette.length];
  }

  if (loadError)
    return (
      <div className="min-h-screen bg-[#2B3638] text-white p-6 flex items-center justify-center">
        <div className="text-red-400">
          Error loading Google Maps. Please check your API key.
        </div>
      </div>
    );

  if (!isLoaded)
    return (
      <div className="min-h-screen bg-[#2B3638] text-white p-6 flex items-center justify-center">
        <div className="text-[#89ECDB]">Loading Google Maps…</div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#2B3638] text-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-bold text-[#89ECDB]">Planit</h1>
        {locations.length > 0 && (
          <button
            onClick={clearAllLocations}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

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
            onPlaceSelect={handlePlaceSelect}
            selectedPlace={selectedPlace}
          />
        </div>
        <button
          onClick={addLocationToMap}
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
          <div className="text-2xl font-bold text-[#7B68EE]">
            {totalDistance} km
          </div>
        </div>
        <div className="col-span-1 bg-[#CDDFFF] rounded-2xl p-3">
          <h2 className="text-gray-700 text-sm font-medium mb-1">Trip Time</h2>
          <div className="text-2xl font-bold text-[#7B68EE]">
            {totalDuration} min
          </div>
        </div>
        <div className="col-span-1 bg-[#DFEABD] rounded-2xl p-3">
          <h2 className="text-gray-700 text-sm font-medium mb-1">Locations</h2>
          <div className="text-2xl font-bold text-gray-700">
            {locations.length}
          </div>
        </div>
      </div>

      {/* Map and Summary */}
      <div className="flex flex-col mb-4">
        <div className="h-96 bg-gray-300 relative rounded-2xl overflow-hidden">
          <GoogleMap
            onLoad={onMapLoad}
            mapContainerClassName="w-full h-full"
            center={
              orderedLocations.length
                ? orderedLocations[0].position
                : { lat: 28.6139, lng: 77.209 }
            }
            zoom={orderedLocations.length ? 12 : 10}
          >
            {orderedLocations.map((loc, idx) => (
              <Marker
                key={loc.id}
                position={loc.position}
                label={{
                  text: String.fromCharCode(65 + idx),
                  color: "#fff",
                  fontWeight: "600",
                  fontSize: "14px",
                }}
                icon={{
                  path: window.google.maps.SymbolPath.CIRCLE,
                  fillColor: pickColor(idx),
                  fillOpacity: 1,
                  strokeColor: "#fff",
                  strokeWeight: 3,
                  scale: 15,
                }}
              />
            ))}
            {directionsResult && (
              <DirectionsRenderer
                options={{
                  directions: directionsResult,
                  suppressMarkers: true,
                  polylineOptions: {
                    strokeColor: "#2563eb",
                    strokeWeight: 5,
                    strokeOpacity: 0.8,
                  },
                }}
              />
            )}
          </GoogleMap>
        </div>

        {/* AI Generated Summary */}
        <div className="bg-blue-600 rounded-2xl p-6 mt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl text-white">Route Summary</h3>
            {orderedLocations.length >= 2 && (
              <div className="flex gap-2">
                <button
                  onClick={() => generateSummary("standard")}
                  disabled={isGeneratingSummary}
                  className={`px-3 py-1 rounded-lg transition-colors text-sm ${
                    summaryType === "standard"
                      ? "bg-blue-800 text-white"
                      : "bg-blue-700 hover:bg-blue-800 text-white"
                  }`}
                >
                  Standard
                </button>
                <button
                  onClick={() => generateSummary("detailed")}
                  disabled={isGeneratingSummary}
                  className={`px-3 py-1 rounded-lg transition-colors text-sm ${
                    summaryType === "detailed"
                      ? "bg-blue-800 text-white"
                      : "bg-blue-700 hover:bg-blue-800 text-white"
                  }`}
                >
                  Detailed
                </button>
              </div>
            )}
          </div>

          {orderedLocations.length < 2 ? (
            <div className="text-center text-blue-100">
              Add at least 2 locations to see the optimized route
            </div>
          ) : isGeneratingSummary ? (
            <div className="text-center text-blue-100">
              Generating AI route summary...
            </div>
          ) : routeSummary ? (
            <div className="text-white leading-relaxed whitespace-pre-line">
              {routeSummary}
            </div>
          ) : (
            <div className="text-center text-blue-100">
              Click "Standard" or "Detailed" to create an AI-powered route
              summary
            </div>
          )}

          {/* Route Sequence */}
          {orderedLocations.length >= 2 && directionsResult && (
            <div className="mt-6 pt-4 border-t border-blue-500">
              <div className="flex justify-center flex-wrap gap-4">
                {orderedLocations.map((loc, i) => (
                  <div key={i} className="flex items-center gap-2 text-white">
                    <span className="text-sm">{i + 1}.</span>
                    <div
                      className="w-5 h-5 rounded-full"
                      style={{ backgroundColor: pickColor(i) }}
                    />
                    <span className="text-sm">{loc.name.split(",")[0]}</span>
                    {i < orderedLocations.length - 1 && (
                      <span className="mx-1 text-blue-200">→</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Added Locations List */}
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
                        fetchLocationInsight(loc.name.split(",")[0], loc.id)
                      }
                      className="text-blue-500 hover:text-blue-700 transition-colors text-xs px-1"
                      title="Get insights"
                    >
                      💡
                    </button>
                    <button
                      onClick={() =>
                        removeLocation(
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
    </div>
  );
}
