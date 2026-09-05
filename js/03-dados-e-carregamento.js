function parseCSV(csv, separador) {
    const linhas = [];
    let atual = '';
    let dentroAspas = false;
    let linha = [];

    for (let i = 0; i < csv.length; i++) {
        const char = csv[i];

        if (char === '"') {
            dentroAspas = !dentroAspas;
        } else if (char === separador && !dentroAspas) {
            linha.push(atual.trim());
            atual = '';
        } else if ((char === '\n' || char === '\r') && !dentroAspas) {
            if (atual || linha.length) {
                linha.push(atual.trim());
                linhas.push(linha);
                linha = [];
                atual = '';
            }
        } else {
            atual += char;
        }
    }

    if (atual || linha.length) {
        linha.push(atual.trim());
        linhas.push(linha);
    }

    return linhas;
}

function normalizarDia(dia) {
    if (!dia) return null;

    return dia
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace("-feira", "")
        .trim()
        .substring(0, 3); // seg, ter, qua, qui...
}

async function carregarDados() {
    const loadingElem = document.getElementById('loading');
    const erroElem = document.getElementById('erroCarregamento');
    const erroMsgElem = document.getElementById('erroCarregamentoMsg');

    // Sempre começa escondendo um erro anterior e mostrando o "carregando"
    if (erroElem) erroElem.classList.add('hidden');
    if (loadingElem) loadingElem.classList.remove('hidden');

    try {
        const yearSelected = document.getElementById('yearSelect').value;

        window.dataStore = {};

        const csv = await obterCSVConsolidado(yearSelected);

        const primeiraLinha = csv.split(/\r?\n/)[0];
        const separador = primeiraLinha.includes('\t')
            ? '\t'
            : primeiraLinha.includes(';')
            ? ';'
            : ',';

        const rows = parseCSV(csv, separador);

        if (rows.length < 2) {
            throw new Error("CSV inválido ou vazio");
        }

        const headers = rows[0];
        const turmasHeaders = headers.slice(2);

        let lastDate = "";

        rows.slice(1).forEach(cols => {
            if (!cols || cols.length < 2) return;

            const primeiraColuna = cols[0]
                ? cols[0].toLowerCase()
                : "";

            // Atualiza data
            if (cols[0] && !primeiraColuna.startsWith("base_")) {
                lastDate = cols[0].replace(/\./g, '/');
            }

            if (!cols[1] || (!primeiraColuna.startsWith("base_") && !lastDate)) {
                return;
            }

            if (cols[1]?.toUpperCase() === "INTERVALO") return;

            turmasHeaders.forEach((tNome, idx) => {
                const cell = cols[idx + 2];

                if (!cell || cell.trim() === "" || cell === "0") return;

                const tId = tNome
                    .toLowerCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .replace(/[^a-z0-9]/g, '');

                if (!dataStore[tId]) {
                    dataStore[tId] = {
                        name: tNome,
                        discs: {}
                    };
                }

                const tagM = cell.match(/\[(.*?)\]/);
                const tag = tagM ? tagM[1].toUpperCase() : null;

                const cleanT = tagM
                    ? cell.replace(tagM[0], "").trim()
                    : cell;

                let discNome, profNome;

                if (cleanT.includes(' - ')) {
                    const partes = cleanT.split(' - ');
                    profNome = partes.pop().trim();
                    discNome = partes.join(' - ').trim();
                } else {
                    discNome = cleanT;
                    profNome = "N/I";
                }

                const dId = (tId + "_" + discNome)
                    .toLowerCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .replace(/[^a-z0-9]/g, '');

                if (!dataStore[tId].discs[dId]) {
                    dataStore[tId].discs[dId] = {
                        name: discNome,
                        sch: []
                    };
                }

                // =========================
                // 🔥 TRATAMENTO DE MOLDE
                // =========================
                if (primeiraColuna.startsWith("base_")) {

                    const timeAtual = cols[1];

                    // 🔴 REMOVE QUALQUER MOLDE NO MESMO SLOT DA TURMA
                    Object.keys(dataStore[tId].discs).forEach(dKey => {
                        const discTemp = dataStore[tId].discs[dKey];

                        discTemp.sch = discTemp.sch.filter(s => {
                            return !(
                                s.tipo === "MOLDE" &&
                                s.identificador === primeiraColuna &&
                                s.time === timeAtual
                            );
                        });
                    });

                    // 🔥 INSERE O NOVO MOLDE (único válido)
                    dataStore[tId].discs[dId].sch.push({
                        tipo: "MOLDE",
                        identificador: primeiraColuna,
                        time: cols[1],
                        prof: traduzirProfessor?.(profNome) || profNome,
                        tag
                    });

                } else {
                    // =========================
                    // 🔵 MANUAL (sem alteração)
                    // =========================
                    const p = lastDate.split('/');
                    if (p.length !== 3) return;

                    const anoData = p[2];
                    if (anoData !== yearSelected) return;

                    const dt = new Date(
                        parseInt(p[2]),
                        parseInt(p[1]) - 1,
                        parseInt(p[0]),
                        12, 0, 0
                    );

                    dataStore[tId].discs[dId].sch.push({
                        tipo: "MANUAL",
                        date: lastDate,
                        dtObj: dt,
                        wd: dt.toLocaleDateString('pt-BR', { weekday: 'long' }),
                        time: cols[1],
                        prof: traduzirProfessor?.(profNome) || profNome,
                        tag
                    });
                }
            });
        });

        console.log("📊 Dados processados:", dataStore);

        gerarFuturoComBase();

        popularSelects?.();
        limparResultados?.();
        atualizarAbaInfo?.(yearSelected);

    } catch (e) {
        console.error("Erro ao carregar dados:", e);

        if (erroElem && erroMsgElem) {
            erroMsgElem.textContent = e.message || "Erro desconhecido.";
            erroElem.classList.remove('hidden');
        }

    } finally {
        // Independente de sucesso ou falha, o "CARREGANDO DADOS..." nunca
        // fica preso na tela — este era o principal defeito encontrado.
        if (loadingElem) loadingElem.classList.add('hidden');
    }
}

