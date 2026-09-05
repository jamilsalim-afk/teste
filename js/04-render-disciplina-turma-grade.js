function renderD() {
    // 1. CAPTURA DE ELEMENTOS
    const tSelect = document.getElementById('turmaSelect');
    const dSelect = document.getElementById('disciplinaSelect');
    const sSelect = document.getElementById('semestreSelect');
    const b = document.getElementById('bodyD');
    const resBusca = document.getElementById('resultadoBusca');

    if (!tSelect || !dSelect || !b) return;

    const tId = tSelect.value;
    const dNomeOriginal = dSelect.options[dSelect.selectedIndex]?.text || "";
    const sem = sSelect ? sSelect.value : "1";

    // 2. RESET INICIAL
    b.innerHTML = '';
    let sR = 0, sE = 0;

    if (!tId || !dNomeOriginal) return;

    // 3. ACESSO AOS DADOS
    const turma = dataStore?.[tId];
    if (!turma || !turma.discs) {
        b.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-red-500">Turma não encontrada.</td></tr>`;
        return;
    }

    const normalizar = (txt) => {
        return (txt || "").toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ");
    };

    const nomeBusca = normalizar(dNomeOriginal);
    const disciplinasLista = Object.values(turma.discs);

// 🔴 1. TENTA MATCH EXATO PRIMEIRO
let disc = disciplinasLista.find(d => {
    return normalizar(d.name) === nomeBusca;
});

// 🔴 2. SE NÃO ENCONTRAR, AÍ SIM USA INCLUDES (fallback controlado)
if (!disc) {
    disc = disciplinasLista.find(d => {
        const nomeDisc = normalizar(d.name);
        return nomeDisc.includes(nomeBusca) || nomeBusca.includes(nomeDisc);
    });
}

    if (!disc || !Array.isArray(disc.sch)) {
        b.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-gray-500 italic">Sem aulas registradas para "${dNomeOriginal}".</td></tr>`;
        resBusca?.classList.remove('hidden');
        return;
    }

    // 5. PROCESSAMENTO E FILTRAGEM
    disc.sch.forEach(a => {
        if (!a || !a.dtObj) return;

        // FILTRO DE SEMESTRE (Mantido)
        if (typeof ehSemestral === "function" && ehSemestral(tId)) {
            const dataAula = new Date(a.dtObj);
            const anoAtual = document.getElementById('yearSelect')?.value || new Date().getFullYear();
            const limites = CALENDARIO_DINAMICO[anoAtual]?.limites;

            if (limites?.superior) {
                const fimS1 = new Date(limites.superior.s1.fim + "T23:59:59");
                const pertenceAoSelec = (sem === "1") ? (dataAula <= fimS1) : (dataAula > fimS1);
                if (!pertenceAoSelec) return;
            }
        }

        // --- LÓGICA DE TRADUÇÃO E TAG (CORRIGIDA) ---
        let info;
        const ehSabado = a.wd && a.wd.toLowerCase().includes("sábado");

        if (ehSabado) {
            // Se for sábado, força a tradução de Sábado Letivo (Verde)
            info = TRADUCAO["SÁBADO LETIVO"];
        } else {
            // Caso contrário, busca a tag da aula ou define como NORMAL
            info = (typeof TRADUCAO !== 'undefined' && TRADUCAO[a.tag])
                ? TRADUCAO[a.tag]
                : {
                    texto: a.tag || "NORMAL",
                    class: "bg-gray-100 text-gray-600 border-gray-200",
                    soma: true
                };
        }

        // Soma nos contadores
        if (info.soma) { sR++; } else { sE++; }

        // RENDERIZAÇÃO DA LINHA
        b.innerHTML += `
            <tr class="hover:bg-blue-50 transition-colors">
                <td class="border p-2 text-center text-sm font-medium">
                    ${a.date || '-'}
                </td>
                <td class="border p-2 uppercase text-[10px] text-gray-500 text-center">
                    ${a.wd || '-'}
                </td>
                <td class="border p-2 text-center text-sm">
                    ${a.time || '-'}
                </td>
                <td class="border p-2 font-semibold text-gray-700 text-sm">
                    ${(a.prof || '-').split(' ')[0]}
                </td>
                <td class="border p-1 text-center">
                    <span class="px-2 py-0.5 rounded text-[9px] font-black border ${info.class}">
                        ${info.texto}
                    </span>
                </td>
            </tr>
        `;
    });

    if (b.innerHTML === '') {
        b.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-gray-400 italic">Nenhuma aula encontrada.</td></tr>`;
    }

    if (typeof atualizarContadores === "function") {
        atualizarContadores(sR, sE);
    }
    resBusca?.classList.remove('hidden');
}

