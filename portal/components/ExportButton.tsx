"use client";

// CSV and PDF are generated client-side from already-fetched data.
// For large exports a server-side streaming endpoint would be preferable.

interface Props {
  data: Record<string, unknown>[];
  filename: string;
  columns: string[];
  headers: string[];
}

export function ExportButton({ data, filename, columns, headers }: Props) {
  function exportCsv() {
    const rows = [
      headers.join(","),
      ...data.map((row) =>
        columns
          .map((col) => {
            const val = String(row[col] ?? "");
            return val.includes(",") ? `"${val}"` : val;
          })
          .join(",")
      ),
    ];
    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    triggerDownload(blob, `${filename}.csv`);
  }

  async function exportPdf() {
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");

    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(14);
    doc.text(filename.replace(/-/g, " ").toUpperCase(), 14, 16);

    autoTable(doc, {
      head: [headers],
      body: data.map((row) =>
        columns.map((col) => String(row[col] ?? ""))
      ),
      startY: 22,
      styles: { fontSize: 9 },
    });

    doc.save(`${filename}.pdf`);
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={exportCsv}
        className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 transition-colors"
        aria-label="Export as CSV"
      >
        Export CSV
      </button>
      <button
        onClick={exportPdf}
        className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 transition-colors"
        aria-label="Export as PDF"
      >
        Export PDF
      </button>
    </div>
  );
}

function triggerDownload(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
