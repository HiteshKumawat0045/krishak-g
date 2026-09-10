import { useState, useEffect } from "react";
import indiaLocations from "../data/indiaLocations.json";
import { SUPPORTED_LANGUAGES, getTranslation, LanguageCode } from "../data/translations";

export interface ProfileData {
  profileName: string;
  profileCountry: string;
  profileState: string;
  profileDistrict: string;
  profileLanguage: LanguageCode;
  profileCrop: string;
  profileFarmSize: string;
  notifyWeather: boolean;
  notifyMandi: boolean;
  notifyAdvisory: boolean;
  voiceSpeed: "normal" | "slow" | "fast";
  autoStartHandsFree: boolean;
  interruptSensitivity: "high" | "medium" | "low";
}

interface ProfileScreenProps {
  data: ProfileData;
  onChange: (updated: Partial<ProfileData>) => void;
  onComplete: () => void;
  onClose?: () => void;
  isInitialOnboarding?: boolean;
}

export const CROP_OPTIONS = [
  "Wheat (गेहूँ)",
  "Paddy / Rice (धान / चावल)",
  "Cotton (कपास / रुई)",
  "Sugarcane (गन्ना)",
  "Maize (मक्का)",
  "Mustard (सरसों)",
  "Pulses (दालें)",
  "Vegetables (सब्जियां)",
  "Fruits (फल)",
  "Other Crops (अन्य फसलें)"
];

export const FARM_SIZE_OPTIONS = [
  "Marginal (< 2 Acres / < 1 Hectare)",
  "Small (2 - 5 Acres)",
  "Medium (5 - 10 Acres)",
  "Large Commercial (> 10 Acres)"
];

