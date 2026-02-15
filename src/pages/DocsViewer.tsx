import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Download, Printer, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MARKDOWN_PATH = "/docs/AIReatro-Platform-Documentation.md";

const DocsViewer = () => {
  const [html, setHtml] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(MARKDOWN_PATH)
      .then((r) => r.text())
      .then((md) => {
        setHtml(parseMarkdown(md));
        setLoading(false);
      })
      .catch(() => {
        setHtml("<p>Failed to load documentation.</p>");
        setLoading(false);
      });
  }, []);

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = MARKDOWN_PATH;
    a.download = "AIReatro-Platform-Documentation.md";
    a.click();
  };

  return (
    <>
      <Helmet>
        <title>Platform Documentation | AIReatro</title>
        <meta name="description" content="Complete technical documentation for the AIReatro Communications Platform." />
      </Helmet>
      <div className="min-h-screen bg-background text-foreground">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
          <div className="max-w-4xl mx-auto flex items-center justify-between px-4 py-3">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <h1 className="text-sm font-semibold">Platform Documentation</h1>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-1" /> Download
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Printer className="h-4 w-4 mr-1" /> PDF
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          {loading ? (
            <p className="text-muted-foreground">Loading documentation...</p>
          ) : (
            <article
              className="prose prose-invert max-w-none
                prose-headings:text-foreground
                prose-h2:border-b prose-h2:border-border prose-h2:pb-2 prose-h2:mt-12
                prose-h3:mt-8
                prose-a:text-primary
                prose-strong:text-foreground
                prose-code:bg-muted prose-code:text-primary prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                prose-pre:bg-muted prose-pre:border prose-pre:border-border
                prose-table:border-collapse
                prose-th:bg-muted prose-th:border prose-th:border-border prose-th:px-3 prose-th:py-2 prose-th:text-left
                prose-td:border prose-td:border-border prose-td:px-3 prose-td:py-2
                prose-hr:border-border
                prose-blockquote:border-l-primary
                prose-li:marker:text-muted-foreground
              "
              dangerouslySetInnerHTML={{ __html: html }}
            />
          )}
        </div>
      </div>
    </>
  );
};

// Simple markdown to HTML parser (no external dependency needed)
function parseMarkdown(md: string): string {
  let html = md;

  // Code blocks (``` ... ```)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_m, lang, code) => {
    return `<pre><code class="language-${lang}">${escapeHtml(code.trim())}</code></pre>`;
  });

  // Tables
  html = html.replace(/^(\|.+\|)\n(\|[-| :]+\|)\n((?:\|.+\|\n?)*)/gm, (_m, header, _sep, body) => {
    const ths = header.split("|").filter(Boolean).map((c: string) => `<th>${c.trim()}</th>`).join("");
    const rows = body.trim().split("\n").map((row: string) => {
      const tds = row.split("|").filter(Boolean).map((c: string) => `<td>${c.trim()}</td>`).join("");
      return `<tr>${tds}</tr>`;
    }).join("");
    return `<table><thead><tr>${ths}</tr></thead><tbody>${rows}</tbody></table>`;
  });

  // Headers
  html = html.replace(/^#### (.+)$/gm, "<h4>$1</h4>");
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");

  // Bold and italic
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // Inline code
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Horizontal rules
  html = html.replace(/^---$/gm, "<hr>");

  // Unordered lists
  html = html.replace(/^- (.+)$/gm, "<li>$1</li>");
  html = html.replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`);

  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, "<li>$1</li>");

  // Paragraphs (lines not already wrapped)
  html = html.replace(/^(?!<[a-z])((?!^\s*$).+)$/gm, "<p>$1</p>");

  // Clean up double paragraphs
  html = html.replace(/<p><(h[1-4]|ul|ol|li|table|pre|hr|blockquote)/g, "<$1");
  html = html.replace(/<\/(h[1-4]|ul|ol|li|table|pre|hr|blockquote)><\/p>/g, "</$1>");

  return html;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export default DocsViewer;
