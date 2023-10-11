// Para página única (SPA), apenas com mudança de conteúdo

// Selecionar os IDs e colocar os Listeners
document.querySelector("#PatientListar").addEventListener('click', atualizarTabelaPacienteLista);
document.querySelector("#PatientCadastrar").addEventListener("click", atualizarCadastroPaciente);
document.querySelector("#DoctorListar").addEventListener("click", atualizarTabelaMedicoLista);
document.querySelector("#DoctorCadastrar").addEventListener("click", atualizarCadastroMedico);
document.querySelector('#AddAppointment').addEventListener('click', adicionarConsulta)

async function consultasPaciente(){
    let nomeGeral = $(this).first().parent().first().parent().children().first().text();
    limparMain();
    respostaConsultas = await fetch("https://ifsp.ddns.net/webservices/clinicaMedica/consultas");
    dadosConsultas = await respostaConsultas.json();
    objetosConsultas = carregarObjetos(dadosConsultas);
    respostaPacientes = await fetch("https://ifsp.ddns.net/webservices/clinicaMedica/pacientes");
    dadosPacientes = await respostaPacientes.json();
    respostaMedicos = await fetch("https://ifsp.ddns.net/webservices/clinicaMedica/medicos");
    dadosMedicos = await respostaMedicos.json();
    organizarConsulta(nomeGeral, dadosPacientes, "idPaciente", dadosMedicos, "idMedico",objetosConsultas);
}

async function consultasMedico(){
    let nomeGeral = $(this).first().parent().first().parent().children().first().text();
    limparMain();
    respostaConsultas = await fetch("https://ifsp.ddns.net/webservices/clinicaMedica/consultas");
    dadosConsultas = await respostaConsultas.json();
    objetosConsultas = carregarObjetos(dadosConsultas);
    let modificarObjeto = objetosConsultas.splice(1, 1);
    objetosConsultas.unshift(modificarObjeto[0]);
    respostaPacientes = await fetch("https://ifsp.ddns.net/webservices/clinicaMedica/pacientes");
    dadosPacientes = await respostaPacientes.json();
    respostaMedicos = await fetch("https://ifsp.ddns.net/webservices/clinicaMedica/medicos");
    dadosMedicos = await respostaMedicos.json();
    organizarConsulta(nomeGeral, dadosMedicos, "idMedico", dadosPacientes, "idPaciente", objetosConsultas)
}

async function organizarConsulta(nomeGeral, dadosPrincipal, idConsulta, dadosSecundario, idSecundario, objetosConsultas) {
    let dadosGerais = [];
    let i;
    let id;
    for (dado of dadosPrincipal) {
        if (dado.nome === nomeGeral){
            id = dado.id
            break
        }
    }
    for (dado of dadosConsultas) {
        let dadosStringify = {};
        if (dado[idConsulta] === id) {
            dado[idConsulta] = nomeGeral;
            i = 1;
        }
        else
            i = 0;
        if (i === 1){
            for (dadoSecundario of dadosSecundario) {
                if (dado[idSecundario] === dadoSecundario.id) {
                    dado[idSecundario] = dadoSecundario.nome;
                }
            }
            for (info of objetosConsultas) {
                dadosStringify[info] = dado[info];
            }
            dadosGerais.push(dadosStringify)
        }
    }
    $("main").append(addCabecalho(`Consultas`));
    $("main").append(criarTabela(dadosGerais, objetosConsultas, null, null, 0));
}

function consultasEspecialidade(id, dados){
    for (let dado of dados) {
        if (dado.id === id)
            return dado.nome
    }
}