function atualizarListaDisciplinas() {
    const tId = document.getElementById('turmaSelect').value;
    const sem = document.getElementById('semestreSelect').value;
    const dS = document.getElementById('disciplinaSelect');
    const year = document.getElementById('yearSelect').value;

    if (!dS) return;

    // Reset padrão
    dS.innerHTML = '<option value="">-- SELECIONE A DISCIPLINA --</option>';
    dS.disabled = true;

    // Validação de existência da turma no Store
    if (!tId || !dataStore[tId]) return;

    // 🔷 1. CONFIGURAÇÃO DE LIMITES DO SEMESTRE
    const dadosAno = CALENDARIO_DINAMICO[year];
    const limites = dadosAno ? dadosAno.limites : null;
    let limiteS1 = null;

    if (limites?.superior?.s1) {
        // Define o timestamp exato do fim do semestre 1 (23:59:59)
        limiteS1 = new Date(limites.superior.s1.fim + "T23:59:59").getTime();
    }

    // 🔷 2. PROCESSAMENTO E FILTRAGEM DE DISCIPLINAS
    const disciplinas = Object.keys(dataStore[tId].discs).sort((a, b) => {
        const nomeA = dataStore[tId].discs[a].name;
        const nomeB = dataStore[tId].discs[b].name;
        return nomeA.localeCompare(nomeB, 'pt-BR', { sensitivity: 'base' });
    });

    disciplinas.forEach(id => {
        const discObj = dataStore[tId].discs[id];
        const nomeDisc = discObj.name.toUpperCase();

        // 🔷 FILTRO A: Disciplinas Administrativas/Ocultas
        if (typeof DISCIPLINAS_OCULTAR !== 'undefined' && DISCIPLINAS_OCULTAR.includes(nomeDisc)) {
            return;
        }

        // 🔷 FILTRO B: Validação de existência de aulas no semestre selecionado
        const temAulaNoPeriodo = discObj.sch.some(a => {
            if (!a || !a.dtObj) return false;

            // Se for curso técnico (anual), qualquer aula serve
            if (!ehSemestral(tId) || !limiteS1) return true;

            const tempoAula = a.dtObj.getTime();
            
            // Filtro dinâmico: S1 (até o limite) ou S2 (após o limite)
            return (sem === "1") ? (tempoAula <= limiteS1) : (tempoAula > limiteS1);
        });

        if (temAulaNoPeriodo) {
            const option = document.createElement('option');
            option.value = id;
            option.textContent = discObj.name;
            dS.appendChild(option);
        }
    });

    // Libera o select se houver disciplinas disponíveis
    if (dS.options.length > 1) {
        dS.disabled = false;
    }

    // 🔷 3. AUTO-RENDERIZAÇÃO
    // Se por acaso já houver uma disciplina selecionada, dispara a renderização da tabela
    if (dS.value && typeof renderD === "function") {
        renderD();
    }
}

// ==========================================
// 🔷 EVENTO DE SELEÇÃO DE DISCIPLINA
// ==========================================
const disciplinaSelectEl = document.getElementById('disciplinaSelect');

if (disciplinaSelectEl) {
    disciplinaSelectEl.onchange = () => {
        // Garante que a renderização só ocorra se houver uma disciplina válida
        if (disciplinaSelectEl.value && typeof renderD === "function") {
            renderD();
        } else {
            // Caso o usuário volte para a opção padrão, limpa os resultados
            if (typeof limparResultados === "function") {
                limparResultados();
            }
        }
    };
}
        
