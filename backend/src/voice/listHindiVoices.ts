import https from "https";

interface VoiceDetail {
  speaker: string;
  gender: string;
  age?: string;
  country?: string;
  modelId?: string;
  lang?: string;
  language?: string;
  description?: string;
}

function fetchVoiceDetails(url: string): Promise<VoiceDetail[]> {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode && res.statusCode >= 400) {
          reject(
            new Error(`Request failed with status code ${res.statusCode}`)
          );
          return;
        }

        let rawData = "";
        res.on("data", (chunk) => {
          rawData += chunk;
        });

        res.on("end", () => {
          try {
            const parsed = JSON.parse(rawData);
            resolve(parsed);
          } catch (err) {
            reject(err);
          }
        });
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}

async function listHindiVoices(): Promise<void> {
  const endpoint = "https://users.rime.ai/data/voices/voice_details.json";
  console.log(`Fetching voice details from ${endpoint}...\n`);

  try {
    const voices = await fetchVoiceDetails(endpoint);

    const hindiVoicesMap = new Map<
      string,
      { speaker: string; gender: string; models: Set<string> }
    >();

    for (const voice of voices) {
      const lang = (voice.lang || "").toLowerCase();
      const language = (voice.language || "").toLowerCase();

      if (
        lang.includes("hi") ||
        lang.includes("hin") ||
        language.includes("hindi")
      ) {
        const key = voice.speaker.toLowerCase();
        if (!hindiVoicesMap.has(key)) {
          hindiVoicesMap.set(key, {
            speaker: voice.speaker,
            gender: voice.gender || "Unknown",
            models: new Set<string>()
          });
        }

        const entry = hindiVoicesMap.get(key)!;
        if (voice.modelId) {
          entry.models.add(voice.modelId);
        }
      }
    }

    const tableRows = Array.from(hindiVoicesMap.values()).map((item) => ({
      "Speaker Name": item.speaker,
      Gender: item.gender,
      "Supported Models": Array.from(item.models).join(", ") || "None"
    }));

    console.log(`Found ${tableRows.length} Hindi voice(s):\n`);
    console.table(tableRows);
  } catch (error) {
    console.error("Failed to retrieve Hindi voices:", error);
    process.exit(1);
  }
}

listHindiVoices();
