function estaDentroPeriodoLetivo(data, tId) {
    const periodo = getPeriodoLetivo(data, tId);
    // Só retorna verdadeiro se a data estiver dentro de um período válido (Integrado, S1 ou S2)
    return periodo.inicio && data >= periodo.inicio && data <= periodo.fim;
}

        const PROFESSORES = {
        "Adilson": "Adilson Miranda de Almeida",
"Adriana": "Adriana Aparecida Rigolon",
"Agatha": "Agatha Christie de Souza Zemke",
"Agmar": "Agmar Aparecido Felix Chaves",
"Aguinaldo": "Aguinaldo Pereira",
"Alberto": "Alberto Ayres Benício",
"Aline": "Aline da Silva Correa Valério Sakyrabiar",
"Aline S": "Aline da Silva Aquilau",
"Almerio": "Almério Camara de Gusmão",
"Ana C": "Ana Caroline Carvalho Miranda",
"Andreia": "Andreia Maciel da Silva",
"Angelica": "Angelica Fernandes Estok",
"Angelita": "Angelita Aparecida Coutinho Picazevicz",
"Antonio": "Antonio Ferreira Neto",
"Arilson": "Arilson Ramos",
"Atila": "Atila Bezerra Mira",
"Ayrton": "Ayrton Schupp Pinheiro Oliveira",
"Barbara": "Barbara Ferreira Fadul",
"Cirlania": "Cirlania Pereira Batista",
"Claudemir": "Claudemir Miranda Barboza",
"Claudia": "Claudia Aline Puerari",
"Coordenador": "Coordenador",
"Daianne": "Daianne Castilho Silva",
"Daphne": "Daphne Chiara Antônio",
"Davys": "Davys Sleman de Negreiros",
"Debora": "Debora Costa Barroso Corrêa",
"Dheimy": "Dheimy da Silva Novelli",
"Dhieisi": "Dhieisi Ebert Bolsanello",
"Diego": "Diego dos Santos Oliveira",
"Dierlei": "Dierlei dos Santos",
"Edmilson": "Edmilson Maria de Brito",
"Edna": "Edna Cristiane da Matta",
"Edslei": "Edslei Rodrigues de Almeida",
"Eduardo": "Eduardo Lucas Jorge Serapião",
"Elton": "Elton Eiji Sasaki",
"Erica": "Erica Anne dos Santos Oliveira",
"Erick": "Erick Rodrigo de Oliveira Mesquita",
"Eslei": "Eslei Justiniano dos Reis",
"Gabriel": "Gabriel Tenório dos Santos",
"Gean": "Gean Batista de Lima",
"Genival": "Genival Gomes da Silva Junior",
"Gian": "Gian Willian Tavares de Souza",
"Gilson D": "Gilson Divino Araújo da Silva",
"Gilson P": "Gilson Pedro Ranzula",
"Guilherme": "Guilherme Raniel da Cruz Santos",
"Heloisa": "Heloisa Helena Ribeiro de Miranda",
"Henri": "Henri Francis Ternes de Oliveira",
"Henrique": "Henrique Silva Sérvio",
"Ideir": "Ideir Coto",
"Ingrid": "Ingrid Leticia Menezes Barbosa",
"Iramaia": "Iramaia Grespan Ferreira",
"Irlan": "Irlan Cordeiro de Souza",
"Isis": "Isis Lazzarini Foroni",
"Itarralyss": "Itarralyss Herico Cardoso Santos", 
"Jakeline": "Jakeline Melo dos Anjos",
"Jefferson": "Jefferson Lemes Pinto",
"Jhonata": "Jhonata Lemos da Silva",
"Joel M": "Joel Martins Braga Junior",
"Joelson": "Joelson Barral do Espírito Santo",
"Jonatas": "Jonatas Schweigert",
"Jorge": "Jorge da Silva Werneck",
"Jose A": "Jose de Anchieta Almeida da Silva",
"Jose N": "Jose Nilson Rosa Baraldi Molis",
"Jose V": "Jose Vechiatto",
"Josimar": "Josimar Monteiro Santos",
"Julia S": "Julia de Souza Lopes Basso",
"Juliana F": "Juliana Ferraz Huback Rodrigues",
"Juliana M": "Juliana Maria Freitas de Assis Holanda",
"Juliane": "Juliane Lima Araújo",
"Juliano A": "Juliano Alves de Deus",
"Juliano C": "Juliano Cristhian Silva",
"Julio": "Julio Eduardo Neves dos Santos",
"Junia": "Junia de Souza Lopes",
"Jussara": "Jussara Maria Oliveira de Araújo",
"Larissa": "Larissa Cristina Torrezani Starling Reinicke",
"Leia": "Leia Marcia dos Santos Kempim",
"Leonardo": "Leonardo dos Santos Franca Shockness",
"Lilian A": "Lilian Andrea dos Santos",
"Lilian B": "Lilian Barbosa da Silva",
"Lilian C": "Lilian Catiúscia Eifler Firme da Silva",
"Luciana": "Luciana Alves Ranzula",
"Magno": "Magno Batista Amorim",
"Maily": "Maily Marques Pereira",
"Marcilei": "Marcilei Serafim Germano",
"Marcio": "Marcio Adolfo de Almeida",
"Marco A": "Marco Aurélio Nunes de Barros",
"Marco R": "Marco Rodrigo de Souza",
"Marcos": "Marcos - Prof PVH",
"Marcos G": "Marcos Grutzmacher",
"Maria A": "Maria Angélica Petrini",
"Maria C": "Maria Cristiana de Freitas da Costa",
"Marli": "Marli Henrique de Lima Pio Surui",
"Messias": "Messias José dos Santos Silva",
"Michelle": "Michelle Ayres Abreu",
"Nathali": "Nathali Fernanda Machado Silva",
"Nephi": "Nephi Moraes de Barros",
"Nirvani": "Nirvani Schroeder Henrique",
"Origenes": "Origenes José Gomes Junior",
"Paula": "Paula Michelli da Silva Franco Belmont",
"Paulla": "Paulla Vieira Rodrigues",
"Paulo": "Paulo Fernando Campagnolli",
"Professor": "Professor Contratado",
"Rafael A": "Rafael Ayres Romanholo",
"Rafael C": "Rafael Carlos Bispo",
"Raquel": "Raquel Pereira da Silva",
"Rivaldo": "Rivaldo José de Souza Silva",
"Rodolfo": "Rodolfo Gustavo Teixeira Ribas",
"Rogerio": "Rogerio Giovani Soares Ferreira",
"Saiane": "Saiane Barros de Souza",
"Saiara": "Saiara Gerlaine Silva Toledo",
"Samanta": "Samanta Margarida Milani",
"Sergio": "Sergio Nunes de Jesus",
"Shelly": "Shelly Braum",
"Sirlei": "Sirlei Soares dos Santos",
"Sirley": "Sirley Leite Freitas",
"Substituto": "Substituto",
"Substituto_a1": "Substituto_a1",
"Substituto_a2": "Substituto_a2",
"Substituto_a3": "Substituto_a3",
"Substituto_a4": "Substituto_a4",
"Substituto_a5": "Substituto_a5",
"Substituto_a6": "Substituto_a6",
"Talita": "Talita Freitas Filgueira de Sá",
"Thiago": "Thiago Jose Sampaio Kaiser",
"Tiago": "Tiago Roberto Silva Santos",
"Uberlando": "Uberlando Tiburtino Leite",
"Uirande": "Uirande Oliveira Costa",
"Vera": "Vera Lucia Lopes Silveira",
"Wellyton": "Wellyton Rocha Vasconcellos" };

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('hidden');
}

