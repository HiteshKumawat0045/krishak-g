import axios from "axios";

export interface RealMandiPriceResult {
  cropName: string;
  location: string;
  pricePerQuintal: number;
  market: string;
  date: string;
}

export async function getRealMandiPrice(
  cropName: string,
  location: string
): Promise<RealMandiPriceResult | null> {
  const apiKey = process.env.DATA_GOV_API_KEY;

  if (!apiKey || apiKey.trim() === "") {
    throw new Error(
      "DATA_GOV_API_KEY is not configured in environment variables."
    );
  }

  if (!cropName || cropName.trim() === "") {
    throw new Error("Crop name is required to fetch mandi prices.");
  }

  const cleanCrop = cropName.trim();
  const cleanLocation = location ? location.trim().toLowerCase() : "";

  try {
    const url =
      "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070";

    const params: Record<string, string | number> = {
      "api-key": apiKey.trim(),
      format: "json",
      limit: 100
    };

    // If crop name is specific, add filter
    if (cleanCrop) {
      params["filters[commodity]"] = cleanCrop;
    }

    const response = await axios.get(url, {
      params,
      timeout: 10000
    });

    const records = response.data?.records || [];

    if (!Array.isArray(records) || records.length === 0) {
      // Try fetching recent records without commodity filter as fallback
      const fallbackResponse = await axios.get(url, {
        params: {
          "api-key": apiKey.trim(),
          format: "json",
          limit: 100
        },
        timeout: 10000
      });

      const fallbackRecords = fallbackResponse.data?.records || [];
      return findBestMatchingRecord(fallbackRecords, cleanCrop, cleanLocation);
    }

    return findBestMatchingRecord(records, cleanCrop, cleanLocation);
  } catch (error: any) {
    if (error.response) {
      if (error.response.status === 401 || error.response.status === 403) {
        throw new Error(
          `Invalid or unauthorized data.gov.in API key: ${
            error.response.data?.message || error.message
          }`
        );
      }
      throw new Error(
        `Data.gov.in Agmarknet API error (${error.response.status}): ${
          error.response.data?.message || error.message
        }`
      );
    }
    throw new Error(
      `Failed to fetch mandi price data for "${cropName}" in "${location}": ${error.message}`
    );
  }
}

function findBestMatchingRecord(
  records: any[],
  crop: string,
  loc: string
): RealMandiPriceResult | null {
  const normCrop = crop.toLowerCase();

  const matchingCropRecords = records.filter((r: any) => {
    const commodity = String(r.commodity || r.Commodity || "").toLowerCase();
    return commodity.includes(normCrop) || normCrop.includes(commodity);
  });

  if (matchingCropRecords.length === 0) {
    return null;
  }

  // Priority 1: Match by district or market
  if (loc) {
    const districtOrMarketMatch = matchingCropRecords.find((r: any) => {
      const district = String(r.district || r.District || "").toLowerCase();
      const market = String(r.market || r.Market || "").toLowerCase();
      return (
        district.includes(loc) ||
        loc.includes(district) ||
        market.includes(loc) ||
        loc.includes(market)
      );
    });

    if (districtOrMarketMatch) {
      return formatRecord(districtOrMarketMatch);
    }

    // Priority 2: Match by state
    const stateMatch = matchingCropRecords.find((r: any) => {
      const state = String(r.state || r.State || "").toLowerCase();
      return state.includes(loc) || loc.includes(state);
    });

    if (stateMatch) {
      return formatRecord(stateMatch);
    }
  }

  // Fallback: Return the most recent matching crop record
  return formatRecord(matchingCropRecords[0]);
}

function formatRecord(record: any): RealMandiPriceResult {
  const cropName = String(record.commodity || record.Commodity || "Commodity");
  const district = String(record.district || record.District || "");
  const state = String(record.state || record.State || "");
  const market = String(record.market || record.Market || "Local Mandi");
  const priceRaw =
    record.modal_price ||
    record.Modal_Price ||
    record.max_price ||
    record.Max_Price ||
    record.min_price ||
    record.Min_Price;
  const pricePerQuintal = Number(priceRaw) || 0;
  const date = String(
    record.arrival_date ||
      record.Arrival_Date ||
      new Date().toISOString().split("T")[0]
  );

  const location = district
    ? `${district}, ${state}`.trim().replace(/^,\s*|,\s*$/g, "")
    : state || "India";

  return {
    cropName,
    location,
    pricePerQuintal,
    market,
    date
  };
}
