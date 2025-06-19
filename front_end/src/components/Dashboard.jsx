// src/components/Dashboard.jsx (Weather Integration)
import { Link } from "react-router-dom";
import React, { useState, useRef, useCallback, useEffect } from "react";
import axios from "axios";
import { useLoadScript } from "@react-google-maps/api";
import Footer from "./Footer";
// Component imports
import DashboardControls from "./DashboardControls";
import EnhancedMap from "./EnhancedMap";
import RouteSummary from "./RouteSummary";
import LocationsList from "./LocationsList";
import WeatherInsights from "./WeatherInsights";
import ExportButton from "./ExportButton";
// Utility imports
import { computeOptimalOrder } from "../utils/tsp";
import {
  generateRouteSummary,
  generateDetailedRouteSummary,
  getLocationInsights,
} from "../utils/routeSummary";
import UserProfile from "./UserProfile";

import { getLocationWeather } from "../utils/weatherService";
import { generateWeatherRecommendations } from "../utils/weatherOptimizer";
import TripCompanionChat from "./TripCompanionChat";
const libraries = ["places"];

export default function Dashboard() {
  // Load Google Maps JS API
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });
  // Inside your Dashboard component
  const [showProfile, setShowProfile] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  // Existing state management
  const [locations, setLocations] = useState([]);
  const [orderedLocations, setOrderedLocations] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [directionsResult, setDirectionsResult] = useState(null);
  const [totalDistance, setTotalDistance] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [routeSummary, setRouteSummary] = useState("");
  const [summaryType, setSummaryType] = useState("standard");
  const [locationInsights, setLocationInsights] = useState({});
  const [error, setError] = useState("");

  // New weather-related state
  const [locationsWithWeather, setLocationsWithWeather] = useState([]);
  const [weatherRecommendations, setWeatherRecommendations] = useState([]);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);

  const mapRef = useRef(null);
  const handleUpdateUser = async (updatedData) => {
    try {
      const response = await axios.put("/user/profile", updatedData, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      setCurrentUser(response.data.user);
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleDeleteRoute = async (routeId) => {
    try {
      await axios.delete(`/api/user/routes/${routeId}`, {
        withCredentials: true,
      });
      fetchUserData(); // Assuming you have a fetchUserData function
    } catch (error) {
      console.error("Error deleting route:", error);
    }
  };

  useEffect(() => {
    console.log("onUpdateUser is:", typeof onUpdateUser); // Should log 'function'
  }, []);

  const handleLoadRoute = async (routeId) => {
    try {
      const response = await axios.get(`/api/user/routes/${routeId}`, {
        withCredentials: true,
      });

      loadRouteIntoPlanner(response.data.route);
    } catch (error) {
      console.error("Error loading route:", error);
    }
  };

  // In your JSX

  // Weather data fetching
  const fetchWeatherForLocations = async (locationsList) => {
    if (locationsList.length === 0) {
      setLocationsWithWeather([]);
      setWeatherRecommendations([]);
      return;
    }

    setIsLoadingWeather(true);
    try {
      const weatherPromises = locationsList.map(async (location) => {
        const weather = await getLocationWeather(
          location.position.lat,
          location.position.lng
        );
        return { ...location, weather };
      });

      const locationsWithWeatherData = await Promise.all(weatherPromises);
      setLocationsWithWeather(locationsWithWeatherData);

      // Generate recommendations
      const recommendations = generateWeatherRecommendations(
        locationsWithWeatherData
      );
      setWeatherRecommendations(recommendations);
    } catch (err) {
      console.error("Failed to fetch weather data:", err);
      setLocationsWithWeather(
        locationsList.map((loc) => ({ ...loc, weather: null }))
      );
    } finally {
      setIsLoadingWeather(false);
    }
  };

  // Existing event handlers (modified to include weather fetching)
  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const handlePlaceSelect = (place) => {
    setSelectedPlace(place);
    setError("");
  };

  const removeLocation = (indexToRemove) => {
    const updated = locations.filter((_, index) => index !== indexToRemove);
    setLocations(updated);

    if (updated.length < 2) {
      setOrderedLocations([]);
      setDirectionsResult(null);
      setRouteSummary("");
      setTotalDistance(0);
      setTotalDuration(0);
      setLocationsWithWeather([]);
      setWeatherRecommendations([]);
    } else {
      optimizeRoute(updated);
    }
  };

  const optimizeRoute = async (locationsList) => {
    if (locationsList.length < 2) return;

    setIsOptimizing(true);
    setError("");

    try {
      const tour = await computeOptimalOrder(locationsList);
      const reordered = tour.map((i) => locationsList[i]);
      setOrderedLocations(reordered);

      // Fetch weather data for optimized route
      await fetchWeatherForLocations(reordered);
    } catch (err) {
      console.error("Failed to compute optimal order:", err);
      setError("Failed to optimize route. Using original order.");
      setOrderedLocations(locationsList);
      await fetchWeatherForLocations(locationsList);
    } finally {
      setIsOptimizing(false);
    }
  };

  const addLocationToMap = async () => {
    if (!selectedPlace) return;

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
      await fetchWeatherForLocations(updated);
    }
  };

  const generateSummary = async (type = summaryType) => {
    if (orderedLocations.length < 2) return;

    setIsGeneratingSummary(true);
    try {
      // Include weather data in summary generation
      const summary =
        type === "detailed"
          ? await generateDetailedRouteSummary(
              orderedLocations,
              locationsWithWeather
            )
          : await generateRouteSummary(orderedLocations, locationsWithWeather);
      setRouteSummary(summary);
      setSummaryType(type);
    } catch (err) {
      console.error("Failed to generate summary:", err);
      setRouteSummary("Unable to generate route summary at this time.");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const fetchLocationInsight = async (locationName, locationId) => {
    if (locationInsights[locationId]) return;

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

  const clearAllLocations = () => {
    setLocations([]);
    setOrderedLocations([]);
    setDirectionsResult(null);
    setRouteSummary("");
    setTotalDistance(0);
    setTotalDuration(0);
    setError("");
    setLocationsWithWeather([]);
    setWeatherRecommendations([]);
  };

  // Existing useEffect for directions (unchanged)
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
        optimizeWaypoints: false,
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
          generateSummary();
        } else {
          console.error("Directions request failed:", status);
          setDirectionsResult(null);
          setError("Failed to calculate route directions.");
        }
      }
    );
  }, [orderedLocations, isLoaded]);

  // Loading states
  if (loadError) {
    return (
      <div className="min-h-screen bg-[#2B3638] text-white p-6 flex items-center justify-center">
        <div className="text-red-400">
          Error loading Google Maps. Please check your API key.
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#2B3638] text-white p-6 flex items-center justify-center">
        <div className="text-[#89ECDB]">Loading Google Maps…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#2B3638] text-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        {/* Left side */}
        <div>
          <h1 className="text-4xl font-bold text-[#89ECDB]">Plan-it</h1>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <Link
            to="/profile"
            className="text-white bg-[#3A4B4F] hover:bg-[#4F6267] px-4 py-2 rounded-lg transition-colors"
          >
            Go to Profile
          </Link>

          {/* Export Button */}
          {orderedLocations.length >= 2 && (
            <ExportButton
              routeData={{
                orderedLocations,
                totalDistance,
                totalDuration,
                routeSummary,
                locationsWithWeather,
                weatherRecommendations,
                directionsResult,
              }}
              disabled={isOptimizing || isGeneratingSummary || isLoadingWeather}
            />
          )}

          {/* Clear All */}
          {locations.length > 0 && (
            <button
              onClick={clearAllLocations}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* idhar bakchodi ho rhi hai */}
      {showProfile && (
        <UserProfile
          user={currentUser}
          onUpdateUser={handleUpdateUser}
          onDeleteRoute={handleDeleteRoute}
          onLoadRoute={handleLoadRoute}
          onClose={() => setShowProfile(false)}
        />
      )}

      {/* Controls Section */}
      <DashboardControls
        selectedPlace={selectedPlace}
        onPlaceSelect={handlePlaceSelect}
        onAddLocation={addLocationToMap}
        isOptimizing={isOptimizing || isLoadingWeather}
        totalDistance={totalDistance}
        totalDuration={totalDuration}
        locationsCount={locations.length}
        error={error}
      />

      {/* Weather Insights Section */}
      <WeatherInsights
        locationsWithWeather={locationsWithWeather}
        recommendations={weatherRecommendations}
      />

      {/* Map and Summary Section */}
      <div className="flex flex-col mb-4">
        <EnhancedMap
          onMapLoad={onMapLoad}
          orderedLocations={orderedLocations}
          directionsResult={directionsResult}
          isLoaded={isLoaded}
        />

        <RouteSummary
          orderedLocations={orderedLocations}
          directionsResult={directionsResult}
          routeSummary={routeSummary}
          summaryType={summaryType}
          isGeneratingSummary={isGeneratingSummary}
          onGenerateSummary={generateSummary}
        />
      </div>

      {/* Locations List Section */}
      <LocationsList
        orderedLocations={orderedLocations}
        locations={locations}
        locationInsights={locationInsights}
        onRemoveLocation={removeLocation}
        onFetchLocationInsight={fetchLocationInsight}
      />

      {/* Trip Companion Chat */}
      <TripCompanionChat
        orderedLocations={orderedLocations}
        locationsWithWeather={locationsWithWeather}
        totalDistance={totalDistance}
        totalDuration={totalDuration}
        onAddLocation={addLocationToMap}
        onRemoveLocation={removeLocation}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
