export default class GeraNumero {
    private anoCorrente: number;
    private filaDeNumeros: number[];

    constructor() {
        this.anoCorrente = new Date().getFullYear();
        this.filaDeNumeros = [];
        this.inicializarAno();
    }

    inicializarAno() {
        console.log(`[Gerador] Inicializando IDs para o ano ${this.anoCorrente}...`);
        const numeros = [];

        // Gera todos os números possíveis de 0 a 11332 (11333 possibilidades)
        for (let i = 0; i <= 11332; i++) {
            numeros.push(i);
        }

        // Algoritmo de Fisher-Yates para embaralhar o array sem repetições
        for (let i = numeros.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [numeros[i], numeros[j]] = [numeros[j], numeros[i]];
        }

        this.filaDeNumeros = numeros;
    }

    proximoId() {
        const anoAgora = new Date().getFullYear();

        // Se o ano mudou na virada da meia-noite, reinicia a lista do zero
        if (anoAgora !== this.anoCorrente) {
            this.anoCorrente = anoAgora;
            this.inicializarAno();
        }

        // Se a fila esvaziar, significa que você estourou o limite de 11333 requisições no ano
        if (this.filaDeNumeros.length === 0) {
            throw new Error(`Limite de 11.333 IDs esgotado para o ano ${this.anoCorrente}!`);
        }

        // Remove o primeiro número da fila embaralhada
        const numeroSorteado = this.filaDeNumeros.shift();
        if (numeroSorteado === undefined) {
            throw new Error(`Falha ao gerar ID para o ano ${this.anoCorrente}`);
        }

        const numeroFormatado = numeroSorteado.toString().padStart(4, '0');

        return `${this.anoCorrente}${numeroFormatado}`;
    }
}
