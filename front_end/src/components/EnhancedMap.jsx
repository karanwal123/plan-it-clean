// src/components/EnhancedMap.jsx

import React, { useState } from "react";
import { GoogleMap, Marker, DirectionsRenderer } from "@react-google-maps/api";
import {
  createCustomPinMarker,
  getEnhancedPathOptions,
  darkMapStyle,
  lightMapStyle,
  pickColor,
} from "../styles/mapStyles";

const EnhancedMap = ({
  onMapLoad,
  orderedLocations,
  directionsResult,
  isLoaded,
}) => {
  const [mapType, setMapType] = useState("roadmap");
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  if (!isLoaded) {
    return (
      <div className="h-96 bg-gray-300 relative rounded-2xl overflow-hidden flex items-center justify-center">
        <div className="text-gray-600">Loading map...</div>
      </div>
    );
  }

  const mapOptions = {
    styles: isDarkTheme ? darkMapStyle : lightMapStyle,
    disableDefaultUI: false,
    zoomControl: true,
    mapTypeControl: true,
    streetViewControl: true,
    fullscreenControl: true,
    mapTypeId: mapType,
    gestureHandling: "cooperative",
  };

  return (
    <div className="h-96 bg-gray-300 relative rounded-2xl overflow-hidden">
      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        {/* Map Type Selector */}
        <select
          value={mapType}
          onChange={(e) => setMapType(e.target.value)}
          className="bg-gray-600 border border-gray-300 rounded px-3 py-1 text-sm shadow-sm"
        >
          <option value="roadmap">Road</option>
          <option value="satellite">Satellite</option>
          <option value="hybrid">Hybrid</option>
          <option value="terrain">Terrain</option>
        </select>

        {/* Theme Toggle */}
        <button
          onClick={() => setIsDarkTheme(!isDarkTheme)}
          className="bg-gray-600 border border-gray-300 rounded px-3 py-1 text-sm shadow-sm hover:bg-black"
        >
          {isDarkTheme ? "Light" : "Dark"}
        </button>
      </div>

      <GoogleMap
        onLoad={onMapLoad}
        mapContainerClassName="w-full h-full"
        center={
          orderedLocations.length
            ? orderedLocations[0].position
            : { lat: 28.6139, lng: 77.209 }
        }
        zoom={orderedLocations.length ? 12 : 10}
        options={mapOptions}
      >
        {orderedLocations.map((loc, idx) => (
          <Marker
            key={loc.id}
            position={loc.position}
            icon={createCustomPinMarker(pickColor(idx), idx)}
            animation={window.google.maps.Animation.DROP}
            label={{
              text: (idx + 1).toString(),
              color: "white",
              fontSize: "12px",
              fontWeight: "bold",
            }}
          />
        ))}
        {directionsResult && (
          <DirectionsRenderer
            options={{
              directions: directionsResult,
              suppressMarkers: true,
              polylineOptions: getEnhancedPathOptions(),
            }}
          />
        )}
      </GoogleMap>
    </div>
  );
};

export default EnhancedMap;
