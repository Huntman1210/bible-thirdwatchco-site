import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Bible — Thirdwatch Co.", template: "%s — Bible — Thirdwatch Co." },
  description:
    "The King James Bible with a plain modern English column. Free side-by-side reading from Thirdwatch Co.",
  metadataBase: new URL("https://bible.thirdwatchco.com"),
  openGraph: { type: "website", siteName: "Bible — Thirdwatch Co." }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <div className="container">
            <a href="https://thirdwatchco.com" className="brand">THIRDWATCH CO.</a>
            <nav>
              <a href="/">Books</a>
              <a href="https://thirdwatchco.com/why-kjv">Why KJV</a>
              <a href="https://thirdwatchco.com/bible/download">Download</a>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="site-footer">
          <div className="container">
            <p className="footer-cta">Get the full PDF + ePub free.</p>
            <form action="https://thirdwatchco.com/bible/download" method="get" className="klaviyo-fallback">
              <input type="email" name="email" placeholder="you@example.com" aria-label="Email" />
              <button type="submit">Send me the Bible</button>
            </form>
            <p className="copy">
              KJV public domain &middot; Modern English &copy; 2026 Jaymes H. Parson &middot;
              <a href="https://thirdwatchco.com"> thirdwatchco.com</a>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
