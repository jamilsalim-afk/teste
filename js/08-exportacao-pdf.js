function exportarDisciplinaPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');

    // ==========================================
    // 🔷 CAPTURA E VALIDAÇÃO DE DADOS
    // ==========================================
    const tId = document.getElementById('turmaSelect')?.value;
    const dId = document.getElementById('disciplinaSelect')?.value;
    const sem = document.getElementById('semestreSelect')?.value;
    const year = document.getElementById('yearSelect')?.value;

    const turma = dataStore?.[tId];
    const disc = turma?.discs?.[dId];

    if (!turma || !disc || !Array.isArray(disc.sch)) {
        alert("Não há dados disponíveis para exportar este relatório.");
        return;
    }

    // ==========================================
    // 🔷 LÓGICA DE CALENDÁRIO E FILTROS
    // ==========================================
    const dadosAno = (typeof CALENDARIO_DINAMICO !== 'undefined') ? CALENDARIO_DINAMICO[year] : null;
    const limites = dadosAno?.limites;
    
    // Timestamp de corte para cursos semestrais
    let limiteS1 = null;
    if (limites?.superior?.s1) {
        limiteS1 = new Date(limites.superior.s1.fim + "T23:59:59").getTime();
    }

    // Filtragem das aulas para o documento
    const aulasFiltradas = disc.sch.filter(a => {
        if (!a || !a.dtObj) return false;
        
        const tempoAula = new Date(a.dtObj).getTime();

        // Filtro de Semestre (Superior)
        if (ehSemestral(tId) && limiteS1) {
            return (sem === "1") ? tempoAula <= limiteS1 : tempoAula > limiteS1;
        }
        return true;
    });

    if (aulasFiltradas.length === 0) {
        alert("O período selecionado não possui aulas projetadas.");
        return;
    }

    // ==========================================
    // 🔷 PROCESSAMENTO DE CABEÇALHO TÉCNICO
    // ==========================================
    // 1. Lista de Professores Únicos
    const listaProfs = [...new Set(
        aulasFiltradas
            .map(a => (typeof traduzirProfessor === "function") ? traduzirProfessor(a.prof) : a.prof)
            .filter(p => p && p !== "N/I")
    )].join(" / ");

    // 2. Contagem de Carga Horária Efetiva (Soma=True na TRADUCAO)
    const totalAulasEfetivas = aulasFiltradas.filter(a => {
        const info = (typeof TRADUCAO !== 'undefined') ? TRADUCAO[a.tag] : null;
        return !a.tag || (info ? info.soma : true);
    }).length;

    // 3. Aplicação do Template Institucional
    if (typeof gerarCabecalhoPadrao === "function") {
        gerarCabecalhoPadrao(doc);
    }

    // Títulos e Metadados do Relatório
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    
    const txtSemestre = (ehSemestral(tId)) ? ` - SEMESTRE: ${sem}º` : '';
    doc.text(`TURMA: ${turma.name || tId}${txtSemestre}`, 14, 45);
    doc.text(`DISCIPLINA: ${disc.name || dId}`, 14, 50);
    doc.text(`DOCENTE(S): ${listaProfs || 'NÃO INFORMADO'}`, 14, 55);
    
    doc.setFillColor(245, 245, 245);
    doc.rect(14, 58, 182, 7, 'F');
    doc.text(`CARGA HORÁRIA TOTAL NO PERÍODO: ${totalAulasEfetivas} AULAS`, 16, 63);

    // ==========================================
    // 🔷 GERAÇÃO DA TABELA (AUTO-TABLE)
    // ==========================================
    if (typeof doc.autoTable === "function") {
        doc.autoTable({
            html: '#tableD', // Usa a tabela já renderizada no DOM
            startY: 68,
            theme: 'grid',
            headStyles: { 
                fillColor: [21, 128, 61], 
                textColor: [255, 255, 255], 
                fontStyle: 'bold', 
                halign: 'center' 
            },
            bodyStyles: { fontSize: 8, textColor: [50, 50, 50] },
            columnStyles: {
                0: { cellWidth: 25, halign: 'center' }, // Data
                1: { cellWidth: 30, halign: 'center' }, // Dia
                2: { cellWidth: 25, halign: 'center' }, // Horário
                3: { halign: 'left' },                  // Professor
                4: { cellWidth: 30, halign: 'center' }  // Status
            },
            margin: { bottom: 20 }
        });
    }

    // ==========================================
    // 🔷 RODAPÉ E SALVAMENTO
    // ==========================================
    if (typeof gerarRodapePadrao === "function") {
        gerarRodapePadrao(doc);
    }

    const dataEmissao = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
    const nomeArquivo = `Relatorio_${disc.name}_${turma.name}_${dataEmissao}`
        .replace(/\s+/g, '_')
        .replace(/[\\/:*?"<>|]/g, '');

    doc.save(`${nomeArquivo}.pdf`);
}

// EXPORTADOR DE PDF DO RELATORIO DE DISCIPLINA DA ABA 02
function exportarPivoPDF() {
    const { jsPDF } = window.jspdf;
    
    // 1. Captura e Validação
    const tId = document.getElementById('turmaSelectPivo')?.value;
    const sem = document.getElementById('semestreSelectPivo')?.value;

    if (!tId || !dataStore[tId]) {
        alert("Por favor, selecione uma turma antes de exportar.");
        return;
    }

    // 2. Configuração do Documento
    const doc = new jsPDF('p', 'mm', 'a4');
    const turmaNome = dataStore[tId].name || tId;
    const dataEmissao = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');

    // 3. Cabeçalho Institucional
    if (typeof gerarCabecalhoPadrao === "function") {
        gerarCabecalhoPadrao(doc);
    }

    // 4. Títulos e Subtítulos
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    
    const textoSemestre = (ehSemestral(tId) && sem) ? ` (${sem}º SEMESTRE)` : '';
    doc.text(`RELATÓRIO DE DISTRIBUIÇÃO MENSAL DE AULAS`, 14, 45);
    
    doc.setFontSize(10);
    doc.text(`TURMA: ${turmaNome.toUpperCase()}${textoSemestre}`, 14, 51);

    // 5. Geração da Tabela (AutoTable)
    if (typeof doc.autoTable === "function") {
        doc.autoTable({
            html: '#tablePivo',
            startY: 56,
            theme: 'grid',
            styles: { 
                fontSize: 7, 
                halign: 'center',
                valign: 'middle',
                cellPadding: 1
            },
            headStyles: { 
                fillColor: [21, 128, 61], // Verde IFRO
                textColor: [255, 255, 255],
                fontStyle: 'bold'
            },
            columnStyles: {
                0: { halign: 'left', fontStyle: 'bold', cellWidth: 40 } // Nome da Disciplina
            },
            // Garante que o rodapé não sobreponha a tabela em múltiplas páginas
            margin: { bottom: 25 }
        });
    }

    // 6. Rodapé Institucional (Aplica em todas as páginas)
    if (typeof gerarRodapePadrao === "function") {
        gerarRodapePadrao(doc);
    }

    // 7. Salvamento com Nome Seguro
    const nomeArquivo = `Resumo_Mensal_${turmaNome.replace(/\s+/g, '_')}_${dataEmissao}`
        .replace(/[\\/:*?"<>|]/g, '');

    doc.save(`${nomeArquivo}.pdf`);
}

// EXPORTADOR DE PDF DO RELATORIO SEMANAL POR PROFESSOR DA ABA 03
function exportarGradePDF() {
    const { jsPDF } = window.jspdf;
    
    // 1. Captura e Validação de Elementos
    const profRaw = document.getElementById('profSelect')?.value;
    const week = document.getElementById('weekInput')?.value;
    const tabelaElement = document.getElementById('tableGS');

    if (!profRaw || !week) {
        alert("Selecione o Professor e a Semana antes de exportar.");
        return;
    }

    if (!tabelaElement) {
        alert("Gere a grade na tela antes de tentar exportar o PDF.");
        return;
    }

    // 2. Processamento de Datas e Nomes
    const profNome = (typeof traduzirProfessor === "function") ? traduzirProfessor(profRaw) : profRaw;
    const [y, w] = week.split('-W').map(Number);
    const start = getStartOfWeek(w, y);

    if (!start || isNaN(start.getTime())) {
        alert("Data de início da semana inválida.");
        return;
    }

    const end = new Date(start);
    end.setDate(end.getDate() + 5); // Sexta/Sábado

    // 3. Configuração do Documento PDF
    const doc = new jsPDF('p', 'mm', 'a4');
    const dataEmissao = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');

    // 4. Cabeçalho Institucional
    if (typeof gerarCabecalhoPadrao === "function") {
        gerarCabecalhoPadrao(doc);
    }

    // 5. Metadados do Relatório
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(`RELATÓRIO SEMANAL DE ATIVIDADES DOCENTES`, 105, 43, { align: "center" });

    doc.setFontSize(9);
    doc.text(`DOCENTE: ${profNome.toUpperCase()}`, 14, 50);
    doc.text(`PERÍODO: ${start.toLocaleDateString('pt-BR')} a ${end.toLocaleDateString('pt-BR')} (SEMANA ${w})`, 14, 55);

    // 6. Geração da Tabela (AutoTable)
    if (typeof doc.autoTable === "function") {
        doc.autoTable({
            html: '#tableGS',
            startY: 60,
            theme: 'grid',
            styles: {
                fontSize: 6.5,
                cellPadding: 1,
                halign: 'center',
                valign: 'middle',
                overflow: 'linebreak',
                lineWidth: 0.1
            },
            headStyles: { 
                fillColor: [21, 128, 61], 
                textColor: [255, 255, 255],
                fontStyle: 'bold'
            },
            // Ajuste preciso de larguras para A4 (Total ~182mm entre margens)
            columnStyles: {
                0: { cellWidth: 22, fontStyle: 'bold', fillColor: [245, 245, 245] }, // Horário
                1: { cellWidth: 27 }, // Seg
                2: { cellWidth: 27 }, // Ter
                3: { cellWidth: 27 }, // Qua
                4: { cellWidth: 27 }, // Qui
                5: { cellWidth: 27 }, // Sex
                6: { cellWidth: 27 }  // Sáb
            },
            // Estilização especial para as linhas de resumo (Totais, Permanência, Alertas)
            didParseCell: function(data) {

    if (!data.cell.raw) return;

    const status = data.cell.raw.getAttribute?.('data-status');

    switch(status) {

        case "EX":
            data.cell.styles.fillColor = [254, 226, 226];
            data.cell.styles.textColor = [127, 29, 29];
            break;

        case "REC":
            data.cell.styles.fillColor = [255, 237, 213];
            data.cell.styles.textColor = [154, 52, 18];
            break;

        case "+":
            data.cell.styles.fillColor = [219, 234, 254];
            data.cell.styles.textColor = [30, 64, 175];
            break;

        case "R":
            data.cell.styles.fillColor = [243, 232, 255];
            data.cell.styles.textColor = [107, 33, 168];
            break;

        case "SÁBADO LETIVO":
            data.cell.styles.fillColor = [220, 252, 231];
            data.cell.styles.textColor = [22, 101, 52];
            break;
    }
    console.log("RAW:", data.cell.raw);
    console.log("TEXT:", data.cell.text);
},
            margin: { bottom: 25 }
        });
    }

    // 7. Rodapé Institucional
    if (typeof gerarRodapePadrao === "function") {
        gerarRodapePadrao(doc);
    }

    // 8. Nome de Arquivo Seguro e Download
    const nomeLimpo = profNome.replace(/\s+/g, '_').replace(/[\\/:*?"<>|]/g, '');
    doc.save(`Ficha_Semanal_${nomeLimpo}_Semana_${w}.pdf`);
}


async function exportarTodosProfessoresSemanaPDF() {

    const select = document.getElementById('profSelect');

    if (!select.value) {
        alert("Selecione primeiro uma semana.");
    }

    const professores = [...select.options]
        .map(o => o.value)
        .filter(v => v);

    if (!professores.length) {
        alert("Nenhum professor encontrado.");
        return;
    }

    const confirmar = confirm(
        `Serão gerados ${professores.length} PDFs.\nDeseja continuar?`
    );

    if (!confirmar) return;

    for (const prof of professores) {

        select.value = prof;

        gerarGrade();

        await new Promise(resolve => setTimeout(resolve, 500));

        exportarGradePDF();

        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    alert("Exportação concluída.");
}
        

// EXPORTADOR DE PDF DO RELATORIO MENSAL DO PROFESSOR DA ABA 04
function exportarRelatorioProfessorPDF() {
    const { jsPDF } = window.jspdf;

    const profRaw = document.getElementById('buscaProfessorRel').value;
    const anoLetivo = document.getElementById('yearSelect').value;
    const dataEmissao = new Date().toLocaleDateString('pt-BR');
    const dataArquivo = dataEmissao.replace(/\//g, '-');

    if (!profRaw) return alert("Selecione um professor na busca!");

    const profNomeCompleto = traduzirProfessor(profRaw);

    const doc = new jsPDF('l', 'mm', 'a4');
    const pageWidth = 297;

    // ================= HEADER =================
    function drawHeader(d) {
        d.setFillColor(255, 255, 255);
        d.rect(0, 0, pageWidth, 40, 'F');

        d.setFont("helvetica", "bold");
        d.setFontSize(14);
        d.text("INSTITUTO FEDERAL DE RONDÔNIA - IFRO", pageWidth / 2, 12, { align: "center" });

        d.setFontSize(11);
        d.text("CAMPUS CACOAL", pageWidth / 2, 18, { align: "center" });

        d.setFontSize(9);
        d.setFont("helvetica", "normal");
        d.text("DEPARTAMENTO DE APOIO AO ENSINO", pageWidth / 2, 25, { align: "center" });
        d.text("COORDENAÇÃO DE DESENVOLVIMENTO DE FERRAMENTAS PEDAGÓGICAS", pageWidth / 2, 30, { align: "center" });

        d.setDrawColor(21, 128, 61);
        d.setLineWidth(0.5);
        d.line(14, 34, 283, 34);
    }

    // ================= FOOTER =================
    function drawFooter(d) {
        const pageCount = d.internal.getNumberOfPages();
        d.setFontSize(7);
        d.setTextColor(100);

        d.line(14, 195, 283, 195);
        d.text("BR-364, Km 228, Lote 2-A, Zona Rural, Cacoal - RO | Tel: (69) 2182-9642", pageWidth / 2, 200, { align: "center" });
        d.text(`E-mail: dape.cacoal@ifro.edu.br | Página ${d.internal.getCurrentPageInfo().pageNumber} de ${pageCount}`, pageWidth / 2, 204, { align: "center" });
    }

    // ================= INÍCIO =================
    drawHeader(doc);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`RELATÓRIO DOCENTE: ${profNomeCompleto.toUpperCase()}`, 14, 45);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`ANO LETIVO: ${anoLetivo} | EMISSÃO: ${dataEmissao}`, 283, 45, { align: "right" });

    const commonStyles = {
        fontSize: 6.5,
        halign: 'center',
        cellPadding: 1.5,
        lineWidth: 0.1
    };

    const commonHead = [[
        "DISCIPLINA", "TURMA", "JAN", "FEV", "MAR", "ABR", "MAI", "JUN",
        "JUL", "AGO", "SET", "OUT", "NOV", "DEZ", "SÁB", "TOTAL"
    ]];

    // ================= FUNÇÃO PARA EXTRAIR TABELA =================
    function extrairTabela(selector, ignorarPrimeiraColuna = false) {
        const body = [];

        document.querySelectorAll(selector + ' tr').forEach(tr => {
            const row = [];

            tr.querySelectorAll('td').forEach((td, index) => {
                if (ignorarPrimeiraColuna && index === 0) return;
                row.push(td.innerText.trim());
            });

            if (row.length) body.push(row);
        });

        return body;
    }

    // ================= 1. EXECUTADO =================
    doc.setFont("helvetica", "bold");
    doc.text("1. CARGA HORÁRIA EXECUTADA (GIST)", 14, 52);

    const bodyExec = extrairTabela('#bodyRelatorioProf', true);

    doc.autoTable({
        head: commonHead,
        body: bodyExec,
        startY: 53,
        theme: 'grid',
        styles: commonStyles,
        headStyles: { fillColor: [30, 58, 138] },
        margin: { top: 45, bottom: 20 },
        didDrawPage: () => { drawHeader(doc); drawFooter(doc); }
    });

    // ================= 2. PREVISTO =================
    let posY = doc.lastAutoTable.finalY + 8;

    doc.text("2. CARGA HORÁRIA PREVISTA (CALENDÁRIO ACADÊMICO)", 14, posY);

    const bodyPrev = extrairTabela('#bodyRelatorioPrevisto');

    doc.autoTable({
        head: commonHead,
        body: bodyPrev,
        startY: posY + 3,
        theme: 'grid',
        styles: commonStyles,
        headStyles: { fillColor: [21, 128, 61] },
        margin: { top: 45, bottom: 20 },
        didDrawPage: () => { drawHeader(doc); drawFooter(doc); }
    });

    // ================= 3. DIFERENÇA =================
    posY = doc.lastAutoTable.finalY + 8;

    doc.text("3. BALANÇO FINAL (DIFERENÇA)", 14, posY);

    const bodyDiff = extrairTabela('#bodyRelatorioDiferenca');

    doc.autoTable({
        head: commonHead,
        body: bodyDiff,
        startY: posY + 3,
        theme: 'grid',
        styles: commonStyles,
        headStyles: { fillColor: [31, 41, 55] },
        margin: { top: 45, bottom: 20 },

        didParseCell: function (data) {
            if (data.section === 'body') {
                const text = data.cell.raw;

                if (typeof text === 'string') {
                    if (text.includes('+')) {
                        data.cell.styles.textColor = [21, 128, 61];
                        data.cell.styles.fontStyle = 'bold';
                    } else if (text.includes('-') && text.length > 1) {
                        data.cell.styles.textColor = [185, 28, 28];
                        data.cell.styles.fontStyle = 'bold';
                    }
                }
            }
        },

        didDrawPage: () => { drawHeader(doc); drawFooter(doc); }
    });

    // ================= SALVAR =================
    const nomeLimpo = profNomeCompleto.replace(/\s/g, '_');

    doc.save(`Relatorio_Docente_${nomeLimpo}_${dataArquivo}.pdf`);
}

/**
 * Gera e baixa automaticamente um PDF individual para cada professor
 * contendo todo o histórico de aulas registradas no dataStore.
 */
async function exportarTodosProfessoresPDF() {
    const { jsPDF } = window.jspdf;

    if (!dataStore || Object.keys(dataStore).length === 0) {
        return alert("Não há dados carregados para gerar relatórios.");
    }

    const professores = {};

    // 1. AGRUPAMENTO E TRIAGEM DE DADOS
    Object.values(dataStore).forEach(turma => {
        Object.values(turma.discs || {}).forEach(disc => {
            if (!disc.sch) return;

            disc.sch.forEach(aula => {
                if (!aula.prof || !aula.dtObj) return;

                // Filtra apenas eventos que compõem carga horária (info.soma)
                const info = (typeof TRADUCAO !== "undefined" && TRADUCAO[aula.tag]) || { soma: true };
                if (!info.soma) return;

                // Traduz o nome para garantir que o agrupamento use o nome completo
                const nomeProf = (typeof traduzirProfessor === "function") 
                    ? traduzirProfessor(aula.prof).toUpperCase() 
                    : aula.prof.toUpperCase();

                if (!professores[nomeProf]) {
                    professores[nomeProf] = [];
                }

                professores[nomeProf].push({
                    turma: turma.name,
                    disciplina: disc.name,
                    data: aula.date,
                    dtObj: new Date(aula.dtObj),
                    tag: aula.tag
                });
            });
        });
    });

    // 2. GERAÇÃO INDIVIDUAL POR DOCENTE
    const listaProfessores = Object.keys(professores).sort();

    for (const prof of listaProfessores) {
        const doc = new jsPDF('p', 'mm', 'a4');
        const aulasDoProf = professores[prof];

        // Ordenação cronológica global do professor
        aulasDoProf.sort((a, b) => a.dtObj - b.dtObj);

        // Cabeçalho Institucional
        if (typeof gerarCabecalhoPadrao === "function") gerarCabecalhoPadrao(doc);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text(`RELATÓRIO INDIVIDUAL DE ATIVIDADES DOCENTES`, 105, 40, { align: "center" });
        
        doc.setFontSize(10);
        doc.text(`PROFESSOR(A): ${prof}`, 14, 48);
        doc.setDrawColor(200);
        doc.line(14, 50, 196, 50);

        // 3. AGRUPAMENTO POR DISCIPLINA + TURMA PARA O PDF
        const grupos = {};
        aulasDoProf.forEach(a => {
            const chave = `${a.disciplina.toUpperCase()} [${a.turma.toUpperCase()}]`;
            if (!grupos[chave]) grupos[chave] = [];
            grupos[chave].push(a);
        });

        let posY = 56;

        for (const [identificador, listaAulas] of Object.entries(grupos)) {
            // Verifica quebra de página antes de cada novo bloco de disciplina
            if (posY > 250) {
                if (typeof gerarRodapePadrao === "function") gerarRodapePadrao(doc);
                doc.addPage();
                if (typeof gerarCabecalhoPadrao === "function") gerarCabecalhoPadrao(doc);
                posY = 45;
            }

            doc.setFont("helvetica", "bold");
            doc.setFontSize(9);
            doc.setTextColor(21, 128, 61); // Verde IFRO
            doc.text(identificador, 14, posY);
            posY += 3;

            const corpoTabela = listaAulas.map(a => {
                const tipoTexto = (typeof TRADUCAO !== "undefined" && TRADUCAO[a.tag]?.texto) || "AULA NORMAL";
                const mesNome = a.dtObj.toLocaleString('pt-BR', { month: 'long' }).toUpperCase();
                return [a.data, mesNome, tipoTexto];
            });

            doc.autoTable({
                startY: posY,
                head: [["DATA", "MÊS", "DESCRIÇÃO DO EVENTO"]],
                body: corpoTabela,
                theme: 'grid',
                styles: { fontSize: 7, halign: 'center', cellPadding: 1.5 },
                headStyles: { fillColor: [60, 60, 60], textColor: [255, 255, 255] },
                margin: { left: 14, right: 14 }
            });

            posY = doc.lastAutoTable.finalY + 8;
            doc.setTextColor(0); // Reseta cor para preto
        }

        // Rodapé Institucional
        if (typeof gerarRodapePadrao === "function") gerarRodapePadrao(doc);

        // Nome de arquivo limpo (sem caracteres especiais)
        const nomeArquivo = `Relatorio_Docente_${prof.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
        doc.save(nomeArquivo);

        // 🔥 Pausa controlada para não travar o navegador (especialmente se houver 50+ profs)
        await new Promise(r => setTimeout(r, 250));
    }

    alert("Exportação concluída! Os relatórios foram gerados individualmente.");
}

/**
 * Gera relatórios mensais consolidados (Grade de Janeiro a Dezembro)
 * Ideal para conferência de carga horária mensal e sábados letivos.
 */
async function exportarTodosProfessoresMensalPDF() {
    const { jsPDF } = window.jspdf;

    if (!dataStore || Object.keys(dataStore).length === 0) {
        alert("Dados não carregados.");
        return;
    }

    const professores = {};
    const ocultarLista = (typeof DISCIPLINAS_OCULTAR !== "undefined") ? DISCIPLINAS_OCULTAR : [];

    // 1. CONSOLIDAÇÃO DOS DADOS MENSALIZADOS
    Object.values(dataStore).forEach(turma => {
        Object.values(turma.discs || {}).forEach(disc => {
            // Filtro de Disciplinas Ocultas (ex: "COORDENAÇÃO")
            if (ocultarLista.includes(disc.name.toUpperCase().trim())) return;

            if (!disc.sch) return;

            disc.sch.forEach(aula => {
                if (!aula.prof || !aula.dtObj) return;

                const info = (typeof TRADUCAO !== "undefined" && TRADUCAO[aula.tag]) || { soma: true };
                
                // Só processa se somar carga horária ou se for Sábado Letivo específico
                if (!info.soma && aula.tag !== "SÁBADO LETIVO") return;

                // Tradução do nome do Professor
                const nomeProf = (typeof traduzirProfessor === "function") 
                    ? traduzirProfessor(aula.prof).toUpperCase() 
                    : aula.prof.toUpperCase();

                const chaveDisciplinaTurma = `${disc.name}||${turma.name}`;

                if (!professores[nomeProf]) professores[nomeProf] = {};
                if (!professores[nomeProf][chaveDisciplinaTurma]) {
                    professores[nomeProf][chaveDisciplinaTurma] = {
                        disciplina: disc.name.toUpperCase(),
                        turma: turma.name.toUpperCase(),
                        meses: Array(12).fill(0),
                        sabado: 0,
                        total: 0
                    };
                }

                const registro = professores[nomeProf][chaveDisciplinaTurma];
                const dataAula = new Date(aula.dtObj);
                const mesIndex = dataAula.getMonth();

                // Contagem de Aulas Efetivas
                if (info.soma) {
                    registro.meses[mesIndex]++;
                    registro.total++;
                }

                // Contagem separada de Sábados Letivos (conforme sua regra)
                if (aula.tag === "SÁBADO LETIVO") {
                    registro.sabado++;
                }
            });
        });
    });

    // 2. GERAÇÃO DOS ARQUIVOS (LOTE)
    const listaDocentes = Object.keys(professores).sort();

    for (const prof of listaDocentes) {
        // 'l' para Landscape é vital para caber 15 colunas
        const doc = new jsPDF('l', 'mm', 'a4'); 
        const pageWidth = 297;

        if (typeof gerarCabecalhoPadrao === "function") gerarCabecalhoPadrao(doc);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text("CONSOLIDADO MENSAL DE CARGA HORÁRIA DOCENTE", pageWidth / 2, 40, { align: "center" });
        
        doc.setFontSize(10);
        doc.text(`PROFESSOR(A): ${prof}`, 14, 48);

        // Ordenação das disciplinas do professor
        const dadosTabela = Object.values(professores[prof])
            .sort((a, b) => a.disciplina.localeCompare(b.disciplina, 'pt-BR'))
            .map(item => [
                item.disciplina,
                item.turma,
                ...item.meses.map(v => v === 0 ? '-' : v),
                item.sabado || '-',
                item.total
            ]);

        // Renderização da Tabela
        doc.autoTable({
            startY: 52,
            head: [[
                "DISCIPLINA", "TURMA",
                "JAN","FEV","MAR","ABR","MAI","JUN",
                "JUL","AGO","SET","OUT","NOV","DEZ",
                "SÁB","TOTAL"
            ]],
            body: dadosTabela,
            theme: 'grid',
            styles: { 
                fontSize: 6, 
                halign: 'center', 
                valign: 'middle',
                cellPadding: 1.5 
            },
            headStyles: { 
                fillColor: [21, 128, 61], // Verde Institucional
                fontSize: 6 
            },
            columnStyles: {
                0: { halign: 'left', cellWidth: 45 }, // Disciplina alinhada à esquerda
                1: { cellWidth: 20 }                  // Turma compacta
            }
        });

        if (typeof gerarRodapePadrao === "function") gerarRodapePadrao(doc);

        const nomeArquivo = `Mensal_${prof.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
        doc.save(nomeArquivo);

        // Delay para evitar sobrecarga no processador/browser
        await new Promise(r => setTimeout(r, 300));
    }

    alert("Relatórios Mensais gerados com sucesso!");
}

// FUNÇÁO QUE EXPORTA O RELATORIO ANUAL DO PROFESSOR - ABA 05
function exportarHorarioAnualPDF() {
    const { jsPDF } = window.jspdf;
    const profRaw = document.getElementById('buscaProfessorAnual').value;

    if (!profRaw) {
        alert("Selecione um professor na busca!");
        return;
    }

    const profNomeCompleto = traduzirProfessor(profRaw);
    const dataEmissao = new Date().toLocaleDateString('pt-BR');
    const dataArquivo = dataEmissao.replace(/\//g, '-');

    const tabela = document.querySelector('#tabelaHorarioAnual');
    if (!tabela || tabela.rows.length <= 1) {
        alert("Não há dados na tabela para exportar!");
        return;
    }

    const doc = new jsPDF('l', 'mm', 'a4');
    const pageWidth = 297;

    function drawHeader(d) {
        d.setFillColor(255, 255, 255);
        d.rect(0, 0, pageWidth, 45, 'F');

        d.setFont("helvetica", "bold");
        d.setFontSize(14);
        d.text("INSTITUTO FEDERAL DE RONDÔNIA - IFRO", pageWidth / 2, 15, { align: "center" });

        d.setFontSize(12);
        d.text("CAMPUS CACOAL", pageWidth / 2, 22, { align: "center" });

        d.setFontSize(10);
        d.setFont("helvetica", "normal");
        d.text("DEPARTAMENTO DE APOIO AO ENSINO", pageWidth / 2, 30, { align: "center" });
        d.text("COORDENAÇÃO DE DESENVOLVIMENTO DE FERRAMENTAS PEDAGÓGICAS", pageWidth / 2, 36, { align: "center" });

        d.setDrawColor(60, 118, 74);
        d.setLineWidth(0.5);
        d.line(14, 40, 283, 40);

        d.setFont("helvetica", "bold");
        d.setFontSize(11);
        d.text(`PROFESSOR(A): ${profNomeCompleto.toUpperCase()}`, 14, 48);

        d.setFont("helvetica", "normal");
        d.setFontSize(9);
        d.text(`EMISSÃO: ${dataEmissao}`, 283, 48, { align: "right" });
    }

    function drawFooterAllPages(d) {
        const totalPages = d.internal.getNumberOfPages();

        for (let i = 1; i <= totalPages; i++) {
            d.setPage(i);

            d.setFontSize(8);
            d.setTextColor(100);
            d.setDrawColor(200);

            d.line(14, 195, 283, 195);

            d.text(
                "BR-364, Km 228, Lote 2-A, Zona Rural, Cacoal - RO | Tel: (69) 2182-9642",
                pageWidth / 2,
                200,
                { align: "center" }
            );

            d.text(
                `E-mail: dape.cacoal@ifro.edu.br | Página ${i} de ${totalPages}`,
                pageWidth / 2,
                205,
                { align: "center" }
            );
        }
    }

    doc.autoTable({
        html: '#tabelaHorarioAnual',
        startY: 55,
        theme: 'grid',
        styles: {
            fontSize: 7,
            cellPadding: 2,
            valign: 'middle'
        },
        headStyles: {
            fillColor: [60, 118, 74],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            halign: 'center'
        },
        columnStyles: {
            0: { cellWidth: 25, halign: 'center', fontStyle: 'bold' }
        },
        margin: { top: 50, bottom: 20 },

        didDrawPage: function () {
            drawHeader(doc);
        }
    });

    // 🔥 RODAPÉ SOMENTE DEPOIS DA TABELA
    drawFooterAllPages(doc);

    const nomeArquivo = profNomeCompleto.replace(/\s/g, '_');
    doc.save(`Horario_Anual_${nomeArquivo}_${dataArquivo}.pdf`);
}

// EXPORTADOR DE PDF DO RELATORIO SEMANAL POR TURMA DA ABA 06
function exportarGradeTurmaPDF() {
    const { jsPDF } = window.jspdf;
    
    // 1. Captura e Validação de Elementos
    const tId = document.getElementById('turmaSelectSemanal')?.value;
    const week = document.getElementById('weekInputTurma')?.value;
    const tabelaHTML = document.getElementById('tableGSTurma');

    if (!tId || !week || !dataStore[tId]) {
        return alert("Por favor, selecione a Turma e a Semana antes de exportar.");
    }

    if (!tabelaHTML) {
        return alert("Gere a grade da turma na tela antes de exportar.");
    }

    // 2. Processamento de Datas e Nomes
    const turmaNome = dataStore[tId].name || tId;
    const [y, w] = week.split('-W').map(Number);
    const start = getStartOfWeek(w, y);
    
    const end = new Date(start);
    end.setDate(end.getDate() + 5); // Exibe até Sábado

    const dataEmissao = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');

    // 3. Configuração do PDF
    const doc = new jsPDF('p', 'mm', 'a4');

    // 4. Cabeçalho Institucional
    if (typeof gerarCabecalhoPadrao === "function") {
        gerarCabecalhoPadrao(doc);
    }

    // 5. Metadados do Relatório
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(`HORÁRIO SEMANAL DE AULAS - TURMA`, 105, 43, { align: "center" });

    doc.setFontSize(10);
    doc.text(`TURMA: ${turmaNome.toUpperCase()}`, 14, 50);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(
        `PERÍODO: ${start.toLocaleDateString('pt-BR')} a ${end.toLocaleDateString('pt-BR')} (SEMANA ${w})`,
        14,
        55
    );

    // 6. Geração da Tabela (AutoTable)
    if (typeof doc.autoTable === "function") {
        doc.autoTable({
            html: '#tableGSTurma',
            startY: 60,
            theme: 'grid',
            styles: {
                fontSize: 6.5,
                cellPadding: 1.5,
                halign: 'center',
                valign: 'middle',
                overflow: 'linebreak',
                lineWidth: 0.1
            },
            headStyles: { 
                fillColor: [21, 128, 61], 
                textColor: [255, 255, 255],
                fontStyle: 'bold'
            },
            // Distribuição equilibrada das colunas para A4
            columnStyles: {
                0: { cellWidth: 20, fontStyle: 'bold', fillColor: [245, 245, 245] }, // Horário
                1: { cellWidth: 27 }, // Segunda
                2: { cellWidth: 27 }, // Terça
                3: { cellWidth: 27 }, // Quarta
                4: { cellWidth: 27 }, // Quinta
                5: { cellWidth: 27 }, // Sexta
                6: { cellWidth: 27 }  // Sábado
            },
            margin: { bottom: 25 },
            // Evita quebra de linha feia dentro dos cards de aula
            didParseCell: function(data) {
                if (data.section === 'body' && data.column.index > 0) {
                    data.cell.styles.fontSize = 6; // Reduz levemente o texto das aulas se necessário
                }
            }
        });
    }

    // 7. Rodapé Institucional
    if (typeof gerarRodapePadrao === "function") {
        gerarRodapePadrao(doc);
    }

    // 8. Nome de Arquivo Seguro e Download
    const nomeSeguro = turmaNome.replace(/\s+/g, '_').replace(/[\\/:*?"<>|]/g, '');
    doc.save(`Grade_Semanal_${nomeSeguro}_Semana_${w}.pdf`);
}
        
// EXPORTADOR DE PDF DO RELATORIO ANUAL POR TURMA DA ABA 07
function exportarGradeGeralPDF() {
    const { jsPDF } = window.jspdf;
    // Orientação Paisagem ('l') é obrigatória para este volume de dados
    const doc = new jsPDF('l', 'mm', 'a4'); 

    const week = document.getElementById("weekInputGeral")?.value;
    const nivel = document.getElementById("nivelSelect")?.value;

    if (!week || !nivel) {
        alert("Selecione Semana e Nível primeiro.");
        return;
    }

    const blocos = document.querySelectorAll('.bloco-dia');
    if (!blocos || blocos.length === 0) {
        alert("Gere a grade antes de exportar.");
        return;
    }

    const [y, w] = week.split('-W').map(Number);
    const start = getStartOfWeek(w, y);
    const pageWidth = 297;

    blocos.forEach((bloco, index) => {
        if (index > 0) doc.addPage();

        // --- CABEÇALHO ULTRA COMPACTO ---
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text("INSTITUTO FEDERAL DE RONDÔNIA - CAMPUS CACOAL", pageWidth / 2, 8, { align: "center" });
        
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        const tituloDia = bloco.querySelector('h3')?.innerText.toUpperCase() || "";
        doc.text(`GRADE HORÁRIA: ${nivel.toUpperCase()} - ${tituloDia} (Semana ${w})`, pageWidth / 2, 13, { align: "center", maxWidth: 260 });

        doc.setDrawColor(21, 128, 61);
        doc.setLineWidth(0.3);
        doc.line(10, 15, 287, 15);

        const tabelaHTML = bloco.querySelector('.tableGS');
        if (!tabelaHTML) return;

        // --- TABELA COM FOCO EM ECONOMIA VERTICAL ---
        doc.autoTable({
            html: tabelaHTML,
            startY: 18,
            theme: 'grid',
            styles: {
                fontSize: 5,           // Fonte reduzida para caber Manhã/Tarde/Noite
                cellPadding: 0.4,      // Padding mínimo para achatar as linhas
                halign: 'center',
                valign: 'middle',
                overflow: 'linebreak',
                lineWidth: 0.02,       // Linhas da grade bem finas
                minCellHeight: 3       // Força a linha a ser o mais baixa possível
            },
            headStyles: {
                fillColor: [21, 128, 61],
                fontSize: 5.5,
                textColor: [255, 255, 255],
                cellPadding: 0.6
            },
            columnStyles: {
                0: { cellWidth: 16, fontStyle: 'bold', fillColor: [245, 245, 245] } // Coluna de Horário
            },
            margin: { left: 10, right: 10, bottom: 8 },
            
            // Lógica para colorir e achatar os intervalos
            didParseCell: function(data) {
                const texto = data.cell.text.join(' ').toLowerCase();
                
                // Se for linha de intervalo, diminui ainda mais a fonte
                if (texto.includes('intervalo')) {
                    data.cell.styles.fillColor = [235, 235, 235];
                    data.cell.styles.fontSize = 4.5;
                    data.cell.styles.fontStyle = 'italic';
                }
                
                // Se o texto for muito longo, tenta reduzir a fonte para não aumentar a altura da linha
                if (data.cell.text.length > 2) {
                    data.cell.styles.fontSize = 4.5;
                }
            }
        });

        // --- RODAPÉ SIMPLIFICADO ---
        const totalPages = doc.internal.getNumberOfPages();
        doc.setFontSize(6);
        doc.setTextColor(150);
        doc.text(`Gerado em: ${new Date().toLocaleString()} | Página ${index + 1}`, 10, 205);
    });

    const nomeArquivo = `Grade_Geral_${nivel}_W${w}.pdf`;
    doc.save(nomeArquivo);
}
        
// EXPORTADOR DE PDF DO SABADO LETIVO DA ABA 08
async function exportarSabadoPDF() {

    const { jsPDF } = window.jspdf;

    const iso = document.getElementById("selectSabado").value;
    const nivel = document.getElementById("nivelSabado").value;

    if (!iso) {
        alert("Selecione um sábado");
        return;
    }

    const html = gerarHTMLSabado(iso, nivel);

    const doc = new jsPDF("l", "mm", "a4");

    await doc.html(html, {
        callback: function (doc) {
            doc.save(`sabado_${iso}.pdf`);
        },
        x: 10,
        y: 10,
        width: 270
    });
}

async function exportarTodosSabadosPDF() {

    const { jsPDF } = window.jspdf;

    const nivel = document.getElementById("nivelSabado").value;
    const year = document.getElementById("yearSelect").value;

    const cal = CALENDARIO_DINAMICO[year];

    if (!cal || !cal.sabados) {
        alert("Nenhum sábado encontrado");
        return;
    }

    const doc = new jsPDF("l", "mm", "a4");

    const sabados = [...cal.sabados].sort((a,b) => a.data.localeCompare(b.data));

    let primeira = true;

    for (let s of sabados) {

        const html = gerarHTMLSabado(s.data, nivel);

        if (!primeira) doc.addPage();
        primeira = false;

        await doc.html(html, {
            x: 10,
            y: 10,
            width: 270
        });
    }

    doc.save(`todos_sabados_${year}.pdf`);
}

// EXPORTADOR DE PDF DO DASHBOARD DA ABA 09
function exportarDashboardPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');

    // 1. Validação de Dados
    if (!dataStore || Object.keys(dataStore).length === 0) {
        alert("Não há dados carregados para gerar o relatório institucional.");
        return;
    }

    const year = document.getElementById('yearSelect')?.value || new Date().getFullYear();
    const dataEmissao = new Date().toLocaleDateString('pt-BR');

    // 2. Processamento dos Indicadores (KPIs)
    let totalAulasGerais = 0;
    let totalAulasComProfessor = 0;
    const totalTurmas = Object.keys(dataStore).length;
    const professoresSet = new Set();
    const contadorProfessores = {};

    Object.values(dataStore).forEach(turma => {
        Object.values(turma.discs || {}).forEach(disc => {
            disc.sch?.forEach(aula => {
                if (!aula) return;
                totalAulasGerais++;

                const nomeRaw = (aula.prof || "").trim();
                if (nomeRaw && nomeRaw !== "N/I") {
                    totalAulasComProfessor++;
                    // Traduz para nome completo antes de somar no PDF
                    const nomeCompleto = (typeof traduzirProfessor === "function") 
                        ? traduzirProfessor(nomeRaw).toUpperCase() 
                        : nomeRaw.toUpperCase();

                    professoresSet.add(nomeCompleto);
                    contadorProfessores[nomeCompleto] = (contadorProfessores[nomeCompleto] || 0) + 1;
                }
            });
        });
    });

    const percentualCobertura = totalAulasGerais > 0
        ? ((totalAulasComProfessor / totalAulasGerais) * 100).toFixed(1)
        : "0.0";

    const ranking = Object.entries(contadorProfessores).sort((a, b) => b[1] - a[1]);

    // 3. Renderização do Cabeçalho e Título
    if (typeof gerarCabecalhoPadrao === "function") gerarCabecalhoPadrao(doc);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`RELATÓRIO INSTITUCIONAL DE CARGA HORÁRIA - ANO ${year}`, 105, 48, { align: "center" });

    // 4. Bloco de Indicadores com Moldura Sutil
    doc.setDrawColor(230);
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(14, 55, 182, 45, 2, 2, 'FD');

    doc.setFontSize(10);
    doc.setTextColor(50);
    const col1 = 20;
    const col2 = 110;

    doc.text(`Total Geral de Aulas: ${totalAulasGerais}`, col1, 63);
    doc.text(`Aulas com Professor: ${totalAulasComProfessor}`, col1, 70);
    doc.text(`Aulas sem Professor: ${totalAulasGerais - totalAulasComProfessor}`, col1, 77);
    doc.text(`Índice de Cobertura: ${percentualCobertura}%`, col1, 84);

    doc.text(`Total de Turmas: ${totalTurmas}`, col2, 63);
    doc.text(`Professores Ativos: ${professoresSet.size}`, col2, 70);
    doc.text(`Data de Emissão: ${dataEmissao}`, col2, 77);

    // 5. Listagem do Ranking (Com controle de página)
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0);
    doc.text("DISTRIBUIÇÃO DE CARGA HORÁRIA POR DOCENTE (ORDEM DECRESCENTE):", 14, 110);
    
    doc.setDrawColor(21, 128, 61);
    doc.line(14, 112, 196, 112);

    doc.setFont("helvetica", "normal");
    let linhaY = 120;

    ranking.forEach(([nome, qtd], index) => {
        // Verifica se precisa de nova página antes de escrever
        if (linhaY > 275) {
            if (typeof gerarRodapePadrao === "function") gerarRodapePadrao(doc);
            doc.addPage();
            if (typeof gerarCabecalhoPadrao === "function") gerarCabecalhoPadrao(doc);
            doc.setFont("helvetica", "normal");
            linhaY = 50;
        }

        const medalha = (index < 3) ? ">> " : "   ";
        doc.text(`${medalha}${index + 1}º - ${nome}`, 18, linhaY);
        doc.text(`${qtd} aulas`, 190, linhaY, { align: "right" });

        // Linha pontilhada de guia
        doc.setDrawColor(240);
        doc.line(18, linhaY + 2, 190, linhaY + 2);

        linhaY += 7;
    });

    // 6. Finalização
    if (typeof gerarRodapePadrao === "function") gerarRodapePadrao(doc);

    const nomeArquivo = `Relatorio_Dashboard_${year}_${dataEmissao.replace(/\//g, '-')}.pdf`;
    doc.save(nomeArquivo);
}