function criarBotoes(botao = 0, ) {
    let tdButton = $("<td>");
    if (botao != 0) {
        for(i = 0; i < 3; i++) {
            let button = $("<button>");
            switch (i) {
                case 0:
                    button.addClass("button");
                    button.addClass("is-primary");
                    button.text("Ver Consultas");
                    if (botao === 1)
                        button.click(consultasPaciente);
                    else
                        button.click(consultasMedico);
                    break;
                case 1:
                    button.addClass("button");
                    button.addClass("is-warning");
                    button.text("Editar");
                    if (botao === 1)
                        button.click(editarPaciente);
                    else
                        button.click(editarMedico);
                    break;
                default:
                    button.addClass("button");
                    button.addClass("is-danger");
                    button.text("Deletar");
                    if (botao === 1)
                        button.click(deletarPaciente);
                    else
                        button.click(deletarMedico);
                    break;
                    
            }
            tdButton.addClass("buttons");
            tdButton.addClass("mb-0");
            tdButton.addClass("is-centered");
            tdButton.append(button);
        }
    } else {
        let button = $("<button>");
        button.addClass("button");
        button.addClass("is-danger");
        button.text("Cancelar");
        button.click(deleteConsulta);
        tdButton.addClass("buttons");
        tdButton.addClass("mb-0");
        tdButton.addClass("is-centered");
        tdButton.append(button);
    }
    return tdButton
}

function encontrarID(dados, idPaciente, idMedico, data){
    for(dado of dados){
        if(dado["idPaciente"] === idPaciente && dado["idMedico"] === idMedico && dado["data"] === data) {
            id = dado["id"];
            break
        }
    }
    return id;
}

function encontrarIdPaciente(dadosPacientes, nomePrincipal, dataNascimento, dataCadastro){
    for(dado of dadosPacientes){
        if(dado["nome"] === nomePrincipal && dado["dataNascimento"] === dataNascimento && dado["dataCadastro"] === dataCadastro) {
            return dado["id"];
        }
    }
}

function encontrarIdMedico(dadosMedicos, nomePrincipal, dataCadastro, especialidade){
    for(dado of dadosMedicos){
        if(dado["nome"] === nomePrincipal && dado["dataCadastro"] === dataCadastro && dado["idEspecialidade"] === especialidade) {
            return dado["id"];
        }
    }   
}

async function editarPaciente(){
    let id;
    date = new Date().getTime()
    let nomePrincipal = $(this).first().parent().first().parent().children(":nth-child(1)").text();
    let dataNascimento = $(this).first().parent().first().parent().children(":nth-child(2)").text();
    let dataCadastro = $(this).first().parent().first().parent().children(":nth-child(3)").text();
    respostaPacientes = await fetch("https://ifsp.ddns.net/webservices/clinicaMedica/pacientes");
    dadosPacientes = await respostaPacientes.json();
    id = encontrarIdPaciente(dadosPacientes, nomePrincipal, dataNascimento, dataCadastro);
    limparMain();
    let form = $("<form>");
    let botao = $("<button>");
    botao.addClass("button");
    botao.addClass("is-link");
    botao.text("Editar");
    form.addClass("my-5");
    form.append(criandoForm("Nome", "text", "nome", "Nome", "<input>", null, nomePrincipal));
    form.append(criandoForm("Data de nascimento", "date", "data", "Data de nascimento", "<input>", null, dataNascimento));
    $("main").append(addCabecalho("Editar paciente"));
    $("main").append(divsNecessariasCadastro("is-6", form, botao));
    let botaoCadastrar = document.querySelector('button');
    botaoCadastrar.addEventListener('click', function() {
        let nomePaciente =  document.querySelector('input').value
        let dataNasc = document.querySelector('[formcontrolname="data"]').value
        dateUsuario = new Date(dataNasc).getTime() 
        if (dateUsuario > date || nomePaciente === "" || dateUsuario === "") {
            Swal.fire(
                'Erro!',
                'Colocar um nome ou verificar a data de nascimento!',
                'error'
              )
            return null
        } 
        let dadosPost = {};
        dadosPost["nome"] = nomePaciente;
        dadosPost["dataNascimento"] = dataNasc;
        options = parametros(dadosPost, "PUT");
        fetch("https://ifsp.ddns.net/webservices/clinicaMedica/pacientes/" + id, options)
        Swal.fire({
            position: 'top',
            icon: 'success',
            title: 'Your work has been saved',
            showConfirmButton: false,
            timer: 1500
          })
    });
}