/**
 * Detecta o erro mais comum de configuração: a planilha não está
 * compartilhada como pública, e o Google devolve uma página de login
 * (HTML) em vez do CSV. Sem essa checagem, isso passava despercebido
 * e o sistema simplesmente ficava sem dados, sem avisar ninguém.
 */
function validarCSVouFalhar(texto, nomeFonte) {
    const inicio = (texto || "").trim().slice(0, 100).toLowerCase();
    if (inicio.startsWith("<!doctype") || inicio.startsWith("<html")) {
        throw new Error(
            `A ${nomeFonte} não está acessível publicamente. ` +
            `No Google Sheets: Compartilhar > Acesso geral > "Qualquer pessoa com o link" (Leitor).`
        );
    }
    if (!texto || texto.trim() === "") {
        throw new Error(`A ${nomeFonte} retornou vazia.`);
    }
}

async function obterCSVConsolidado(ano) {
    const timestamp = new Date().getTime();

    // ano antigo via gist
    if (ano === "2025") {
        const res = await fetch(GIST_URLS[ano] + "?t=" + timestamp);
        if (!res.ok) throw new Error("Erro ao acessar Gist");
        const texto = await res.text();
        validarCSVouFalhar(texto, "planilha de 2025");
        return texto;
    }

    // 2026 = integrado + superior
    if (ano === "2026") {
        const integradoUrl =
            "https://docs.google.com/spreadsheets/d/1j33kiPqwtzZNuvkBgYDaIiXZvVMY_J0qWAtRfYGdnD8/export?format=csv&gid=1589791808";

        const superiorUrl =
            "https://docs.google.com/spreadsheets/d/14ALXZgFIT68ee9ajuIdG63SpGVm0HyTjwp63-J6vRyg/export?format=csv&gid=1706802967";

        const [csvIntegrado, csvSuperior] = await Promise.all([
            fetch(integradoUrl + "&t=" + timestamp).then(r => r.text()),
            fetch(superiorUrl + "&t=" + timestamp).then(r => r.text())
        ]);

        validarCSVouFalhar(csvIntegrado, "planilha Integrado");
        validarCSVouFalhar(csvSuperior, "planilha Superior");

        return consolidarCSVs(csvIntegrado, csvSuperior);
    }

    throw new Error(`Ano ${ano} não configurado`);
}

