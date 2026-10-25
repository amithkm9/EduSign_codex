import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import captions from "./captions.json";

const C = {
  paper: "#F7F6F2",
  ink: "#182840",
  blue: "#3455CF",
  mist: "#DDE5FA",
  muted: "#64718A",
};
const ease = Easing.bezier(0.22, 1, 0.36, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const entry = (frame: number, delay = 0) =>
  interpolate(frame, [delay, delay + 24], [0, 1], { ...clamp, easing: ease });
const chapters = [
  {
    from: 0,
    number: "01",
    title: "A place to begin.",
    tag: "FRENCH SIGN LANGUAGE · AGES 3–15",
    note: "Children + parents, learning together",
  },
  {
    from: 14,
    number: "02",
    title: "Watch. Then try.",
    tag: "SOURCED LESSONS",
    note: "Alphabet · MAE Langue des Signes",
  },
  {
    from: 27,
    number: "03",
    title: "Make practice active.",
    tag: "CAMERA PRACTICE",
    note: "Experimental feedback · not a validated LSF assessment",
  },
  {
    from: 49,
    number: "04",
    title: "A little guidance, on demand.",
    tag: "THE VIDEO ASSISTANT",
    note: "Imported collection · sign language unverified",
  },
  {
    from: 77,
    number: "05",
    title: "Good. Then morning.",
    tag: "WORDS IN SEQUENCE",
    note: "Separate word clips · not a signed sentence translation",
  },
  {
    from: 98,
    number: "06",
    title: "Ask in French or English.",
    tag: "OPTIONAL VOICE INPUT",
    note: "Imported collection · sign language unverified",
  },
  {
    from: 134,
    number: "07",
    title: "See your learning activity.",
    tag: "THE LEARNING NOTEBOOK",
    note: "Viewing activity and comprehension · not signing proficiency",
  },
];

const Brand = ({
  light = false,
  small = false,
}: {
  light?: boolean;
  small?: boolean;
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: small ? 13 : 22,
      color: light ? "white" : C.ink,
    }}
  >
    <div
      style={{
        width: small ? 44 : 78,
        height: small ? 44 : 78,
        borderRadius: small ? 14 : 24,
        background: light ? "#ffffff12" : C.blue,
        display: "grid",
        placeItems: "center",
        border: light ? "1px solid #ffffff38" : undefined,
      }}
    >
      <svg
        width={small ? 29 : 49}
        height={small ? 29 : 49}
        viewBox="0 0 48 48"
        fill="none"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M15 26V13a3 3 0 0 1 6 0v10-15a3 3 0 0 1 6 0v15-12a3 3 0 0 1 6 0v14-8a3 3 0 0 1 6 0v14c0 9-6 14-14 14-6 0-10-3-13-8L7 28a3 3 0 0 1 5-3l5 6" />
      </svg>
    </div>
    <span
      style={{
        fontSize: small ? 31 : 66,
        fontWeight: 700,
        letterSpacing: small ? -1 : -3,
      }}
    >
      EduSign<span style={{ color: light ? "#94AFF8" : C.blue }}>.</span>
    </span>
  </div>
);

