function gerarGradeTurma() {
    const tId = document.getElementById('turmaSelectSemanal').value;
    const week = document.getElementById('weekInputTurma').value;

    if (!tId || !week) {
        alert("Por favor, selecione a Turma e a Semana desejada.");
        return;
    }

    const [y, w] = week.split('-W').map(Number);
    const start = getStartOfWeek(w, y);
    const dias = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

    // 1. Início da Tabela
    let h = `
    <div class="overflow-x-auto shadow-md rounded-lg">
        <table class="tableGS bg-white w-full border-collapse" id="tableGSTurma">
            <thead>
                <tr class="bg-[#15803d] text-white">
                    <th class="w-[80px] p-2 text-[10px] border border-green-700">HORÁRIO</th>`;

    dias.forEach((d, i) => {
        const dtHead = new Date(start);
        dtHead.setDate(dtHead.getDate() + i);
        h += `
            <th class="p-2 border border-green-700 text-[10px]">
                ${d.toUpperCase()}<br>
                <span class="opacity-80 font-normal">${dtHead.toLocaleDateString('pt-BR').slice(0, 5)}</span>
            </th>`;
    });

    h += `</tr></thead><tbody>`;

    // 2. Renderização das Linhas baseadas no GABARITO (Horários da Instituição)
    GABARITO.forEach(slot => {
        if (slot.t === "intervalo") {
            h += `
                <tr class="bg-gray-100 italic text-gray-500 text-[10px] text-center">
                    <td class="border p-1">${slot.h}</td>
                    <td colspan="6" class="border p-1">${slot.l}</td>
                </tr>`;
            return;
        }

        // Normalização do horário para comparação (ex: 07:30)
        const horaSlotPad = slot.h.split(' - ')[0].trim().padStart(5, '0');

        h += `<tr><td class="bg-gray-50 font-bold border p-2 text-[10px] text-center">${slot.h}</td>`;

        // Loop pelos 6 dias da semana (Segunda a Sábado)
        for (let i = 0; i < 6; i++) {
            const dtRef = new Date(start);
            dtRef.setDate(dtRef.getDate() + i);
            let cellContent = "";

            if (dataStore[tId]) {
                // Varre as disciplinas da turma selecionada
                Object.keys(dataStore[tId].discs).forEach(dId => {
                    const discObj = dataStore[tId].discs[dId];

                    discObj.sch.forEach(aula => {
                        if (!aula.dtObj || !aula.time) return;

                        const horaAulaPad = aula.time.split(' - ')[0].trim().padStart(5, '0');

                        // Comparação de Data e Hora
                        if (aula.dtObj.getDate() === dtRef.getDate() &&
                            aula.dtObj.getMonth() === dtRef.getMonth() &&
                            aula.dtObj.getFullYear() === dtRef.getFullYear() &&
                            horaAulaPad === horaSlotPad) {

                            const status = TRADUCAO[aula.tag] || { class: "bg-green-50 border-green-200" };
                            const profNome = (typeof traduzirProfessor === "function") 
                                ? traduzirProfessor(aula.prof) 
                                : aula.prof;

                            cellContent += `
                                <div class="p-1 mb-1 rounded border-l-4 shadow-sm ${status.class}">
                                    <div class="font-black text-[9px] text-gray-800 leading-tight uppercase">
                                        ${discObj.name}
                                    </div>
                                    <div class="border-t border-gray-200 mt-1 pt-1 italic text-[8px] text-blue-800">
                                        ${getPrimeiroNome(profNome)}
                                    </div>
                                </div>`;
                        }
                    });
                });
            }

            h += `<td class="border p-1 align-top min-h-[50px]">${cellContent}</td>`;
        }
        h += `</tr>`;
    });

    // 3. Renderização Final
    document.getElementById('gradeTurmaRender').innerHTML = h + "</tbody></table></div>";
}

