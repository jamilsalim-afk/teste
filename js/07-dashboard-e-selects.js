function gerarDashboard() {
    const container = document.getElementById('dashboardContent');
    if (!container) {
        console.warn("Elemento #dashboardContent não encontrado no DOM.");
        return;
    }

    // 1. Verificação de Dados
    if (!dataStore || Object.keys(dataStore).length === 0) {
        container.innerHTML = `
            <div class="p-12 text-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl">
                <p class="text-gray-400 italic">Aguardando sincronização com o Gist para gerar indicadores...</p>
            </div>`;
        return;
    }

    // 2. Variáveis de Controle
    let totalAulasGerais = 0;
    let totalAulasComProfessor = 0;
    const totalTurmas = Object.keys(dataStore).length;
    const professoresSet = new Set();
    const contadorProfessores = {};

    // 3. Processamento Analítico
    Object.values(dataStore).forEach(turma => {
        if (!turma?.discs) return;

        Object.values(turma.discs).forEach(disciplina => {
            if (!Array.isArray(disciplina.sch)) return;

            disciplina.sch.forEach(aula => {
                if (!aula) return;

                totalAulasGerais++;
                const nomeRaw = (aula.prof || "").trim();

                if (nomeRaw && nomeRaw !== "N/I") {
                    totalAulasComProfessor++;
                    
                    // Normalização e Tradução
                    const nomeCompleto = (typeof traduzirProfessor === "function") 
                        ? traduzirProfessor(nomeRaw).toUpperCase() 
                        : nomeRaw.toUpperCase();

                    professoresSet.add(nomeCompleto);
                    contadorProfessores[nomeCompleto] = (contadorProfessores[nomeCompleto] || 0) + 1;
                }
            });
        });
    });

    // 4. Cálculos de Performance
    const totalProfessores = professoresSet.size;
    const totalAulasSemProfessor = totalAulasGerais - totalAulasComProfessor;
    const percentualCobertura = totalAulasGerais > 0 
        ? ((totalAulasComProfessor / totalAulasGerais) * 100).toFixed(1) 
        : "0.0";

    // Busca a última data registrada para informar o usuário
    const ultimaData = (typeof getUltimaDataRegistrada === "function") ? getUltimaDataRegistrada() : null;
    const dataFormatada = ultimaData ? ultimaData.toLocaleDateString('pt-BR') : "N/A";

    // 5. Geração do Ranking Docente
    const ranking = Object.entries(contadorProfessores).sort((a, b) => b[1] - a[1]);

    let rankingHTML = `
        <div class="mt-8">
            <div class="flex justify-between items-end mb-4">
                <h3 class="font-bold text-gray-800 flex items-center gap-2">
                    <span class="text-xl">🏆</span> Ranking de Carga Horária Efetiva
                </h3>
                <span class="text-xs text-gray-400 font-medium bg-gray-100 px-2 py-1 rounded">
                    Dados atualizados até: ${dataFormatada}
                </span>
            </div>
            <div class="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
    `;

    ranking.forEach(([nome, qtd], index) => {
        const medalha = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `<span class="text-gray-400">${index + 1}º</span>`;
        const corMedalha = index < 3 ? 'bg-yellow-50' : '';

        rankingHTML += `
            <div class="flex justify-between items-center p-3 border-b border-gray-50 hover:bg-blue-50 transition-all ${corMedalha}">
                <div class="flex items-center gap-4">
                    <div class="w-8 font-bold text-center">${medalha}</div>
                    <button onclick="gerarGraficoProfessor('${nome}')" 
                            class="text-sm font-bold text-blue-600 hover:text-blue-900 transition-colors uppercase text-left">
                        ${nome}
                    </button>
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-sm font-black text-gray-700">${qtd}</span>
                    <span class="text-[10px] text-gray-400 uppercase font-bold">aulas</span>
                </div>
            </div>
        `;
    });

    rankingHTML += `</div></div>`;

    // 6. Montagem Final da Interface
    container.innerHTML = `
        <div class="flex items-center justify-between mb-2">
            <h2 class="text-lg font-black text-gray-800 uppercase tracking-tighter">Indicadores Institucionais</h2>
            <button onclick="exportarDashboardPDF()" class="text-xs bg-gray-800 text-white px-3 py-1 rounded-full hover:bg-black transition-all">
                📥 Exportar PDF
            </button>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            ${gerarCard("Total de Aulas", totalAulasGerais, "#f8fafc", "#e2e8f0")}
            ${gerarCard("Com Professor", totalAulasComProfessor, "#f0fdf4", "#bbf7d0")}
            ${gerarCard("Sem Professor", totalAulasSemProfessor, "#fef2f2", "#fecaca")}
            ${gerarCard("Turmas Ativas", totalTurmas, "#f5f3ff", "#ddd6fe")}
            ${gerarCard("Corpo Docente", totalProfessores, "#fffbeb", "#fef3c7")}
            ${gerarCard("Cobertura", percentualCobertura + "%", "#ecfeff", "#a5f3fc")}
        </div>

        ${rankingHTML}
        
        <div id="containerGraficoDashboard" class="hidden mt-8 p-6 bg-white border border-gray-200 rounded-2xl shadow-sm">
            <canvas id="graficoProfessor" style="max-height: 400px;"></canvas>
        </div>
    `;
}

