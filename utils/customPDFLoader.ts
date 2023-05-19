import type { TextItem } from 'pdfjs-dist/types/src/display/api.js';
import { Document } from 'langchain/document';

export async function customPDFLoader(
  raw: Buffer,
  filename: string = '',
): Promise<Document[]> {
  const mod = await import('pdfjs-dist');
  console.log('mod', mod);

  const { getDocument, version } = mod;
  const pdf = await getDocument({
    data: new Uint8Array(raw.buffer),
    useWorkerFetch: false,
    isEvalSupported: false,
    useSystemFonts: true,
  }).promise;
  const meta = await pdf.getMetadata().catch(() => null);

  const documents: Document[] = [];

  for (let i = 1; i <= pdf.numPages; i += 1) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items.map((item) => (item as TextItem).str).join('\n');
  
    documents.push(
      new Document({
        pageContent: text,
        metadata: {
          source: filename,
          pdf: {
            totalPages: pdf.numPages,
          },
          loc: {
            pageNumber: i,
          },
        },
      }),
    );
  }

  return documents;
}
