async function gerarRelatorioProfessorCompleto() {
    const profInput = document.getElementById("buscaProfessorRel")?.value.trim().toUpperCase();
    
    const bExec = document.getElementById("bodyRelatorioProf");
    const bPrev = document.getElementById("bodyRelatorioPrevisto");
    const bDiff = document.getElementById("bodyRelatorioDiferenca");

    if (!bExec || !bPrev || !bDiff) return;

    // Limpeza inicial
bExec.innerHTML = ''; 
bPrev.innerHTML = ''; 
bDiff.innerHTML = '';

// 🔥 LIMPA SELEÇÃO ANTERIOR
window.disciplinasSelecionadas = new Set();

if (!profInput) return;

    // 🔷 Garante que o Set existe
    if (!window.disciplinasSelecionadas) {
        window.disciplinasSelecionadas = new Set();
    }

    // 1. PREVISTO
    const previstoAll = (typeof calcularPrevistoProfessor === "function") 
        ? calcularPrevistoProfessor() 
        : {};

    const previsto = previstoAll[profInput] || {};

    // 2. EXECUTADO
    let executado = {};

    Object.values(dataStore).forEach(turma => {
        if (!turma.discs) return;

        Object.values(turma.discs).forEach(disc => {
            if (!disc.sch) return;

            disc.sch.forEach(s => {
                if (s.tipo === "MOLDE") return;

                const nomeProfTraduzido = (typeof traduzirProfessor === "function") 
                    ? traduzirProfessor(s.prof).toUpperCase().trim() 
                    : s.prof.toUpperCase().trim();

                if (nomeProfTraduzido !== profInput) return;

                const chave = `${disc.name.toUpperCase().trim()}||${turma.name.toUpperCase().trim()}`;

                if (!executado[chave]) {
                    executado[chave] = {
                        disciplina: disc.name.toUpperCase(),
                        turma: turma.name.toUpperCase(),
                        meses: Array(12).fill(0),
                        sabado: 0,
                        total: 0
                    };
                }

                const dataAula = new Date(s.dtObj);
                const mes = dataAula.getMonth();

                executado[chave].meses[mes]++;
                executado[chave].total++;

                if (dataAula.getDay() === 6) {
                    executado[chave].sabado++;
                }
            });
        });
    });

    // 3. UNIFICAÇÃO
    const todasAsChaves = new Set([
        ...Object.keys(executado), 
        ...Object.keys(previsto)
    ]);

    todasAsChaves.forEach(chave => {
        const dadosExec = executado[chave] || { meses: Array(12).fill(0), sabado: 0, total: 0, disciplina: "", turma: "" };
        const dadosPrev = previsto[chave] || { meses: Array(12).fill(0), sabado: 0, total: 0, disciplina: "", turma: "" };

        const dNome = (dadosExec.disciplina || dadosPrev.disciplina || chave.split("||")[0]).trim();
        const tNome = (dadosExec.turma || dadosPrev.turma || chave.split("||")[1]).trim();

        // ==========================================
        // 🔷 EXECUTADO COM CHECKBOX
        // ==========================================
        const rowId = "row-" + btoa(chave);
        const checked = window.disciplinasSelecionadas.has(chave) ? "checked" : "";

        let rowExec = `
        <tr 
            id="${rowId}"
            class="hover:bg-blue-50 cursor-pointer transition-colors"
            onclick="toggleDisciplina('${chave}')"
        >
            <td class="text-center">
                <input 
                    type="checkbox" 
                    ${checked}
                    onclick="event.stopPropagation(); toggleDisciplina('${chave}')"
                />
            </td>
            <td class="text-left font-bold text-[10px]">${dNome}</td>
            <td class="bg-gray-50 text-[10px]">${tNome}</td>
        `;

        dadosExec.meses.forEach(v => {
            rowExec += `<td class="text-center">${v || '-'}</td>`;
        });

        rowExec += `
            <td class="font-bold text-center">${dadosExec.sabado || '-'}</td>
            <td class="bg-blue-50 font-black text-center">${dadosExec.total}</td>
        </tr>
        `;

        bExec.innerHTML += rowExec;

        // ==========================================
        // 🔷 PREVISTO
        // ==========================================
        let rowPrev = `<tr class="hover:bg-gray-50">
            <td class="text-left font-bold text-[10px]">${dNome}</td>
            <td class="bg-gray-50 text-[10px]">${tNome}</td>`;

        dadosPrev.meses.forEach(v => {
            rowPrev += `<td class="text-center">${v || '-'}</td>`;
        });

        rowPrev += `
            <td class="font-bold text-center">${dadosPrev.sabado || '-'}</td>
            <td class="bg-green-50 font-black text-center">${dadosPrev.total}</td>
        </tr>`;

        bPrev.innerHTML += rowPrev;

        // ==========================================
        // 🔷 DIFERENÇA
        // ==========================================
        let rowDiff = `<tr class="hover:bg-gray-50">
            <td class="text-left font-bold text-[10px]">${dNome}</td>
            <td class="bg-gray-50 text-[10px]">${tNome}</td>`;

        dadosPrev.meses.forEach((pVal, i) => {
            const eVal = dadosExec.meses[i] || 0;
            const diff = eVal - pVal;

            const cor =
                diff < 0 ? 'text-red-600 font-bold' :
                diff > 0 ? 'text-green-600 font-bold' :
                'text-gray-300';

            rowDiff += `<td class="text-center ${cor}">${diff === 0 ? '-' : diff}</td>`;
        });

        const diffSab = (dadosExec.sabado || 0) - (dadosPrev.sabado || 0);
        const diffTotal = (dadosExec.total || 0) - (dadosPrev.total || 0);

        rowDiff += `
            <td class="text-center ${
                diffSab < 0 ? 'text-red-600 font-bold' :
                diffSab > 0 ? 'text-green-600 font-bold' :
                'text-gray-300'
            }">${diffSab || '-'}</td>
            <td class="p-1 text-center">
                <span class="px-2 py-0.5 rounded ${
                    diffTotal < 0 ? 'bg-red-100 text-red-700' :
                    diffTotal > 0 ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-400'
                } font-black text-[10px]">${diffTotal}</span>
            </td>
        </tr>`;

        bDiff.innerHTML += rowDiff;
    });
}

