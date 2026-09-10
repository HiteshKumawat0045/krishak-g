import { SUPPORTED_LANGUAGES, getTranslation, LanguageCode } from "../data/translations";


interface HeaderProps {
  activeTab: "home" | "dashboard" | "history" | "weather" | "schemes";
  profileLanguage: LanguageCode;
  setProfileLanguage: (lang: LanguageCode) => void;
  profileDistrict: string;
  profileState: string;
  onGoHome: () => void;
  onGoDashboard: () => void;
  onOpenHistory: () => void;
  onSelectWeather: () => void;
  onSelectSchemes: () => void;
  onEditProfile: () => void;
  onOpenSettings: () => void;
  onOpenNotifications: () => void;
  onStartFieldMode?: () => void;
  hasUnreadNotifications?: boolean;
}

export default function Header({
  activeTab,
  profileLanguage,
  setProfileLanguage,
  profileDistrict,
  profileState,
  onGoHome,
  onGoDashboard,
  onOpenHistory,
  onSelectWeather,
  onSelectSchemes,
  onEditProfile,
  onOpenSettings,
  onOpenNotifications,
  onStartFieldMode,
  hasUnreadNotifications = true
}: HeaderProps) {
  const t = getTranslation(profileLanguage);

  return (
    <header className="app-header">
      <div className="app-header-inner">
        {/* Left: Brand Logo & Title */}
        <div className="header-left" onClick={onGoDashboard} title="Krishak-G Home">
          <div className="header-logo-icon">🌾</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span className="header-brand-title">Krishak-G</span>
            <span className="header-brand-location">
              {profileDistrict && profileState
                ? `📍 ${profileDistrict}, ${profileState}`
                : t.voiceAssistant}
            </span>
          </div>
        </div>

        {/* Center: Navigation Links (Localized) */}
        <nav className="header-center-nav" aria-label="Main Navigation">
          <button
            type="button"
            className={`nav-link-btn ${activeTab === "home" ? "active" : ""}`}
            onClick={onGoHome}
            title={t.home}
          >
            {t.home}
          </button>
          <button
            type="button"
            className={`nav-link-btn ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={onGoDashboard}
            title={t.dashboard}
          >
            {t.dashboard}
          </button>
          <button
            type="button"
            className={`nav-link-btn ${activeTab === "history" ? "active" : ""}`}
            onClick={onOpenHistory}
            title={t.history}
          >
            {t.history}
          </button>
          <button
            type="button"
            className={`nav-link-btn ${activeTab === "weather" ? "active" : ""}`}
            onClick={onSelectWeather}
            title={t.weather}
          >
            {t.weather}
          </button>
          <button
            type="button"
            className={`nav-link-btn ${activeTab === "schemes" ? "active" : ""}`}
            onClick={onSelectSchemes}
            title={t.schemes}
          >
            {t.schemes}
          </button>
          {onStartFieldMode && (
            <button
              type="button"
              className="nav-link-btn field-mode-nav-btn"
              onClick={onStartFieldMode}
              style={{
                background: "linear-gradient(135deg, #15803d, #22c55e)",
                color: "#ffffff",
                fontWeight: "700",
                borderRadius: "20px",
                padding: "0.35rem 0.9rem",
                boxShadow: "0 2px 8px rgba(34, 197, 94, 0.4)",
                border: "none",
                display: "flex",
                alignItems: "center",
                gap: "0.3rem"
              }}
              title="Start Hands-Free Field Mode"
            >
              <span>🎙️</span>
              <span>Field Mode</span>
            </button>
          )}
        </nav>

        {/* Right: Actions (Dropdown Language Selector, Profile, Settings, Notifications) */}
        <div className="header-right-actions">
          {/* Language Selector Dropdown */}
          <div className="language-select-wrapper" title="Select Preferred Language">
            <span style={{ fontSize: "0.9rem", pointerEvents: "none" }}>🌐</span>
            <select
              className="header-language-select"
              value={profileLanguage}
              onChange={(e) => setProfileLanguage(e.target.value as LanguageCode)}
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.nativeLabel} ({lang.label})
                </option>
              ))}
            </select>
          </div>

          {/* Notifications */}
          <button
            type="button"
            className="header-action-btn"
            onClick={onOpenNotifications}
            title={t.notifications}
          >
            <span>🔔</span>
            {hasUnreadNotifications && <span className="notification-badge-dot" />}
          </button>

          {/* Profile */}
          <button
            type="button"
            className="header-action-btn"
            onClick={onEditProfile}
            title={t.profile}
          >
            <span>👨‍🌾</span>
            <span className="hide-on-mobile">{t.profile}</span>
          </button>

          {/* Settings */}
          <button
            type="button"
            className="header-action-btn"
            onClick={onOpenSettings}
            title={t.settings}
          >
            <span>⚙️</span>
          </button>
        </div>
      </div>
    </header>
  );
}