// Variável para controle de instância do Chart.js (se for usar)
let chartAtual = null;

function gerarGraficoProfessor(nomeProf) {
    // 1. Verificações de Segurança
    if (!dataStore || typeof BASE_HORARIOS === 'undefined') {
        console.warn("Dados ou Base de Horários não carregados.");
        return;
    }

    const containerGrafico = document.getElementById('containerGraficoDashboard');
    const canvas = document.getElementById('graficoProfessor');

    if (!canvas || !containerGrafico) {
        console.warn("Elementos do gráfico não encontrados no Dashboard.");
        return;
    }

    // Exibe o container do gráfico (caso esteja oculto)
    containerGrafico.classList.remove('hidden');
    // Scroll suave até o gráfico para o usuário ver que gerou
    containerGrafico.scrollIntoView({ behavior: 'smooth', block: 'start' });

    const nomeNormalizado = (nomeProf || "").trim().toUpperCase();
    let realizado = Array(12).fill(0);
    let previsto = Array(12).fill(0);

    // ==========================================
    // 🔷 CÁLCULO DO REALIZADO (O que está no Gist)
    // ==========================================
    Object.values(dataStore).forEach(turma => {
        Object.values(turma.discs || {}).forEach(disc => {
            disc.sch?.forEach(a => {
                if (!a?.dtObj) return;
                
                // Traduz o professor da aula para comparar com o selecionado
                const profAulaTraduzido = (typeof traduzirProfessor === "function") 
                    ? traduzirProfessor(a.prof).toUpperCase() 
                    : a.prof.toUpperCase();

                if (profAulaTraduzido === nomeNormalizado) {
                    const info = TRADUCAO?.[a.tag] || { soma: true };
                    if (info.soma) {
                        realizado[a.dtObj.getMonth()]++;
                    }
                }
            });
        });
    });

    // ==========================================
    // 🔷 CÁLCULO DO PREVISTO (Baseado na Grade Base)
    // ==========================================
    const year = document.getElementById('yearSelect').value;
    
    // Otimização: Filtramos a grade base apenas para o professor em questão
    Object.keys(BASE_HORARIOS).forEach(tipo => {
        Object.keys(BASE_HORARIOS[tipo]).forEach(tId => {
            const ehIntegrado = !ehSemestral(tId);
            
            Object.values(BASE_HORARIOS[tipo][tId]).forEach(aulasBase => {
                aulasBase.forEach(aula => {
                    // Compara o professor da base com o nome solicitado
                    const profBaseTrad = (typeof traduzirProfessor === "function") 
                        ? traduzirProfessor(aula.prof).toUpperCase() 
                        : aula.prof.toUpperCase();

                    if (profBaseTrad !== nomeNormalizado) return;

                    // Percorre o ano letivo para projetar as aulas
                    let dataAtual = new Date(year, 0, 1);
                    const dataFimAno = new Date(year, 11, 31);

                    while (dataAtual <= dataFimAno) {
                        if (dataAtual.getDay() === aula.diaSemana) {
                            // Verifica Férias e Feriados
                            const emFerias = ehIntegrado ? estaEmFeriasIntegrado(dataAtual) : estaEmFeriasSuperior(dataAtual);
                            const feriado = (typeof ehFeriado === "function") ? ehFeriado(dataAtual, tipo) : false;

                            if (!emFerias && !feriado) {
                                previsto[dataAtual.getMonth()]++;
                            }
                            // Pula 7 dias após encontrar o dia da semana
                            dataAtual.setDate(dataAtual.getDate() + 7);
                        } else {
                            dataAtual.setDate(dataAtual.getDate() + 1);
                        }
                    }
                });
            });
        });
    });

    // ==========================================
    // 🔷 RENDERIZAÇÃO DO CHART.JS
    // ==========================================
    const ctx = canvas.getContext('2d');
    if (chartAtual) chartAtual.destroy();

    chartAtual = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"],
            datasets: [
                {
                    label: 'Previsto (Grade Ideal)',
                    data: previsto,
                    borderColor: '#2563eb', // Azul
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Realizado (Gist)',
                    data: realizado,
                    borderColor: '#dc2626', // Vermelho
                    backgroundColor: 'transparent',
                    borderWidth: 3,
                    pointStyle: 'rectRounded',
                    pointRadius: 5,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: `PROJEÇÃO VS REALIZADO: ${nomeProf.toUpperCase()}`,
                    font: { size: 16, weight: 'bold' }
                }
            },
            scales: {
                y: { beginAtZero: true, title: { display: true, text: 'Qtd. Aulas' } }
            }
        }
    });
}