function consolidarCSVs(csvIntegrado, csvSuperior) {
    const linhasInt = csvIntegrado
        .split(/\r?\n/)
        .filter(l => l.trim());

    const linhasSup = csvSuperior
        .split(/\r?\n/)
        .filter(l => l.trim());

    if (!linhasInt.length) return csvSuperior;
    if (!linhasSup.length) return csvIntegrado;

    const separador = linhasInt[0].includes('\t')
        ? '\t'
        : linhasInt[0].includes(';')
        ? ';'
        : ',';

    const cabecalhoInt = linhasInt[0].split(separador);
    const cabecalhoSup = linhasSup[0].split(separador);

    // cabeçalho unificado
    const novoCabecalho = [
        ...cabecalhoInt,
        ...cabecalhoSup.slice(2)
    ].join(separador);

    const linhasFinais = [novoCabecalho];

    // linhas do integrado: completa com vazios do superior
    linhasInt.slice(1).forEach(linha => {
        const cols = linha.split(separador);

        const novaLinha = [
            ...cols,
            ...new Array(cabecalhoSup.length - 2).fill("")
        ];

        linhasFinais.push(novaLinha.join(separador));
    });

    // linhas do superior: preserva DATA + HORÁRIO e desloca turmas corretamente
    linhasSup.slice(1).forEach(linha => {
        const cols = linha.split(separador);

        const novaLinha = [
            cols[0] || "",
            cols[1] || "",
            ...new Array(cabecalhoInt.length - 2).fill(""),
            ...cols.slice(2)
        ];

        linhasFinais.push(novaLinha.join(separador));
    });

    console.log("CSV consolidado final:", linhasFinais.slice(0, 10));

    return linhasFinais.join('\n');
}
        
/**
 * Gera as aulas futuras projetando os horários BASE_
 * para os dias letivos válidos do calendário selecionado.
 */
/**
 * Projeta as aulas para o futuro com base nos moldes:
 * base_int_XXX, base_sup_s1_XXX, base_sup_s2_XXX
 */
function gerarFuturoComBase() {
    const yearSelect = document.getElementById('yearSelect');
    if (!yearSelect) return;

    const ano = yearSelect.value;
    const cal = CALENDARIO_DINAMICO[ano];

    if (!cal || !cal.limites) {
        console.warn("Calendário não encontrado:", ano);
        return;
    }

    const mapaDias = {
        dom: 0, seg: 1, ter: 2, qua: 3, qui: 4, sex: 5, sab: 6
    };

    console.log("📅 Iniciando projeção...");

    Object.keys(dataStore).forEach(tId => {
        const turma = dataStore[tId];

        const mapaTurma = new Set();
        const mapaDatasManuais = new Set(); // 🔴 NOVO

        // 🔥 PASSO 1 — limpar AUTO e mapear manual
        Object.values(turma.discs).forEach(disc => {

            disc.sch = disc.sch.filter(s => s.tipo !== "AUTO");

            disc.sch.forEach(a => {
                if (a.tipo === "MANUAL" && a.dtObj) {
                    const iso = a.dtObj.toISOString().split('T')[0];

                    mapaTurma.add(`${iso}|${a.time}`);
                    mapaDatasManuais.add(iso); // 🔴 BLOQUEIA O DIA
                }
            });
        });

        Object.keys(turma.discs).forEach(dId => {
            const disc = turma.discs[dId];

            const moldes = disc.sch.filter(s => s.tipo === "MOLDE");
            const manuais = disc.sch.filter(s => s.tipo === "MANUAL");

            if (manuais.length === 0) return;

            manuais.forEach(m => {
                if (!m.dtObj && m.date) {
                    const p = m.date.split('/');
                    m.dtObj = new Date(p[2], p[1] - 1, p[0], 12, 0, 0);
                }
            });

            const ultimaData = new Date(
                Math.max(...manuais.map(m => m.dtObj.getTime()))
            );

            moldes.forEach(m => {
                const partes = m.identificador.toLowerCase().split('_');

                let limites = null;
                let diaRef = null;
                let tipoSabado = null;
                let feriasRef = [];

                if (partes[1] === 'int') {
                    limites = cal.limites.integrado;
                    diaRef = mapaDias[normalizarDia(partes[2])];
                    tipoSabado = "integrado";
                    feriasRef = cal.ferias_int || [];
                } else if (partes[1] === 'sup') {
                    const semestre = partes[2];
                    limites = cal.limites.superior?.[semestre];
                    diaRef = mapaDias[normalizarDia(partes[3])];
                    tipoSabado = `superior_${semestre}`;
                    feriasRef = cal.ferias_sup || [];
                }

                if (!limites || diaRef === undefined) return;

                let curr = new Date(limites.inicio + "T12:00:00");
                const fim = new Date(limites.fim + "T12:00:00");

                while (curr <= fim) {

                    const isoData = curr.toISOString().split('T')[0];

                    // 🔴 REGRA 1 — não gera antes da última manual
                    if (curr <= ultimaData) {
                        curr.setDate(curr.getDate() + 1);
                        continue;
                    }

                    // 🔴 REGRA 2 — NÃO GERAR EM DIA MANUAL (mesmo vazio)
                    if (mapaDatasManuais.has(isoData)) {
                        curr.setDate(curr.getDate() + 1);
                        continue;
                    }

                    const diaAtual = curr.getDay();

                    let deveCriar = false;
                    let tagEspecial = m.tag;

                    if (diaAtual === diaRef) {
                        deveCriar = true;
                    }

                    const configSabado = (cal.sabados || []).find(s =>
                        s.data === isoData &&
                        s.tipo === tipoSabado &&
                        s.referencia === diaRef
                    );

                    if (configSabado) {
                        deveCriar = true;
                        tagEspecial = "SÁBADO LETIVO";
                    }

                    if (deveCriar) {

                        const ehFeriado =
                            (cal.feriados || []).includes(isoData);

                        const estaEmFerias =
                            feriasRef.some(f =>
                                isoData >= f.inicio &&
                                isoData <= f.fim
                            );

                        if (!ehFeriado && !estaEmFerias) {

                            const chave = `${isoData}|${m.time}`;

                            // 🔴 REGRA FINAL — conflito global
                            if (!mapaTurma.has(chave)) {

                                mapaTurma.add(chave);

                                disc.sch.push({
                                    tipo: "AUTO",
                                    date: curr.toLocaleDateString('pt-BR'),
                                    iso: isoData,
                                    dtObj: new Date(curr),
                                    wd: curr.toLocaleDateString('pt-BR', {
                                        weekday: 'long'
                                    }),
                                    time: m.time,
                                    prof: m.prof,
                                    tag: tagEspecial,
                                    geradaAutomaticamente: true
                                });
                            }
                        }
                    }

                    curr.setDate(curr.getDate() + 1);
                }
            });

            disc.sch.sort((a, b) => {
                const tA = a.dtObj ? a.dtObj.getTime() : 0;
                const tB = b.dtObj ? b.dtObj.getTime() : 0;

                if (tA !== tB) return tA - tB;
                return (a.time || "").localeCompare(b.time || "");
            });
        });
    });

    console.log("✅ Projeção finalizada!");
}

