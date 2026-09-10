import { useState } from "react";
import "./LandingPage.css";
import logo from "../assets/logo.svg";
import Footer from "./Footer";

interface LandingPageProps {
  onGetStarted: () => void;
  onStartFieldMode?: () => void;
}

export default function LandingPage({ onGetStarted, onStartFieldMode }: LandingPageProps) {
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: "Do I need internet access to use this?",
      a: "Yes, it needs an internet connection for speech recognition, the assistant, and live prices/weather."
    },
    {
      q: "What languages does it support?",
      a: "Hindi and English with auto-detection and intelligent language fallback based on your saved profile."
    },
    {
      q: "How does hands-free interruption work?",
      a: "You can talk anytime while Krishak-G is speaking. It will immediately stop local playback, cancel the old request, and process your new query."
    },
    {
      q: "Is my information shared with anyone?",
      a: "No. Your profile (name, location, crop, language) is stored locally and securely to personalize mandi prices and weather answers."
    },
    {
      q: "Can I ask follow-up questions?",
      a: "Yes! Krishak-G remembers conversation context so you can ask follow-ups like 'Mere 5 acre ke hisaab se?' naturally."
    }
  ];

  return (
    <div className="landing-page">
      {/* Sticky header */}
      <header className="landing-header">
        <img src={logo} alt="Krishak-G" className="landing-logo" />
        <span className="landing-wordmark">Krishak-G</span>
      </header>

      <div className="landing-content">
        {/* Hero */}
        <section className="landing-hero">
          <img src={logo} alt="" className="landing-hero-logo" />
          <div style={{ display: "inline-block", marginBottom: "0.5rem" }}>
            <span className="dash-badge" style={{ background: "rgba(34, 197, 94, 0.15)", color: "#4ade80", border: "1px solid rgba(34, 197, 94, 0.3)", padding: "0.3rem 0.8rem" }}>
              ⚡ Hands-Free Field Companion for Farmers
            </span>
          </div>
          <h1 className="landing-tagline">
            Talk to your farm. Get answers. <span className="accent">Keep working.</span>
          </h1>
          <p className="landing-description">
            Krishak-G is a voice-native field assistant for Indian farmers. Speak naturally, interrupt anytime, get real-time mandi prices, weather alerts, and crop advice — without touching the screen.
          </p>

          <div style={{ display: "flex", gap: "1rem", marginTop: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
            <button
              type="button"
              className="landing-cta"
              onClick={onStartFieldMode || onGetStarted}
              style={{
                background: "linear-gradient(135deg, #15803d, #22c55e)",
                boxShadow: "0 4px 15px rgba(34, 197, 94, 0.4)",
                fontSize: "1.1rem"
              }}
            >
              🎙️ Start Field Mode
            </button>
            <button
              type="button"
              className="landing-cta"
              onClick={onGetStarted}
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                color: "#ffffff",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                fontSize: "1.05rem"
              }}
            >
              Explore Dashboard →
            </button>
          </div>
        </section>

        {/* How it works */}
        <section style={{ width: "100%", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h2 className="landing-section-title">How It Works</h2>
          <div className="landing-steps">
            <div className="landing-step">
              <span className="step-number">1</span>
              <span className="step-text">Set your location once so prices and weather are always local.</span>
            </div>
            <div className="landing-step">
              <span className="step-number">2</span>
              <span className="step-text">Just talk — no typing, no language menus. Continuous hands-free voice activity detection.</span>
            </div>
            <div className="landing-step">
              <span className="step-number">3</span>
              <span className="step-text">Get mandi prices, weather, and farming answers spoken back to you instantly via Rime AI TTS.</span>
            </div>
            <div className="landing-step">
              <span className="step-number">4</span>
              <span className="step-text">Ask again anytime — it remembers your last conversation.</span>
            </div>
          </div>
        </section>

        {/* Feature highlights */}
        <section style={{ width: "100%", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h2 className="landing-section-title">Features</h2>
          <div className="landing-features">
            <div className="feature-card">
              <span className="feature-icon">🎙️</span>
              <span className="feature-title">Hands-Free Voice</span>
              <span className="feature-desc">Natural conversation — no keyboards needed</span>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🌐</span>
              <span className="feature-title">7 Indian Languages</span>
              <span className="feature-desc">Hindi, English, Marathi, Gujarati, Punjabi, Tamil, Telugu</span>
            </div>
            <div className="feature-card">
              <span className="feature-icon">📊</span>
              <span className="feature-title">Live Market Data</span>
              <span className="feature-desc">Real-time AGMARKNET mandi prices and weather</span>
            </div>
            <div className="feature-card">
              <span className="feature-icon">💬</span>
              <span className="feature-title">Conversation History</span>
              <span className="feature-desc">Review past questions and answers anytime</span>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section style={{ width: "100%", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h2 className="landing-section-title">Frequently Asked Questions</h2>
          <div className="faq-list">
            {faqs.map((faq, index) => {
              const isExpanded = expandedFaqIndex === index;
              return (
                <div key={index} className={`faq-item ${isExpanded ? "expanded" : ""}`}>
                  <button
                    className="faq-question"
                    onClick={() => setExpandedFaqIndex(isExpanded ? null : index)}
                  >
                    <span>{faq.q}</span>
                    <span className="faq-icon">{isExpanded ? "−" : "+"}</span>
                  </button>
                  {isExpanded && (
                    <div className="faq-answer">
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA */}
        <button
          type="button"
          className="landing-cta"
          onClick={onGetStarted}
        >
          Get Started
        </button>
      </div>

      <Footer />
    </div>
  );
}