function getPeriodoLetivo(data, tId, cal) {
    // Helper para converter string YYYY-MM-DD em Date objeto
    // Ajustado para garantir que o fim do dia seja considerado (23:59:59) se necessário
    const toDate = (str, isEnd = false) => new Date(str + (isEnd ? "T23:59:59" : "T00:00:00"));
    
    const ehIntegrado = !ehSemestral(tId);

    if (ehIntegrado) {
        const inicioInt = toDate(cal.integrado.inicio);
        const fimInt = toDate(cal.integrado.fim, true); // Usa o fim do dia

        if (data < inicioInt || data > fimInt) {
            return null; 
        }

        return {
            inicio: inicioInt,
            fim: fimInt,
            tipo: "integrado"
        };
    }

    const s1Inicio = toDate(cal.superior.s1.inicio);
    const s1Fim = toDate(cal.superior.s1.fim, true);
    const s2Inicio = toDate(cal.superior.s2.inicio);
    const s2Fim = toDate(cal.superior.s2.fim, true);

    if (data >= s1Inicio && data <= s1Fim) {
        return {
            inicio: s1Inicio,
            fim: s1Fim,
            tipo: "superior_s1"
        };
    }

    if (data >= s2Inicio && data <= s2Fim) {
        return {
            inicio: s2Inicio,
            fim: s2Fim,
            tipo: "superior_s2"
        };
    }

    return null; 
}