// Função auxiliar para clareza do código
function jaTemManualNoMesmoHorario(manuais, data, horario) {
    return manuais.some(m => m.date === data && m.time === horario);
}

/**
 * Helpers necessários para a lógica acima
 */
function getLimitesPorTurma(tId, ano) {
    const cal = CALENDARIO_DINAMICO[ano];
    if (ehSemestral(tId)) {
        // Como o Gist pode ter turmas de S1 e S2, precisamos checar o nome
        const nome = dataStore[tId].name.toUpperCase();
        if (nome.includes("2º SEMESTRE") || nome.includes("S2")) {
            return { inicio: cal.limites.superior.s2.inicio, fim: cal.limites.superior.s2.fim };
        }
        return { inicio: cal.limites.superior.s1.inicio, fim: cal.limites.superior.s1.fim };
    }
    return { inicio: cal.limites.integrado.inicio, fim: cal.limites.integrado.fim };
}

function verificarFerias(data, ehSuperior, cal) {
    const periodos = ehSuperior ? cal.ferias_sup : cal.ferias_int;
    return periodos.some(p => {
        const d = data.toISOString().split('T')[0];
        return d >= p.inicio && d <= p.fim;
    });
}

// Função auxiliar para evitar repetição de código
function atualizarContadores(reg, ext) {
    const cReg = document.getElementById('cont-regular');
    const cExt = document.getElementById('cont-extra');
    if (cReg) cReg.textContent = reg;
    if (cExt) cExt.textContent = ext;
}

// =====================================================
// 🔷 CONFIGURAÇÕES DE CALENDÁRIO E DATAS
// =====================================================

function obterAnoSelecionado() {
    return document.getElementById('yearSelect')?.value || new Date().getFullYear();
}

/**
 * Converte um objeto Date para string YYYY-MM-DD local com segurança
 */
