        window.disciplinasSelecionadas = new Set();
    // ---> CALENDÁRIO LETIVO/FERIAS/FERIADOS/SABADOS LETIVOS
    // --- CONFIGURAÇÃO DE DATAS POR ANO ---
    // Centralização total da inteligência de calendário
    const CALENDARIO_DINAMICO = {
        "2025": {
            limites: {
                integrado: { inicio: "2025-01-01", fim: "2025-12-31" },
                superior: {
                    s1: { inicio: "2025-01-01", fim: "2025-07-12" },
                    s2: { inicio: "2025-07-27", fim: "2025-12-31" }
                }
            },
            ferias_int: [{ inicio: "2025-06-20", fim: "2025-07-20" }, { inicio: "2025-12-01", fim: "2025-12-31" }],
            ferias_sup: [{ inicio: "2025-06-25", fim: "2025-07-20" }, { inicio: "2025-12-10", fim: "2025-12-31" }],
            feriados: ["2025-01-01", "2025-04-18", "2025-05-01", "2025-09-07", "2025-10-12", "2025-11-02", "2025-11-15", "2025-12-25"],
            sabados: [] 
        },
        "2026": {
            limites: {
                integrado: { inicio: "2026-02-10", fim: "2026-12-11" },
                superior: {
                    s1: { inicio: "2026-02-09", fim: "2026-07-03" },
                    s2: { inicio: "2026-07-22", fim: "2026-12-11" }
                }
            },
            // Férias e recessos específicos por nível
            ferias_int: [
                { inicio: "2026-06-21", fim: "2026-07-21" }, 
                { inicio: "2026-11-30", fim: "2027-01-31" }
            ],
            ferias_sup: [
                { inicio: "2026-06-27", fim: "2026-07-21" }, 
                { inicio: "2026-12-05", fim: "2027-01-31" }
            ],
            // Feriados e Pontos Facultativos Gerais
            feriados: [
                "2026-02-16", "2026-02-17", "2026-02-18", "2026-04-03", "2026-04-20", 
                "2026-04-21", "2026-05-01", "2026-06-04", "2026-06-05", "2026-09-07", 
                "2026-10-12", "2026-10-15", "2026-10-28", "2026-11-02", "2026-11-20", "2026-11-26"
            ],
            sabados: [
                // INTEGRADO
                { data: "2026-03-07", tipo: "integrado", referencia: 1 },
                { data: "2026-03-14", tipo: "integrado", referencia: 2 },
                { data: "2026-03-21", tipo: "integrado", referencia: 4 },
                { data: "2026-03-28", tipo: "integrado", referencia: 5 },
                { data: "2026-04-04", tipo: "integrado", referencia: 1 },
                { data: "2026-04-11", tipo: "integrado", referencia: 3 },
                { data: "2026-04-18", tipo: "integrado", referencia: 4 },
                { data: "2026-04-25", tipo: "integrado", referencia: 5 },
                { data: "2026-05-09", tipo: "integrado", referencia: 1 },
                { data: "2026-05-16", tipo: "integrado", referencia: 2 },
                { data: "2026-05-23", tipo: "integrado", referencia: 1 },
                { data: "2026-05-30", tipo: "integrado", referencia: 3 },
                { data: "2026-06-06", tipo: "integrado", referencia: 5 },
                { data: "2026-06-13", tipo: "integrado", referencia: 2 },
                { data: "2026-06-20", tipo: "integrado", referencia: 5 },
                { data: "2026-07-25", tipo: "integrado", referencia: 1 },
                { data: "2026-08-01", tipo: "integrado", referencia: 2 },
                { data: "2026-08-15", tipo: "integrado", referencia: 3 },
                { data: "2026-08-29", tipo: "integrado", referencia: 4 },
                { data: "2026-09-05", tipo: "integrado", referencia: 5 },
                { data: "2026-09-12", tipo: "integrado", referencia: 1 },
                { data: "2026-09-19", tipo: "integrado", referencia: 2 },
                { data: "2026-09-26", tipo: "integrado", referencia: 3 },
                { data: "2026-10-03", tipo: "integrado", referencia: 4 },
                { data: "2026-10-10", tipo: "integrado", referencia: 5 },
                { data: "2026-10-24", tipo: "integrado", referencia: 4 },
                { data: "2026-10-31", tipo: "integrado", referencia: 1 },
                { data: "2026-11-07", tipo: "integrado", referencia: 1 },
                { data: "2026-11-14", tipo: "integrado", referencia: 1 },
                
                // SUPERIOR S1
                { data: "2026-03-14", tipo: "superior_s1",  referencia: 1 },
                { data: "2026-03-28", tipo: "superior_s1",  referencia: 2 },
                { data: "2026-04-11", tipo: "superior_s1",  referencia: 1 },
                { data: "2026-04-18", tipo: "superior_s1",  referencia: 3 },
                { data: "2026-04-25", tipo: "superior_s1",  referencia: 4 },
                { data: "2026-05-09", tipo: "superior_s1",  referencia: 5 },
                { data: "2026-05-23", tipo: "superior_s1",  referencia: 2 },
                { data: "2026-06-13", tipo: "superior_s1",  referencia: 5 },
                { data: "2026-06-20", tipo: "superior_s1",  referencia: 5 },
                
                // SUPERIOR S2
                { data: "2026-08-01", tipo: "superior_s2",  referencia: 1 },
                { data: "2026-08-15", tipo: "superior_s2",  referencia: 2 },
                { data: "2026-08-29", tipo: "superior_s2",  referencia: 3 },
                { data: "2026-09-12", tipo: "superior_s2",  referencia: 1 },
                { data: "2026-09-26", tipo: "superior_s2",  referencia: 4 },
                { data: "2026-10-03", tipo: "superior_s2",  referencia: 1 },
                { data: "2026-10-10", tipo: "superior_s2",  referencia: 5 },
                { data: "2026-10-24", tipo: "superior_s2",  referencia: 1 },
                { data: "2026-11-14", tipo: "superior_s2",  referencia: 4 }
            ]
        }
    };


