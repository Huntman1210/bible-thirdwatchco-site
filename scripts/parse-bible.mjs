// Parse bible-modern markdown into per-book JSON.
import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const MANUSCRIPT_ROOT = "C:\\Users\\hunte\\bible-modern";
const OUT_ROOT = path.join(process.cwd(), "data", "bible");

const BOOKS = [
  ["genesis", "Genesis"], ["exodus", "Exodus"], ["leviticus", "Leviticus"],
  ["numbers", "Numbers"], ["deuteronomy", "Deuteronomy"], ["joshua", "Joshua"],
  ["judges", "Judges"], ["ruth", "Ruth"], ["1samuel", "1 Samuel"],
  ["2samuel", "2 Samuel"], ["1kings", "1 Kings"], ["2kings", "2 Kings"],
  ["1chronicles", "1 Chronicles"], ["2chronicles", "2 Chronicles"],
  ["ezra", "Ezra"], ["nehemiah", "Nehemiah"], ["esther", "Esther"],
  ["job", "Job"], ["psalms", "Psalms"], ["proverbs", "Proverbs"],
  ["ecclesiastes", "Ecclesiastes"], ["songofsolomon", "Song of Solomon"],
  ["isaiah", "Isaiah"], ["jeremiah", "Jeremiah"], ["lamentations", "Lamentations"],
  ["ezekiel", "Ezekiel"], ["daniel", "Daniel"], ["hosea", "Hosea"],
  ["joel", "Joel"], ["amos", "Amos"], ["obadiah", "Obadiah"], ["jonah", "Jonah"],
  ["micah", "Micah"], ["nahum", "Nahum"], ["habakkuk", "Habakkuk"],
  ["zephaniah", "Zephaniah"], ["haggai", "Haggai"], ["zechariah", "Zechariah"],
  ["malachi", "Malachi"], ["matthew", "Matthew"], ["mark", "Mark"],
  ["luke", "Luke"], ["john", "John"], ["acts", "Acts"], ["romans", "Romans"],
  ["1corinthians", "1 Corinthians"], ["2corinthians", "2 Corinthians"],
  ["galatians", "Galatians"], ["ephesians", "Ephesians"], ["philippians", "Philippians"],
  ["colossians", "Colossians"], ["1thessalonians", "1 Thessalonians"],
  ["2thessalonians", "2 Thessalonians"], ["1timothy", "1 Timothy"],
  ["2timothy", "2 Timothy"], ["titus", "Titus"], ["philemon", "Philemon"],
  ["hebrews", "Hebrews"], ["james", "James"], ["1peter", "1 Peter"],
  ["2peter", "2 Peter"], ["1john", "1 John"], ["2john", "2 John"],
  ["3john", "3 John"], ["jude", "Jude"], ["revelation", "Revelation"]
];

const COMBINED_BOOKS = new Set([
  "genesis", "exodus", "leviticus", "numbers", "deuteronomy", "joshua",
  "judges", "ruth", "1samuel", "2samuel", "1kings", "2kings",
  "1chronicles", "2chronicles", "ezra"
]);

function parseBookMarkdown(md, displayName) {
  const lines = md.split(/\r?\n/);
  const chapters = [];
  let currentChapter = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const chMatch = line.match(/^##\s+Chapter\s+(\d+)\s*$/i);
    if (chMatch) {
      currentChapter = { num: parseInt(chMatch[1], 10), verses: [], summary: "" };
      chapters.push(currentChapter);
      for (let j = i + 1; j < Math.min(i + 8, lines.length); j++) {
        const sm = lines[j].match(/^\*([^*]+)\*\s*$/);
        if (sm) { currentChapter.summary = sm[1]; break; }
        if (lines[j].startsWith("|")) break;
      }
      continue;
    }
    if (currentChapter && line.startsWith("|")) {
      const cells = line.split("|").map((c) => c.trim());
      if (cells.length >= 5) {
        const vNum = cells[1];
        const kjv = cells[2];
        const modern = cells[3];
        if (/^\d+$/.test(vNum) && kjv && modern && kjv !== "King James Version") {
          currentChapter.verses.push({ v: parseInt(vNum, 10), kjv, modern });
        }
      }
    }
  }
  return { book: displayName, chapters: chapters.filter((c) => c.verses.length > 0) };
}

