import express, { Request, Response } from "express";
import { FarmerProfile } from "../db/models/FarmerProfile";
import { fetchDashboardData, fetchFarmBriefing } from "../services/dashboardService";

const router = express.Router();


router.post("/profile", async (req: Request, res: Response): Promise<void> => {
  const { deviceId, name, location, country, state, district, preferredLanguage } = req.body || {};

  if (!deviceId || typeof deviceId !== "string" || !deviceId.trim()) {
    res.status(400).json({ error: "deviceId is required" });
    return;
  }

  if (!location || typeof location !== "string" || !location.trim()) {
    res.status(400).json({ error: "location is required" });
    return;
  }

  try {
    const updateData: Record<string, any> = {
      deviceId: deviceId.trim(),
      location: location.trim()
    };

    if (name !== undefined) {
      updateData.name = typeof name === "string" ? name.trim() : name;
    }

    if (country !== undefined) {
      updateData.country = typeof country === "string" ? country.trim() : country;
    }
    if (state !== undefined) {
      updateData.state = typeof state === "string" ? state.trim() : state;
    }
    if (district !== undefined) {
      updateData.district = typeof district === "string" ? district.trim() : district;
    }

    if (preferredLanguage && typeof preferredLanguage === "string") {
      updateData.preferredLanguage = preferredLanguage.trim();
    }

    if (req.body.crop !== undefined || req.body.mainCrop !== undefined) {
      const cropVal = req.body.crop || req.body.mainCrop;
      updateData.mainCrop = typeof cropVal === "string" ? cropVal.trim() : cropVal;
    }
    if (req.body.farmSize !== undefined || req.body.landSizeAcres !== undefined) {
      const farmSizeVal = req.body.farmSize || req.body.landSizeAcres;
      updateData.farmSize = typeof farmSizeVal === "string" ? farmSizeVal.trim() : farmSizeVal;
    }

    if (req.body.landSizeAcres !== undefined) {
      updateData.landSizeAcres = Number(req.body.landSizeAcres);
    }
    if (req.body.previousCrop !== undefined) {
      updateData.previousCrop = typeof req.body.previousCrop === "string" ? req.body.previousCrop.trim() : req.body.previousCrop;
    }

    const profile = await FarmerProfile.findOneAndUpdate(
      { deviceId: deviceId.trim() },
      { $set: updateData },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    res.status(200).json(profile);
  } catch (error: any) {
    console.error("Error saving farmer profile:", error);
    res.status(500).json({
      error: "Failed to save farmer profile: " + (error.message || String(error))
    });
  }
});

router.get(
  "/profile/:deviceId",
  async (req: Request, res: Response): Promise<void> => {
    const rawDeviceId = req.params.deviceId;
    const deviceId =
      typeof rawDeviceId === "string" ? rawDeviceId.trim() : "";

    if (!deviceId) {
      res.status(400).json({ error: "deviceId parameter is required" });
      return;
    }

    try {
      const profile = await FarmerProfile.findOne({
        deviceId
      });

      if (!profile) {
        res.status(404).json({
          error: `Farmer profile not found for deviceId: ${deviceId}`
        });
        return;
      }

      res.status(200).json(profile);
    } catch (error: any) {
      console.error("Error retrieving farmer profile:", error);
      res.status(500).json({
        error:
          "Failed to retrieve farmer profile: " +
          (error.message || String(error))
      });
    }
  }
);

router.get("/dashboard-data", async (req: Request, res: Response): Promise<void> => {
  const location = typeof req.query.location === "string" ? req.query.location.trim() : "";
  const deviceId = typeof req.query.deviceId === "string" ? req.query.deviceId.trim() : "";

  let targetLocation = location;
  if (!targetLocation && deviceId) {
    try {
      const profile = await FarmerProfile.findOne({ deviceId });
      if (profile?.location) {
        targetLocation = profile.location;
      }
    } catch {
      // Ignored
    }
  }

  if (!targetLocation) {
    targetLocation = "Delhi, India";
  }

  try {
    const data = await fetchDashboardData(targetLocation);
    res.status(200).json(data);
  } catch (error: any) {
    console.error("Dashboard data endpoint error:", error);
    res.status(500).json({
      error: "Failed to fetch dashboard data: " + (error.message || String(error))
    });
  }
});

router.get("/farm-briefing", async (req: Request, res: Response): Promise<void> => {
  const location = typeof req.query.location === "string" ? req.query.location.trim() : "";
  const deviceId = typeof req.query.deviceId === "string" ? req.query.deviceId.trim() : "";

  let targetLocation = location;
  if (!targetLocation && deviceId) {
    try {
      const profile = await FarmerProfile.findOne({ deviceId });
      if (profile?.location) {
        targetLocation = profile.location;
      }
    } catch {
      // Ignored
    }
  }

  if (!targetLocation) {
    targetLocation = "Delhi, India";
  }

  try {
    const data = await fetchFarmBriefing(targetLocation);
    res.status(200).json(data);
  } catch (error: any) {
    console.error("Farm briefing endpoint error:", error);
    res.status(500).json({
      error: "Failed to fetch farm briefing: " + (error.message || String(error))
    });
  }
});

export default router;