// 1. Melhora a formatação visual (Ex: BIOLOGIA CELULAR -> Biologia Celular)
function formatarNome(nome) {
    if (!nome) return "";

    const minusculas = ['de', 'da', 'do', 'das', 'dos', 'e'];

    return nome
        .toLowerCase()
        .trim()
        .split(/\s+/)
        .map((p, i) => {
            if (i > 0 && minusculas.includes(p)) return p;
            return p.charAt(0).toUpperCase() + p.slice(1);
        })
        .join(" ");
}

// 2. Normalização para BUSCA (Onde estava o problema do relatório)
function normalizarTexto(txt) {
    if (!txt) return "";
    return txt
        .toString()
        .normalize("NFD")               // Decompõe acentos
        .replace(/[\u0300-\u036f]/g, "") // Remove acentos
        .toLowerCase()                  // Padroniza para maiúsculas
        .trim()                         // Remove espaços nas pontas
        .replace(/\s+/g, ' ');          // Transforma múltiplos espaços em um só (MANTÉM O ESPAÇO)
}

/**
 * Criação do Mapa de Professores:
 * Transforma a lista bruta em um objeto de busca rápida com chaves normalizadas.
 * Nota: Certifique-se de que a constante 'PROFESSORES' esteja definida antes deste trecho.
 */
// O JS já conhece 'PROFESSORES' aqui, então criamos o mapa direto:
const MAPA_PROFESSORES = Object.fromEntries(
    Object.entries(PROFESSORES).map(([k, v]) => [
        normalizarTexto(k),
        formatarNome(v)
    ])
);

function traduzirProfessor(nome) {
    if (!nome || nome.trim() === "") return "Não Identificado";

    // 🔥 remove * antes de qualquer coisa
    const nomeLimpo = nome
        .replace(/\*/g, '')
        .trim();

    const chave = normalizarTexto(nomeLimpo);

    return MAPA_PROFESSORES[chave] || formatarNome(nomeLimpo);
}

// =========================
// 🔷 CURSOS SUPERIORES (CONFIGURAÇÃO)
// =========================
const CURSOS_SEMESTRAIS = [
    "GEOGRAFIA",
    "MATEMÁTICA",
    "AGRONEGÓCIO",
    "ZOOTECNIA",
    "AGRONOMIA",
    "SEMESTRE" // Adicionado para capturar cabeçalhos que indicam semestralidade
];

// Alias para manter compatibilidade com outras partes do seu script
function turmaEhSuperior(nome) {
    return ehSemestral(nome);
}

// =========================
// 🔷 TRATAMENTO DE NOMES
// =========================
function getPrimeiroNome(nomeCompleto) {
    if (!nomeCompleto) return "";
    // Remove espaços extras e pega apenas a primeira palavra
    return nomeCompleto.trim().split(/\s+/)[0]; 
}

// =========================
// 🔷 TRADUÇÃO DE STATUS E ESTILIZAÇÃO (CSS)
// =========================
const TRADUCAO = { 
    "+": {
        texto: "EXTRA",
        class: "bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-[10px] font-bold",
        soma: true
    },
    "R": {
        texto: "REPOSIÇÃO",
        class: "bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-[10px] font-bold",
        soma: true
    },
    "REC": {
        texto: "RECUPERAÇÃO",
        class: "bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full text-[10px] font-bold",
        soma: false
    },
    "EX": {
        texto: "EXAME",
        class: "bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-[10px] font-bold",
        soma: false
    },
    "SÁBADO LETIVO": {
        texto: "SÁBADO LETIVO",
        class: "bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-[10px] font-bold",
        soma: true
    }
};

