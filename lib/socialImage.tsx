import { ImageResponse } from "next/og";

export const socialImageAlt = "LPCS — Công cụ lập kế hoạch vay và tính lịch trả nợ ngân hàng";
export const socialImageSize = { width: 1200, height: 630 };
export const socialImageContentType = "image/png";

export function createSocialImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        padding: "66px 72px",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        overflow: "hidden",
        color: "#f4fbf7",
        background: "#10483e",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: 430,
          height: 430,
          position: "absolute",
          top: -175,
          right: -105,
          display: "flex",
          border: "74px solid rgba(197, 223, 111, 0.16)",
          borderRadius: 999,
        }}
      />
      <div
        style={{
          width: 290,
          height: 290,
          position: "absolute",
          right: 54,
          bottom: -188,
          display: "flex",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          transform: "rotate(45deg)",
        }}
      />

      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div
          style={{
            width: 76,
            height: 76,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#10483e",
            background: "#c5df6f",
            borderRadius: 4,
            fontSize: 25,
            fontWeight: 800,
            letterSpacing: "-1px",
          }}
        >
          LPCS
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <span style={{ color: "#c5df6f", fontSize: 18, fontWeight: 800, letterSpacing: "3px" }}>
            LOAN PAYMENT CALCULATOR SPEC
          </span>
          <span style={{ color: "#a9c2bb", fontSize: 17 }}>
            Công cụ lập kế hoạch vay ngân hàng
          </span>
        </div>
      </div>

      <div style={{ width: 870, display: "flex", flexDirection: "column", gap: 22 }}>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 58, fontWeight: 700, lineHeight: 1.08, letterSpacing: "-2px" }}>
          <span>Tính toán từng đồng</span>
          <span>trước khi đặt bút vay.</span>
        </div>
        <div style={{ color: "#c2d5cf", fontSize: 25, lineHeight: 1.4 }}>
          Tiến độ dự án · Phân bổ nguồn vốn · Lịch trả nợ theo tháng
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 10 }}>
          {["Actual/365", "Nhiều lần giải ngân", "Xuất Excel"].map((item) => (
            <span
              key={item}
              style={{
                padding: "9px 14px",
                display: "flex",
                color: "#d9e7e2",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: 3,
                fontSize: 15,
              }}
            >
              {item}
            </span>
          ))}
        </div>
        <span style={{ color: "#c5df6f", fontSize: 18, fontWeight: 700 }}>LPCS</span>
      </div>
    </div>,
    socialImageSize,
  );
}