/**
 * Gera o HTML de um card de informação para o Dashboard.
 * @param {string} titulo - O rótulo do card.
 * @param {string|number} valor - O dado principal a ser exibido.
 * @param {string} bg - Cor de fundo (Hex ou RGB).
 * @param {string} border - Cor da borda (Hex ou RGB).
 */
function gerarCard(titulo, valor, bg, border) {
    // Tratamento de segurança para strings e números
    const t = (titulo || '').toString().toUpperCase();
    const v = (valor !== undefined && valor !== null) ? valor.toString() : '0';

    // Retorna o template literal com estilos inline (garante consistência independente do CSS externo)
    return `
        <div class="info-card shadow-sm transition-transform hover:scale-[1.02]" 
             style="padding: 12px 8px; 
                    background: ${bg || '#ffffff'}; 
                    border: 1px solid ${border || '#e5e7eb'}; 
                    border-radius: 10px; 
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    min-height: 80px;">
            
            <div class="info-card-title" 
                 style="font-size: 9px; 
                        font-weight: 600; 
                        color: #6b7280; 
                        margin-bottom: 4px;
                        letter-spacing: 0.05em;">
                ${t}
            </div>
            
            <div class="info-card-value" 
                 style="font-size: 20px; 
                        font-weight: 800; 
                        color: #111827;
                        line-height: 1.2;">
                ${v}
            </div>
        </div>
    `;
}

function popularFiltroProfessores() {
    const dataList = document.getElementById("listaProfessores");
    if (!dataList) return;

    let nomesSet = new Set();

    // 🔷 1. Professores do cadastro fixo
    if (typeof PROFESSORES !== 'undefined') {
        Object.values(PROFESSORES).forEach(nome => {
            if (nome) {
                nomesSet.add(formatarNome(nome.trim()));
            }
        });
    }

    // 🔷 2. Professores vindos do dataStore
    Object.keys(dataStore).forEach(tId => {
        Object.values(dataStore[tId].discs).forEach(disc => {
            (disc.sch || []).forEach(aula => {
                if (aula.prof && aula.prof !== "N/I") {
                    const nomeTraduzido =
                        typeof traduzirProfessor === "function"
                            ? traduzirProfessor(aula.prof)
                            : aula.prof;

                    nomesSet.add(
                        formatarNome(nomeTraduzido.trim())
                    );
                }
            });
        });
    });

    // 🔷 3. Ordenação
    const nomesOrdenados = Array.from(nomesSet).sort((a, b) =>
        a.localeCompare(b, 'pt-BR')
    );

    // 🔷 4. Renderização
    dataList.innerHTML = '';

    nomesOrdenados.forEach(nome => {
        const option = document.createElement('option');
        option.value = nome;
        dataList.appendChild(option);
    });
}

