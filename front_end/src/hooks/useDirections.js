import { useState, useEffect } from "react";

export const useDirections = (orderedLocations, isLoaded) => {
  const [directionsResult, setDirectionsResult] = useState(null);
  const [totalDistance, setTotalDistance] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (orderedLocations.length < 2 || !isLoaded) {
      setDirectionsResult(null);
      setTotalDistance(0);
      setTotalDuration(0);
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
          setError("");
        } else {
          console.error("Directions request failed:", status);
          setDirectionsResult(null);
          setError("Failed to calculate route directions.");
        }
      }
    );
  }, [orderedLocations, isLoaded]);

  return { directionsResult, totalDistance, totalDuration, error };
};
//this is useDirection.js