// ==========================================
// 🔷 GABARITO DE HORÁRIOS (ESTRUTURA IFRO)
// ==========================================
const GABARITO = [
    { h:"07:30 - 08:20", t:"aula" },
    { h:"08:20 - 09:10", t:"aula" },
    { h:"09:10 - 09:30", t:"intervalo", l:"INTERVALO MATUTINO" },
    { h:"09:30 - 10:20", t:"aula" },
    { h:"10:20 - 11:10", t:"aula" },
    { h:"11:10 - 12:00", t:"aula" },
    { h:"12:00 - 13:50", t:"intervalo", l:"ALMOÇO" },
    { h:"13:50 - 14:40", t:"aula" },
    { h:"14:40 - 15:30", t:"aula" },
    { h:"15:30 - 15:50", t:"intervalo", l:"INTERVALO VESPERTINO" },
    { h:"15:50 - 16:40", t:"aula" },
    { h:"16:40 - 17:30", t:"aula" },
    { h:"17:30 - 18:20", t:"aula" },
    { h:"18:20 - 19:00", t:"intervalo", l:"JANTAR" },
    { h:"19:00 - 19:50", t:"aula" },
    { h:"19:50 - 20:40", t:"aula" },
    { h:"20:40 - 20:50", t:"intervalo", l:"INTERVALO NOTURNO" },
    { h:"20:50 - 21:40", t:"aula" },
    { h:"21:40 - 22:30", t:"aula" }
];

// ==========================================
// 🔷 ARMAZENAMENTO E CONFIGURAÇÃO
// ==========================================
let dataStore = {}; // Repositório global de dados processados

const GIST_URLS = {
    "2025": {
        tipo: "gist",
        url: "https://gist.githubusercontent.com/jamilsalim-afk/15207392062fe2b7f6fbd0a788e8d99c/raw/"
    },

    "2026": {
        tipo: "sheets",
        integrado: {
            sheetId: "1j33kiPqwtzZNuvkBgYDaIiXZvVMY_J0qWAtRfYGdnD8",
            gid: "1589791808"
        },

        superior: {
            sheetId: "14ALXZgFIT68ee9ajuIdG63SpGVm0HyTjwp63-J6vRyg",
            gid: "1706802967"
        }
    }
};

// Disciplinas que não entram na contagem de aulas letivas nos relatórios
const DISCIPLINAS_OCULTAR = [
    "ATENDIMENTO INDIVIDUAL",
    "ESTUDOS INDIVIDUAIS",
    "PPS/ATENDIMENTO",
    "RESERVA ENSINO",
    "REUNIÃO DE SERVIDORES",
    "PRÉ-CONSELHO*"
];

/**
 * Função Auxiliar: Verifica se uma disciplina deve ser exibida
 */
function deveExibirDisciplina(nomeDisciplina) {
    if (!nomeDisciplina) return false;
    const nomeNorm = normalizarTexto(nomeDisciplina);
    return !DISCIPLINAS_OCULTAR.some(oculta => 
        nomeNorm.includes(normalizarTexto(oculta))
    );
}

// ==========================================
// 🔷 FUNÇÃO AUXILIAR DE FILTRAGEM
// ==========================================
function disciplinaDeveSerOcultada(nome) {
    if (!nome) return false;
    const nomeUpper = nome.toUpperCase();
    // Verifica se o nome da disciplina contém algum dos termos proibidos
    return DISCIPLINAS_OCULTAR.some(d => nomeUpper.includes(d.toUpperCase()));
}

function ordenarTurmas(turmasIds, nivel) {

    const ORDEM_SUPERIOR = [
        "GEOGRAFIA",
        "MATEMATICA",
        "AGRONEGOCIO",
        "ZOOTECNIA",
        "AGRONOMIA"
    ];

    const ORDEM_INTEGRADO = [
        "AGROECOLOGIA",
        "AGROPECUARIA",
        "INFORMATICA"
    ];

    const ORDEM = nivel === "superior"
        ? ORDEM_SUPERIOR
        : ORDEM_INTEGRADO;

    return turmasIds.sort((a, b) => {

        const nomeA = (dataStore[a]?.name || "").toUpperCase();
        const nomeB = (dataStore[b]?.name || "").toUpperCase();

        const idxA = ORDEM.findIndex(c => nomeA.includes(c));
        const idxB = ORDEM.findIndex(c => nomeB.includes(c));

        // Cursos conhecidos vêm primeiro
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;

        // resto ordena por nome
        return nomeA.localeCompare(nomeB);
    });
}
        
