import { listShipped, getManifest } from "@/lib/bible";

export default function Home() {
  const manifest = getManifest();
  const shipped = manifest.shipped;
  const missing = manifest.missing;
  return (
    <div className="container">
      <h1>The Holy Bible</h1>
      <p>
        King James Version with a plain modern English column. Sixty-six books,
        thirty-one thousand verses, side by side. Free.
      </p>
      <h2>Books</h2>
      <ul className="book-list">
        {shipped.map((b) => (
          <li key={b.slug}>
            <a href={`/bible/${b.slug}/1/`}>
              {b.display} <span style={{ opacity: 0.5, fontSize: "0.85em" }}>· {b.chapters} ch</span>
            </a>
          </li>
        ))}
      </ul>
      {missing.length > 0 && (
        <p style={{ marginTop: "2rem", fontSize: "0.85rem", opacity: 0.6 }}>
          {missing.length} book{missing.length === 1 ? "" : "s"} not yet parsed:{" "}
          {missing.join(", ")}. Run <code>npm run parse-bible</code> after the
          manuscript ships those books.
        </p>
      )}
    </div>
  );
}
