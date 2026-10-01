import {
  ImageResponse,
} from "next/og";

export const runtime =
  "edge";

export const alt =
  "Nexora Realty - Propiedades e Inversiones";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType =
  "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width:
            "100%",
          height:
            "100%",
          display:
            "flex",
          position:
            "relative",
          background:
            "linear-gradient(135deg,#020617 0%,#0f172a 65%,#083344 100%)",
          color:
            "white",
          fontFamily:
            "Arial, sans-serif",
          overflow:
            "hidden",
        }}
      >

        <div
          style={{
            position:
              "absolute",
            width:
              "600px",
            height:
              "600px",
            borderRadius:
              "9999px",
            background:
              "rgba(34,211,238,.13)",
            top:
              "-330px",
            right:
              "-130px",
          }}
        />

        <div
          style={{
            display:
              "flex",
            flexDirection:
              "column",
            justifyContent:
              "center",
            padding:
              "75px 90px",
            width:
              "100%",
          }}
        >

          <div
            style={{
              display:
                "flex",
              alignItems:
                "center",
              marginBottom:
                "38px",
            }}
          >

            <div
              style={{
                display:
                  "flex",
                width:
                  "72px",
                height:
                  "72px",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                background:
                  "#22d3ee",
                color:
                  "#020617",
                borderRadius:
                  "18px",
                fontSize:
                  "38px",
                fontWeight:
                  900,
                marginRight:
                  "22px",
              }}
            >
              N
            </div>

            <div
              style={{
                display:
                  "flex",
                fontSize:
                  "46px",
                fontWeight:
                  900,
                letterSpacing:
                  "-2px",
              }}
            >
              NEXORA

              <span
                style={{
                  color:
                    "#22d3ee",
                  marginLeft:
                    "8px",
                }}
              >
                REALTY
              </span>
            </div>

          </div>

          <div
            style={{
              display:
                "flex",
              flexDirection:
                "column",
            }}
          >

            <div
              style={{
                fontSize:
                  "67px",
                lineHeight:
                  1.05,
                fontWeight:
                  900,
                letterSpacing:
                  "-3px",
                maxWidth:
                  "940px",
              }}
            >
              Propiedades e inversiones
              inmobiliarias
            </div>

            <div
              style={{
                marginTop:
                  "28px",
                fontSize:
                  "29px",
                color:
                  "#94a3b8",
              }}
            >
              Solares • Apartamentos • Casas • Villas • Terrenos • Proyectos
            </div>

            <div
              style={{
                marginTop:
                  "38px",
                display:
                  "flex",
                color:
                  "#67e8f9",
                fontSize:
                  "24px",
                fontWeight:
                  700,
              }}
            >
              República Dominicana
            </div>

          </div>

        </div>

      </div>
    ),
    {
      ...size,
    },
  );
}