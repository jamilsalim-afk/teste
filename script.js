// --- Definições Globais e Chaves de Local Storage ---
const LS_KEYS = {
    professor: 'ifro_professores',
    horario: 'ifro_horarios',
    turma: 'ifro_turmas',
    disciplina: 'ifro_disciplinas',
    calendario_integrado: 'ifro_calendario_integrado',
    calendario_superior: 'ifro_calendario_superior',
};

// ... (após const LS_KEYS) ...

// Dados Iniciais de Teste
const PROFESSORES_INICIAIS_DATA = [
    {
        siape: '100001',
        nome_professor: 'Ana Carolina Silva',
        ch_aulas: 16,
        ch_pgd: 4,
        restricoes: {
            prd_principal: { dia: 'SEGUNDA', periodo: 'INTEIRO' },
            pgd_secundario: '0',
            dispensa_11h: 'NAO'
        }
    },
    {
        siape: '100002',
        nome_professor: 'Carlos Eduardo Santos',
        ch_aulas: 18,
        ch_pgd: 2,
        restricoes: {
            prd_principal: { dia: 'QUARTA', periodo: 'NOTURNO' },
            pgd_secundario: '0',
            dispensa_11h: 'SIM'
        }
    }
];

// Ajuste a inicialização dentro de obterDados (Seção 1)
function obterDados(key) {
    let dados = JSON.parse(localStorage.getItem(LS_KEYS[key]));
    
    if (!dados) {
        // ... (lógica de inicialização de calendário e horário) ...
        
        // NOVO: Inicialização de Professores
        if (key === 'professor') {
             dados = PROFESSORES_INICIAIS_DATA;
        }
        // ... (restante da lógica de inicialização) ...
        
        salvarDados(key, dados);
    }
    return dados;
}
// ----------------------------------------------------------------------
// --- 1. FUNÇÕES BÁSICAS DE DADOS (Local Storage) ---
// ----------------------------------------------------------------------

/**
 * Salva dados no Local Storage.
 */
function salvarDados(key, dados) {
    localStorage.setItem(LS_KEYS[key], JSON.stringify(dados));
}

/**
 * Obtém dados do Local Storage, inicializando se estiver vazio.
 */
function obterDados(key) {
    let dados = JSON.parse(localStorage.getItem(LS_KEYS[key]));
    
    if (!dados) {
        // Inicialização de Calendário
        if (key === 'calendario_integrado' || key === 'calendario_superior') {
             dados = {}; 
        } 
        // Inicialização de Horários (será detalhada na próxima etapa)
        else if (key === 'horario') { 
             dados = { matutino: ['07:30-08:20', '08:20-09:10', 'INTERVALO', '09:30-10:20', '10:20-11:10'], vespertino: [], noturno: [] };
        }
        // Outros cadastros
        else {
             dados = [];
        }
        
        salvarDados(key, dados);
    }
    return dados;
}

// ----------------------------------------------------------------------
// --- 2. LÓGICA DE NAVEGAÇÃO E RECARGA ---
// ----------------------------------------------------------------------

/**
 * Mostra o conteúdo da aba selecionada e esconde as outras.
 */
function mostrarConteudoDaAba(targetId) {
    document.querySelectorAll('.aba-conteudo').forEach(section => {
        section.style.display = 'none';
    });
    
    const targetSection = document.getElementById(targetId);
    
    if (targetSection) {
        targetSection.style.display = 'block';
        
        // Chamada de carregamento específica para a aba (será preenchida nas próximas etapas)
        if (targetId === 'cadastro-professores') {
            // carregarProfessores(); // A ser implementado
        } else if (targetId === 'cadastro-calendario-integrado') {
            // renderizarCalendario('integrado'); // A ser implementado
        } 
        // ... outras chamadas de carregamento ...
    }
    if (targetSection) {
        targetSection.style.display = 'block';
        
        // Chamada de carregamento específica para a aba:
        if (targetId === 'cadastro-professores') {
            carregarProfessores(); // AGORA CHAMAMOS A FUNÇÃO DE CARREGAMENTO
        } else if (targetId === 'instituicao-cadastro') {
            // Caso especial para a aba inicial (não precisa de recarga de tabela)
        }
}

/**
 * Inicializa os ouvintes de evento (listeners) para os links de navegação.
 */
function inicializarNavegacao() {
    const links = document.querySelectorAll('.link-menu, .sub-link-menu');

    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            document.querySelectorAll('.link-menu, .sub-link-menu').forEach(l => l.classList.remove('ativo'));
            this.classList.add('ativo');

            let targetId = this.getAttribute('href').substring(1);
            
            // Tratamento para links de Menu Principal que não são uma seção
            if (targetId === 'instituicao-cadastro') {
                // Se clicar em um link pai, ativa a primeira sub-aba (Professores)
                targetId = 'cadastro-professores'; 
                const profLink = document.querySelector('a[href="#cadastro-professores"]');
                if (profLink) {
                   profLink.classList.add('ativo');
                }
            }
            
            mostrarConteudoDaAba(targetId);
        });
    });

    // Garante que a aba inicial (Instituição) ou a primeira seja carregada
    mostrarConteudoDaAba('instituicao-cadastro'); 
}

