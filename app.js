/* =========================================
   VARIÁVEIS PRINCIPAIS
========================================= */
let comandaAtual = null;

let comandas = {}; 
// HISTÓRICO DE TODAS AS VENDAS FINALIZADAS
let historico = [];


/* =========================================
   GERAR COMANDAS
========================================= */
function gerarComandas() {
  const lista = document.getElementById("listaComandas");
  lista.innerHTML = "";

  for (let i = 1; i <= 20; i++) {
    const div = document.createElement("div");
    div.className = "col-3 mb-2";
    div.innerHTML = `
      <button class="btn-comanda w-100" onclick="selecionarComanda(${i}, this)">
        Comanda ${i}
      </button>`;
    lista.appendChild(div);
  }
}
gerarComandas();


/* =========================================
   PRODUTOS
========================================= */
const produtos = [
  { id: 1, nome: "Pastel de Carne", preco: 8 },
  { id: 2, nome: "Pastel de Queijo", preco: 8 },
  { id: 3, nome: "Pastel de Frango", preco: 9 },
  { id: 4, nome: "Pastel de Pizza", preco: 9 },
  { id: 5, nome: "Pastel X-Bacon", preco: 12 },

  { id: 6, nome: "Batata Frita", preco: 18 },
  { id: 7, nome: "Mandioca Frita", preco: 16 },
  { id: 8, nome: "Calabresa Acebolada", preco: 22 },
  { id: 9, nome: "Nuggets", preco: 20 },
  { id: 10, nome: "Frango a Passarinho", preco: 25 },

  { id: 11, nome: "Espetinho de Carne", preco: 10 },
  { id: 12, nome: "Espetinho de Frango", preco: 10 },
  { id: 13, nome: "Espetinho de Kafta", preco: 12 },
  { id: 14, nome: "Espetinho de Linguiça", preco: 10 },

  { id: 15, nome: "Coca 350ml", preco: 6 },
  { id: 16, nome: "Coca 2L", preco: 12 },
  { id: 17, nome: "Guaraná 350ml", preco: 5 },
  { id: 18, nome: "Fanta Laranja", preco: 5 },
  { id: 19, nome: "Água", preco: 3 },
  { id: 20, nome: "Suco Del Valle", preco: 6 }
];


/* =========================================
   GERAR PRODUTOS
========================================= */
function gerarProdutos() {
  const lista = document.getElementById("listaProdutos");
  lista.innerHTML = "";

  produtos.forEach((p, index) => {
    const div = document.createElement("div");
    div.className = "col-4";

    div.innerHTML = `
      <div class="produto-card mb-3" onclick="adicionarItem(${index})">
        <h5>${p.nome}</h5>
        <div class="produto-preco">R$ ${p.preco.toFixed(2)}</div>
      </div>`;

    lista.appendChild(div);
  });
}
gerarProdutos();


/* =========================================
   SELECIONAR COMANDA
========================================= */
function selecionarComanda(num, btn) {
  comandaAtual = num;

  if (!comandas[num]) {
    comandas[num] = { nome: "", itens: [], total: 0, pagamento: "DINHEIRO" };
  }

  document.querySelectorAll(".btn-comanda").forEach(b =>
    b.classList.remove("ativa")
  );

  btn.classList.add("ativa");

  document.getElementById("tituloComanda").innerText = "Comanda " + num;
  document.getElementById("nomeCliente").value = comandas[num].nome;

  atualizarTotal();
}


/* =========================================
   SALVAR NOME AUTOMÁTICO
========================================= */
function salvarNomeCliente() {
  if (comandaAtual !== null) {
    comandas[comandaAtual].nome = document.getElementById("nomeCliente").value;
  }
}


/* =========================================
   ADICIONAR ITEM
========================================= */
function adicionarItem(index) {
  if (!comandaAtual) {
    Swal.fire("Selecione uma comanda!");
    return;
  }

  comandas[comandaAtual].itens.push(produtos[index]);
  atualizarTotal();
}


/* =========================================
   ATUALIZAR TOTAL
========================================= */
function atualizarTotal() {
  if (!comandaAtual) return;

  const itens = comandas[comandaAtual].itens;
  const total = itens.reduce((acc, item) => acc + item.preco, 0);

  comandas[comandaAtual].total = total;
  document.getElementById("total").innerText = "R$ " + total.toFixed(2);
}


/* =========================================
   FINALIZAR COMANDA
========================================= */
async function finalizarComanda() {
  if (!comandaAtual) return;

  const c = comandas[comandaAtual];

  if (!c.nome.trim()) {
    Swal.fire("Erro", "Digite o nome do cliente!", "error");
    return;
  }

  let totalFinal = c.total;
  const forma = document.getElementById("pagamento").value;
  c.pagamento = forma;

  /* =========================================
     TAXA 0,79% DÉBITO
  ========================================= */
  if (forma === "CARTÃO") {
    totalFinal += totalFinal * 0.0079;
  }

  /* =========================================
     TROCO AUTOMÁTICO
  ========================================= */
  let troco = 0;

  if (forma === "DINHEIRO") {
    const valorPago = parseFloat(
      await Swal.fire({
        title: "Valor Pago",
        input: "number",
        inputLabel: "Digite o valor pago pelo cliente:",
        showCancelButton: true
      }).then(r => r.value)
    );

    if (!valorPago || valorPago < totalFinal) {
      Swal.fire("Erro", "Dinheiro insuficiente!", "error");
      return;
    }

    troco = valorPago - totalFinal;
  }

  /* =========================================
     SALVAR HISTÓRICO
  ========================================= */
  historico.push({
    cliente: c.nome,
    itens: [...c.itens],
    total: totalFinal,
    pagamento: forma,
    troco: troco,
    data: new Date().toLocaleString()
  });

  /* =========================================
     ALERTA FINAL
  ========================================= */
  Swal.fire({
    icon: "success",
    title: "Comanda Finalizada!",
    html: `
      <b>Cliente:</b> ${c.nome}<br>
      <b>Pagamento:</b> ${forma}<br>
      <b>Total Final:</b> R$ ${totalFinal.toFixed(2)}<br>
      ${forma === "DINHEIRO" ? `<b>Troco:</b> R$ ${troco.toFixed(2)}` : ""}
    `
  });

  /* RESETAR COMANDA */
  comandas[comandaAtual] = { nome: "", itens: [], total: 0, pagamento: "DINHEIRO" };
  document.getElementById("nomeCliente").value = "";
  atualizarTotal();
}