function toggleTodasDisciplinas(masterCheckbox) {
    const marcar = masterCheckbox.checked;

    const linhas = document.querySelectorAll('#bodyRelatorioProf tr');

    linhas.forEach(tr => {
        const id = tr.id;
        if (!id) return;

        const chave = atob(id.replace("row-", ""));
        const checkbox = tr.querySelector('input[type="checkbox"]');

        if (marcar) {
            window.disciplinasSelecionadas.add(chave);
            tr.classList.add("bg-blue-200");
            if (checkbox) checkbox.checked = true;
        } else {
            window.disciplinasSelecionadas.delete(chave);
            tr.classList.remove("bg-blue-200");
            if (checkbox) checkbox.checked = false;
        }
    });
}
        
function toggleDisciplina(chave) {
    const id = "row-" + btoa(chave);
    const el = document.getElementById(id);

    if (!el) return;

    const checkbox = el.querySelector('input[type="checkbox"]');

    if (window.disciplinasSelecionadas.has(chave)) {
        window.disciplinasSelecionadas.delete(chave);
        el.classList.remove("bg-blue-200");
        if (checkbox) checkbox.checked = false;
    } else {
        window.disciplinasSelecionadas.add(chave);
        el.classList.add("bg-blue-200");
        if (checkbox) checkbox.checked = true;
    }

    // 🔥 atualiza checkbox geral
    atualizarCheckAll();
}

        function atualizarCheckAll() {
    const totalLinhas = document.querySelectorAll('#bodyRelatorioProf tr').length;
    const totalSelecionadas = window.disciplinasSelecionadas.size;

    const master = document.getElementById("checkAllDisciplinas");

    if (!master) return;

    master.checked = totalLinhas > 0 && totalSelecionadas === totalLinhas;
}

        async function gerarRelatorioMultiplasDisciplinas() {
    if (!window.disciplinasSelecionadas.size) {
        alert("Selecione pelo menos uma disciplina");
        return;
    }

    const lista = Array.from(window.disciplinasSelecionadas);

    for (const chave of lista) {
        const [disciplina, turma] = chave.split("||");

        // troca seleção
        selecionarDisciplinaERenderizar(disciplina, turma);

        // ⏳ espera render REAL (não só timeout)
        await esperarTabelaRenderizada();

        // 🔥 CHAMA A FUNÇÃO CORRETA
        exportarDisciplinaPDF();

        // pequeno intervalo entre downloads (evita travar navegador)
        await new Promise(r => setTimeout(r, 500));
    }
}

        function esperarTabelaRenderizada() {
    return new Promise(resolve => {
        const intervalo = setInterval(() => {
            const tabela = document.querySelector('#tableD tbody');

            if (tabela && tabela.children.length > 0) {
                clearInterval(intervalo);
                resolve();
            }
        }, 100);
    });
}

        function selecionarDisciplinaERenderizar(nomeDisc, nomeTurma) {

    const tSelect = document.getElementById('turmaSelect');
    const dSelect = document.getElementById('disciplinaSelect');

    if (!tSelect || !dSelect) return;

    // selecionar turma
    for (let i = 0; i < tSelect.options.length; i++) {
        if (tSelect.options[i].text.toUpperCase().trim() === nomeTurma) {
            tSelect.selectedIndex = i;
            break;
        }
    }

    // 🔥 USA SUA FUNÇÃO REAL
    if (typeof atualizarListaDisciplinas === "function") {
        atualizarListaDisciplinas();
    }

    // ⚠️ pequeno delay para garantir que o select foi populado
    setTimeout(() => {
        for (let i = 0; i < dSelect.options.length; i++) {
            if (dSelect.options[i].text.toUpperCase().trim() === nomeDisc) {
                dSelect.selectedIndex = i;
                break;
            }
        }

        renderD();
    }, 50);
}
        