async function editarMedico(){
    let id;
    let objetosEspecialidades = [];
    let nomePrincipal = $(this).first().parent().first().parent().children(":nth-child(1)").text();
    let dataCadastro = $(this).first().parent().first().parent().children(":nth-child(2)").text();
    let especialidadeNome = $(this).first().parent().first().parent().children(":nth-child(3)").text();
    respostaMedicos = await fetch("https://ifsp.ddns.net/webservices/clinicaMedica/medicos");
    dadosMedicos = await respostaMedicos.json();
    respostaEspecialidades = await fetch("https://ifsp.ddns.net/webservices/clinicaMedica/especialidades");
    dadosEspecialidades = await respostaEspecialidades.json();
    for(dado of dadosEspecialidades){
        if(dado["nome"] === especialidadeNome) {
            especialidade = dado["id"];
        }
    }
    for (dado in dadosEspecialidades) {
        objetosEspecialidades.push(dadosEspecialidades[dado].nome);
    }
    id = encontrarIdMedico(dadosMedicos, nomePrincipal, dataCadastro, especialidade);
    limparMain();
    let form = $("<form>");
    let botao = $("<button>");
    botao.addClass("button");
    botao.addClass("is-link");
    botao.text("Editar");
    form.addClass("my-5");
    form.append(criandoForm("Nome", "text", "nome", "Nome", "<input>", null, nomePrincipal));
    form.append(criandoForm("Especialidade", null, "especialidade", "Selecione a Especialidade", "<select>", objetosEspecialidades));
    $("main").append(addCabecalho("Editar médico"));
    $("main").append(divsNecessariasCadastro("is-6", form, botao));
    $('select').val(especialidadeNome);
    let botaoCadastrar = document.querySelector('button');
    botaoCadastrar.addEventListener('click', async function() {
        let nomeMedico =  document.querySelector('input').value
        fetch("https://ifsp.ddns.net/webservices/clinicaMedica/especialidades")
        .then(resposta => {return resposta.json()})
        .then(dadosEspecialidades => {
            let especialidade = document.querySelector('select').value
            for(dado of dadosEspecialidades){
                if(dado["nome"] === especialidade) {
                    especialidade = dado["id"];
                }
            }
        })
        let dadosPost = {};
        dadosPost["nome"] = nomeMedico;
        dadosPost["idEspecialidade"] = especialidade;
        options = parametros(dadosPost, "PUT");
        fetch("https://ifsp.ddns.net/webservices/clinicaMedica/medicos/" + id, options)
        Swal.fire({
            position: 'top',
            icon: 'success',
            title: 'Your work has been saved',
            showConfirmButton: false,
            timer: 1500
          })
    });
}

async function deletarPaciente(){
    let id;
    let nomePrincipal = $(this).first().parent().first().parent().children(":nth-child(1)").text();
    let dataNascimento = $(this).first().parent().first().parent().children(":nth-child(2)").text();
    let dataCadastro = $(this).first().parent().first().parent().children(":nth-child(3)").text();
    respostaPacientes = await fetch("https://ifsp.ddns.net/webservices/clinicaMedica/pacientes");
    dadosPacientes = await respostaPacientes.json();
    id = encontrarIdPaciente(dadosPacientes, nomePrincipal, dataNascimento, dataCadastro);
    let dadosDelete = {id};
    options = parametros(dadosDelete, "DELETE");
    fetch("https://ifsp.ddns.net/webservices/clinicaMedica/pacientes/" + id, options);
    $(this).first().parent().first().parent().remove();
    Swal.fire({
        position: 'top',
        icon: 'success',
        title: 'Your work has been saved',
        showConfirmButton: false,
        timer: 1500
      })
}

