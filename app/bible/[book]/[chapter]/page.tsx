import { getBook, getChapter, generateAllChapterParams } from "@/lib/bible";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return generateAllChapterParams();
}

type Params = { book: string; chapter: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { book, chapter } = await params;
  const data = getChapter(book, parseInt(chapter, 10));
  if (!data) return { title: "Not found" };
  return {
    title: `${data.book.book} ${data.chapter.num}`,
    description: data.chapter.summary || `${data.book.book} chapter ${data.chapter.num} — KJV with plain modern English.`,
    alternates: { canonical: `https://bible.thirdwatchco.com/bible/${book}/${chapter}/` }
  };
}

export default async function ChapterPage({ params }: { params: Promise<Params> }) {
  const { book, chapter } = await params;
  const chNum = parseInt(chapter, 10);
  const data = getChapter(book, chNum);
  if (!data) notFound();

  const bookData = getBook(book)!;
  const chapters = bookData.chapters.map((c) => c.num).sort((a, b) => a - b);
  const idx = chapters.indexOf(chNum);
  const prev = idx > 0 ? chapters[idx - 1] : null;
  const next = idx < chapters.length - 1 ? chapters[idx + 1] : null;

  const audioUrl = `https://audio.thirdwatchco.com/${book}/${chNum}.mp3`;
  const schema = {
    "@context": "https://schema.org",
    "@type": "Chapter",
    name: `${data.book.book} ${data.chapter.num}`,
    isPartOf: {
      "@type": "Book",
      name: data.book.book,
      bookFormat: "https://schema.org/EBook",
      inLanguage: "en"
    }
  };

  return (
    <div className="container">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <h1>{data.book.book} {data.chapter.num}</h1>
      {data.chapter.summary && <p style={{ fontStyle: "italic", color: "var(--stone)" }}>{data.chapter.summary}</p>}
      <audio controls preload="none" src={audioUrl}>
        Your browser does not support the audio element.
      </audio>
      <table className="verse-table">
        <thead>
          <tr>
            <th className="v-num">v</th>
            <th>King James Version</th>
            <th>Modern English</th>
          </tr>
        </thead>
        <tbody>
          {data.chapter.verses.map((v) => (
            <tr key={v.v}>
              <td className="v-num">{v.v}</td>
              <td className="kjv">{v.kjv}</td>
              <td className="modern">{v.modern}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <nav className="chapter-nav">
        {prev ? <a href={`/bible/${book}/${prev}/`}>← {data.book.book} {prev}</a> : <span />}
        {next ? <a href={`/bible/${book}/${next}/`}>{data.book.book} {next} →</a> : <span />}
      </nav>
    </div>
  );
}
