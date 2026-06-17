// Free, CORS-friendly sources for random cover ingredients.

export interface WikiResult {
  title: string;
  url: string;
}

export interface QuoteResult {
  fullQuote: string;
  tail: string; // last 3-4 words
  author: string;
  url: string;
}

export interface ImageResult {
  url: string;
  pageUrl: string;
  author: string;
}

export async function fetchRandomWiki(): Promise<WikiResult> {
  // Keep rolling until we land on a clean 3-word title with no parentheses.
  for (let i = 0; i < 25; i++) {
    const res = await fetch(
      "https://en.wikipedia.org/api/rest_v1/page/random/summary",
      { headers: { Accept: "application/json" } },
    );
    if (!res.ok) throw new Error("Wikipedia request failed");
    const data = await res.json();
    const title = (data.title as string) ?? "";
    if (title.includes("(") || title.includes(")")) continue;
    const words = title.trim().split(/\s+/);
    if (words.length !== 3) continue;
    return {
      title,
      url:
        (data.content_urls?.desktop?.page as string) ??
        `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
    };
  }
  throw new Error("Couldn't find a 3-word Wikipedia title after 25 tries");
}


export async function fetchRandomQuote(): Promise<QuoteResult> {
  const res = await fetch("https://dummyjson.com/quotes/random");
  if (!res.ok) throw new Error("Quote request failed");
  const data = await res.json();
  const quote: string = data.quote ?? "";
  const cleaned = quote.replace(/[.!?,;:"']+$/g, "").trim();
  const words = cleaned.split(/\s+/);
  const count = words.length >= 4 ? (Math.random() < 0.5 ? 3 : 4) : words.length;
  const tail = words.slice(-count).join(" ");
  return {
    fullQuote: quote,
    tail,
    author: data.author ?? "Unknown",
    url: `https://dummyjson.com/quotes/${data.id}`,
  };
}

export async function fetchRandomImage(): Promise<ImageResult> {
  // Picsum gives us a fresh random image each call via the seed.
  const seed = Math.random().toString(36).slice(2, 10);
  // We hit /info first to learn the author + page, then load the actual image.
  const info = await fetch(`https://picsum.photos/seed/${seed}/info`);
  if (!info.ok) throw new Error("Image lookup failed");
  const data = await info.json();
  return {
    url: `https://picsum.photos/seed/${seed}/900/900`,
    pageUrl: data.url as string,
    author: data.author as string,
  };
}
