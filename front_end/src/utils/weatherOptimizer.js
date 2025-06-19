export function analyzeWeatherPatterns(locationsWithWeather) {
  const temps = locationsWithWeather.map((loc) => loc.weather?.temp || 20);
  const conditions = locationsWithWeather.map(
    (loc) => loc.weather?.condition || "Clear"
  );

  const tempRange = Math.max(...temps) - Math.min(...temps);
  const uniqueConditions = [...new Set(conditions)].length;

  return {
    hasVariedTemperatures: tempRange > 5, // 5°C difference
    hasVariedConditions: uniqueConditions > 1,
    avgTemp: temps.reduce((a, b) => a + b, 0) / temps.length,
    dominantCondition: getMostFrequent(conditions),
  };
}

export function generateWeatherRecommendations(locationsWithWeather) {
  const analysis = analyzeWeatherPatterns(locationsWithWeather);

  if (!analysis.hasVariedTemperatures && !analysis.hasVariedConditions) {
    // Similar weather everywhere - focus on time-based recommendations
    return generateTimeBasedRecommendations(locationsWithWeather, analysis);
  }

  // Different weather patterns - optimize by conditions
  return generateConditionBasedRecommendations(locationsWithWeather);
}

function generateTimeBasedRecommendations(locations, analysis) {
  const recommendations = [];

  if (analysis.avgTemp > 25) {
    // Hot weather - suggest early/late visits for outdoor locations
    recommendations.push({
      type: "time_optimization",
      message:
        "Hot weather detected. Consider visiting outdoor locations early morning (8-10 AM) or late afternoon (4-6 PM).",
      priority: "high",
    });
  } else if (analysis.avgTemp < 10) {
    // Cold weather - suggest midday visits
    recommendations.push({
      type: "time_optimization",
      message:
        "Cool weather detected. Plan outdoor activities during warmer midday hours (11 AM - 3 PM).",
      priority: "medium",
    });
  }

  if (analysis.dominantCondition === "Rain") {
    recommendations.push({
      type: "activity_adjustment",
      message:
        "Rain expected. Prioritize indoor attractions or bring weather protection.",
      priority: "high",
    });
  }

  return recommendations;
}

function generateConditionBasedRecommendations(locations) {
  const recommendations = [];

  // Group locations by weather conditions
  const weatherGroups = locations.reduce((groups, location) => {
    const condition = location.weather?.condition || "Unknown";
    if (!groups[condition]) groups[condition] = [];
    groups[condition].push(location);
    return groups;
  }, {});

  // Generate recommendations based on groups
  Object.entries(weatherGroups).forEach(([condition, locs]) => {
    if (condition === "Rain" && locs.length > 0) {
      recommendations.push({
        type: "route_adjustment",
        message: `${locs.length} location(s) have rain. Consider rescheduling or bringing rain gear.`,
        locations: locs.map((l) => l.name),
        priority: "high",
      });
    }

    if (condition === "Clear" && locs.length > 0) {
      recommendations.push({
        type: "opportunity",
        message: `${locs.length} location(s) have clear weather - perfect for outdoor activities!`,
        locations: locs.map((l) => l.name),
        priority: "low",
      });
    }
  });

  return recommendations;
}

function getMostFrequent(arr) {
  const counts = arr.reduce((acc, val) => {
    acc[val] = (acc[val] || 0) + 1;
    return acc;
  }, {});

  return Object.keys(counts).reduce((a, b) => (counts[a] > counts[b] ? a : b));
}