// ABA 07
// FUNÇÃO PARA GERAR O HORÁRIO DA SEMANA - PODE FILTRAR POR PROFESSOR TAMBEM
function gerarGradeGeral() {
    console.log("🚀 Gerando grade geral...");

    const weekInput = document.getElementById("weekInputGeral");
    const nivelInput = document.getElementById("nivelSelect");
    const buscaInput = document.getElementById("buscaGeral");
    const render = document.getElementById("gradeGeralRender");

    if (!weekInput || !nivelInput || !render) {
        console.error("❌ Elementos não encontrados");
        return;
    }

    try {
        gerarGradeGeralInterno(weekInput, nivelInput, buscaInput, render);
    } catch (e) {
        console.error("Erro ao gerar a grade geral:", e);
        render.innerHTML = `<div class="p-4 bg-red-50 border-2 border-red-300 text-red-800 rounded-lg">
            <p class="font-black uppercase text-sm mb-1">⚠️ Não foi possível montar a grade</p>
            <p class="text-sm">${e.message || "Erro desconhecido."}</p>
        </div>`;
    }
}

function gerarGradeGeralInterno(weekInput, nivelInput, buscaInput, render) {
    const week = weekInput.value;
    const nivel = nivelInput.value || "tecnico";
    const buscaProf = normalizarTexto(buscaInput?.value || "");

    if (!week) {
        render.innerHTML = `<div class="p-4 text-red-600 font-bold">Selecione a semana.</div>`;
        return;
    }

    if (!dataStore || Object.keys(dataStore).length === 0) {
        render.innerHTML = `<div class="p-4 text-red-600 font-bold">Nenhum dado carregado.</div>`;
        return;
    }

    const [ano, semana] = week.split("-W").map(Number);
    const start = getStartOfWeek(semana, ano);

    if (!(start instanceof Date) || isNaN(start)) {
        render.innerHTML = `<div class="p-4 text-red-600 font-bold">Semana inválida.</div>`;
        return;
    }

    const diasSemana = ["SEGUNDA","TERÇA","QUARTA","QUINTA","SEXTA","SÁBADO"];

    let horariosFiltrados = [...GABARITO];

    if (nivel === "tecnico") {
        horariosFiltrados = GABARITO.filter(slot => {
            const horaInicio = slot.h.split(" - ")[0];
            return horaInicio < "18:20";
        });
    }

    const turmasFiltradas = Object.keys(dataStore).filter(tId => {
        return nivel === "superior"
            ? turmaEhSuperior(tId)
            : !turmaEhSuperior(tId);
    });

    if (turmasFiltradas.length === 0) {
        render.innerHTML = `<div class="p-4 text-yellow-600 font-bold">Nenhuma turma encontrada.</div>`;
        return;
    }

    let html = "";

    for (let i = 0; i < 6; i++) {

        let dataDia = new Date(start);
        dataDia.setDate(start.getDate() + i);
        dataDia.setHours(0,0,0,0);

        html += `
        <div class="bloco-dia">
            <h3 class="bg-[#15803d] text-white p-2 font-bold mt-6">
                ${diasSemana[i]} - ${dataDia.toLocaleDateString("pt-BR")}
            </h3>

            <table class="tableGS bg-white mb-6">
                <thead class="sticky top-[90px] bg-gray-100 z-10">
                    <tr>
                        <th style="width:70px;" class="text-[10px]">H</th>
                        ${turmasFiltradas.map(tId => `<th>${dataStore[tId].name}</th>`).join("")}
                    </tr>
                </thead>
                <tbody>
        `;

        horariosFiltrados.forEach(slot => {

            if (slot.t === "intervalo") {
                html += `
                <tr class="intervalo-row">
                    <td>${slot.h}</td>
                    <td colspan="${turmasFiltradas.length}">
                        ${slot.l || "INTERVALO"}
                    </td>
                </tr>`;
                return;
            }

            const horaSlot = slot.h.split(" - ")[0].substring(0,5).padStart(5,"0");

            html += `<tr>
                <td class="bg-gray-100 font-bold border">${slot.h}</td>`;

            turmasFiltradas.forEach(tId => {

                let conteudo = "";
                const disciplinas = dataStore[tId].discs || {};

                Object.values(disciplinas).forEach(disc => {

                    (disc.sch || []).forEach(a => {

                        if (!a?.dtObj) return;

                        const dataAula = new Date(a.dtObj);
                        dataAula.setHours(0,0,0,0);

                        const horaAula = (a.time || "")
                            .split(" - ")[0]
                            .substring(0,5)
                            .padStart(5,"0");

                        if (
                            dataAula.getTime() === dataDia.getTime() &&
                            horaAula === horaSlot
                        ) {

                            const nomeProf = traduzirProfessor?.(a.prof) || "";
                            const nomeBusca = normalizarTexto(nomeProf);

                            if (!buscaProf || nomeBusca.includes(buscaProf)) {
                                conteudo += `
                                <div class="border p-1 mb-1 rounded bg-gray-50">
                                    <div class="font-bold text-[11px]">${disc.name}</div>
                                    <div class="text-[10px] text-blue-800">
                                        ${getPrimeiroNome(nomeProf)}
                                    </div>
                                </div>`;
                            }
                        }
                    });
                });

                html += `
                <td class="border align-top">
                    <div class="min-h-[40px]">${conteudo}</div>
                </td>`;
            });

            html += `</tr>`;
        });

        html += `</tbody></table></div>`;
    }

    render.innerHTML = html;

    console.log("✅ Grade renderizada!");
}