function limparResultados() {
    // 🔷 Esconde containers de resultados
    const idsParaEsconder = ['resultadoBusca', 'gradeGeralRender', 'resultadoPivo'];
    idsParaEsconder.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });

    // 🔷 Limpa corpos de tabelas e áreas de renderização
    const containersParaLimpar = [
        'bodyD', 
        'bodyPivo', 
        'bodyRelatorioProf', 
        'bodyRelatorioPrevisto', 
        'bodyRelatorioDiferenca',
        'gradeRender', 
        'gradeTurmaRender'
    ];
    containersParaLimpar.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = '';
    });

    // 🔷 Reset de Selects Dependentes
    const disciplinaSelect = document.getElementById('disciplinaSelect');
    if (disciplinaSelect) {
        disciplinaSelect.disabled = true;
        disciplinaSelect.innerHTML = '<option value="">Selecione a Turma Primeiro</option>';
    }

    // 🔷 Reset de Contadores
    const contRegular = document.getElementById('cont-regular');
    if (contRegular) contRegular.textContent = '0';
    const contExtra = document.getElementById('cont-extra');
    if (contExtra) contExtra.textContent = '0';

    // 🔷 Esconde seletores de semestre
    const semestres = ['semestreSelect', 'semestreSelectPivo'];
    semestres.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });
}

function popularSelects() {
    // Captura de elementos com segurança individual
    const t1 = document.getElementById('turmaSelect');
    const t2 = document.getElementById('turmaSelectPivo');
    const t3 = document.getElementById('turmaSelectSemanal');
    const ps = document.getElementById('profSelect');

    // 🔷 1. PROCESSAMENTO DE TURMAS
    // Ordena as turmas pelo nome legível, não pelo ID técnico
    const turmasOrdenadas = Object.keys(dataStore).sort((a, b) => {
        const nomeA = dataStore[a]?.name || "";
        const nomeB = dataStore[b]?.name || "";
        return nomeA.localeCompare(nomeB);
    });

    const optionsTurmasHtml = '<option value="">-- SELECIONE A TURMA --</option>' +
        turmasOrdenadas
            .map(id => `<option value="${id}">${dataStore[id].name}</option>`)
            .join('');

    // Preenche apenas os elementos que existirem na página atual
    if (t1) t1.innerHTML = optionsTurmasHtml;
    if (t2) t2.innerHTML = optionsTurmasHtml;
    if (t3) t3.innerHTML = optionsTurmasHtml;

    // 🔷 2. PROCESSAMENTO DE PROFESSORES (PADRONIZADO)
    if (ps) {
        const profs = new Set();

        Object.keys(dataStore).forEach(tId => {
            Object.values(dataStore[tId].discs).forEach(disc => {
                disc.sch.forEach(aula => {
                    // Só adiciona se o professor não for "N/I" (Não Informado)
                    if (aula.prof && aula.prof !== "N/I") {
                        // Garante o nome completo através da tradução
                        const nomeCompleto = (typeof traduzirProfessor === "function") 
                            ? traduzirProfessor(aula.prof) 
                            : aula.prof;
                        
                        profs.add(nomeCompleto.trim());
                    }
                });
            });
        });

        // Converte o Set em Array e ordena alfabeticamente
        const profsOrdenados = Array.from(profs).sort((a, b) => a.localeCompare(b));

        ps.innerHTML = '<option value="">-- SELECIONE O PROFESSOR --</option>' +
            profsOrdenados.map(p => `<option value="${p}">${p}</option>`).join('');
    }
}

// ==========================================
// 🔷 EVENTOS DE INTERFACE (COM PROTEÇÃO)
// ==========================================
const turmaSelectEl = document.getElementById('turmaSelect');
const semestreSelectEl = document.getElementById('semestreSelect');

