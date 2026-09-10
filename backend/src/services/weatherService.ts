import axios from "axios";

export interface RealWeatherResult {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  rainExpected: boolean;
  advisory: string;
}

export async function getRealWeather(
  location: string
): Promise<RealWeatherResult> {
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey || apiKey.trim() === "") {
    throw new Error(
      "OPENWEATHER_API_KEY is not configured in environment variables."
    );
  }

  if (!location || location.trim() === "") {
    throw new Error("Location parameter is required to fetch weather data.");
  }

  try {
    const url = "https://api.openweathermap.org/data/2.5/weather";
    const response = await axios.get(url, {
      params: {
        q: location.trim(),
        appid: apiKey.trim(),
        units: "metric"
      },
      timeout: 8000
    });

    const data = response.data;
    const temperature = Math.round(data.main?.temp ?? 0);
    const humidity = Math.round(data.main?.humidity ?? 60);
    const windSpeed = Math.round((data.wind?.speed ?? 0) * 3.6); // m/s to km/h
    const weatherItem = data.weather?.[0];
    const condition = weatherItem?.main || "Clear";
    const description = weatherItem?.description || condition;
    const weatherId = weatherItem?.id || 800;

    // Check for rain, drizzle, or thunderstorm (IDs 2xx, 3xx, 5xx)
    const rainExpected =
      (weatherId >= 200 && weatherId < 600) ||
      condition.toLowerCase().includes("rain") ||
      condition.toLowerCase().includes("drizzle") ||
      condition.toLowerCase().includes("thunderstorm") ||
      description.toLowerCase().includes("rain");

    let advisory = "";
    if (rainExpected) {
      advisory =
        "Rain is expected; delay spraying pesticides and fertilizers to avoid chemical runoff.";
    } else if (temperature >= 38) {
      advisory =
        "High temperatures detected; irrigate crops during early morning or late evening to prevent heat stress.";
    } else if (temperature <= 8) {
      advisory =
        "Cold conditions; protect sensitive crops from frost and cold stress.";
    } else {
      advisory =
        "Favorable weather conditions for field work, crop monitoring, and spraying.";
    }

    return {
      location: data.name || location,
      temperature,
      condition: description.charAt(0).toUpperCase() + description.slice(1),
      humidity,
      windSpeed,
      rainExpected,
      advisory
    };

  } catch (error: any) {
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error(
          `Weather data not found for location "${location}". Please check the spelling.`
        );
      }
      if (error.response.status === 401) {
        throw new Error(
          "Invalid OpenWeatherMap API key. Please check your OPENWEATHER_API_KEY configuration."
        );
      }
      throw new Error(
        `OpenWeatherMap API error (${error.response.status}): ${
          error.response.data?.message || error.message
        }`
      );
    }
    throw new Error(
      `Failed to fetch weather data for "${location}": ${error.message}`
    );
  }
}
