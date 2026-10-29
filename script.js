
const CHAVE_PROJETOS = "reqai_projetos";
const CHAVE_REQUISITOS = "reqai_requisitos";

let projetos = carregar(CHAVE_PROJETOS);
let requisitos = carregar(CHAVE_REQUISITOS);

function carregar(chave) {
  try {
    const dados = JSON.parse(localStorage.getItem(chave) || "[]");
    return Array.isArray(dados) ? dados : [];
  } catch {
    return [];
  }
}

function salvar() {
  localStorage.setItem(CHAVE_PROJETOS, JSON.stringify(projetos));
  localStorage.setItem(CHAVE_REQUISITOS, JSON.stringify(requisitos));
}

function criarId() {
  return crypto.randomUUID();
}

function criarBotao(texto, acao, classe = "") {
  const botao = document.createElement("button");
  botao.type = "button";
  botao.textContent = texto;
  if (classe) botao.className = classe;
  botao.addEventListener("click", acao);
  return botao;
}

function criarElemento(tag, texto, classe = "") {
  const elemento = document.createElement(tag);
  elemento.textContent = texto;
  if (classe) elemento.className = classe;
  return elemento;
}

function atualizar() {
  salvar();
  atualizarResumo();
  mostrarProjetos();
  atualizarSelecaoProjetos();
  mostrarRequisitos();
}

function atualizarResumo() {
  document.getElementById("totalProjetos").textContent =
    projetos.length;

  document.getElementById("totalRequisitos").textContent =
    requisitos.length;

  document.getElementById("totalConcluidos").textContent =
    requisitos.filter(r => r.status === "Concluído").length;
}

document.getElementById("formProjeto")
  .addEventListener("submit", function(evento) {
    evento.preventDefault();

    const nome = document.getElementById("nomeProjeto").value.trim();
    const descricao =
      document.getElementById("descricaoProjeto").value.trim();

    if (!nome) return;

    projetos.push({
      id: criarId(),
      nome,
      descricao,
      criadoEm: new Date().toISOString()
    });

    this.reset();
    atualizar();
  });

function atualizarSelecaoProjetos() {
  const select = document.getElementById("projetoRequisito");
  const selecionado = select.value;

  select.replaceChildren();

  const opcaoInicial = document.createElement("option");
  opcaoInicial.value = "";
  opcaoInicial.textContent = "Selecione um projeto";
  select.appendChild(opcaoInicial);

  projetos.forEach(projeto => {
    const opcao = document.createElement("option");
    opcao.value = projeto.id;
    opcao.textContent = projeto.nome;
    select.appendChild(opcao);
  });

  if (projetos.some(p => p.id === selecionado)) {
    select.value = selecionado;
  }
}

document.getElementById("formRequisito")
  .addEventListener("submit", function(evento) {
    evento.preventDefault();

    const projetoId =
      document.getElementById("projetoRequisito").value;
    const titulo =
      document.getElementById("tituloRequisito").value.trim();
    const descricao =
      document.getElementById("descricaoRequisito").value.trim();

    if (!projetos.some(p => p.id === projetoId)) {
      alert("Cadastre ou selecione um projeto primeiro.");
      return;
    }

    if (!titulo || !descricao) {
      alert("Preencha o título e a descrição.");
      return;
    }

    requisitos.push({
      id: criarId(),
      projetoId,
      titulo,
      descricao,
      tipo: document.getElementById("tipoRequisito").value,
      prioridade:
        document.getElementById("prioridadeRequisito").value,
      status: "Pendente",
      criadoEm: new Date().toISOString()
    });

    this.reset();
    atualizar();
  });

function mostrarProjetos() {
  const lista = document.getElementById("listaProjetos");
  lista.replaceChildren();

  if (projetos.length === 0) {
    lista.appendChild(criarElemento(
      "p", "Nenhum projeto cadastrado.", "vazio"
    ));
    return;
  }

  projetos.forEach(projeto => {
    const item = criarElemento("article", "", "item");
    item.appendChild(criarElemento("h3", projeto.nome));
    item.appendChild(criarElemento(
      "p", projeto.descricao || "Sem descrição."
    ));

    item.appendChild(criarBotao("Excluir projeto", () => {
      const possuiRequisitos = requisitos.some(
        r => r.projetoId === projeto.id
      );

      if (possuiRequisitos) {
        alert("Exclua os requisitos deste projeto primeiro.");
        return;
      }

      if (confirm(`Excluir o projeto "${projeto.nome}"?`)) {
        projetos = projetos.filter(p => p.id !== projeto.id);
        atualizar();
      }
    }, "botao-excluir"));

    lista.appendChild(item);
  });
}

document.getElementById("filtroTipo")
  .addEventListener("change", mostrarRequisitos);

function mostrarRequisitos() {
  const lista = document.getElementById("listaRequisitos");
  const filtro = document.getElementById("filtroTipo").value;

  lista.replaceChildren();

  const filtrados = requisitos.filter(r =>
    filtro === "Todos" || r.tipo === filtro
  );

  if (filtrados.length === 0) {
    lista.appendChild(criarElemento(
      "p", "Nenhum requisito encontrado.", "vazio"
    ));
    return;
  }

  filtrados.forEach(requisito => {
    const projeto = projetos.find(p => p.id === requisito.projetoId);
    const item = criarElemento("article", "", "item");

    item.appendChild(criarElemento("h3", requisito.titulo));
    item.appendChild(criarElemento(
      "p", `Projeto: ${projeto ? projeto.nome : "Não encontrado"}`
    ));
    item.appendChild(criarElemento("p", requisito.descricao));
    item.appendChild(criarElemento(
      "p", `Tipo: ${requisito.tipo} | Prioridade: ${requisito.prioridade}`
    ));
    item.appendChild(criarElemento(
      "p", `Status: ${requisito.status}`
    ));

    item.appendChild(criarBotao(
      requisito.status === "Concluído"
        ? "Marcar como pendente"
        : "Concluir requisito",
      () => {
        requisito.status = requisito.status === "Concluído"
          ? "Pendente"
          : "Concluído";
        atualizar();
      }
    ));

    item.appendChild(criarBotao("Excluir requisito", () => {
      if (confirm(`Excluir "${requisito.titulo}"?`)) {
        requisitos = requisitos.filter(r => r.id !== requisito.id);
        atualizar();
      }
    }, "botao-excluir"));

    lista.appendChild(item);
  });
}

atualizar();
ss