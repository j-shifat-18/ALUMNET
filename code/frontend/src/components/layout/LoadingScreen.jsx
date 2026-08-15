"use client";

import Image from "next/image";
import logo from "../../../public/logo.png";

export default function LoadingScreen() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
      }}
    >
      <div className="animate-pulse">
        <Image
          src={logo}
          alt="ALUMNET"
          width={220}
          height={60}
          priority
          className="select-none"
        />
      </div>

      <div
        style={{
          marginTop: "2rem",
          width: "12rem",
          height: "4px",
          backgroundColor: "#e5e7eb",
          borderRadius: "9999px",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "40%",
            height: "100%",
            borderRadius: "9999px",
            background: "linear-gradient(to right, #9ca3af, #374151, #9ca3af)",
            animation: "alumnet-slide 1.2s ease-in-out infinite",
          }}
        />
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes alumnet-slide {
              0% { transform: translateX(-110%); }
              50% { transform: translateX(200%); }
              100% { transform: translateX(400%); }
            }
          `,
        }}
      />
    </div>
  );
}