function formatarDataISO(data) {
    if (!(data instanceof Date)) return "";
    const y = data.getFullYear();
    const m = String(data.getMonth() + 1).padStart(2, '0');
    const d = String(data.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function estaEmFeriasIntegrado(data) {
    const ano = obterAnoSelecionado();
    const dataString = formatarDataISO(data);
    const ferias = CALENDARIO_DINAMICO[ano]?.ferias_int || [];
    return ferias.some(f => dataString >= f.inicio && dataString <= f.fim);
}

function estaEmFeriasSuperior(data) {
    const ano = obterAnoSelecionado();
    const dataString = formatarDataISO(data);
    const ferias = CALENDARIO_DINAMICO[ano]?.ferias_sup || [];
    return ferias.some(f => dataString >= f.inicio && dataString <= f.fim);
}

function ehFeriado(data) {
    const ano = obterAnoSelecionado();
    const dataString = formatarDataISO(data);
    const lista = CALENDARIO_DINAMICO[ano]?.feriados || [];
    return lista.includes(dataString);
}

/**
 * Verifica se a data está dentro do período letivo oficial do campus
 * @param {Date} data - Objeto Date a ser verificado
 * @param {string} tipo - "integrado" ou "superior"
 * @param {string} semestre - "s1" ou "s2" (opcional)
 */
function estaNoPeriodoLetivo(data, tipo, semestre = null) {
    const ano = obterAnoSelecionado();
    const dataString = formatarDataISO(data);
    const limites = CALENDARIO_DINAMICO[ano]?.limites;
    
    if (!limites) return false;

    if (tipo === "integrado") {
        return dataString >= limites.integrado.inicio && dataString <= limites.integrado.fim;
    } 
    
    if (tipo.startsWith("superior")) {
        // Se o semestre não for passado, tenta extrair do tipo (ex: superior_s1) ou assume s1
        const s = semestre || (tipo.includes('_') ? tipo.split('_')[1] : 's1');
        const limiteS = limites.superior[s];
        
        return limiteS ? (dataString >= limiteS.inicio && dataString <= limiteS.fim) : false;
    }
    
    return false;
}

// =====================================================
// 🔷 BASE DE HORÁRIOS
// =====================================================

let BASE_HORARIOS = {
    integrado: {},
    superior_s1: {},
    superior_s2: {}
};

/**
 * Processa as linhas de configuração da Grade Base (Gabarito)
 * @param {string} dataStr - O conteúdo da primeira coluna (ex: BASE_INT_SEG)
 * @param {string} horario - O horário da aula (ex: 07:30)
 * @param {string} cell - O conteúdo da célula (Disciplina - Professor)
 * @param {string} tNome - O nome da Turma (ex: 1A AGRO)
 */
function processarLinhaBase(dataStr, horario, cell, tNome) {
    if (!dataStr || typeof dataStr !== "string") return false;
    
    // 🔷 Filtro Inicial: Só processa se for uma linha de configuração BASE
    if (!dataStr.startsWith("BASE_")) return false;

    const partes = dataStr.split("_");
    if (partes.length < 3) return true; // Linha mal formada, mas ignoramos como aula real

    let tipo = "";
    let diaIndex = 2; // Padrão para Integrado: BASE_INT_SEG (índice 2)

    // 🔷 Identificação do Segmento e Semestre
    const prefixoNivel = partes[1].toUpperCase();

    if (prefixoNivel === "INT") {
        tipo = "integrado";
    } else if (prefixoNivel === "SUP") {
        // Para Superior, esperamos: BASE_SUP_S1_TER (índice 3 para o dia)
        const semestre = (partes[2] || "S1").toLowerCase();
        tipo = `superior_${semestre}`;
        diaIndex = 3; 
    } else {
        return true; // Tipo desconhecido (ex: BASE_EXT), pula a linha
    }

    // 🔷 Mapeamento de Dias (Conversão para JS Date.getDay())
    const mapaDias = { 
        "SEG": 1, "TER": 2, "QUA": 3, "QUI": 4, "SEX": 5, "SAB": 6 
    };

    const diaStr = (partes[diaIndex] || "").toUpperCase();
    const diaSemana = mapaDias[diaStr];
    
    if (diaSemana === undefined) {
        console.warn(`[BASE] Dia inválido: ${diaStr} na turma ${tNome}`);
        return true;
    }

    // 🔷 Extração de Disciplina e Professor (Limpeza de String)
    let disc = "";
    let prof = "N/I";

    if (cell && typeof cell === "string" && cell.trim() !== "0") {
        const cellLimpa = cell.trim();
        if (cellLimpa.includes(" - ")) {
            const arr = cellLimpa.split(" - ");
            prof = arr.pop().trim(); // Pega o último elemento como professor
            disc = arr.join(" - ").trim(); // O restante é a disciplina
        } else {
            disc = cellLimpa;
        }
    } else {
        return true; // Célula vazia ou "0", não há aula base aqui
    }

    // 🔷 Normalização de IDs (para bater com o dataStore)
    const tId = tNome.toLowerCase().replace(/[^a-z0-9]/g, '');
    const dId = disc.toLowerCase().replace(/[^a-z0-9]/g, '');

    // 🔷 Inicialização e Persistência no Objeto Global
    if (!window.BASE_HORARIOS) window.BASE_HORARIOS = { integrado: {}, superior_s1: {}, superior_s2: {} };
    if (!window.BASE_HORARIOS[tipo]) window.BASE_HORARIOS[tipo] = {};
    if (!window.BASE_HORARIOS[tipo][tId]) window.BASE_HORARIOS[tipo][tId] = {};
    if (!window.BASE_HORARIOS[tipo][tId][dId]) window.BASE_HORARIOS[tipo][tId][dId] = [];

    // Tradução do Professor para nome completo
    const nomeProf = (typeof traduzirProfessor === "function") ? traduzirProfessor(prof) : prof;

    // 🔷 Adição ao Gabarito (Evitando duplicatas de processamento)
    const existe = window.BASE_HORARIOS[tipo][tId][dId].some(a => a.diaSemana === diaSemana && a.time === horario);
    
    if (!existe) {
        window.BASE_HORARIOS[tipo][tId][dId].push({
            name: disc,
            prof: nomeProf,
            diaSemana: diaSemana,
            time: horario || ""
        });
    }

    return true; // Retorna true para interromper o processamento desta linha como "Aula Real"
}

/**
 * Localiza a data mais recente entre todas as aulas registradas no dataStore.
 * Útil para exibir o status de atualização do sistema no Dashboard.
 */
function getUltimaDataRegistrada() {
    // 1. Verificação de Integridade
    if (!dataStore || Object.keys(dataStore).length === 0) {
        console.warn("dataStore vazio ou não carregado.");
        return null;
    }

    let ultimaData = null;

    // 2. Varredura Profunda (Turmas -> Disciplinas -> Aulas)
    Object.values(dataStore).forEach(turma => {
        if (!turma?.discs) return;

        Object.values(turma.discs).forEach(disciplina => {
            if (!Array.isArray(disciplina.sch)) return;

            disciplina.sch.forEach(aula => {
                // Consideramos apenas aulas que possuem o objeto de data (dtObj)
                if (!aula?.dtObj) return;

                // Criamos uma instância de Date para garantir a comparação numérica
                const dataAula = new Date(aula.dtObj);

                // Se for a primeira data encontrada ou for mais recente que a 'ultimaData'
                if (!ultimaData || dataAula.getTime() > ultimaData.getTime()) {
                    ultimaData = dataAula;
                }
            });
        });
    });

    // 3. Log de Diagnóstico
    if (!ultimaData) {
        console.info("Nenhum registro de aula cronológica encontrado para definir a última atualização.");
    }

    return ultimaData;
}

/**
 * Gera uma chave única e normalizada para identificação de Disciplina/Turma.
 * Remove acentos, converte para maiúsculas e limpa espaços em branco.
 * @param {string} disc - Nome da disciplina.
 * @param {string} turma - Nome da turma.
 * @returns {string} Chave única (ex: "MATEMATICA||1A AGRO").
 */
function gerarChave(disc, turma) {
    // 1. Validação de entrada para evitar erros de undefined/null
    const d = (disc || "").toString().trim();
    const t = (turma || "").toString().trim();

    // 2. Composição da string bruta
    const rawKey = `${d}||${t}`;

    // 3. Processo de Normalização:
    return rawKey
        .toUpperCase()                      // Tudo em maiúsculo
        .normalize("NFD")                   // Decompõe caracteres acentuados (ex: 'á' vira 'a' + '´')
        .replace(/[\u0300-\u036f]/g, "")    // Remove os acentos isolados pela regex
        .replace(/\s+/g, ' ');              // Transforma múltiplos espaços em apenas um
}

// ABA 01
// FUNÇÃO QUE GERA TODAS AULAS DE CADA DISCIPLINA