const Background = ({ dark = false }: { dark?: boolean }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{ background: dark ? C.ink : C.paper, overflow: "hidden" }}
    >
      <div
        style={{
          position: "absolute",
          width: 1100,
          height: 1100,
          borderRadius: "50%",
          border: `1px solid ${dark ? "#ffffff0b" : "#3455CF12"}`,
          right: -350,
          top: -400,
          transform: `translate(${Math.sin(f / 140) * 20}px,${Math.cos(f / 170) * 12}px)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 850,
          height: 850,
          borderRadius: "50%",
          border: `100px solid ${dark ? "#3455CF16" : "#3455CF06"}`,
          left: -400,
          bottom: -500,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          width: 1100,
          height: 1080,
          background: dark
            ? "radial-gradient(ellipse at 80% 20%, #3455CF30, transparent 65%)"
            : "radial-gradient(ellipse at 80% 20%, #DDE5FA99, transparent 65%)",
        }}
      />
    </AbsoluteFill>
  );
};

const Intro = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: f - 8, fps, config: { damping: 200 } });
  return (
    <AbsoluteFill style={{ color: "white" }}>
      <Background dark />
      <div
        style={{ position: "absolute", left: 110, top: 90, opacity: entry(f) }}
      >
        <Brand light small />
      </div>
      <div
        style={{
          position: "absolute",
          left: 115,
          top: 265,
          opacity: entry(f, 12),
          transform: `translateY(${(1 - p) * 45}px)`,
        }}
      >
        <div
          style={{
            fontSize: 20,
            letterSpacing: 5,
            color: "#A9BDF8",
            fontWeight: 700,
            marginBottom: 32,
          }}
        >
          A WEEKEND BUILD. A HUMAN CONNECTION.
        </div>
        <div
          style={{
            fontSize: 114,
            letterSpacing: -5,
            fontWeight: 700,
            lineHeight: 1.04,
          }}
        >
          One sign.
        </div>
        <div
          style={{
            fontFamily: "Editorial",
            fontSize: 116,
            letterSpacing: -4,
            color: "#A9BDF8",
            lineHeight: 1.15,
          }}
        >
          A closer connection.
        </div>
        <div
          style={{
            fontSize: 30,
            color: "#D1D9E9",
            marginTop: 42,
            opacity: entry(f, 38),
          }}
        >
          French Sign Language, for children and parents.
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 115,
          bottom: 115,
          right: 115,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          opacity: entry(f, 58),
        }}
      >
        <div style={{ display: "flex", gap: 14 }}>
          {["WATCH", "TRY", "CONNECT"].map((label, i) => (
            <div
              key={label}
              style={{
                padding: "16px 25px",
                border: "1px solid #ffffff33",
                borderRadius: 50,
                fontSize: 18,
                letterSpacing: 3,
                opacity: entry(f, 58 + i * 9),
              }}
            >
              {label}
            </div>
          ))}
        </div>
        <span style={{ fontSize: 23, color: "#B9C7E5" }}>
          Built by Amith K M
        </span>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          height: 5,
          width: `${interpolate(f, [0, 210], [0, 100], clamp)}%`,
          background: "#9BB4FF",
        }}
      />
    </AbsoluteFill>
  );
};

const Walkthrough = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const chapter = [...chapters].reverse().find((c) => t >= c.from)!;
  const local = f - chapter.from * 30;
  // Keep the actual recording intact. Subtle camera movement does not simulate clicks.
  const zoom = interpolate(local, [0, 90, 450], [1, 1.025, 1.025], {
    ...clamp,
    easing: ease,
  });
  const caption = captions.find((c) => t >= c.start && t < c.end);
  return (
    <AbsoluteFill>
      <Background />
      <div
        style={{
          position: "absolute",
          left: 72,
          top: 39,
          right: 72,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: C.blue,
              letterSpacing: 2,
            }}
          >
            CHAPTER {chapter.number}
          </div>
          <div
            key={chapter.number}
            style={{
              fontSize: 38,
              fontWeight: 700,
              letterSpacing: -1.2,
              color: C.ink,
              opacity: entry(local),
              transform: `translateY(${(1 - entry(local)) * 12}px)`,
            }}
          >
            {chapter.title}
          </div>
        </div>
        <Brand small />
      </div>
      <div
        style={{
          position: "absolute",
          left: 72,
          top: 106,
          right: 72,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 14,
          color: C.muted,
          letterSpacing: 1.2,
        }}
      >
        <span>{chapter.tag}</span>
        <span>REAL PRODUCT WALKTHROUGH</span>
      </div>
      <div
        style={{
          position: "absolute",
          left: 72,
          top: 145,
          width: 1776,
          height: 815,
          background: "#FAF8F4",
          border: "1px solid #DCE0E9",
          borderRadius: 23,
          overflow: "hidden",
          boxShadow: "0 20px 60px #18284015",
        }}
      >
        <OffthreadVideo
          src={staticFile("recording.mp4")}
          muted
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            transform: `scale(${zoom})`,
            transformOrigin: "50% 50%",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 22,
            bottom: 18,
            maxWidth: 950,
            padding: "10px 16px",
            borderRadius: 30,
            background: "#182840ee",
            color: "white",
            fontSize: 15,
            letterSpacing: 0.2,
          }}
        >
          {chapter.note}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 160,
          right: 160,
          bottom: 31,
          minHeight: 52,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {caption && (
          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: C.ink,
              textAlign: "center",
              lineHeight: 1.25,
            }}
          >
            {caption.text}
          </div>
        )}
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          height: 4,
          width: `${(t / 151) * 100}%`,
          background: C.blue,
        }}
      />
    </AbsoluteFill>
  );
};

const Closing = () => {
  const f = useCurrentFrame();
  const final = entry(f, 220);
  const caption = captions.find(
    (c) => 151 + f / 30 >= c.start && 151 + f / 30 < c.end,
  );
  return (
    <AbsoluteFill style={{ color: "white" }}>
      <Background dark />
      <div style={{ position: "absolute", left: 110, top: 80 }}>
        <Brand light small />
      </div>
      <div
        style={{
          position: "absolute",
          left: 110,
          top: 220,
          right: 110,
          opacity: (1 - final) * entry(f),
          transform: `translateY(${-final * 40}px)`,
        }}
      >
        <div
          style={{
            fontSize: 20,
            letterSpacing: 4,
            color: "#A9BDF8",
            fontWeight: 700,
          }}
        >
          FROM IDEA TO WORKING PRODUCT
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            letterSpacing: -2,
            marginTop: 22,
          }}
        >
          One project. Two roles.
        </div>
        <div style={{ display: "flex", gap: 28, marginTop: 54 }}>
          {[
            {
              name: "Codex",
              role: "MY DEVELOPMENT PARTNER",
              body: "Interface · backend integration\nDebugging · tests · iteration",
            },
            {
              name: "OpenAI API",
              role: "THE IN-APP ASSISTANT",
              body: "Learning guidance · speech transcription\nOptional spoken responses",
            },
          ].map((card, i) => (
            <div
              key={card.name}
              style={{
                flex: 1,
                border: "1px solid #FFFFFF28",
                borderRadius: 28,
                padding: 40,
                background: "#FFFFFF06",
                opacity: entry(f, 12 + i * 12),
                transform: `translateY(${(1 - entry(f, 12 + i * 12)) * 30}px)`,
              }}
            >
              <div
                style={{ fontSize: 16, letterSpacing: 2.5, color: "#A9BDF8" }}
              >
                {card.role}
              </div>
              <div
                style={{
                  fontSize: 52,
                  fontWeight: 700,
                  letterSpacing: -2,
                  margin: "22px 0",
                }}
              >
                {card.name}
              </div>
              <div
                style={{
                  whiteSpace: "pre-line",
                  fontSize: 25,
                  lineHeight: 1.7,
                  color: "#CDD8EC",
                }}
              >
                {card.body}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 110,
          top: 295,
          right: 110,
          opacity: final,
          transform: `translateY(${(1 - final) * 25}px)`,
        }}
      >
        <div style={{ fontSize: 97, fontWeight: 700, letterSpacing: -4 }}>
          Watch. Try.
        </div>
        <div
          style={{
            fontSize: 112,
            fontFamily: "Editorial",
            color: "#A9BDF8",
            letterSpacing: -4,
          }}
        >
          Connect.
        </div>
        <div style={{ fontSize: 29, color: "#CDD8EC", marginTop: 35 }}>
          Building EduSign in public. One improvement at a time.
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 110,
          right: 110,
          bottom: 100,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          opacity: entry(f, 30),
        }}
      >
        <div style={{ fontSize: 25 }}>
          Amith K M <span style={{ color: "#8397BE" }}> / </span> @Amith_Reddy10
        </div>
        <div style={{ fontSize: 19, color: "#A9BDF8", letterSpacing: 2 }}>
          BUILT WITH CODEX · POWERED BY OPENAI
        </div>
      </div>
      {caption && (
        <div
          style={{
            position: "absolute",
            left: 110,
            right: 110,
            bottom: 205,
            fontSize: 25,
            color: "#D1D9E9",
          }}
        >
          {caption.text}
        </div>
      )}
      <div
        style={{
          position: "absolute",
          left: 110,
          bottom: 43,
          color: "#8397BE",
          fontSize: 14,
        }}
      >
        Lesson media: MAE Langue des Signes · Dico Plus LSF. Original screen
        recording and narration: Amith K M.
      </div>
    </AbsoluteFill>
  );
};

export const Demo: React.FC = () => {
  const f = useCurrentFrame();
  const fade = interpolate(f, [0, 15, 5120, 5159], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill
      style={{ background: C.ink, fontFamily: "DemoSans, Arial, sans-serif" }}
    >
      <style>{`@font-face{font-family:DemoSans;src:url('${staticFile("Arial.ttf")}')}@font-face{font-family:DemoSans;src:url('${staticFile("Arial-Bold.ttf")}');font-weight:700}@font-face{font-family:Editorial;src:url('${staticFile("Georgia-Italic.ttf")}')}`}</style>
      <AbsoluteFill style={{ opacity: fade }}>
        <Sequence durationInFrames={210}>
          <Intro />
        </Sequence>
        <Sequence from={210} durationInFrames={4530}>
          <Walkthrough />
        </Sequence>
        <Sequence from={4740} durationInFrames={420}>
          <Closing />
        </Sequence>
        {[210, 4740].map((at) => (
          <Sequence key={at} from={at - 8} durationInFrames={16}>
            <Transition />
          </Sequence>
        ))}
      </AbsoluteFill>
      <Audio src={staticFile("mix.wav")} />
    </AbsoluteFill>
  );
};
const Transition = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        background: C.paper,
        opacity: interpolate(f, [0, 7, 15], [0, 0.95, 0], clamp),
      }}
    />
  );
};