// ----------------------------------------------------------------------
// --- 3. LÓGICA DE CADASTRO DE PROFESSORES ---
// ----------------------------------------------------------------------

/**
 * Coleta os dados do formulário e salva/atualiza o professor.
 */
function salvarProfessor() {
    const form = document.getElementById('form-cadastro-professor');
    const siape = document.getElementById('siape').value.trim();
    
    // Impede que o form seja submetido duas vezes se o siape estiver disabled
    if (document.getElementById('siape').disabled) return; 

    const professor = {
        siape: siape,
        nome_professor: document.getElementById('nome_professor').value.trim(),
        ch_aulas: parseInt(document.getElementById('ch_aulas').value) || 0,
        ch_pgd: parseInt(document.getElementById('ch_pgd').value) || 0,
        restricoes: {
            prd_principal: { 
                dia: document.getElementById('prd_principal_dia').value, 
                periodo: document.getElementById('prd_principal_periodo').value 
            },
            pgd_secundario: document.getElementById('pgd_secundario').value,
            dispensa_11h: document.getElementById('dispensa_11h').value
        }
    };

    let professores = obterDados('professor');
    const index = professores.findIndex(p => p.siape === siape);

    if (index > -1) {
        // Atualiza professor existente
        professores[index] = professor;
        alert(`Professor ${professor.nome_professor} atualizado com sucesso!`);
    } else {
        // Adiciona novo professor
        professores.push(professor);
        alert(`Professor ${professor.nome_professor} cadastrado com sucesso!`);
    }

    salvarDados('professor', professores);
    
    // Limpa e recarrega a tabela
    limparFormularioProfessor();
    carregarProfessores();
}

/**
 * Carrega e renderiza a lista de professores na tabela.
 */
function carregarProfessores() {
    const professores = obterDados('professor');
    const tbody = document.getElementById('tabela-corpo-professores');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';

    professores.forEach(prof => {
        const tr = document.createElement('tr');
        
        // Formatação da Restrição Principal
        const restPrin = prof.restricoes.prd_principal;
        let restTxt = 'N/A';
        if (restPrin.dia && restPrin.periodo) {
            restTxt = `${restPrin.dia} (${restPrin.periodo.substring(0, 1)})`;
        }

        tr.innerHTML = `
            <td>${prof.siape}</td>
            <td>${prof.nome_professor}</td>
            <td>${prof.ch_aulas}</td>
            <td>${restTxt}</td>
            <td>
                <button class="botao-acao botao-editar" onclick="editarProfessor('${prof.siape}')">✏️ Editar</button>
                <button class="botao-acao botao-remover" onclick="excluirProfessor('${prof.siape}')">🗑️ Excluir</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

/**
 * Carrega os dados de um professor no formulário para edição.
 */
function editarProfessor(siape) {
    const professores = obterDados('professor');
    const prof = professores.find(p => p.siape === siape);

    if (prof) {
        document.getElementById('siape').value = prof.siape;
        document.getElementById('nome_professor').value = prof.nome_professor;
        document.getElementById('ch_aulas').value = prof.ch_aulas;
        document.getElementById('ch_pgd').value = prof.ch_pgd;

        // Restrições
        document.getElementById('prd_principal_dia').value = prof.restricoes.prd_principal.dia || '';
        document.getElementById('prd_principal_periodo').value = prof.restricoes.prd_principal.periodo || '';
        document.getElementById('pgd_secundario').value = prof.restricoes.pgd_secundario || '';
        document.getElementById('dispensa_11h').value = prof.restricoes.dispensa_11h || 'NAO';
        
        // Bloqueia o campo SIAPE para garantir que a edição seja no mesmo registro
        document.getElementById('siape').setAttribute('disabled', 'true');
        
        alert(`Editando professor SIAPE ${siape}.`);
    }
}

/**
 * Remove um professor do Local Storage.
 */
function excluirProfessor(siape) {
    if (confirm(`Tem certeza que deseja excluir o professor SIAPE ${siape}?`)) {
        let professores = obterDados('professor');
        professores = professores.filter(p => p.siape !== siape);
        
        salvarDados('professor', professores);
        carregarProfessores();
    }
}

/**
 * Limpa o formulário e desbloqueia o campo SIAPE.
 */
function limparFormularioProfessor() {
    document.getElementById('form-cadastro-professor').reset();
    document.getElementById('siape').removeAttribute('disabled');
}

// ----------------------------------------------------------------------
// --- 6. INICIALIZAÇÃO E EVENT LISTENERS ---
// ----------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    // Garante que os dados iniciais existam no Local Storage
    Object.keys(LS_KEYS).forEach(key => obterDados(key)); 
    
    inicializarNavegacao(); 
    
    // Mapeamento dos botões Salvar genéricos
    document.querySelectorAll('.botao-salvar').forEach(button => {
        button.addEventListener('click', function() {
            const target = this.getAttribute('data-save-target');
            
            if (target === 'professor') salvarProfessor(); // CHAMADA CORRETA
            // ... (adicionar outros targets nas próximas etapas) ...
        });
    });
    
    // Força a exibição da aba inicial ao carregar
    mostrarConteudoDaAba('instituicao-cadastro'); 
});
