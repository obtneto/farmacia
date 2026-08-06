declare module 'pdfmake/build/pdfmake.js' {
    const pdfMake: {
        addVirtualFileSystem(fonts: unknown): void;
        createPdf(docDefinition: object): {
            getBlob(): Promise<Blob>;
        };
    };

    export default pdfMake;
}

declare module 'pdfmake/build/vfs_fonts.js' {
    const pdfFonts: unknown;
    export default pdfFonts;
}
