function initTabs() {
    const botoes = document.querySelectorAll('.tab-btn');
    const abas = document.querySelectorAll('.tab-pane');

    if (!botoes.length || !abas.length) {
        console.warn("Estrutura de abas não encontrada no DOM.");
        return;
    }

    botoes.forEach(botao => {
        botao.addEventListener('click', () => {
            const targetId = botao.dataset.tab;

            if (!targetId) return;

            const abaAlvo = document.getElementById(targetId);
            if (!abaAlvo) return;

            // 1. LIMPEZA DE ESTADOS ANTERIORES
            botoes.forEach(b => b.classList.remove('active'));
            abas.forEach(a => {
                a.classList.remove('active');
                // Esconde por segurança (caso seu CSS use display:none na falta de .active)
                a.style.display = 'none'; 
            });

            // 2. ATIVAÇÃO DA ABA ATUAL
            botao.classList.add('active');
            abaAlvo.classList.add('active');
            abaAlvo.style.display = 'block';

            // 2b. FECHA O MENU NO MOBILE AO ESCOLHER UMA ABA
            // (no desktop, o menu fica sempre visível e não é afetado)
            if (window.innerWidth < 768) {
                const sidebar = document.getElementById('sidebar');
                if (sidebar) sidebar.classList.add('hidden');
            }

            // 3. LÓGICA ESPECÍFICA DE SAÍDA DO DASHBOARD
            // Se a aba clicada NÃO for o Dashboard, limpamos o gráfico
            if (targetId !== "dashboardTab") {
                const containerGrafico = document.getElementById('containerGraficoDashboard');
                if (containerGrafico) {
                    containerGrafico.classList.add('hidden'); // Esconde o container
                }
                
                if (chartAtual) {
                    chartAtual.destroy(); // Libera memória do Chart.js
                    chartAtual = null;    // Reseta a variável global
                }
            }

            // 4. CARREGAMENTO SOB DEMANDA (ENTRADA)
            if (targetId === "dashboardTab") {
                try {
                    // Pequeno delay para garantir que o DOM da aba esteja visível antes de renderizar
                    setTimeout(() => {
                        gerarDashboard();
                    }, 50);
                } catch (e) {
                    console.error("Erro ao gerar dashboard:", e);
                }
            }
        });
    });
}

