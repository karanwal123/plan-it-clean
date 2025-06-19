// utils/weatherService.js
const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const WEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5";

export async function getLocationWeather(lat, lng) {
  try {
    const response = await fetch(
      `${WEATHER_BASE_URL}/weather?lat=${lat}&lon=${lng}&appid=${WEATHER_API_KEY}&units=metric`
    );
    const data = await response.json();

    return {
      temp: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      condition: data.weather[0].main,
      description: data.weather[0].description,
      windSpeed: data.wind.speed,
      visibility: data.visibility / 1000, // Convert to km
      icon: data.weather[0].icon,
    };
  } catch (error) {
    console.error("Weather fetch failed:", error);
    return null;
  }
}

export async function getLocationForecast(lat, lng, days = 3) {
  try {
    const response = await fetch(
      `${WEATHER_BASE_URL}/forecast?lat=${lat}&lon=${lng}&appid=${WEATHER_API_KEY}&units=metric&cnt=${
        days * 8
      }`
    );
    const data = await response.json();

    return data.list.map((item) => ({
      time: new Date(item.dt * 1000),
      temp: Math.round(item.main.temp),
      condition: item.weather[0].main,
      description: item.weather[0].description,
      pop: item.pop * 100, // Probability of precipitation
      icon: item.weather[0].icon,
    }));
  } catch (error) {
    console.error("Forecast fetch failed:", error);
    return [];
  }
}
