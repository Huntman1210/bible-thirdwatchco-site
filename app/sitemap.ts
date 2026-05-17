import type { MetadataRoute } from "next";
import { generateAllChapterParams } from "@/lib/bible";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://bible.thirdwatchco.com";
  const entries: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 }
  ];
  for (const p of generateAllChapterParams()) {
    entries.push({
      url: `${base}/bible/${p.book}/${p.chapter}/`,
      changeFrequency: "monthly",
      priority: 0.7
    });
  }
  return entries;
}