// Função que injeta os dados baseada no ano selecionado
function atualizarAbaInfo(anoSelecionado) {
    // Busca dentro de CALENDARIO_DINAMICO as configurações do ano
    const dadosAno = CALENDARIO_DINAMICO[anoSelecionado];

    if (dadosAno && dadosAno.limites) {
        const limites = dadosAno.limites;

        // Atualiza o texto do ano no título da aba Info
        const infoYearEl = document.getElementById('infoYear');
        if (infoYearEl) infoYearEl.textContent = anoSelecionado;

        // Função interna para formatar YYYY-MM-DD para DD/MM/YYYY
        const formatarData = (dataStr) => {
            if (!dataStr) return "--/--/----";
            const dataObj = new Date(dataStr + "T00:00:00");
            return dataObj.toLocaleDateString('pt-BR');
        };

        // Referências dos elementos na Aba Info (IDs conforme Parte 1)
        const integradoEl = document.getElementById('cal-integrado');
        const s1El = document.getElementById('semestre1');
        const s2El = document.getElementById('semestre2');

        // Injeta as datas do Integrado (Anual)
        if (integradoEl && limites.integrado) {
            integradoEl.innerText = `${formatarData(limites.integrado.inicio)} até ${formatarData(limites.integrado.fim)}`;
        }

        // Injeta as datas do Superior (S1 e S2)
        if (s1El && limites.superior && limites.superior.s1) {
            s1El.innerText = `${formatarData(limites.superior.s1.inicio)} até ${formatarData(limites.superior.s1.fim)}`;
        }
        if (s2El && limites.superior && limites.superior.s2) {
            s2El.innerText = `${formatarData(limites.superior.s2.inicio)} até ${formatarData(limites.superior.s2.fim)}`;
        }
    } else {
        console.warn(`Calendário para o ano ${anoSelecionado} não encontrado.`);
    }
}

// Escutador de eventos para o campo de seleção de ANO (ID: yearSelect conforme Parte 1)
document.addEventListener('DOMContentLoaded', () => {
    const selectAno = document.getElementById('yearSelect');
    
    if (selectAno) {
        // Atualiza quando o usuário muda o ano no Select
        selectAno.addEventListener('change', function() {
            atualizarAbaInfo(this.value);
        });
        
        // Chama uma vez ao carregar a página para o ano inicial
        atualizarAbaInfo(selectAno.value);
    }
});


