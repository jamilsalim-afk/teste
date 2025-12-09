// --- Definições Globais e Chaves de Local Storage ---
const LS_KEYS = {
    professor: 'ifro_professores',
    horario: 'ifro_horarios',
    turma: 'ifro_turmas',
    disciplina: 'ifro_disciplinas',
    calendario_integrado: 'ifro_calendario_integrado',
    calendario_superior: 'ifro_calendario_superior',
};

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
// --- 6. INICIALIZAÇÃO E EVENT LISTENERS ---
// ----------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    // Garante que os dados iniciais existam no Local Storage
    Object.keys(LS_KEYS).forEach(key => obterDados(key)); 
    
    inicializarNavegacao(); 
    
    // Mapeamento dos botões Salvar (será preenchido nas próximas etapas)
    document.querySelectorAll('.botao-salvar').forEach(button => {
        button.addEventListener('click', function() {
            const target = this.getAttribute('data-save-target');
            if (target === 'professor') {
                // salvarProfessor(); // A ser implementado
            }
        });
    });
    
    // Força a exibição da aba inicial ao carregar
    mostrarConteudoDaAba('instituicao-cadastro');
});
