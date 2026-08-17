declare module 'pdfmake/src/Printer.js' {
  export default class PdfPrinter {
    constructor(fontDescriptors: Record<string, unknown>, virtualfs?: unknown, urlResolver?: unknown, localAccessPolicy?: unknown)
    createPdfKitDocument(docDefinition: object, options?: object): Promise<NodeJS.WritableStream & {
      end: () => void
      on: (event: 'data', listener: (chunk: Buffer) => void) => void
      on: (event: 'end', listener: () => void) => void
      on: (event: 'error', listener: (error: Error) => void) => void
    }>
  }
}
