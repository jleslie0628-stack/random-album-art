import { useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { createFileRoute } from "@tanstack/react-router";

import "@fontsource/bebas-neue/400.css";
import "@fontsource/space-mono/400.css";
import "@fontsource/space-mono/700.css";
import "@fontsource/playfair-display/400.css";
import "@fontsource/playfair-display/700-italic.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/700.css";
import "@fontsource/archivo-black/400.css";

import {
  fetchRandomImage,
  fetchRandomQuote,
  fetchRandomWiki,
  type ImageResult,
  type QuoteResult,
  type WikiResult,
} from "@/lib/cover-sources";
import {
  randomStyle,
  styleLabel,
  type CoverStyle,
} from "@/lib/cover-styles";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Wiki Band — Random CD Cover Generator" },
      {
        name: "description",
        content:
          "Mash a random Wikipedia article, a random photo, and the tail of a random quote into a fake album cover.",
      },
      { property: "og:title", content: "Wiki Band — Random CD Cover Generator" },
      {
        property: "og:description",
        content:
          "Mash a random Wikipedia article, a random photo, and the tail of a random quote into a fake album cover.",
      },
    ],
  }),
  component: Index,
});

interface Cover {
  id: string;
  band: WikiResult;
  album: QuoteResult;
  image: ImageResult;
  style: CoverStyle;
  explicit: boolean;
  createdAt: number;
}


const HISTORY_KEY = "wikiband.history.v1";

function loadHistory(): Cover[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Cover[];
  } catch {
    return [];
  }
}

function saveHistory(items: Cover[]) {
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, 24)));
  } catch {
    /* ignore quota */
  }
}