async function deletarMedico() {
    let id;
    let nomePrincipal = $(this).first().parent().first().parent().children(":nth-child(1)").text();
    let dataCadastro = $(this).first().parent().first().parent().children(":nth-child(2)").text();
    let especialidade = $(this).first().parent().first().parent().children(":nth-child(3)").text();
    respostaMedicos = await fetch("https://ifsp.ddns.net/webservices/clinicaMedica/medicos");
    dadosMedicos = await respostaMedicos.json();
    respostaEspecialidades = await fetch("https://ifsp.ddns.net/webservices/clinicaMedica/especialidades");
    dadosEspecialidades = await respostaEspecialidades.json();
    for(dado of dadosEspecialidades) {
        if(dado["nome"] === especialidade) {
            especialidade = dado["id"];
        }
    }   
    id = encontrarIdMedico(dadosMedicos, nomePrincipal, dataCadastro, especialidade);
    let dadosDelete = {id};
    options = parametros(dadosDelete, "DELETE");
    fetch("https://ifsp.ddns.net/webservices/clinicaMedica/medicos/" + id, options);
    $(this).first().parent().first().parent().remove();
    Swal.fire({
        position: 'top',
        icon: 'success',
        title: 'Your work has been saved',
        showConfirmButton: false,
        timer: 1500
      })
}

async function deleteConsulta(){
    let idPaciente;
    let idMedico;
    let nomePrincipal = $(this).first().parent().first().parent().children(":nth-child(1)").text();
    let nomeAuxiliar = $(this).first().parent().first().parent().children(":nth-child(2)").text();
    let data = $(this).first().parent().first().parent().children(":nth-child(3)").text();
    respostaConsultas = await fetch("https://ifsp.ddns.net/webservices/clinicaMedica/consultas");
    dadosConsultas = await respostaConsultas.json();
    objetosConsultas = carregarObjetos(dadosConsultas);
    respostaPacientes = await fetch("https://ifsp.ddns.net/webservices/clinicaMedica/pacientes");
    dadosPacientes = await respostaPacientes.json();
    respostaMedicos = await fetch("https://ifsp.ddns.net/webservices/clinicaMedica/medicos");
    dadosMedicos = await respostaMedicos.json();
    if ($(this).first().parent().first().parent().first().parent().first().parent().children().first().children().first().text() === "Paciente") {
        for (dado of dadosPacientes) {
            if (dado.nome === nomePrincipal){
                idPaciente = dado.id
                break
            }
        }
        for (dado of dadosMedicos) {
            if (dado.nome === nomeAuxiliar){
                idMedico = dado.id
                break
            }
        }
    } else {
        for (dado of dadosMedicos) {
            if (dado.nome === nomePrincipal){
                idMedico = dado.id
                break
            }
        }
        for (dado of dadosPacientes) {
            if (dado.nome === nomeAuxiliar){
                idPaciente = dado.id
                break
            }
        }
    }
    id = encontrarID(dadosConsultas, idPaciente, idMedico, data);
    let dadosDelete = {id};
    options = parametros(dadosDelete, "DELETE");
    fetch("https://ifsp.ddns.net/webservices/clinicaMedica/consultas/" + id, options);
    $(this).first().parent().first().parent().remove();
    Swal.fire({
        position: 'top',
        icon: 'success',
        title: 'Your work has been saved',
        showConfirmButton: false,
        timer: 1500
      })
};

function corpoLinha(tr, dado, objetos, dadosAux, chave = 0) {
    for (let info of objetos) {
        let td = $("<td>");
        if(!Array.isArray(dado[info])) {
            if($.isNumeric(dado[info]))
                td.text(consultasEspecialidade(dado[info], dadosAux));
            else
                td.text(dado[info]);
            td.addClass("has-text-centered");
        } else {
            let ul = $("<ul>");
            for (let acessorio of dado[info]) {
                let li = $("<li>");
                li.text(acessorio);
                ul.append(li);
            }
            td.append(ul);
        }
        tr.append(td);
    }
    // Adicionar Botoes na ultima coluna
    switch (chave) {
    case ("paciente"):
        tr.append(criarBotoes(1));
        break
    case ("medico"):
        tr.append(criarBotoes(2));
        break
    default:
        tr.append(criarBotoes());
        break
    }
}