function extrairDadosDoMolde(m, discName) {
    const iden = String(m.identificador || "").toLowerCase();
    const mapaDias = { 'seg': 1, 'ter': 2, 'qua': 3, 'qui': 4, 'sex': 5, 'sab': 6, 'dom': 0 };
    
    const diaChave = Object.keys(mapaDias).find(d => iden.includes(d));
    
    let profRaw = (m.prof || discName || "").toUpperCase();
    if (profRaw.includes(" - ")) profRaw = profRaw.split(" - ")[1];

    return {
        diaSemana: mapaDias[diaChave],
        modalidade: iden.includes('int') ? 'integrado' : 'superior',
        semestre: iden.includes('s2') ? 's2' : 's1',
        professor: profRaw.trim()
    };
}

function projetarDatasVaildas(inicio, fim, diaAlvo, feriados, ferias, sabadosLetivos, tipoSabado) {
    let datas = [];
    let atual = new Date(inicio + "T00:00:00");
    const dataFim = new Date(fim + "T00:00:00");

    while (atual <= dataFim) {
        const iso = atual.toISOString().split('T')[0];
        const wDay = atual.getDay();

        const ehSabadoSubstituto = (sabadosLetivos || []).some(s => 
            s.data === iso && s.tipo === tipoSabado && s.referencia === diaAlvo
        );

        if (wDay === diaAlvo || ehSabadoSubstituto) {
            const ehFeriado = (feriados || []).includes(iso);
            const ehFerias = (ferias || []).some(f => iso >= f.inicio && iso <= f.fim);

            if (!ehFeriado && !ehFerias) {
                datas.push(new Date(atual));
            }
        }
        atual.setDate(atual.getDate() + 1);
    }
    return datas;
}