// ABA 08
// FUNÇÃO RESPONSÁVEL POR GERAR OS SABADOS LETIVOS
function carregarSabadosSelect() {
    const select = document.getElementById("selectSabado");
    const nivel = document.getElementById("nivelSabado")?.value;
    const year = document.getElementById("yearSelect")?.value;

    if (!select) return;

    select.innerHTML = `<option value="">SELECIONE O SÁBADO</option>`;

    const cal = CALENDARIO_DINAMICO?.[year];
    if (!cal || !cal.sabados) return;

    // 🔴 FILTRA POR NÍVEL (ESSENCIAL)
    const sabadosFiltrados = cal.sabados.filter(s => {
        if (nivel === "integrado") return s.tipo === "integrado";
        if (nivel === "superior") return s.tipo.startsWith("superior");
        return true;
    });

    // 🔴 ORDENA
    sabadosFiltrados.sort((a,b) => a.data.localeCompare(b.data));

    sabadosFiltrados.forEach(s => {
        const opt = document.createElement("option");
        opt.value = s.data;

        const dataFormatada = new Date(s.data + "T12:00:00")
            .toLocaleDateString("pt-BR");

        opt.textContent = dataFormatada;
        select.appendChild(opt);
    });

    console.log("✅ Sábados carregados:", sabadosFiltrados.length);
}
        