function corpoHead(objetos, numero = 1) {
    let thead = $("<thead>") 
    let tr = $("<tr>"); 
    for (let info of objetos) {
        let th = $("<th>");
        switch(info) {
            case "nome":
                th.text("Nome");
                break
            case "dataNascimento":
                th.text("Data de Nascimento");
                break
            case "dataCadastro":
                th.text("Data de Cadastro");
                break
            case "idEspecialidade":
                th.text("Especialidade");
                break
            case "idPaciente":
                th.text("Paciente");
                break
            case "idMedico":
                th.text("Médico");
                break
            case "data":
                th.text("Data");
                break
        }
        th.addClass("has-text-centered");
        tr.append(th);
    }
    let th = $("<th>");
    if (numero === 1)
        th.text("Ações");
    else
        th.text("Cancelar");
    th.addClass("has-text-centered");
    tr.append(th);
    thead.append(tr);
    return thead
}

function corpoTabela(dados, objetos, dadosAux, chave) {
    let tbody = $("<tbody>") 
    for (let dado of dados) {
        let tr = $("<tr>"); 
        corpoLinha(tr, dado, objetos, dadosAux, chave);
        tbody.append(tr);
    }
    return tbody
}

function limparJSON(objetos) {
    // Retirar os IDs
    objetos.shift();
    return objetos;
}

function carregarObjetos(dados, limpar = true) {
    let objetos = []
    if(dados[0] == undefined) {
      for (let dado in dados){
        objetos.push(dado)
      }
    } else {
      for (let dado in dados[0]){
        objetos.push(dado)
      }
    }
    if(limpar)
      objetos = limparJSON(objetos);
    return objetos
}

function divsNecessarias(tamanho, menor) {
    let div1 = $("<div>");
    div1.addClass("columns");
    div1.addClass(tamanho);
    div1.append(menor)
    let div2 = $("<div>");
    div2.addClass("columns");
    div2.addClass("is-centered");
    div2.addClass("my-5");
    div2.append(div1)
    return div2
}

function criarTabela(dados, objetos, dadosAux = null, chave = null, numero = 1) {
    let table = $("<table>");
    table.addClass("table");
    table.addClass("is-striped");
    table.addClass("is-fullwidth");
    table.addClass("is-hoverable");
    table.append(corpoHead(objetos, numero));
    table.append(corpoTabela(dados, objetos, dadosAux, chave));
    return divsNecessarias("is-10", table)
}

function addCabecalho(texto) {
    let h2 = $("<h2>");
    h2.addClass("title");
    h2.addClass("has-text-centered");
    h2.addClass("my-5");
    h2.text(texto);
    return h2
}

function limparMain() {
    $("main").empty();
}

async function atualizarTabelaPacienteLista(){
    limparMain();
    resposta = await fetch("https://ifsp.ddns.net/webservices/clinicaMedica/pacientes");
    dados = await resposta.json();
    objetos = carregarObjetos(dados);
    $("main").append(addCabecalho("Lista de pacientes"));
    $("main").append(criarTabela(dados, objetos, null, "paciente"));
}

async function atualizarTabelaMedicoLista(){
    limparMain();
    respostaMedicos = await fetch("https://ifsp.ddns.net/webservices/clinicaMedica/medicos");
    dadosMedico = await respostaMedicos.json();
    objetosMedico = carregarObjetos(dadosMedico);
    respostaEspecialidades = await fetch("https://ifsp.ddns.net/webservices/clinicaMedica/especialidades");
    dadosEspecialidades = await respostaEspecialidades.json();
    $("main").append(addCabecalho("Lista de médicos"));
    $("main").append(criarTabela(dadosMedico, objetosMedico, dadosEspecialidades, "medico"));
}


function criandoForm(labelNome, tipo, formcontrol, holder, inputAux, objetos = null, texto = "") {
    let div1 = $("<div>");
    div1.addClass("field");
    let label = $("<label>");
    label.text(labelNome);
    let div2 = $("<div>");
    div2.addClass("control");
    let input = $(inputAux);
    if (inputAux === "<input>") {
        input.attr("type", tipo);
        input.val(texto);
    } else {
        for (dado of objetos) {
            opt = $("<option>");
            opt.val(dado);
            opt.text(dado);
            input.append(opt);
        }
    }
    input.attr("formcontrolname", formcontrol);
    input.attr("placeholder", holder);
    input.addClass("input");
    div2.append(input);
    div1.append(label);
    div1.append(div2);
    return div1
}