// ABA 02
// FUNÇÃO RESPONSÁVEL POR GERAR O RELATÓRIO DE AULAS MENSAL POR TURMA
function renderPivo() {
    // 1. Captura de Elementos
    const tId = document.getElementById('turmaSelectPivo')?.value;
    const sem = document.getElementById('semestreSelectPivo')?.value;
    const b = document.getElementById('bodyPivo');
    const year = document.getElementById('yearSelect')?.value;

    if (!b) return;

    // 2. Validação de Dados Iniciais
    if (!tId || !dataStore[tId]) {
        b.innerHTML = `<tr><td colspan="15" class="p-4 text-center text-gray-500 italic">Selecione uma turma para visualizar o resumo mensal.</td></tr>`;
        return;
    }

    // 3. Configuração de Calendário e Limites
    const dadosAno = (typeof CALENDARIO_DINAMICO !== 'undefined') ? CALENDARIO_DINAMICO[year] : null;
    const limites = dadosAno ? dadosAno.limites : null;
    let limiteS1 = null;

    if (limites?.superior?.s1) {
        // Define o limite exato do fim do S1 para comparação de timestamp
        limiteS1 = new Date(limites.superior.s1.fim + "T23:59:59").getTime();
    }

    // 4. Preparação das Disciplinas (Ordenação)
    const disciplinas = Object.values(dataStore[tId].discs).sort((a, b) =>
        (a.name || "").localeCompare((b.name || ""), 'pt-BR', { sensitivity: 'base' })
    );

    let html = "";

    // 5. Processamento por Disciplina
    disciplinas.forEach(disc => {
        if (!disc || !disc.sch) return;

        // Filtro de Segurança: Disciplinas Ocultas
        const nomeDiscUpper = disc.name.toUpperCase().trim();
        if (typeof DISCIPLINAS_OCULTAR !== 'undefined' && DISCIPLINAS_OCULTAR.includes(nomeDiscUpper)) {
            return;
        }

        let mCount = Array(12).fill(0); // Contador para os 12 meses (0=Jan, 11=Dez)
        let aulasSabado = 0;
        let temAulaNoPeriodo = false;

        disc.sch.forEach(s => {
            if (!s || !s.dtObj) return;

            const tempoAula = s.dtObj.getTime();
            let aulaPertenceAoPeriodo = true;

            // Lógica de Filtro Semestral (Superior)
            if (ehSemestral(tId) && limiteS1 && sem) {
                aulaPertenceAoPeriodo = (sem === "1") 
                    ? tempoAula <= limiteS1 
                    : tempoAula > limiteS1;
            }

            if (aulaPertenceAoPeriodo) {
                mCount[s.dtObj.getMonth()]++;
                
                // Contabiliza se for Sábado (6)
                if (s.dtObj.getDay() === 6) {
                    aulasSabado++;
                }
                temAulaNoPeriodo = true;
            }
        });

        // Se a disciplina não tem aulas no semestre/período selecionado, pula a linha
        if (!temAulaNoPeriodo) return;

        const totalGeral = mCount.reduce((acc, val) => acc + val, 0);

        // 6. Construção da Linha HTML (Tabela Pivo)
        html += `
            <tr class="border-b hover:bg-blue-50/50 transition-colors">
                <td class="p-2 text-left font-bold border-r bg-gray-50 text-[#15803d] uppercase text-[10px] sticky left-0 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
                    ${disc.name}
                </td>
        `;

        // Colunas de Meses (Janeiro a Dezembro)
        mCount.forEach((qtd, idx) => {
            // Destaca meses sem aula para facilitar leitura
            const estiloMes = qtd === 0 ? "text-gray-300" : "text-gray-700 font-medium";
            html += `<td class="border-r text-center p-2 text-[11px] ${estiloMes}">${qtd || '-'}</td>`;
        });

        // Colunas de Totais (Sábados e Total Geral)
        html += `
            <td class="bg-yellow-50 text-yellow-800 font-bold border-r text-center p-2 text-[11px]">
                ${aulasSabado || '-'}
            </td>
            <td class="bg-green-100 text-green-900 font-black text-center p-2 text-xs">
                ${totalGeral}
            </td>
        </tr>
        `;
    });

    // 7. Fallback e Renderização Final
    if (html === "") {
        html = `<tr><td colspan="15" class="p-4 text-center text-gray-400 italic">Nenhuma aula projetada ou registrada para os critérios selecionados.</td></tr>`;
    }

    b.innerHTML = html;
    
    // Revela o container de resultados caso esteja oculto
    const resPivo = document.getElementById('resultadoPivo');
    if (resPivo) resPivo.classList.remove('hidden');
}

