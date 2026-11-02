/**
 * PDF text extraction via pdf.js — para o modo remoto, onde o agente não tem
 * acesso ao filesystem do cliente. PDFs textuais (extratos, contratos, docs)
 * viram text-file inline sem precisar de upload.
 *
 * Scans/imagens PDF retornam texto vazio → o caller decide o fallback.
 *
 * Usa dynamic import pra não inchar o bundle inicial.
 */

export interface PdfExtractResult {
  /** Texto concatenado de todas as páginas, separado por `\n\n`. */
  text: string;
  /** Número de páginas processadas. */
  pageCount: number;
  /** Caracteres (post-trim por página). Zero = provável scan/imagem. */
  charCount: number;
}

/**
 * Extrai texto de um PDF. Lança se o arquivo for inválido/corrompido.
 * Retorna texto vazio (charCount=0) se o PDF for só imagens.
 */
export async function extractPdfText(file: File): Promise<PdfExtractResult> {
  // Dynamic import — carrega pdf.js sob demanda (zero cost pra quem não usa PDF).
  // Usa o build legacy (sem worker thread) por simplicidade — bom pra <50 páginas.
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");

  // Desabilita worker: tudo roda no main thread. Simpler, no CORS, no build config.
  // Tradeoff: PDFs grandes travam a UI. Pra extratos / docs normais (<50 páginas) é ok.
  pdfjs.GlobalWorkerOptions.workerSrc = "";

  const buffer = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({
    data: buffer,
  });

  const doc = await loadingTask.promise;
  const parts: string[] = [];
  let charCount = 0;

  for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
    const page = await doc.getPage(pageNum);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item: unknown) => {
        const i = item as { str?: unknown };
        return typeof i.str === "string" ? i.str : "";
      })
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    if (pageText.length > 0) {
      parts.push(`--- página ${pageNum} ---\n${pageText}`);
      charCount += pageText.length;
    }
  }

  await loadingTask.destroy();

  return {
    text: parts.join("\n\n"),
    pageCount: doc.numPages,
    charCount,
  };
}
