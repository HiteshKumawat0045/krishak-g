import { useEffect, useState } from "react";
import "./SplashScreen.css";
import logo from "../assets/logo.svg";

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Start the fade out transition at 1500ms
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 1500);

    // Completely unmount after the total 1800ms
    const finishTimer = setTimeout(() => {
      onFinish();
    }, 1800);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div className={`splash-container ${isFadingOut ? "fade-out" : ""}`}>
      <div className="splash-content">
        <img src={logo} alt="Krishak-G Logo" className="splash-logo" />
        <h1 className="splash-text">Krishak-G</h1>
      </div>
    </div>
  );
}