function calcularPrevistoProfessor() {
    const year = document.getElementById('yearSelect')?.value || "2026";
    const dadosAno = CALENDARIO_DINAMICO[year];
    const previsto = {};
    const mapaDias = { 'seg': 1, 'ter': 2, 'qua': 3, 'qui': 4, 'sex': 5, 'sab': 6, 'dom': 0 };

    if (!dadosAno) return {};

    // 1. Buscamos as turmas (cabeçalho do CSV)
    // Usamos o consolidado que aparece nos seus logs para saber qual coluna é qual turma
    const linhasCsv = window.csvConsolidado || []; // Certifique-se que seu script guarda o CSV aqui
    if (linhasCsv.length < 2) return {};

    const cabecalho = linhasCsv[0].split(',');
    
    // 2. Varremos as linhas que são de "BASE" (o horário oficial)
    linhasCsv.forEach(linha => {
        if (!linha.startsWith("BASE_")) return;

        const colunas = linha.split(',');
        const identificador = colunas[0].toLowerCase(); // ex: base_int_seg
        
        // Identifica o dia e modalidade
        const diaChave = Object.keys(mapaDias).find(d => identificador.includes(d));
        const diaRef = mapaDias[diaChave];
        const eIntegrado = identificador.includes('int');
        const semestre = identificador.includes('s2') ? 's2' : 's1';
        
        const limites = eIntegrado ? dadosAno.limites.integrado : dadosAno.limites.superior?.[semestre];
        const ferias = eIntegrado ? dadosAno.ferias_int : dadosAno.ferias_sup;
        const tipoSabado = eIntegrado ? "integrado" : `superior_${semestre}`;

        if (diaRef === undefined || !limites) return;

        // 3. Percorremos as colunas das turmas (começa na coluna 2 do CSV)
        for (let i = 2; i < colunas.length; i++) {
            const celula = colunas[i].trim();
            if (!celula || celula === "INTERVALO") continue;

            const nomeTurma = cabecalho[i].toUpperCase();
            
            // Extrai Professor e Disciplina (ex: "Biologia - Paulla")
            let disciplina = celula;
            let professor = "DESCONHECIDO";

            if (celula.includes(" - ")) {
                const partes = celula.split(" - ");
                disciplina = partes[0].trim().toUpperCase();
                professor = partes[1].trim().toUpperCase();
            }

            const chave = `${disciplina}||${nomeTurma}`;

            // 4. Projeta para o calendário oficial
            let curr = new Date(limites.inicio + "T00:00:00");
            const fim = new Date(limites.fim + "T00:00:00");

            while (curr <= fim) {
                const iso = curr.toISOString().split('T')[0];
                const wDay = curr.getDay();

                const ehSabado = (dadosAno.sabados || []).some(s => 
                    s.data === iso && s.tipo === tipoSabado && s.referencia === diaRef
                );

                if (wDay === diaRef || ehSabado) {
                    const bloqueado = (dadosAno.feriados || []).includes(iso) || 
                                      (ferias || []).some(f => iso >= f.inicio && iso <= f.fim);

                    if (!bloqueado) {
                        if (!previsto[professor]) previsto[professor] = {};
                        if (!previsto[professor][chave]) {
                            previsto[professor][chave] = {
                                disciplina: disciplina,
                                turma: nomeTurma,
                                meses: Array(12).fill(0),
                                total: 0
                            };
                        }
                        previsto[professor][chave].meses[curr.getMonth()]++;
                        previsto[professor][chave].total++;
                    }
                }
                curr.setDate(curr.getDate() + 1);
            }
        }
    });

    console.log("🚀 Projeção do Horário Oficial concluída:", previsto);
    return previsto;
}
        
/**
 * Calcula o saldo de aulas (Previsto - Realizado).
 * Valores positivos: Aulas pendentes (faltando).
 * Valores negativos: Aulas excedentes (reposições extras).
 */
function calcularDiferencaProfessor(realizado, previsto) {
    const diferenca = {};

    // 1. Itera sobre o Gabarito (Previsto) para cobrar o que é devido
    Object.keys(previsto).forEach(prof => {
        const dadosPrevistosProf = previsto[prof];
        const dadosRealizadosProf = realizado[prof] || {};

        // Criamos um mapa de chaves normalizadas do 'Realizado' para busca rápida
        const mapaRealizadoNormalizado = {};
        Object.keys(dadosRealizadosProf).forEach(ch => {
            const chNorm = ch.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
            mapaRealizadoNormalizado[chNorm] = dadosRealizadosProf[ch];
        });

        Object.keys(dadosPrevistosProf).forEach(chaveOriginal => {
            const prev = dadosPrevistosProf[chaveOriginal];
            
            // Normalizamos a chave do Previsto para comparar com o Realizado
            const chaveNorm = chaveOriginal.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
            const real = mapaRealizadoNormalizado[chaveNorm];

            const saldoMeses = Array(12).fill(0);
            let temDiferencaNoMes = false;

            // 2. Cálculo mensal do Saldo
            for (let i = 0; i < 12; i++) {
                const p = prev.meses[i] || 0;
                const r = real?.meses?.[i] || 0;
                const diff = p - r;
                
                saldoMeses[i] = diff;
                if (diff !== 0) temDiferencaNoMes = true;
            }

            const saldoTotal = (prev.total || 0) - (real?.total || 0);
            const saldoSabado = (prev.sabados || 0) - (real?.sabados || 0);

            // 3. Só incluímos no objeto final se houver discrepância
            if (saldoTotal !== 0 || saldoSabado !== 0 || temDiferencaNoMes) {
                if (!diferenca[prof]) diferenca[prof] = {};
                
                diferenca[prof][chaveOriginal] = {
                    disciplina: prev.disciplina,
                    turma: prev.turma,
                    meses: saldoMeses,
                    sabado: saldoSabado,
                    total: saldoTotal,
                    status: saldoTotal > 0 ? "PENDENTE" : "OK/EXCEDENTE"
                };
            }
        });
    });

    return diferenca;
}