// ==========================================
// 🔷 INICIALIZAÇÃO DO SISTEMA (WINDOW ONLOAD)
// ==========================================
window.onload = async () => {
    console.log("🚀 Iniciando Sistema de Gestão Pedagógica - IFRO Cacoal");

    // 1. Atualiza a data de emissão no rodapé/cabeçalho da página
    const dataRel = document.getElementById('dataRelatorio');
    if (dataRel) {
        dataRel.textContent = new Date().toLocaleDateString('pt-BR');
    }

    // 2. Carregamento inicial dos dados do Gist (Aguarda a conclusão)
    try {
        await carregarDados();
    } catch (error) {
        console.error("Erro crítico ao carregar dados iniciais:", error);
        alert("Erro ao conectar com o servidor de dados. Verifique sua conexão.");
    }

    // 3. Inicializa componentes de interface
    if (typeof initTabs === "function") initTabs();
    if (typeof popularFiltroProfessores === "function") popularFiltroProfessores();

    // 4. Configura seletor de Ano com recarregamento automático
    const yearSelect = document.getElementById('yearSelect');
    if (yearSelect) {
        yearSelect.onchange = async function() {
            // Limpa o datastore antes de carregar o novo ano para evitar conflitos
            dataStore = {}; 
            await carregarDados();
            // Opcional: recarregar a aba atual após a troca de ano
            const activeTab = document.querySelector('.tab-btn.active');
            if (activeTab) activeTab.click();
        };
    }

    // 5. Ativa a primeira aba por padrão para o usuário não ver a tela vazia
    const primeiraTab = document.querySelector('.tab-btn');
    if (primeiraTab) primeiraTab.click();

    // ==========================================
    // 🔷 LÓGICA DO RELATÓRIO PIVÔ
    // ==========================================
    const turmaPivo = document.getElementById('turmaSelectPivo');
    const semestrePivo = document.getElementById('semestreSelectPivo');

    if (turmaPivo && semestrePivo) {
        turmaPivo.onchange = (e) => {
            const tId = e.target.value;

            // Se for curso superior, mostra seletor de semestre. Se for técnico, esconde.
            if (ehSemestral(tId)) {
                semestrePivo.classList.remove('hidden');
            } else {
                semestrePivo.classList.add('hidden');
            }

            if (typeof renderPivo === "function") renderPivo();
        };

        semestrePivo.onchange = () => {
            if (typeof renderPivo === "function") renderPivo();
        };
    }

    // ==========================================
    // 🔷 LÓGICA DO RELATÓRIO GERAL (GRADE)
    // ==========================================
    const weekInputGeral = document.getElementById("weekInputGeral");
    const nivelSelect = document.getElementById("nivelSelect");
    const buscaGeral = document.getElementById("buscaGeral");

    if (weekInputGeral && nivelSelect && buscaGeral) {
        weekInputGeral.onchange = function () {
            if (this.value) {
                nivelSelect.classList.remove("hidden");
            } else {
                nivelSelect.classList.add("hidden");
                buscaGeral.classList.add("hidden");
            }
        };

        nivelSelect.onchange = function () {
            if (this.value) {
                buscaGeral.classList.remove("hidden");
                if (typeof gerarGradeGeral === "function") gerarGradeGeral();
            } else {
                buscaGeral.classList.add("hidden");
            }
        };

        buscaGeral.oninput = () => {
            if (typeof gerarGradeGeral === "function") gerarGradeGeral();
        };
    }
    carregarSabadosSelect();
};


// Mantenha apenas ESTA versão no seu arquivo:
function ehSemestral(tId) {
    // 1. Validação de segurança: evita erro se a turma não existir no banco de dados
    if (!tId || !dataStore[tId] || !dataStore[tId].name) return false;

    // 2. Pega o nome real da turma (Ex: "MATEMÁTICA - 1º SEMESTRE")
    const nome = dataStore[tId].name.toUpperCase().trim();

    // 3. Verifica se o nome da turma bate com a sua lista de cursos superiores
    return CURSOS_SEMESTRAIS.some(curso => 
        nome.includes(curso.toUpperCase())
    );
}