if (turmaSelectEl) {
    turmaSelectEl.onchange = (e) => {
        const tId = e.target.value;
        const semS = document.getElementById('semestreSelect');
        const discS = document.getElementById('disciplinaSelect');

        // 1. Controle de Visibilidade do Semestre
        if (ehSemestral(tId)) {
            semS?.classList.remove('hidden');
        } else {
            semS?.classList.add('hidden');
            // Reset do valor caso mude para uma turma anual
            if (semS) semS.value = "1"; 
        }

        // 2. Limpeza do seletor de disciplinas ao trocar a turma
        if (discS) {
            discS.innerHTML = '<option value="">-- CARREGANDO... --</option>';
            discS.disabled = true;
        }

        // 3. Atualização em cascata
        if (typeof atualizarListaDisciplinas === "function") {
            atualizarListaDisciplinas();
        }
    };
}

if (semestreSelectEl) {
    semestreSelectEl.onchange = () => {
        if (typeof atualizarListaDisciplinas === "function") {
            atualizarListaDisciplinas();
        }
    };
}

function getStartOfWeek(week, year) {
    // Validação básica
    if (!week || !year || isNaN(week) || isNaN(year)) {
        console.warn("Semana ou ano inválido:", week, year);
        return new Date();
    }

    // ISO 8601:
    // A semana 1 é a semana que contém 4 de janeiro
    const jan4 = new Date(year, 0, 4);

    // Converte domingo (0) para 7
    const dayOfWeek = jan4.getDay() === 0 ? 7 : jan4.getDay();

    // Segunda-feira da semana 1
    const mondayWeek1 = new Date(jan4);
    mondayWeek1.setDate(jan4.getDate() - dayOfWeek + 1);

    // Soma as semanas desejadas
    const startDate = new Date(mondayWeek1);
    startDate.setDate(mondayWeek1.getDate() + (week - 1) * 7);

    // Zera horário para evitar problemas na comparação
    startDate.setHours(0, 0, 0, 0);

    console.log(
        `📅 Semana ${week}/${year} começa em: ${startDate.toLocaleDateString('pt-BR')}`
    );

    return startDate;
}

// FUNÇÃO RESPONSÁVEL POR GERAR O CABEÇALHO PADRÃO DOS DOCUMENTOS EM PDF EXPORTADOS
function gerarCabecalhoPadrao(doc) {
    // Título Principal
    doc.setFont("helvetica", "bold"); 
    doc.setFontSize(14);
    doc.text("INSTITUTO FEDERAL DE RONDÔNIA - IFRO", 105, 15, { align: "center" });
    
    // Subtítulo Campus
    doc.setFontSize(12); 
    doc.text("CAMPUS CACOAL", 105, 22, { align: "center" });
    
    // Departamentos e Coordenações
    doc.setFontSize(10); 
    doc.setFont("helvetica", "normal");
    doc.text("DEPARTAMENTO DE APOIO AO ENSINO", 105, 30, { align: "center" });
    doc.text("COORDENAÇÃO DE DESENVOLVIMENTO DE FERRAMENTAS PEDAGÓGICAS", 105, 35, { align: "center" });
    
    // Linha Divisória Verde (RGB correspondente ao Tailwind green-700)
    doc.setDrawColor(21, 128, 61); 
    doc.setLineWidth(0.5); 
    doc.line(14, 38, 196, 38);
}

// FUNÇÃO RESPONSÁVEL POR GERAR O RODAPÉ PADRÃO DOS DOCUMENTOS EM PDF EXPORTADOS
function gerarRodapePadrao(doc) {
    const pageCount = doc.internal.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
        // Seleciona a página para aplicar o rodapé
        doc.setPage(i); 
        doc.setFontSize(8); 
        doc.setTextColor(100); 
        
        // Linha de fechamento no rodapé
        doc.setDrawColor(200); // Cinza claro para a linha do rodapé
        doc.line(14, 285, 196, 285);
        
        // Endereço e Contato (Centralizados)
        doc.text("BR-364, Km 228, Lote 2-A, Zona Rural, Cacoal - RO | Tel: (69) 2182-9642", 105, 289, { align: "center" });
        
        // E-mail e Paginação
        const textoPagina = `E-mail: dape.cacoal@ifro.edu.br | Página ${i} de ${pageCount}`;
        doc.text(textoPagina, 105, 293, { align: "center" });
    }
}

// EXPORTADOR DE PDF DO RELATORIO DE DISCIPLINA DA ABA 01