function renderSabadoSelecionado() {

    const iso = document.getElementById("selectSabado")?.value;
    const nivel = document.getElementById("nivelSabado")?.value;
    const render = document.getElementById("renderSabados");

    if (!render) {
        console.error("❌ renderSabados não encontrado");
        return;
    }

    if (!iso) {
        render.innerHTML = `<div class="p-4 text-red-600">Selecione um sábado.</div>`;
        return;
    }

    const dataDia = new Date(iso + "T00:00:00");

    let turmasFiltradas = Object.keys(dataStore).filter(tId => {
    return nivel === "superior"
        ? turmaEhSuperior(tId)
        : !turmaEhSuperior(tId);
});

// 🔥 AQUI ENTRA A ORDENAÇÃO
turmasFiltradas = ordenarTurmas(turmasFiltradas, nivel);

    let html = `
    <div class="max-w-full overflow-x-auto">
        <h3 class="bg-[#15803d] text-white p-2 font-bold mb-4">
            SÁBADO LETIVO - ${dataDia.toLocaleDateString("pt-BR")}
        </h3>

        <table class="tableGS bg-white mb-6 text-[10px] table-fixed w-full">
            <thead class="bg-gray-100">
                <tr>
                    <th class="border w-[70px]">H</th>
                    ${turmasFiltradas.map(t => `
                        <th class="border break-words">
                            ${dataStore[t].name}
                        </th>
                    `).join("")}
                </tr>
            </thead>
            <tbody>
    `;

    let horariosFiltrados = [...GABARITO];

    if (nivel === "tecnico") {
        horariosFiltrados = GABARITO.filter(slot => {
            const horaInicio = slot.h.split(" - ")[0];
            return horaInicio < "18:20";
        });
    }

    horariosFiltrados.forEach(slot => {

        if (slot.t === "intervalo") {
            html += `
            <tr class="intervalo-row">
                <td class="border">${slot.h}</td>
                <td colspan="${turmasFiltradas.length}" class="text-center">
                    ${slot.l || "INTERVALO"}
                </td>
            </tr>`;
            return;
        }

        const horaSlot = slot.h.split(" - ")[0].substring(0,5).padStart(5,"0");

        html += `<tr>
            <td class="bg-gray-100 font-bold border text-[10px]">${slot.h}</td>`;

        turmasFiltradas.forEach(tId => {

            let conteudo = "";

            Object.values(dataStore[tId].discs || {}).forEach(disc => {

                (disc.sch || []).forEach(a => {

                    if (!a?.dtObj) return;

                    const dataAula = new Date(a.dtObj);
                    dataAula.setHours(0,0,0,0);

                    const horaAula = (a.time || "")
                        .split(" - ")[0]
                        .substring(0,5)
                        .padStart(5,"0");

                    if (
                        dataAula.getTime() === dataDia.getTime() &&
                        horaAula === horaSlot
                    ) {
                        conteudo += `
                        <div class="border p-1 mb-1 rounded bg-gray-50 break-words">
                            <div class="font-bold text-[10px] leading-tight">
                                ${disc.name}
                            </div>
                            <div class="text-[9px] text-blue-800 leading-tight">
                                ${getPrimeiroNome(a.prof || "")}
                            </div>
                        </div>`;
                    }
                });
            });

            html += `
            <td class="border align-top">
                <div class="min-h-[35px] break-words">
                    ${conteudo}
                </div>
            </td>`;
        });

        html += `</tr>`;
    });

    html += `
            </tbody>
        </table>
    </div>
    `;

    render.innerHTML = html;
}

function gerarHTMLSabado(iso, nivel) {

    const dataDia = new Date(iso + "T00:00:00");

    const turmasFiltradas = Object.keys(dataStore).filter(tId => {
        return nivel === "superior"
            ? turmaEhSuperior(tId)
            : !turmaEhSuperior(tId);
    });

    let html = `
    <h3 style="background:#15803d;color:white;padding:6px;">
        SÁBADO LETIVO - ${dataDia.toLocaleDateString("pt-BR")}
    </h3>

    <table border="1" style="width:100%; border-collapse:collapse; font-size:10px;">
        <thead>
            <tr>
                <th>HORA</th>
                ${turmasFiltradas.map(t => `<th>${dataStore[t].name}</th>`).join("")}
            </tr>
        </thead>
        <tbody>
    `;

    const horarios = [...GABARITO];

    horarios.forEach(slot => {

        if (slot.t === "intervalo") {
            html += `
            <tr>
                <td>${slot.h}</td>
                <td colspan="${turmasFiltradas.length}">INTERVALO</td>
            </tr>`;
            return;
        }

        const horaSlot = slot.h.split(" - ")[0].substring(0,5);

        html += `<tr><td>${slot.h}</td>`;

        turmasFiltradas.forEach(tId => {

            let conteudo = "";

            Object.values(dataStore[tId].discs || {}).forEach(disc => {

                (disc.sch || []).forEach(a => {

                    if (!a?.dtObj) return;

                    const isoAula = a.iso || (a.dtObj
    ? a.dtObj.toISOString().split("T")[0]
    : null);

const horaAula = (a.time || "")
    .split(" - ")[0]
    .substring(0,5);

if (
    isoAula === iso &&
    horaAula === horaSlot
) {
                        conteudo += `${disc.name}<br>${getPrimeiroNome(a.prof || "")}<br><br>`;
                    }
                });
            });

            html += `<td>${conteudo}</td>`;
        });

        html += `</tr>`;
    });

    html += `</tbody></table><br><br>`;

    return html;
}
        
// ABA 09
// FUNÇÃO RESPONSÁVEL POR GERAR OS DADOS DE TODOS OS PROFESSORES - SOMA DAS AULAS = ANUAL+SEMESTRAL
