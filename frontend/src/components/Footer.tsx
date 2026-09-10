import { useState } from "react";
import { LanguageCode } from "../data/translations";

interface FooterProps {
  profileLanguage?: LanguageCode;
}

type ModalType = "about" | "tech" | "privacy" | "contact" | null;

export default function Footer({ profileLanguage = "en" }: FooterProps) {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const langLabel = profileLanguage === "hi" ? "हिंदी" : profileLanguage === "mr" ? "मराठी" : profileLanguage === "gu" ? "ગુજરાતી" : profileLanguage === "pa" ? "ਪੰਜਾਬੀ" : profileLanguage === "ta" ? "தமிழ்" : profileLanguage === "te" ? "తెలుగు" : "English";

  const closeModal = () => setActiveModal(null);

  return (
    <footer className="footer-container">
      <div className="footer-content">
        {/* Brand & About Column */}
        <div className="footer-brand-col">
          <div className="footer-brand-header">
            <span className="footer-logo-icon">🌾</span>
            <span className="footer-brand-title">Krishak-G</span>
            <span className="footer-version-pill">v2.4.0</span>
          </div>
          <p className="footer-description">
            Voice-native AI field assistant empowering Indian farmers with real-time weather forecasts, AGMARKNET mandi prices, government schemes, and agronomic guidance in native Indian languages.
          </p>
          <div className="footer-badge-row">
            <span className="rime-badge">
              🎙️ Made with <strong>Rime AI</strong>
            </span>
          </div>
        </div>

        {/* Technology Column */}
        <div className="footer-col">
          <h4 className="footer-col-title">Technology</h4>
          <ul className="footer-links">
            <li>
              <button
                type="button"
                className="footer-link-btn"
                onClick={() => setActiveModal("tech")}
              >
                Rime Voice TTS Engine
              </button>
            </li>
            <li>
              <button
                type="button"
                className="footer-link-btn"
                onClick={() => setActiveModal("tech")}
              >
                Silero VAD & ONNX Runtime
              </button>
            </li>
            <li>
              <button
                type="button"
                className="footer-link-btn"
                onClick={() => setActiveModal("tech")}
              >
                AGMARKNET Live Price API
              </button>
            </li>
            <li>
              <button
                type="button"
                className="footer-link-btn"
                onClick={() => setActiveModal("tech")}
              >
                Open-Meteo Weather API
              </button>
            </li>
          </ul>
        </div>

        {/* Legal & Information Column */}
        <div className="footer-col">
          <h4 className="footer-col-title">Information</h4>
          <ul className="footer-links">
            <li>
              <button
                type="button"
                className="footer-link-btn"
                onClick={() => setActiveModal("about")}
              >
                About Krishak-G
              </button>
            </li>
            <li>
              <button
                type="button"
                className="footer-link-btn"
                onClick={() => setActiveModal("privacy")}
              >
                Privacy & Data Security
              </button>
            </li>
            <li>
              <button
                type="button"
                className="footer-link-btn"
                onClick={() => setActiveModal("contact")}
              >
                Contact & Support
              </button>
            </li>
          </ul>
        </div>

        {/* Developer & GitHub Column */}
        <div className="footer-col">
          <h4 className="footer-col-title">Developer & Code</h4>
          <ul className="footer-links">
            <li>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-link-a"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  style={{ display: "inline-block", verticalAlign: "middle", marginRight: "6px" }}
                >
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                GitHub Repository
              </a>
            </li>
            <li>
              <span className="footer-meta-item">
                License: <strong>MIT</strong>
              </span>
            </li>
            <li>
              <span className="footer-meta-item">
                Version: <strong>2.4.0 (Stable)</strong>
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Footer Bottom Bar */}
      <div className="footer-bottom">
        <div className="footer-bottom-inner">
          <p>© 2026 Krishak-G Field Assistant. Built for Indian Agriculture.</p>
          <div className="footer-bottom-tags">
            <span className="footer-tag">🌾 Voice-First OS</span>
            <span className="footer-tag">🌐 {langLabel}</span>
            <span className="footer-tag">🎙️ Made with Rime</span>
            <span className="footer-tag">v2.4.0</span>
          </div>
        </div>
      </div>

      {/* Interactive Modals */}
      {activeModal && (
        <div className="footer-modal-backdrop" onClick={closeModal}>
          <div className="footer-modal-card" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="footer-modal-close" onClick={closeModal}>
              ✕
            </button>

            {activeModal === "about" && (
              <div>
                <div className="footer-modal-header">
                  <span className="footer-modal-icon">🌾</span>
                  <h3>About Krishak-G</h3>
                </div>
                <div className="footer-modal-body">
                  <p>
                    <strong>Krishak-G</strong> is a next-generation Voice-First Agricultural Operating System designed specifically for smallholder and commercial farmers across India.
                  </p>
                  <p>
                    Traditional agricultural apps require typing, navigating complex menus, and reading small text. Krishak-G breaks literacy and digital accessibility barriers through hands-free, continuous voice interaction in <strong>7 Indian languages</strong>: Hindi, English, Marathi, Gujarati, Punjabi, Tamil, and Telugu.
                  </p>
                  <h4>Key Capabilities:</h4>
                  <ul>
                    <li><strong>Hyper-local Weather Forecasts:</strong> Live temperature, humidity, wind speed, and rain alerts via Open-Meteo.</li>
                    <li><strong>AGMARKNET Mandi Prices:</strong> Real-time crop prices per quintal direct from government agricultural markets.</li>
                    <li><strong>PM-KISAN & Schemes:</strong> Instant eligibility checking and installment tracking for government agricultural subsidies.</li>
                    <li><strong>Agronomic Crop Advisory:</strong> Diagnostic soil care, pest warnings, and fertilizer recommendations customized to your crop and district.</li>
                  </ul>
                </div>
              </div>
            )}

            {activeModal === "tech" && (
              <div>
                <div className="footer-modal-header">
                  <span className="footer-modal-icon">⚙️</span>
                  <h3>Technology Stack</h3>
                </div>
                <div className="footer-modal-body">
                  <p>
                    Krishak-G is built on a high-performance, real-time voice pipeline engineered for low latency and smooth speech synthesis.
                  </p>
                  <div className="tech-stack-grid">
                    <div className="tech-stack-item">
                      <strong>🎙️ Made with Rime AI</strong>
                      <p>Ultra-low-latency neural speech synthesis producing natural, expressive voice responses for agricultural advisory.</p>
                    </div>
                    <div className="tech-stack-item">
                      <strong>⚡ Silero VAD + ONNX</strong>
                      <p>Client-side Voice Activity Detection running entirely in WebAssembly for instant hands-free speech segmentation.</p>
                    </div>
                    <div className="tech-stack-item">
                      <strong>📊 AGMARKNET & Open Data</strong>
                      <p>Direct integration with Ministry of Agriculture market data endpoints and high-precision meteorological servers.</p>
                    </div>
                    <div className="tech-stack-item">
                      <strong>🚀 React + Node.js Engine</strong>
                      <p>TypeScript-typed reactive frontend with glassmorphic cards and scalable Express backend API orchestrator.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeModal === "privacy" && (
              <div>
                <div className="footer-modal-header">
                  <span className="footer-modal-icon">🛡️</span>
                  <h3>Privacy & Data Security</h3>
                </div>
                <div className="footer-modal-body">
                  <p>
                    Your privacy and data ownership are core principles of Krishak-G. We ensure complete transparency regarding how your voice and location data are handled.
                  </p>
                  <ul>
                    <li><strong>No Voice Recording Persistence:</strong> Spoken audio is processed strictly in-memory to generate responses and transcriptions. Raw voice recordings are never stored or monetized.</li>
                    <li><strong>Local-First Preference Storage:</strong> Your state, district, crop type, and voice settings are stored locally in your browser (`localStorage`) and synced securely to your anonymous device ID.</li>
                    <li><strong>Zero Selling of Farmer Data:</strong> Crop details, mandi queries, and field locations are strictly protected and never shared with third-party advertisers.</li>
                    <li><strong>Client-Side Audio Processing:</strong> Silero VAD runs inside your browser via WebAssembly to detect speech locally before transmitting audio chunks.</li>
                  </ul>
                </div>
              </div>
            )}

            {activeModal === "contact" && (
              <div>
                <div className="footer-modal-header">
                  <span className="footer-modal-icon">💬</span>
                  <h3>Contact & Support</h3>
                </div>
                <div className="footer-modal-body">
                  <p>
                    We welcome feedback, issue reports, and feature suggestions from farmers, agronomy experts, and open-source contributors.
                  </p>
                  <div className="contact-card">
                    <div className="contact-row">
                      <span>📧 Email Support:</span>
                      <strong>support@krishakg.in</strong>
                    </div>
                    <div className="contact-row">
                      <span>🐙 GitHub Issues:</span>
                      <strong>github.com/krishak-g/krishak-g/issues</strong>
                    </div>
                    <div className="contact-row">
                      <span>🌐 Main Website:</span>
                      <strong>krishakg.in</strong>
                    </div>
                  </div>
                  <p style={{ marginTop: "1rem", fontSize: "0.85rem", color: "#8b949e" }}>
                    For urgent field emergency alerts or localized agricultural extension office contacts, consult your nearest Krishi Vigyan Kendra (KVK).
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </footer>
  );
}
