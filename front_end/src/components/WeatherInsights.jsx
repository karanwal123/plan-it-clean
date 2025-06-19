import React from "react";
import { Cloud, Sun, CloudRain, Thermometer, Wind, Eye } from "lucide-react";

const WeatherIcon = ({ condition, className = "w-5 h-5" }) => {
  const icons = {
    Clear: Sun,
    Clouds: Cloud,
    Rain: CloudRain,
    Snow: Cloud,
    Thunderstorm: CloudRain,
  };

  const Icon = icons[condition] || Cloud;
  return <Icon className={className} />;
};

export default function WeatherInsights({
  locationsWithWeather,
  recommendations,
}) {
  if (!locationsWithWeather?.length) return null;

  const hasWeatherData = locationsWithWeather.some((loc) => loc.weather);
  if (!hasWeatherData) return null;

  return (
    <div className="bg-[#1E2528] rounded-lg p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Thermometer className="w-5 h-5 text-[#89ECDB]" />
        <h3 className="text-lg font-semibold text-[#dcfff9]">
          Weather Insights
        </h3>
      </div>

      {/* Weather Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        {locationsWithWeather.map(
          (location, index) =>
            location.weather && (
              <div key={index} className="bg-[#2B3638] rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium truncate">
                    {location.name}
                  </span>
                  <WeatherIcon condition={location.weather.condition} />
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-300">
                  <span className="flex items-center gap-1">
                    <Thermometer className="w-3 h-3" />
                    {location.weather.temp}°C
                  </span>
                  <span className="flex items-center gap-1">
                    <Wind className="w-3 h-3" />
                    {location.weather.windSpeed}m/s
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1 capitalize">
                  {location.weather.description}
                </p>
              </div>
            )
        )}
      </div>

      {/* Recommendations */}
      {recommendations?.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-white">Recommendations:</h4>
          {recommendations.map((rec, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border-l-4 ${
                rec.priority === "high"
                  ? "bg-red-900/20 border-red-500"
                  : rec.priority === "medium"
                  ? "bg-yellow-900/20 border-yellow-500"
                  : "bg-green-900/20 border-green-500"
              }`}
            >
              <p className="text-sm text-gray-200">{rec.message}</p>
              {rec.locations && (
                <p className="text-xs text-gray-400 mt-1">
                  Affects: {rec.locations.join(", ")}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
