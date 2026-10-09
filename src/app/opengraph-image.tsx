import { readFileSync } from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";
import { getTexts } from "@/content";
import { DEFAULT_LOCALE } from "@/content/locales";
import { DATABASE, SERVER } from "@/engine/catalog";
import { type TokenName, parseTokens } from "@/theme/tokens";
import { imageAlt } from "./site-metadata";

const texts = getTexts(DEFAULT_LOCALE);

export const alt = imageAlt(texts);
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const tokens = parseTokens(
  readFileSync(path.join(process.cwd(), "src/theme/tokens.css"), "utf8"),
);

const QUERY: readonly { text: string; token: TokenName }[] = [
  { text: "SELECT", token: "syntax-keyword" },
  { text: " Name, Role ", token: "text" },
  { text: "FROM", token: "syntax-keyword" },
  { text: " dbo.About", token: "text" },
  { text: ";", token: "syntax-operator" },
];

function color(token: TokenName): string {
  return tokens.get(token) ?? "";
}

export default function OpenGraphImage() {
  const { about, shell } = texts;

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        background: color("bg-window"),
        color: color("text"),
        fontSize: 28,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          height: 72,
          padding: "0 48px",
          color: color("text-muted"),
        }}
      >
        {shell.windowTitle}
      </div>
      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          justifyContent: "center",
          margin: "0 32px",
          padding: "0 56px",
          border: `1px solid ${color("border")}`,
          borderTop: `4px solid ${color("accent")}`,
          background: color("bg-editor"),
        }}
      >
        <div style={{ display: "flex", color: color("syntax-comment") }}>
          {`-- ${shell.scripts.about[0]}`}
        </div>
        <div style={{ display: "flex", marginTop: 12 }}>
          {QUERY.map(({ text, token }) => (
            <span key={text} style={{ color: color(token), whiteSpace: "pre" }}>
              {text}
            </span>
          ))}
        </div>
        <div style={{ display: "flex", marginTop: 64, fontSize: 80 }}>
          {about.name}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 8,
            fontSize: 44,
            color: color("text-muted"),
          }}
        >
          {about.role}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 56,
          height: 72,
          marginTop: 32,
          padding: "0 48px",
          background: color("status-connected"),
          color: color("text-on-status"),
        }}
      >
        <span>{shell.connection.connected}</span>
        <span>{SERVER.name}</span>
        <span>{DATABASE}</span>
      </div>
    </div>,
    size,
  );
}
