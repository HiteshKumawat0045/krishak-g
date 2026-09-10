import dotenv from "dotenv";
import { getRealWeather } from "./weatherService";
import { getRealMandiPrice } from "./mandiPriceService";

dotenv.config();

async function runRealDataTest(): Promise<void> {
  console.log("=== Testing Real External API Integrations ===\n");

  // 1. Weather API Test
  console.log("--- 1. Testing OpenWeatherMap API ---");
  try {
    const weather = await getRealWeather("Jaipur");
    console.log("Live Weather Result for Jaipur:");
    console.log(JSON.stringify(weather, null, 2));
    console.log(
      `✓ Temperature: ${weather.temperature}°C | Condition: ${weather.condition} | Rain Expected: ${weather.rainExpected}`
    );
    console.log(`✓ Advisory: "${weather.advisory}"\n`);
  } catch (err: any) {
    console.error("✗ Weather API test failed:", err.message, "\n");
  }

  // 2. Mandi Price API Test
  console.log("--- 2. Testing Data.gov.in Agmarknet Mandi Price API ---");
  try {
    const mandiPrice = await getRealMandiPrice("Wheat", "Rajasthan");
    console.log("Live Mandi Price Result for Wheat in Rajasthan:");
    console.log(JSON.stringify(mandiPrice, null, 2));
    if (mandiPrice) {
      console.log(
        `✓ Commodity: ${mandiPrice.cropName} | Location: ${mandiPrice.location} | Price: ₹${mandiPrice.pricePerQuintal}/quintal | Market: ${mandiPrice.market} | Date: ${mandiPrice.date}\n`
      );
    } else {
      console.log(
        "ℹ No direct records found for Wheat in Rajasthan (returned null gracefully).\n"
      );
    }
  } catch (err: any) {
    console.error("✗ Mandi Price API test failed:", err.message, "\n");
  }

  console.log("=== Real Data Test Completed ===");
}

runRealDataTest();
