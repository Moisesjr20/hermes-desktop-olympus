/**
 * Extração text client-side de .docx (Word) e .xlsx (Excel).
 * Permite envio desses binários no modo remoto (API server :8642 sem /api/upload).
 *
 * Dynamic import → bundle inicial não cresce.
 */

export interface OfficeExtractResult {
  text: string;
  charCount: number;
  /** docx tem "páginas lógicas" só se tiver pageBreaks explícitos; não medimos. */
  sheetCount?: number;
}

/** Extrai texto plano de .docx usando mammoth (converte via XML/zip). */
export async function extractDocxText(file: File): Promise<OfficeExtractResult> {
  const mammoth = await import("mammoth/mammoth.browser");
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  const text = (result.value ?? "").trim();
  return { text, charCount: text.length };
}

/**
 * Extrai texto de .xlsx — cada sheet vira seção `--- sheet: NOME ---` com CSV.
 * Para spreadsheets grandes, trunca por nº total de linhas lido (limite do caller).
 */
export async function extractXlsxText(file: File): Promise<OfficeExtractResult> {
  const XLSX = await import("xlsx");
  const arrayBuffer = await file.arrayBuffer();
  const wb = XLSX.read(arrayBuffer, { type: "array" });

  const parts: string[] = [];
  for (const sheetName of wb.SheetNames) {
    const sheet = wb.Sheets[sheetName];
    const csv = XLSX.utils.sheet_to_csv(sheet).trim();
    if (csv.length > 0) {
      parts.push(`--- sheet: ${sheetName} ---\n${csv}`);
    }
  }

  const text = parts.join("\n\n");
  return {
    text,
    charCount: text.length,
    sheetCount: wb.SheetNames.length,
  };
}