export default function ProfileScreen({
  data,
  onChange,
  onComplete,
  onClose,
  isInitialOnboarding = false
}: ProfileScreenProps) {
  const [saveStatus, setSaveStatus] = useState<"saving" | "saved" | null>(null);
  const t = getTranslation(data.profileLanguage);

  const handleFieldChange = (key: keyof ProfileData, val: any) => {
    setSaveStatus("saving");
    onChange({ [key]: val });
    setTimeout(() => {
      setSaveStatus("saved");
    }, 300);
  };

  useEffect(() => {
    if (saveStatus === "saved") {
      const timer = setTimeout(() => {
        setSaveStatus(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [saveStatus]);

  return (
    <div className="profile-screen-wrapper">
      {/* Header Bar */}
      <div className="profile-header-bar">
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {!isInitialOnboarding && onClose && (
            <button
              type="button"
              className="profile-back-btn"
              onClick={onClose}
              title="Return to Dashboard"
            >
              ← Back
            </button>
          )}
          <div>
            <h1 className="profile-main-title">{t.setupProfile}</h1>
            <p className="profile-main-subtitle">
              Personalized Voice Assistant & Agricultural Preferences
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {saveStatus === "saving" && (
            <span className="auto-save-pill saving">Saving...</span>
          )}
          {saveStatus === "saved" && (
            <span className="auto-save-pill saved">Auto-Saved ✓</span>
          )}
          {!isInitialOnboarding && (
            <button
              type="button"
              className="btn-primary"
              style={{ padding: "0.45rem 1.25rem", fontSize: "0.9rem", marginTop: 0 }}
              onClick={onComplete}
            >
              Done
            </button>
          )}
        </div>
      </div>

      <div className="profile-cards-grid">
        {/* Card 1: Personal & Location Details */}
        <div className="profile-card">
          <div className="profile-card-header">
            <span className="profile-card-icon">👨‍🌾</span>
            <div>
              <h2 className="profile-card-title">Personal & Location</h2>
              <p className="profile-card-desc">Identify your farm location for local weather & mandi pricing</p>
            </div>
          </div>

          <div className="profile-form-grid">
            <div className="form-group">
              <label className="form-label">Farmer Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Ramesh Kumar"
                value={data.profileName}
                onChange={(e) => handleFieldChange("profileName", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t.preferredLanguage} *</label>
              <select
                className="form-input"
                value={data.profileLanguage}
                onChange={(e) => handleFieldChange("profileLanguage", e.target.value as LanguageCode)}
                required
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.nativeLabel} ({lang.label})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">State *</label>
              <select
                className="form-input"
                value={data.profileState}
                onChange={(e) => {
                  handleFieldChange("profileState", e.target.value);
                  handleFieldChange("profileDistrict", "");
                }}
                required
              >
                <option value="" disabled>Select State</option>
                {Object.keys(indiaLocations).sort().map((stateName) => (
                  <option key={stateName} value={stateName}>
                    {stateName}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">District *</label>
              <select
                className="form-input"
                value={data.profileDistrict}
                onChange={(e) => handleFieldChange("profileDistrict", e.target.value)}
                disabled={!data.profileState}
                required
              >
                <option value="" disabled>Select District</option>
                {data.profileState &&
                  (indiaLocations as Record<string, string[]>)[data.profileState]
                    ?.sort()
                    .map((districtName) => (
                      <option key={districtName} value={districtName}>
                        {districtName}
                      </option>
                    ))}
              </select>
            </div>
          </div>
        </div>

        {/* Card 2: Farm Details */}
        <div className="profile-card">
          <div className="profile-card-header">
            <span className="profile-card-icon">🌾</span>
            <div>
              <h2 className="profile-card-title">Farm & Crop Details</h2>
              <p className="profile-card-desc">Help Krishak-G provide relevant crop advisory & fertilizer guidance</p>
            </div>
          </div>

          <div className="profile-form-grid">
            <div className="form-group">
              <label className="form-label">Current Primary Crop</label>
              <select
                className="form-input"
                value={data.profileCrop}
                onChange={(e) => handleFieldChange("profileCrop", e.target.value)}
              >
                <option value="" disabled>Select Crop</option>
                {CROP_OPTIONS.map((crop) => (
                  <option key={crop} value={crop}>
                    {crop}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Farm Size / Landholding</label>
              <select
                className="form-input"
                value={data.profileFarmSize}
                onChange={(e) => handleFieldChange("profileFarmSize", e.target.value)}
              >
                <option value="" disabled>Select Land Size</option>
                {FARM_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Card 3: Notification Preferences */}
        <div className="profile-card">
          <div className="profile-card-header">
            <span className="profile-card-icon">🔔</span>
            <div>
              <h2 className="profile-card-title">Notifications & Alerts</h2>
              <p className="profile-card-desc">Choose field updates and emergency alert notifications</p>
            </div>
          </div>

          <div className="toggle-list">
            <label className="toggle-item">
              <div>
                <span className="toggle-label-title">Weather & Rainfall Warnings</span>
                <span className="toggle-label-desc">Emergency warnings for high winds, heavy rain & frost</span>
              </div>
              <input
                type="checkbox"
                className="toggle-checkbox"
                checked={data.notifyWeather}
                onChange={(e) => handleFieldChange("notifyWeather", e.target.checked)}
              />
            </label>

            <label className="toggle-item">
              <div>
                <span className="toggle-label-title">Mandi Price Updates</span>
                <span className="toggle-label-desc">Daily AGMARKNET commodity price changes for your district</span>
              </div>
              <input
                type="checkbox"
                className="toggle-checkbox"
                checked={data.notifyMandi}
                onChange={(e) => handleFieldChange("notifyMandi", e.target.checked)}
              />
            </label>

            <label className="toggle-item">
              <div>
                <span className="toggle-label-title">Agronomic Crop Advisory</span>
                <span className="toggle-label-desc">Seasonal pest alerts, fertilizer timings & soil health tips</span>
              </div>
              <input
                type="checkbox"
                className="toggle-checkbox"
                checked={data.notifyAdvisory}
                onChange={(e) => handleFieldChange("notifyAdvisory", e.target.checked)}
              />
            </label>
          </div>
        </div>

        {/* Card 4: Voice & AI Assistant Settings */}
        <div className="profile-card">
          <div className="profile-card-header">
            <span className="profile-card-icon">🎙️</span>
            <div>
              <h2 className="profile-card-title">Voice & AI Settings</h2>
              <p className="profile-card-desc">Tune hands-free VAD sensitivity and speech synthesis speed</p>
            </div>
          </div>

          <div className="profile-form-grid">
            <div className="form-group">
              <label className="form-label">Speech Synthesis Speed</label>
              <select
                className="form-input"
                value={data.voiceSpeed}
                onChange={(e) => handleFieldChange("voiceSpeed", e.target.value as any)}
              >
                <option value="normal">Normal (Natural Pacing)</option>
                <option value="slow">Slow (Clear & Detailed)</option>
                <option value="fast">Fast (Quick Responses)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Hands-Free Auto-Start</label>
              <select
                className="form-input"
                value={data.autoStartHandsFree ? "on" : "off"}
                onChange={(e) => handleFieldChange("autoStartHandsFree", e.target.value === "on")}
              >
                <option value="on">On (Start continuous listening on launch)</option>
                <option value="off">Off (Manual start via Voice Orb)</option>
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label className="form-label">Voice Interruption Sensitivity</label>
              <select
                className="form-input"
                value={data.interruptSensitivity}
                onChange={(e) => handleFieldChange("interruptSensitivity", e.target.value as any)}
              >
                <option value="high">High (Instant interruption on speech detection)</option>
                <option value="medium">Medium (Balanced speech threshold)</option>
                <option value="low">Low (Requires clear voice signal)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {isInitialOnboarding && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: "1.5rem" }}>
          <button
            type="button"
            className="btn-primary"
            style={{ maxWidth: "400px" }}
            disabled={!data.profileState || !data.profileDistrict}
            onClick={onComplete}
          >
            {t.getStarted}
          </button>
        </div>
      )}
    </div>
  );
}
