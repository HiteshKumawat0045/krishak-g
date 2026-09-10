import { getRealWeather } from "../services/weatherService";
import { getRealMandiPrice } from "../services/mandiPriceService";

export interface DosageResult {
  chemicalName: string;
  tankSizeLitres: number;
  doseMl: number;
}

export interface MandiPriceResult {
  cropName: string;
  location: string;
  pricePerQuintal: number | null;
  market?: string;
  date?: string;
  message?: string;
}

export interface WeatherAlertResult {
  location: string;
  temperature?: number;
  condition: string;
  rainExpected: boolean;
  advisory: string;
}

export function calculateDosage(
  tankSizeLitres: number,
  chemicalName: string
): DosageResult {
  const dosePerLitre = 3;
  const doseMl = Math.round(tankSizeLitres * dosePerLitre);
  return {
    chemicalName,
    tankSizeLitres,
    doseMl
  };
}

export async function getMandiPrice(
  cropName: string,
  location: string
): Promise<MandiPriceResult> {
  try {
    const result = await getRealMandiPrice(cropName, location);
    if (!result) {
      return {
        cropName,
        location,
        pricePerQuintal: null,
        message: `No current market price data is currently available for ${cropName} in ${location}.`
      };
    }
    return {
      cropName: result.cropName,
      location: result.location,
      pricePerQuintal: result.pricePerQuintal,
      market: result.market,
      date: result.date
    };
  } catch (err: any) {
    return {
      cropName,
      location,
      pricePerQuintal: null,
      message: `Unable to fetch mandi price: ${err.message}`
    };
  }
}

export async function getWeatherAlert(
  location: string
): Promise<WeatherAlertResult> {
  try {
    const result = await getRealWeather(location);
    return {
      location: result.location,
      temperature: result.temperature,
      condition: `${result.condition}, ${result.temperature} degrees Celsius`,
      rainExpected: result.rainExpected,
      advisory: result.advisory
    };
  } catch (err: any) {
    return {
      location,
      condition: "Unavailable",
      rainExpected: false,
      advisory: `Unable to fetch real-time weather: ${err.message}`
    };
  }
}

export const toolDefinitions = [
  {
    type: "function" as const,
    function: {
      name: "calculateDosage",
      description:
        "Calculate the recommended chemical or pesticide dosage in milliliters based on sprayer tank size in litres and chemical name.",
      parameters: {
        type: "object",
        properties: {
          tankSizeLitres: {
            type: "number",
            description: "The volume of the sprayer tank in litres (for example: 15)"
          },
          chemicalName: {
            type: "string",
            description: "The name of the pesticide, fertilizer, or agricultural chemical"
          }
        },
        required: ["tankSizeLitres", "chemicalName"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "getMandiPrice",
      description:
        "Get current market (mandi) commodity prices per quintal for a specified crop and location.",
      parameters: {
        type: "object",
        properties: {
          cropName: {
            type: "string",
            description: "The crop or commodity name (for example: wheat, mustard, cotton)"
          },
          location: {
            type: "string",
            description: "The market, district, or region name"
          }
        },
        required: ["cropName", "location"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "getWeatherAlert",
      description:
        "Get current weather conditions, precipitation alerts, and farming advisories for a location.",
      parameters: {
        type: "object",
        properties: {
          location: {
            type: "string",
            description: "The location or district name"
          }
        },
        required: ["location"]
      }
    }
  }
];

export async function executeTool(
  name: string,
  args: Record<string, any>
): Promise<unknown> {
  switch (name) {
    case "calculateDosage":
      return calculateDosage(
        Number(args.tankSizeLitres || 0),
        String(args.chemicalName || "pesticide")
      );
    case "getMandiPrice":
      return await getMandiPrice(
        String(args.cropName || "crops"),
        String(args.location || "local market")
      );
    case "getWeatherAlert":
      return await getWeatherAlert(String(args.location || "local area"));
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