function Index() {
  const [cover, setCover] = useState<Cover | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<Cover[]>([]);
  const coverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHistory(loadHistory());
    void generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const [band, album, image] = await Promise.all([
        fetchRandomWiki(),
        fetchRandomQuote(),
        fetchRandomImage(),
      ]);
      const next: Cover = {
        id: crypto.randomUUID(),
        band,
        album,
        image,
        style: randomStyle(),
        explicit: Math.random() < 0.1,
        createdAt: Date.now(),

      };
      setCover(next);
      setHistory((prev) => {
        const updated = [next, ...prev].slice(0, 24);
        saveHistory(updated);
        return updated;
      });
    } catch (e) {
      console.error(e);
      setError("Couldn't reach one of the random sources. Try again?");
    } finally {
      setLoading(false);
    }
  }

  async function download() {
    if (!coverRef.current || !cover) return;
    try {
      const dataUrl = await toPng(coverRef.current, {
        cacheBust: true,
        pixelRatio: 2,
      });
      const link = document.createElement("a");
      link.download = `${cover.band.title.replace(/\s+/g, "_")}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error(e);
      setError("Export failed — the image host may have blocked the snapshot.");
    }
  }

  return (
    <main className="min-h-screen bg-[#0e0e10] text-zinc-100 px-4 py-10 md:py-16">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10 flex flex-col items-start gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
              wiki · band · generator
            </p>
            <h1
              className="mt-2 text-5xl md:text-6xl leading-none text-white"
              style={{ fontFamily: "'Archivo Black', sans-serif" }}
            >
              Fake Album Maker
            </h1>
            <p className="mt-3 max-w-xl text-sm text-zinc-400">
              A random Wikipedia article becomes your band. The tail of a random
              quote becomes the album. A stranger&apos;s photo becomes the cover.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={generate}
              disabled={loading}
              className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:opacity-60"
            >
              {loading ? "Rolling…" : "Roll new cover"}
            </button>
            <button
              onClick={download}
              disabled={!cover || loading}
              className="rounded-full border border-zinc-700 px-5 py-2.5 text-sm font-semibold text-zinc-100 transition hover:bg-zinc-900 disabled:opacity-40"
            >
              Download PNG
            </button>
          </div>
        </header>

        {error && (
          <div className="mb-6 rounded-md border border-red-900/50 bg-red-950/40 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="grid gap-10 md:grid-cols-[1fr_1fr] md:items-start">
          <div>
            <div
              ref={coverRef}
              className="aspect-square w-full max-w-[560px] overflow-hidden shadow-2xl shadow-black/60"
            >
              {cover ? (
                <CoverArt cover={cover} />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-zinc-900 text-zinc-600">
                  Generating…
                </div>
              )}
            </div>
            {cover && (
              <p className="mt-3 text-xs uppercase tracking-widest text-zinc-500">
                Style: {styleLabel(cover.style)}
              </p>
            )}
          </div>

          {cover && (
            <aside className="space-y-6 text-sm">
              <Field
                label="Band (Wikipedia)"
                value={cover.band.title}
                href={cover.band.url}
              />
              <Field
                label="Album (quote tail)"
                value={`"${cover.album.tail}"`}
                detail={`from "${cover.album.fullQuote}" — ${cover.album.author}`}
                href={cover.album.url}
              />
              <Field
                label="Cover photo"
                value={`Photo by ${cover.image.author}`}
                href={cover.image.pageUrl}
              />
              <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-4">
                <p className="mb-2 text-xs uppercase tracking-widest text-zinc-500">
                  Sources
                </p>
                <ul className="space-y-1.5 text-xs">
                  <li>
                    <SourceLink href={cover.band.url} label="Wikipedia article" />
                  </li>
                  <li>
                    <SourceLink href={cover.album.url} label="Quote (DummyJSON)" />
                  </li>
                  <li>
                    <SourceLink href={cover.image.pageUrl} label="Photo (Picsum)" />
                  </li>
                </ul>
              </div>
            </aside>
          )}
        </div>

        {history.length > 1 && (
          <section className="mt-20">
            <div className="mb-4 flex items-end justify-between">
              <h2
                className="text-2xl text-white"
                style={{ fontFamily: "'Archivo Black', sans-serif" }}
              >
                Discography
              </h2>
              <button
                onClick={() => {
                  saveHistory([]);
                  setHistory([]);
                }}
                className="text-xs uppercase tracking-widest text-zinc-500 hover:text-zinc-300"
              >
                Clear
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {history.map((h) => (
                <button
                  key={h.id}
                  onClick={() => setCover(h)}
                  className="group aspect-square overflow-hidden ring-1 ring-zinc-800 transition hover:ring-zinc-500"
                  title={`${h.band.title} — ${h.album.tail}`}
                >
                  <CoverArt cover={h} />
                </button>
              ))}
            </div>
          </section>
        )}

        <footer className="mt-20 border-t border-zinc-900 pt-6 text-xs text-zinc-600">
          Random data from Wikipedia, DummyJSON quotes, and Picsum Photos.
        </footer>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  detail,
  href,
}: {
  label: string;
  value: string;
  detail?: string;
  href?: string;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-zinc-500">{label}</p>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="mt-1 block text-lg text-white underline-offset-4 hover:underline"
        >
          {value}
        </a>
      ) : (
        <p className="mt-1 text-lg text-white">{value}</p>
      )}
      {detail && <p className="mt-1 text-xs text-zinc-500">{detail}</p>}
    </div>
  );
}

function SourceLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-zinc-400 underline decoration-zinc-700 underline-offset-4 hover:text-white hover:decoration-zinc-300"
    >
      {label} ↗
    </a>
  );
}

/* ---------------- Cover art renderer ---------------- */

function CoverArt({ cover }: { cover: Cover }) {
  const { band, album, image, style } = cover;
  const bandName = band.title;
  const albumName = album.tail;

  switch (style) {
    case "indie":
      return (
        <div className="relative h-full w-full bg-black">
          <img
            src={image.url}
            crossOrigin="anonymous"
            alt=""
            className="h-full w-full object-cover opacity-90"
            style={{ filter: "grayscale(0.2) contrast(1.05) sepia(0.15)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70" />
          <div className="absolute inset-0 flex flex-col justify-end p-6">
            <p
              className="text-2xl leading-tight text-white"
              style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}
            >
              {bandName}
            </p>
            <p
              className="mt-1 text-sm uppercase tracking-[0.25em] text-white/80"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              {albumName}
            </p>
          </div>
        </div>
      );

    case "vaporwave":
      return (
        <div className="relative h-full w-full overflow-hidden bg-[#160033]">
          <img
            src={image.url}
            crossOrigin="anonymous"
            alt=""
            className="h-full w-full object-cover"
            style={{ filter: "hue-rotate(220deg) saturate(1.6) contrast(1.1)" }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,0,200,0.25), rgba(0,255,255,0.15) 50%, rgba(0,0,40,0.6))",
              mixBlendMode: "screen",
            }}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <p
              className="text-5xl tracking-widest text-white"
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                textShadow: "3px 3px 0 #ff00aa, -3px -3px 0 #00ffff",
              }}
            >
              {bandName.toUpperCase()}
            </p>
            <p
              className="mt-3 text-xs uppercase tracking-[0.6em] text-cyan-200"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              {albumName}
            </p>
          </div>
        </div>
      );

    case "minimal":
      return (
        <div className="relative h-full w-full bg-[#f3efe7]">
          <div className="absolute inset-0 p-8">
            <div className="h-full w-full overflow-hidden">
              <img
                src={image.url}
                crossOrigin="anonymous"
                alt=""
                className="h-full w-full object-cover"
                style={{ filter: "grayscale(1) contrast(1.05)" }}
              />
            </div>
          </div>
          <div className="absolute inset-0 flex flex-col justify-between p-8">
            <p
              className="text-[10px] uppercase tracking-[0.4em] text-black/70"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {albumName}
            </p>
            <p
              className="self-end text-right text-2xl text-black"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {bandName}
            </p>
          </div>
        </div>
      );

    case "brutalist":
      return (
        <div className="relative h-full w-full bg-[#ff3b00]">
          <img
            src={image.url}
            crossOrigin="anonymous"
            alt=""
            className="absolute inset-0 h-full w-full object-cover mix-blend-multiply"
            style={{ filter: "contrast(1.2) grayscale(1)" }}
          />
          <div className="absolute inset-0 flex flex-col justify-between p-5">
            <p
              className="text-[11px] uppercase tracking-widest text-black"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              ★ {albumName} ★
            </p>
            <p
              className="text-6xl leading-[0.85] text-black"
              style={{ fontFamily: "'Archivo Black', sans-serif" }}
            >
              {bandName.toUpperCase()}
            </p>
          </div>
        </div>
      );

    case "noir":
      return (
        <div className="relative h-full w-full bg-black">
          <img
            src={image.url}
            crossOrigin="anonymous"
            alt=""
            className="h-full w-full object-cover"
            style={{ filter: "grayscale(1) brightness(0.55) contrast(1.4)" }}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <div className="border-y border-white/60 px-6 py-4">
              <p
                className="text-3xl tracking-[0.15em] text-white"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                {bandName.toUpperCase()}
              </p>
            </div>
            <p
              className="mt-5 text-[10px] uppercase tracking-[0.5em] text-white/70"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              — {albumName} —
            </p>
          </div>
        </div>
      );

    case "punk":
    default:
      return (
        <div className="relative h-full w-full bg-yellow-300">
          <img
            src={image.url}
            crossOrigin="anonymous"
            alt=""
            className="h-full w-full object-cover mix-blend-multiply"
            style={{ filter: "contrast(1.4) grayscale(1)" }}
          />
          <div
            className="absolute left-3 top-3 max-w-[85%] -rotate-3 bg-black px-3 py-2"
            style={{ fontFamily: "'Archivo Black', sans-serif" }}
          >
            <p className="text-2xl leading-none text-yellow-300">
              {bandName.toUpperCase()}
            </p>
          </div>
          <div
            className="absolute bottom-4 right-3 rotate-2 bg-white px-3 py-1 ring-2 ring-black"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            <p className="text-xs font-bold uppercase tracking-wider text-black">
              {albumName}
            </p>
          </div>
        </div>
      );
  }
}