function splitCombinedBible(md) {
  // Prefix-based matching so headers like
  // "THE FIFTH BOOK OF MOSES called DEUTERONOMY" still resolve,
  // and timeline-marker H1s like "THE ASSYRIAN PERIOD ENDS — 612 BC"
  // are ignored entirely (they don't match any book prefix).
  const titleToSlug = {
    "THE FIRST BOOK OF MOSES": "genesis",
    "THE SECOND BOOK OF MOSES": "exodus",
    "THE THIRD BOOK OF MOSES": "leviticus",
    "THE FOURTH BOOK OF MOSES": "numbers",
    "THE FIFTH BOOK OF MOSES": "deuteronomy",
    "THE BOOK OF JOSHUA": "joshua",
    "THE BOOK OF JUDGES": "judges",
    "THE BOOK OF RUTH": "ruth",
    "THE FIRST BOOK OF SAMUEL": "1samuel",
    "THE SECOND BOOK OF SAMUEL": "2samuel",
    "THE FIRST BOOK OF THE KINGS": "1kings",
    "THE SECOND BOOK OF THE KINGS": "2kings",
    "THE FIRST BOOK OF THE CHRONICLES": "1chronicles",
    "THE SECOND BOOK OF THE CHRONICLES": "2chronicles",
    "THE BOOK OF EZRA": "ezra"
  };

  const lines = md.split(/\r?\n/);
  const bookH1s = [];
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].startsWith("# ") || lines[i].startsWith("## ")) continue;
    const titleKey = lines[i].replace(/^#\s+/, "").trim().toUpperCase();
    for (const [prefix, slug] of Object.entries(titleToSlug)) {
      if (titleKey.startsWith(prefix)) {
        bookH1s.push({ start: i, slug });
        break;
      }
    }
  }

  const sections = {};
  for (let bi = 0; bi < bookH1s.length; bi++) {
    const start = bookH1s[bi].start;
    const end = bi + 1 < bookH1s.length ? bookH1s[bi + 1].start : lines.length;
    sections[bookH1s[bi].slug] = lines.slice(start, end).join("\n");
  }
  return sections;
}

async function main() {
  await mkdir(OUT_ROOT, { recursive: true });
  const manifest = { generatedAt: new Date().toISOString(), shipped: [], missing: [] };

  const combinedPath = path.join(MANUSCRIPT_ROOT, "bible.md");
  let combinedSections = {};
  if (existsSync(combinedPath)) {
    const md = await readFile(combinedPath, "utf8");
    combinedSections = splitCombinedBible(md);
    console.log(`combined bible.md -> ${Object.keys(combinedSections).length} books`);
  }

  for (const [slug, display] of BOOKS) {
    let md = null;
    if (COMBINED_BOOKS.has(slug)) {
      md = combinedSections[slug] ?? null;
    } else {
      const p = path.join(MANUSCRIPT_ROOT, `${slug}.md`);
      if (existsSync(p)) md = await readFile(p, "utf8");
    }
    if (!md) { manifest.missing.push(slug); continue; }
    const parsed = parseBookMarkdown(md, display);
    if (parsed.chapters.length === 0) { manifest.missing.push(slug); continue; }
    const outPath = path.join(OUT_ROOT, `${slug}.json`);
    await writeFile(outPath, JSON.stringify(parsed, null, 2));
    manifest.shipped.push({ slug, display, chapters: parsed.chapters.length });
    console.log(`  ok ${slug} (${parsed.chapters.length} chapters)`);
  }

  await writeFile(path.join(process.cwd(), "data", "build-manifest.json"),
    JSON.stringify(manifest, null, 2));
  console.log(`\nShipped: ${manifest.shipped.length} books | Missing: ${manifest.missing.length}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
