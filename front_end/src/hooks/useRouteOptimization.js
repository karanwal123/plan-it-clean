import { useState } from "react";
import { computeOptimalOrder } from "../utils/tsp";

export const useRouteOptimization = () => {
  const [isOptimizing, setIsOptimizing] = useState(false);

  const optimizeRoute = async (locationsList) => {
    if (locationsList.length < 2) return locationsList;

    setIsOptimizing(true);
    try {
      const tour = await computeOptimalOrder(locationsList);
      const reordered = tour.map((i) => locationsList[i]);
      return reordered;
    } catch (err) {
      console.error("Failed to compute optimal order:", err);
      throw new Error("Failed to optimize route. Using original order.");
    } finally {
      setIsOptimizing(false);
    }
  };

  return { optimizeRoute, isOptimizing };
};
//useRouteOptimisation.js