// ABA 05 - ANUAL PROFESSOR
// GERA TODAS AS AULAS DO PROFESSOR NO ANO INTEIRO
function gerarHorarioAnualProfessor() {
    const profInput = document.getElementById("buscaProfessorAnual")?.value.trim().toUpperCase();
    const b = document.getElementById("bodyHorarioAnual");

    if (!b) return;
    b.innerHTML = '';

    if (!profInput) return;

    let agenda = {};
    let maxAulasPorDia = 0;

    // 1. Coleta e Normalização dos Dados
    Object.keys(dataStore).forEach(tId => {

        Object.values(dataStore[tId].discs || {}).forEach(disc => {

            const agendaDisc = Array.isArray(disc.schProjetada)
                ? disc.schProjetada
                : (disc.sch || []);

            agendaDisc.forEach(s => {

                // 🔴 PROTEÇÃO CONTRA ERROS
                if (!s || !s.dtObj || !s.time) return;

                const nomeProf = traduzirProfessor?.(s.prof) || s.prof || "";

                if (normalizarTexto(nomeProf) === normalizarTexto(profInput)) {

                    const iso = s.dtObj.toISOString().split('T')[0];

                    if (!agenda[iso]) agenda[iso] = [];

                    const horaString = s.time.split(' - ')[0].trim();
                    const [h, m] = horaString.split(':');

                    const minutosDoDia =
                        (parseInt(h || 0) * 60) + parseInt(m || 0);

                    agenda[iso].push({
                        turma: dataStore[tId].name,
                        disc: disc.name,
                        horario: s.time,
                        ordem: minutosDoDia
                    });

                    if (agenda[iso].length > maxAulasPorDia) {
                        maxAulasPorDia = agenda[iso].length;
                    }
                }
            });
        });
    });

    // 2. Ajuste do Cabeçalho
    if (typeof ajustarCabecalhoAnual === "function") {
        ajustarCabecalhoAnual(maxAulasPorDia);
    }

    // 3. Ordenação e Renderização
    const datasOrdenadas = Object.keys(agenda).sort();

    datasOrdenadas.forEach(data => {

        agenda[data].sort((a, b) => a.ordem - b.ordem);

        let row = `<tr>
            <td class="border p-2 font-bold">
                ${new Date(data + "T12:00:00").toLocaleDateString("pt-BR")}
            </td>`;

        agenda[data].forEach(aula => {
            row += `
            <td class="border p-2">
                ${aula.turma} / ${aula.disc} (${aula.horario})
            </td>`;
        });

        // Completa colunas vazias
        for (let i = agenda[data].length; i < maxAulasPorDia; i++) {
            row += `<td class="border p-2">-</td>`;
        }

        row += `</tr>`;

        b.innerHTML += row;
    });
}

function ajustarCabecalhoAnual(maxAulas) {

    const theadRow = document.querySelector("#tabelaHorarioAnual thead tr");
    if (!theadRow) return; // 🔥 proteção contra erro de DOM
    const styleClass = "border p-2 bg-[#3c764a] text-white font-bold text-[10px] uppercase";

    // limpa o cabeçalho
    theadRow.innerHTML = "";

    // coluna fixa
    const thBase = document.createElement("th");
    thBase.className = styleClass;
    thBase.innerText = "Dia da Aula";
    theadRow.appendChild(thBase);

    // colunas dinâmicas
    for (let i = 1; i <= maxAulas; i++) {
        const th = document.createElement("th");
        th.className = styleClass;
        th.innerText = `${i}ª AULA`;
        theadRow.appendChild(th);
    }
}

// ABA 06
// FUNÇÃO RESPONSÁVEL POR GERAR A FICHA INDIVIDUAL SEMANAL POR TURMA
