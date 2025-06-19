// SearchBox.jsx
import React, { useRef, useState } from "react";
import { Autocomplete } from "@react-google-maps/api";

export default function SearchBox({ onPlaceSelect, selectedPlace }) {
  const autocompleteRef = useRef(null);
  const [inputValue, setInputValue] = useState("");

  const handlePlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace();

    if (!place || !place.geometry || !place.geometry.location) {
      console.warn("No valid place selected");
      return;
    }

    // Extract place data
    const placeData = {
      id: place.place_id || `${Date.now()}-${Math.random()}`,
      name:
        place.name && place.name.length < 80 && !/^[\d\s,.-]+$/.test(place.name)
          ? place.name
          : (
              place.formatted_address ||
              place.vicinity ||
              place.name ||
              "Unknown Location"
            )
              .replace(/, (India|United States|Canada|United Kingdom)$/, "")
              .split(",")
              .slice(0, 2)
              .join(", "),
      position: {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      },
    };

    // Call the parent callback
    onPlaceSelect(placeData);

    // Clear the input field
    setInputValue("");

    // Optional: Clear the autocomplete selection
    if (autocompleteRef.current) {
      // Note: This method might not exist in all versions
      try {
        autocompleteRef.current.set("place", null);
      } catch (error) {
        console.log("Could not clear autocomplete place");
      }
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleLoad = (autocomplete) => {
    autocompleteRef.current = autocomplete;

    // Optional: Set autocomplete options
    autocomplete.setFields([
      "place_id",
      "formatted_address",
      "name",
      "geometry.location",
    ]);

    // Optional: Restrict to certain types (uncomment if needed)
    // autocomplete.setTypes(['establishment', 'geocode']);
  };

  return (
    <div className="bg-white rounded-2xl p-4">
      <h2 className="text-gray-500 text-sm font-medium mb-2">
        Search location
      </h2>
      <Autocomplete onLoad={handleLoad} onPlaceChanged={handlePlaceChanged}>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Enter a location..."
          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </Autocomplete>
      {selectedPlace && (
        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-gray-600">
          Selected: {selectedPlace.name.split(",")[0]}
        </div>
      )}
    </div>
  );
}