// ABA 03
// FUNÇÃO RESPONSÁVEL POR GERAR O RELATÓRIO SEMANAL DO PROFESSOR
function gerarGrade() {
    const prof = document.getElementById('profSelect').value;
    const week = document.getElementById('weekInput').value;

    if (!prof || !week) {
        alert("Selecione Professor e Semana");
        return;
    }

    const profNormalizado = (typeof traduzirProfessor === "function") ? traduzirProfessor(prof) : prof;
    const [y, w] = week.split('-W').map(Number);
    const start = getStartOfWeek(w, y);
    
    // Fim da semana (Sábado) para pré-filtragem
    const end = new Date(start);
    end.setDate(end.getDate() + 6);

    const dias = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    let aulasPorDia = Array(6).fill(0);
    let horasPermanencia = Array(6).fill(0);
    let observacoes = [];

    // --- PASSO 1: PRÉ-FILTRAGEM OTIMIZADA ---
    // Em vez de buscar no loop da tabela, criamos um "Mapa de Aulas" do professor na semana
    // Chave: "DATA_HORA" -> Valor: { turma, disciplina, tag }
    const mapaAulasSemana = {};
    const aulasOrdenadasParaPermanencia = [[], [], [], [], [], []]; // Indexado por dia da semana (0-5)

    Object.keys(dataStore).forEach(tId => {
        const turma = dataStore[tId];
        Object.keys(turma.discs).forEach(dId => {
            const disc = turma.discs[dId];
            disc.sch.forEach(aula => {
                if (!aula.dtObj || !aula.time) return;

                // Pré-filtro: A aula é deste professor e está dentro desta semana?
                const profAulaTrad = (typeof traduzirProfessor === "function") ? traduzirProfessor(aula.prof) : aula.prof;
                
                if (profAulaTrad === profNormalizado && aula.dtObj >= start && aula.dtObj <= end) {
                    
                    const dataISO = aula.dtObj.toISOString().split('T')[0];
                    const horaPad = aula.time.split(' - ')[0].trim().padStart(5, '0');
                    const chave = `${dataISO}_${horaPad}`;

                    if (!mapaAulasSemana[chave]) mapaAulasSemana[chave] = [];
                    
                    mapaAulasSemana[chave].push({
                        turmaNome: turma.name,
                        discNome: disc.name,
                        tag: aula.tag
                    });

                    // Para cálculo de permanência posterior
                    const diaSemanaIndex = (aula.dtObj.getDay() + 6) % 7; // Ajuste para Seg=0
                    if (diaSemanaIndex < 6) {
                        const [iniH, iniM] = aula.time.split(' - ')[0].split(':').map(Number);
                        const [fimH, fimM] = aula.time.split(' - ')[1].split(':').map(Number);
                        aulasOrdenadasParaPermanencia[diaSemanaIndex].push({
                            inicioDec: iniH + (iniM / 60),
                            fimDec: fimH + (fimM / 60),
                            dt: new Date(aula.dtObj)
                        });
                        aulasPorDia[diaSemanaIndex]++;
                    }
                }
            });
        });
    });

    // --- PASSO 2: RENDERIZAÇÃO DA TABELA (RÁPIDA) ---
    let h = `<div class="overflow-x-auto"><table class="tableGS bg-white w-full border-collapse border border-gray-300" id="tableGS">
                <thead><tr class="bg-[#15803d] text-white"><th class="w-[100px] p-2 text-[10px] border">HORÁRIO</th>`;
    
    for (let i = 0; i < 6; i++) {
        const dtHead = new Date(start);
        dtHead.setDate(dtHead.getDate() + i);
        h += `<th class="w-[14%] p-2 border text-[10px]">${dias[i].toUpperCase()}<br>
              <span class="opacity-80 font-normal">${dtHead.toLocaleDateString('pt-BR').slice(0, 5)}</span></th>`;
    }
    h += `</tr></thead><tbody>`;

    GABARITO.forEach(slot => {
        if (slot.t === "intervalo") {
            h += `<tr class="bg-gray-100 italic text-gray-500 text-[10px] text-center">
                    <td class="border p-1">${slot.h}</td><td colspan="6" class="border p-1">${slot.l}</td></tr>`;
            return;
        }

        const horaSlotPad = slot.h.split(' - ')[0].padStart(5, '0');
        h += `<tr><td class="bg-gray-50 font-bold border p-2 text-[10px] text-center">${slot.h}</td>`;

        for (let i = 0; i < 6; i++) {
            const dtRef = new Date(start);
            dtRef.setDate(dtRef.getDate() + i);
            const dataISO = dtRef.toISOString().split('T')[0];
            const chaveBusca = `${dataISO}_${horaSlotPad}`;
            
            let cellContent = "";
            const aulasEncontradas = mapaAulasSemana[chaveBusca];

            if (aulasEncontradas) {
                aulasEncontradas.forEach(a => {
                    const status = TRADUCAO[a.tag] || { class: "bg-green-50 border-green-200" };
                    cellContent += `
                        <div class="p-1 mb-1 rounded border-l-4 ${status.class} shadow-sm" data-status="${a.tag}">
                            <div class="font-bold text-[9px] text-gray-800">${a.turmaNome}</div>
                            <div class="text-[8px] text-blue-800 uppercase border-t border-blue-100 mt-1">${a.discNome}</div>
                        </div>`;
                });
            }
            h += `<td class="border p-1 align-top min-h-[50px]">${cellContent}</td>`;
        }
        h += `</tr>`;
    });

    // --- PASSO 3: CÁLCULO DE PERMANÊNCIA (USANDO O FILTRO PRONTO) ---
    let ultimaAulaDoDiaAnterior = null;
    for (let i = 0; i < 6; i++) {
        let dia = aulasOrdenadasParaPermanencia[i];
        if (dia.length > 0) {
            dia.sort((a, b) => a.inicioDec - b.inicioDec);
            let primeira = dia[0];
            let ultima = dia[dia.length - 1];
            let diff = ultima.fimDec - primeira.inicioDec;

            if (primeira.inicioDec <= 12 && ultima.fimDec >= 14) diff -= 2;
            horasPermanencia[i] = Math.max(0, diff).toFixed(1);

            // Interjornada
            if (ultimaAulaDoDiaAnterior) {
                const fimAnt = new Date(ultimaAulaDoDiaAnterior.dt);
                fimAnt.setHours(Math.floor(ultimaAulaDoDiaAnterior.fimDec), (ultimaAulaDoDiaAnterior.fimDec % 1) * 60);
                const iniAtu = new Date(primeira.dt);
                iniAtu.setHours(Math.floor(primeira.inicioDec), (primeira.inicioDec % 1) * 60);
                
                const diffInter = (iniAtu - fimAnt) / (1000 * 60 * 60);
                if (diffInter < 11 && diffInter > 0) {
                    observacoes.push(`${dias[i]}: ${diffInter.toFixed(1)}h de intervalo`);
                }
            }
            ultimaAulaDoDiaAnterior = ultima;
        } else {
            ultimaAulaDoDiaAnterior = null;
        }
    }

    // --- RODAPÉ ---
    // (O resto do seu código de rodapé permanece igual, injetando aulasPorDia e horasPermanencia)
    h += `<tr class="bg-gray-50 font-bold text-[10px]"><td class="border p-2">AULAS / DIA</td>`;
    aulasPorDia.forEach(c => h += `<td class="border p-2 text-center">${c}</td>`);
    h += `</tr><tr class="bg-blue-50 font-bold text-[10px]"><td class="border p-2">PERMANÊNCIA</td>`;
    horasPermanencia.forEach(v => h += `<td class="border p-2 text-center text-blue-700">${v}h</td>`);
    h += `</tr>`;

    const totalSemana = aulasPorDia.reduce((a, b) => a + b, 0);
    h += `<tr class="bg-green-100 font-black text-xs text-green-900 uppercase">
            <td colspan="2" class="p-3 border">Total:</td><td colspan="5" class="p-3 border">${totalSemana} Aulas</td></tr>`;

    const obsTexto = observacoes.length > 0 ? observacoes.join(' | ') : "Interjornada regular.";
    h += `<tr class="text-[9px] bg-yellow-50"><td class="font-bold p-2 border">ALERTAS:</td>
          <td colspan="6" class="p-2 border ${observacoes.length > 0 ? 'text-red-600' : 'text-gray-500'}">${obsTexto}</td>
          </tr></tbody></table></div>`;

    document.getElementById('gradeRender').innerHTML = h;
}

// ABA 04 - PROFESSOR
// GERA O RELATORIO DO PROFESSOR POR MES - IGUAL O DA TURMA
/**
 * Gera o painel comparativo completo de um professor específico.
 * Exibe tabelas de Executado, Previsto e o Saldo (Diferença).
 */