function divsNecessariasCadastro(tamanho, menor, outroMenor) {
    let div1 = $("<div>");
    div1.addClass("column");
    div1.addClass(tamanho);
    div1.append(menor);
    div1.append(outroMenor);
    let div2 = $("<div>");
    div2.addClass("columns");
    div2.addClass("is-centered");
    div2.append(div1);
    return div2
}

function atualizarCadastroPaciente() {
    date = new Date().getTime()
    limparMain();
    let form = $("<form>");
    let botao = $("<button>");
    botao.addClass("button");
    botao.addClass("is-link");
    botao.text("Cadastrar");
    form.addClass("my-5");
    form.append(criandoForm("Nome", "text", "nome", "Nome", "<input>"));
    form.append(criandoForm("Data de nascimento", "date", "data", "Data de nascimento", "<input>"));
    $("main").append(addCabecalho("Cadastrar novo paciente"));
    $("main").append(divsNecessariasCadastro("is-6", form, botao));

    let botaoCadastrar = document.querySelector('button');
    botaoCadastrar.addEventListener('click', function(){
        async function novoPaciente() {
            let nomePaciente =  document.querySelector('input').value
            let dataNasc = document.querySelector('[formcontrolname="data"]').value
            dateUsuario = new Date(dataNasc).getTime() 
            if (dateUsuario > date || nomePaciente === "" || dateUsuario === "") {
                Swal.fire(
                    'Erro!',
                    'Colocar um nome ou verificar a data de nascimento!',
                    'error'
                  )
                return null
            } 
            dados = { 
                nome: nomePaciente,
                dataNascimento: dataNasc
            }
            let params = new URLSearchParams();
            for (let chave in dados) {
                params.append(chave, dados[chave]);
            }
            let query = params.toString();
            if(dataNasc !=  '' && nomePaciente != ''){
                let options = {
                    method: "POST",
                    body: query,
                    headers: {
                        "Content-Type":"application/x-www-form-urlencoded"
                    },
                }
                fetch("https://ifsp.ddns.net/webservices/clinicaMedica/pacientes", options)
            }
            atualizarCadastroPaciente();
            Swal.fire({
                position: 'top',
                icon: 'success',
                title: 'Your work has been saved',
                showConfirmButton: false,
                timer: 1500
              })
        }
        novoPaciente()
    });
}

async function atualizarCadastroMedico() {
    let objetosEspecialidades = [];
    respostaEspecialidades = await fetch("https://ifsp.ddns.net/webservices/clinicaMedica/especialidades");
    dadosEspecialidades = await respostaEspecialidades.json();
    for (dado in dadosEspecialidades) {
        objetosEspecialidades.push(dadosEspecialidades[dado].nome);
    }
    limparMain();
    let form = $("<form>");
    let botao = $("<button>");
    botao.addClass("button");
    botao.addClass("is-link");
    botao.text("Cadastrar");
    form.addClass("my-5");
    form.append(criandoForm("Nome", "text", "nome", "Nome", "<input>"));
    form.append(criandoForm("Especialidade", null, "especialidade", "Selecione a Especialidade", "<select>", objetosEspecialidades));
    $("main").append(addCabecalho("Cadastrar novo médico"));
    $("main").append(divsNecessariasCadastro("is-6", form, botao));

    let botaoCadastrar = document.querySelector('button');
    botaoCadastrar.addEventListener('click', function(){
        let especialidadeMedica;
        async function fetchNovoMedico(){
            const response = await fetch('https://ifsp.ddns.net/webservices/clinicaMedica/especialidades')
            const dados = await response.json()
            let especialidadeM = document.querySelector('select').value
            for(let especialidade=0; especialidade<dados.length; especialidade++){
                if(especialidadeM == dados[especialidade].nome){
                    especialidadeMedica = dados[especialidade].id
                }       
            }
            return especialidadeMedica
        }
        async function novoMedico() {
            const resultado = await fetchNovoMedico(); 
            let nomeMedico =  document.querySelector('input').value
            if (nomeMedico === "") {
                Swal.fire(
                    'Erro!',
                    'Colocar um nome!',
                    'error'
                  )
                return null
            } 
            dados = { 
                nome: nomeMedico,
                idEspecialidade: resultado
            }
            let params = new URLSearchParams();
            for (let chave in dados) {
                params.append(chave, dados[chave]);
            }
            let query = params.toString();
            if(nomeMedico != ''){
                let options = {
                    method: "POST",
                    body: query,
                    headers: {
                        "Content-Type":"application/x-www-form-urlencoded"
                    },
                }
                fetch("https://ifsp.ddns.net/webservices/clinicaMedica/medicos", options)
            }
            atualizarCadastroMedico();
            Swal.fire({
                position: 'top',
                icon: 'success',
                title: 'Your work has been saved',
                showConfirmButton: false,
                timer: 1500
              })
        }
        novoMedico()
    });
}

