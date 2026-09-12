import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

type PdfHeaderOptions = {
    contentWidth: number;
    currentPage: number;
    pageCount: number;
    title: string;
    subtitle?: string;
    badge?: string;
    lineColor?: string;
    lineWidth?: number;
};

const CURRENT_DIR = dirname(fileURLToPath(import.meta.url));
const BRAND_LOGO_PATHS = [
    resolve(CURRENT_DIR, '../public/logo_simple.png'),
    resolve(CURRENT_DIR, '../../public/logo_simple.png'),
    resolve(CURRENT_DIR, '../../frontend/public/logo_simple.png'),
    resolve(CURRENT_DIR, '../../../frontend/public/logo_simple.png'),
];

function loadBrandLogoDataUrl(): string {
    const logoPath = BRAND_LOGO_PATHS.find((path) => existsSync(path));

    if (!logoPath) {
        throw new Error('Logo dos impressos nao encontrada em backend/public ou frontend/public');
    }

    return `data:image/png;base64,${readFileSync(logoPath).toString('base64')}`;
}

const BRAND_LOGO_DATA_URL = loadBrandLogoDataUrl();

export function buildPdfBrandHeaderStack(options: PdfHeaderOptions) {
    const {
        badge,
        contentWidth,
        currentPage,
        lineColor = '#d7e0ea',
        lineWidth = 1,
        pageCount,
        subtitle,
        title,
    } = options;

    return [
        {
            columns: [
                {
                    width: '*',
                    columns: [
                        {
                            width: 28,
                            image: BRAND_LOGO_DATA_URL,
                            fit: [28, 36],
                            margin: [0, 0, 8, 0],
                        },
                        {
                            width: '*',
                            stack: [
                                { text: 'Fundação de Saude Parreira Horta', bold: true, fontSize: 11, color: '#233d96', margin: [0, 3, 0, 0] },
                                { text: 'HEMOSE - Hemocentro de Sergipe', bold: true, fontSize: 8.5, color: '#1187c8', margin: [0, 2, 0, 0] },
                            ],
                        },
                    ],
                },
                {
                    width: 176,
                    alignment: 'right',
                    stack: [
                        badge ? { text: badge, style: 'headerBadge' } : { text: 'Documento operacional', style: 'headerBadge' },
                        { text: `Pagina ${currentPage} de ${pageCount}`, style: 'headerMeta', margin: [0, 8, 0, 0] },
                    ],
                },
            ],
        },
        {
            margin: [0, 8, 0, 0],
            stack: [
                { text: title, style: 'reportTitle' },
                subtitle ? { text: subtitle, style: 'reportSubtitle', margin: [0, 2, 0, 0] } : { text: '', margin: [0, 0, 0, 0] },
            ],
        },
        {
            canvas: [
                { type: 'line', x1: 0, y1: 10, x2: contentWidth, y2: 10, lineWidth, lineColor },
            ],
        },
    ];
}
