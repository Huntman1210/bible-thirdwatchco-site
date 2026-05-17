import { readFileSync, existsSync, readdirSync } from "fs";
import path from "path";

export type Verse = { v: number; kjv: string; modern: string };
export type Chapter = { num: number; verses: Verse[]; summary?: string };
export type Book = { book: string; chapters: Chapter[] };
export type ManifestEntry = { slug: string; display: string; chapters: number };

const DATA_DIR = path.join(process.cwd(), "data", "bible");
const MANIFEST = path.join(process.cwd(), "data", "build-manifest.json");

export function getManifest(): { shipped: ManifestEntry[]; missing: string[] } {
  if (!existsSync(MANIFEST)) return { shipped: [], missing: [] };
  return JSON.parse(readFileSync(MANIFEST, "utf8"));
}

export function getBook(slug: string): Book | null {
  const p = path.join(DATA_DIR, `${slug}.json`);
  if (!existsSync(p)) return null;
  return JSON.parse(readFileSync(p, "utf8")) as Book;
}

export function getChapter(slug: string, chapterNum: number): { book: Book; chapter: Chapter } | null {
  const book = getBook(slug);
  if (!book) return null;
  const chapter = book.chapters.find((c) => c.num === chapterNum);
  if (!chapter) return null;
  return { book, chapter };
}

export function listShipped(): ManifestEntry[] {
  return getManifest().shipped;
}

export function generateAllChapterParams(): { book: string; chapter: string }[] {
  const params: { book: string; chapter: string }[] = [];
  if (!existsSync(DATA_DIR)) return params;
  for (const file of readdirSync(DATA_DIR)) {
    if (!file.endsWith(".json")) continue;
    const slug = file.replace(/\.json$/, "");
    const book = getBook(slug);
    if (!book) continue;
    for (const ch of book.chapters) {
      params.push({ book: slug, chapter: String(ch.num) });
    }
  }
  return params;
}