function parametros(dados, metodo, corpo = true){
    let params = new URLSearchParams();
    for(let chave in dados) {
        params.append(chave, dados[chave]);
    }
    let query = params.toString();
    let options = {};
    if(corpo == true){
         options = {
            method: metodo,
            body: query,
            headers:  {
                "Content-Type" : "application/x-www-form-urlencoded"
            }
        }
    } else {
        options = {
            method: metodo,
            headers:  {
                "Content-Type" : "application/x-www-form-urlencoded"
            }
        }
    }
    return options
}

function adicionarConsulta(){
    limparMain();
    let consultaMedico = $('<form>')
    let div1 = $("<div>");
    div1.addClass("field");
    let div2 = $("<div>");
    div2.addClass("field");
    let div3 = $("<div>");
    div3.addClass("field");
    let div4 = $("<div>");
    div4.addClass("field");
    let div5 = $("<div>");
    div5.addClass("field");
    consultaMedico.addClass("colum")
    consultaMedico.addClass("is-6")
    let tituloMedico = $('<h2>')
    let tituloPaciente = $('<h2>')
    let tituloDataConsulta = $('<h2>')
    let titutloHoraConsulta = $('<h2>')
    // Botao
    let botaoCadastrar = $('<button>')
    botaoCadastrar.addClass("button")
    botaoCadastrar.addClass("is-link")
    botaoCadastrar.text('Cadastrar')
    botaoCadastrar.attr('id', 'botaoCadastrarConsulta')
    div1.append(botaoCadastrar);
    // Titulos
    tituloMedico.text('Médico')
    div2.append(tituloMedico);
    tituloPaciente.text('Paciente')
    div3.append(tituloMedico);
    tituloDataConsulta.text('Data da consulta')
    div4.append(tituloDataConsulta);
    titutloHoraConsulta = 'Hora da Consulta'
    div5.append(titutloHoraConsulta);
    // Dados
    let medico = document.createElement('select')
    let paciente = document.createElement('select')
    medico.classList.add("select","is-danger","ng-untouched","ng-pristin","ng-invalid")
    div2.append(medico);
    paciente.classList.add("select","is-danger","ng-untouched","ng-pristin","ng-invalid")
    div3.append(paciente);
    let data = document.createElement( 'input')
    data.classList.add("input","is-danger","ng-untouched","ng-pristine","ng-invalid")
    data.setAttribute('type','date');
    data.setAttribute('id','date1');
    div4.append(data);
    let hora = document.createElement('input');
    hora.classList.add("input","is-danger","ng-untouched","ng-pristine","ng-invalid")
    hora.setAttribute('type','time');
    hora.setAttribute('id','hora');
    hora.setAttribute('name','hora');
    hora.setAttribute('min','09:00');
    hora.setAttribute('max', '18:00');
    hora.setAttribute('required','required')
    div5.append(hora);
    consultaMedico.addClass("my-5")
    consultaMedico.append(div1)
    consultaMedico.append(div2)
    consultaMedico.append(div3)
    consultaMedico.append(div4)
    consultaMedico.append(div5)
    $("main").append(addCabecalho("Cadastrar nova consulta"));
    $("main").append(divsNecessariasCadastro("is-6", consultaMedico, div1));

    fetch('https://ifsp.ddns.net/webservices/clinicaMedica/medicos')
    .then(resposta => {
        if(!resposta.ok) {
            throw new Error('Houve algum erro');
        }
        return resposta.json();
    })
    .then(dados => {
        for(let medico=0; medico<dados.length; medico++){
            var medicoNome = dados[medico].nome
            var option = document.createElement('option')
            option.value = medicoNome
            option.textContent = medicoNome
            let opcoesDeMedicos = document.querySelector('select')
            opcoesDeMedicos.appendChild(option)
        }
    })
    .catch(erro => {
        console.error("Erro encontrado ",erro);
    })

    fetch('https://ifsp.ddns.net/webservices/clinicaMedica/pacientes')
    .then(resposta => {
        if(!resposta.ok) {
            throw new Error('Houve algum erro');
        }
        return resposta.json();
    })
    .then(dados => {
        for(let paciente=0; paciente<dados.length; paciente++){
            var pacienteNome = dados[paciente].nome
            var option = document.createElement('option')
            option.value = pacienteNome
            option.textContent = pacienteNome
            let opcoesDePacientes = document.querySelectorAll('select')[1]
            opcoesDePacientes.appendChild(option)
        }
    })
    .catch(erro => {
        console.error("Erro encontrado ",erro);
    })

    let botao5 = document.querySelector('#botaoCadastrarConsulta');
    botao5.addEventListener('click', cadastrarConsulta);

}

function cadastrarConsulta(){ 
    async function fetchPaciente(){
        const response = await fetch('https://ifsp.ddns.net/webservices/clinicaMedica/pacientes')
        const dados = await response.json()
        let paciente = document.querySelectorAll('select')[1]
        let nomePaciente = paciente.value
        for(let paciente=0; paciente<dados.length; paciente++){
            if(nomePaciente == dados[paciente].nome){
                idPaciente = dados[paciente].id

            }
        }
        return idPaciente;
    }
    async function fetchMedico(){
        const response = await fetch('https://ifsp.ddns.net/webservices/clinicaMedica/medicos')
        const dados = await response.json()
        let medico = document.querySelector('select')
        let nomeMedico = medico.value
        for(let medico=0; medico<dados.length; medico++){
            if(nomeMedico == dados[medico].nome){
                idMedico = dados[medico].id
            }
        }
        return idMedico;
    }
    async function ids() {
        const date = new Date().getTime()
        const resultado = await fetchPaciente(); 
        const resultado2 = await fetchMedico();
        let inputDate = document.getElementById('date1')
        let dataSelecionada = inputDate.value;
        let inputTime = document.getElementById('hora')
        let horaSelecionada = inputTime.value;
        dataSelecionadaValor = new Date(dataSelecionada).getTime() 
        if (dataSelecionadaValor < date || resultado === "" || resultado2 === "") {
            Swal.fire(
                'Erro!',
                'Verificar a data de agendamento!',
                'error'
              )
            return null
        } 
        dados = { 
            idPaciente: resultado,
            idMedico: resultado2,
            data: dataSelecionada + ' ' + horaSelecionada
        }
        let params = new URLSearchParams();
        for (let chave in dados) {
            params.append(chave, dados[chave]);
        }
        let query = params.toString();
        if(dataSelecionada !=  '' && horaSelecionada != ''){
            let options = {
                method: "POST",
                body: query,
                headers: {
                    "Content-Type":"application/x-www-form-urlencoded"
                },
            }
            fetch("https://ifsp.ddns.net/webservices/clinicaMedica/consultas", options)
            Swal.fire({
                position: 'top',
                icon: 'success',
                title: 'Your work has been saved',
                showConfirmButton: false,
                timer: 1500
              })
        }
        adicionarConsulta()
    }
    ids()
}