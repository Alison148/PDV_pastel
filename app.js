/* =========================================
   VARIÁVEIS PRINCIPAIS
========================================= */
let comandaAtual = null;
let comandas = {};
let historico = [];
let totalComandas = 20;

/* =========================================
   GERAR COMANDAS
========================================= */
function gerarComandas() {
  const lista = document.getElementById("listaComandas");
  lista.innerHTML = "";

  for (let i = 1; i <= totalComandas; i++) {
    const div = document.createElement("div");
    div.innerHTML = `
      <button class="btn-comanda" onclick="selecionarComanda(${i}, this)">
        Comanda ${i}
      </button>
    `;
    lista.appendChild(div);
  }
}
gerarComandas();

/* =========================================
   ADICIONAR COMANDA
========================================= */
function adicionarComanda() {
  totalComandas++;

  const lista = document.getElementById("listaComandas");
  const num = totalComandas;

  const div = document.createElement("div");
  div.innerHTML = `
    <button class="btn-comanda" onclick="selecionarComanda(${num}, this)">
      Comanda ${num}
    </button>
  `;

  lista.appendChild(div);

  const btn = div.querySelector("button");
  selecionarComanda(num, btn);
}

/* =========================================
   PRODUTOS
========================================= */
let produtos = [
  { nome: "Pastel de Carne", preco: 8 },
  { nome: "Pastel de Queijo", preco: 8 },
  { nome: "Pastel de Frango", preco: 9 },
  { nome: "Pastel de Pizza", preco: 9 },
  { nome: "Pastel X-Bacon", preco: 12 },

  { nome: "Batata Frita", preco: 18 },
  { nome: "Mandioca Frita", preco: 16 },
  { nome: "Calabresa Acebolada", preco: 22 },
  { nome: "Nuggets", preco: 20 },
  { nome: "Frango a Passarinho", preco: 25 },

  { nome: "Espetinho de Carne", preco: 10 },
  { nome: "Espetinho de Frango", preco: 10 },
  { nome: "Espetinho de Kafta", preco: 12 },
  { nome: "Espetinho de Linguiça", preco: 10 },

  { nome: "Coca 350ml", preco: 6 },
  { nome: "Coca 2L", preco: 12 },
  { nome: "Guaraná 350ml", preco: 5 },
  { nome: "Fanta Laranja", preco: 5 },
  { nome: "Água", preco: 3 },
  { nome: "Suco Del Valle", preco: 6 }
];

/* =========================================
   GERAR PRODUTOS NA TELA
========================================= */
function gerarProdutos() {
  const lista = document.getElementById("listaProdutos");
  lista.innerHTML = "";

  produtos.forEach((p, index) => {
    const div = document.createElement("div");
    div.className = "col-4 mb-3";

    div.innerHTML = `
      <div class="produto-card" onclick="adicionarItem(${index})">
        <h5>${p.nome}</h5>
        <div class="produto-preco">R$ ${p.preco.toFixed(2)}</div>
      </div>
    `;

    lista.appendChild(div);
  });
}
gerarProdutos();

/* =========================================
   ADICIONAR NOVO PRODUTO
========================================= */
async function adicionarNovoProduto() {
  const { value: form } = await Swal.fire({
    title: "Adicionar Produto",
    html: `
      <input id="novoNome" class="swal2-input" placeholder="Nome do produto">
      <input id="novoPreco" type="number" class="swal2-input" placeholder="Preço (ex: 8.50)">
    `,
    showCancelButton: true,
    confirmButtonText: "Adicionar"
  });

  const nome = document.getElementById("novoNome").value;
  const preco = Number(document.getElementById("novoPreco").value);

  if (!nome || preco <= 0) {
    Swal.fire("Erro", "Preencha corretamente!", "error");
    return;
  }

  produtos.push({ nome, preco });
  gerarProdutos();
  Swal.fire("Produto adicionado!");
}

/* =========================================
   SELECIONAR COMANDA
========================================= */
function selecionarComanda(num, btn) {
  comandaAtual = num;

  if (!comandas[num]) {
    comandas[num] = { nome: "", itens: [], total: 0, valorPago: null, totalFinal: 0, troco: 0, pagamento: "" };
  }

  document.querySelectorAll(".btn-comanda").forEach(b => b.classList.remove("ativa"));
  btn.classList.add("ativa");

  document.getElementById("tituloComanda").innerText = "Comanda " + num;
  document.getElementById("nomeCliente").value = comandas[num].nome;

  atualizarTotal();
}

/* =========================================
   SALVAR NOME DO CLIENTE
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
  if (comandaAtual === null) {
    Swal.fire("Selecione uma comanda!");
    return;
  }

  const item = produtos[index];
  const itens = comandas[comandaAtual].itens;

  const existente = itens.find(i => i.nome === item.nome);

  if (existente) {
    existente.qtd++;
  } else {
    itens.push({ nome: item.nome, preco: item.preco, qtd: 1 });
  }

  atualizarTotal();
}

/* =========================================
   CONTROLE DE QUANTIDADE
========================================= */
function aumentarQtd(i) {
  comandas[comandaAtual].itens[i].qtd++;
  atualizarTotal();
}

function diminuirQtd(i) {
  if (comandas[comandaAtual].itens[i].qtd > 1) {
    comandas[comandaAtual].itens[i].qtd--;
  } else {
    comandas[comandaAtual].itens.splice(i, 1);
  }

  atualizarTotal();
}

/* =========================================
   ATUALIZAR TOTAL
========================================= */
function atualizarTotal() {
  if (comandaAtual === null) return;

  let itens = comandas[comandaAtual].itens;
  let total = 0;

  const lista = document.getElementById("listaItens");
  lista.innerHTML = "";

  itens.forEach((item, index) => {
    const subtotal = item.preco * item.qtd;
    total += subtotal;

    const div = document.createElement("div");
    div.className = "item-card";

    div.innerHTML = `
      <div class="item-info">${item.nome}<br><small>${item.qtd}x</small></div>
      <div>
        <button class="qty-btn qty-remove" onclick="diminuirQtd(${index})">-</button>
        <button class="qty-btn qty-add" onclick="aumentarQtd(${index})">+</button>
      </div>
      <div class="item-preco">R$ ${subtotal.toFixed(2)}</div>
    `;

    lista.appendChild(div);
  });

  comandas[comandaAtual].total = total;
  document.getElementById("total").innerText = "R$ " + total.toFixed(2);
}

/* =========================================
   GERAR PDF
========================================= */
function gerarPDF(c) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(14);
  doc.text("Comprovante - PDV", 10, 10);

  doc.setFontSize(11);
  doc.text("Cliente: " + c.nome, 10, 20);
  doc.text("Data: " + new Date().toLocaleString(), 10, 28);

  doc.text("Itens:", 10, 40);

  let y = 48;
  c.itens.forEach(item => {
    doc.text(`${item.nome} (${item.qtd}x) - R$ ${(item.qtd * item.preco).toFixed(2)}`, 10, y);
    y += 8;
  });

  y += 5;

  doc.text("Pagamento: " + c.pagamento, 10, y);  
  y += 8;

  if (c.pagamento === "DEBITO") {
    doc.text("Taxa Débito (0,79%): R$ " + (c.totalFinal - c.total).toFixed(2), 10, y);
    y += 8;
  }

  if (c.pagamento === "CREDITO") {
    doc.text("Taxa Crédito (3,99%): R$ " + (c.totalFinal - c.total).toFixed(2), 10, y);
    y += 8;
  }

  doc.text("Total Final: R$ " + c.totalFinal.toFixed(2), 10, y);
  y += 8;

  doc.text("Valor Pago: R$ " + c.valorPago.toFixed(2), 10, y);
  y += 8;

  doc.text("Troco: R$ " + c.troco.toFixed(2), 10, y);

  doc.save(`Comanda_${c.nome}.pdf`);
}

/* =========================================
   FINALIZAR COMANDA (100% CORRIGIDO)
========================================= */
async function finalizarComanda() {
  if (comandaAtual === null) return;

  const c = comandas[comandaAtual];

  if (!c.nome.trim()) {
    Swal.fire("Digite o nome do cliente!");
    return;
  }

  let totalFinal = Number(c.total);
  const forma = document.getElementById("pagamento").value;

  let valorPago = 0;
  let troco = 0;

  // DEBITO
  if (forma === "DEBITO") {
    totalFinal += totalFinal * 0.0079;
    valorPago = totalFinal;
  }

  // CREDITO
  if (forma === "CREDITO") {
    totalFinal += totalFinal * 0.0399;
    valorPago = totalFinal;
  }

  // PIX
  if (forma === "PIX") {
    valorPago = totalFinal;
  }

  // DINHEIRO
  if (forma === "DINHEIRO") {
    const resultado = await Swal.fire({
      title: "Valor Pago",
      input: "number",
      showCancelButton: true
    });

    valorPago = Number(resultado.value);

    if (!valorPago || valorPago < totalFinal) {
      Swal.fire("Erro", "Dinheiro insuficiente!", "error");
      return;
    }

    troco = valorPago - totalFinal;
  }

  // SALVAR NA COMANDA
  c.totalFinal = Number(totalFinal);
  c.valorPago = Number(valorPago);
  c.troco = Number(troco);
  c.pagamento = forma;

  // MONTAR LISTA
  let htmlItens = "";
  c.itens.forEach(item => {
    htmlItens += `<li>${item.nome} (${item.qtd}x) - R$ ${(item.qtd * item.preco).toFixed(2)}</li>`;
  });

  // PRÉ-VISUALIZAÇÃO
  Swal.fire({
    title: "Pré-visualização",
    html: `
      <b>Cliente:</b> ${c.nome}<br>
      <b>Pagamento:</b> ${c.pagamento}<br><br>

      <b>Itens:</b>
      <ul style="text-align:left;">${htmlItens}</ul>

      <br><b>Total Final:</b> R$ ${c.totalFinal.toFixed(2)}
      <br><b>Valor Pago:</b> R$ ${c.valorPago.toFixed(2)}
      <br><b>Troco:</b> R$ ${c.troco.toFixed(2)}
    `,
    showCancelButton: true,
    confirmButtonText: "Gerar PDF"
  }).then(resultado => {
    if (resultado.isConfirmed) {
      gerarPDF(c);
      salvarHistorico(c);

      Swal.fire("Comanda Finalizada!");

      comandas[comandaAtual] = { nome: "", itens: [], total: 0, valorPago: null };
      document.getElementById("nomeCliente").value = "";
      atualizarTotal();
    }
  });
}

/* =========================================
   SALVAR HISTÓRICO (CORRIGIDO)
========================================= */
function salvarHistorico(c) {
  historico.push({
    cliente: c.nome,
    itens: [...c.itens],
    totalFinal: Number(c.totalFinal),
    pagamento: c.pagamento,
    valorPago: Number(c.valorPago),
    troco: Number(c.troco),
    data: new Date().toLocaleString()
  });
}

/* =========================================
   VER HISTÓRICO
========================================= */
function verHistorico() {
  let html = "";

  historico.forEach((h, index) => {
    html += `
      <div>
        <h4>Comanda ${index + 1} - ${h.cliente}</h4>
        <p><b>Data:</b> ${h.data}</p>

        <ul>
          ${h.itens.map(item => `
            <li>${item.nome} (${item.qtd}x) - R$ ${(item.qtd * item.preco).toFixed(2)}</li>
          `).join("")}
        </ul>

        <p><b>Total:</b> R$ ${h.totalFinal.toFixed(2)}</p>
        <p><b>Valor Pago:</b> R$ ${h.valorPago.toFixed(2)}</p>
        <p><b>Troco:</b> R$ ${h.troco.toFixed(2)}</p>
        <p><b>Pagamento:</b> ${h.pagamento}</p>

        <hr>
      </div>
    `;
  });

  Swal.fire({
    title: "Histórico de Comandas",
    width: 650,
    html: `<div style="max-height:400px; overflow-y:auto; text-align:left">${html}</div>`
  });
}

/* =========================================
   FECHAMENTO DO DIA (100% SEM NaN)
========================================= */
function fechamentoDoDia() {

  if (historico.length === 0) {
    Swal.fire("Nenhuma venda ainda!");
    return;
  }

  let totalRecebido = 0;
  let totalTroco = 0;

  let totalDinheiro = 0;
  let totalPix = 0;

  let totalDebitoBruto = 0;
  let totalDebitoLiquido = 0;

  let totalCreditoBruto = 0;
  let totalCreditoLiquido = 0;

  let totalItensVendidos = 0;

  historico.forEach(c => {

    totalRecebido += Number(c.valorPago);
    totalTroco += Number(c.troco);

    if (c.pagamento === "DINHEIRO") {
      totalDinheiro += Number(c.valorPago);
    }

    if (c.pagamento === "PIX") {
      totalPix += Number(c.totalFinal);
    }

    if (c.pagamento === "DEBITO") {
      totalDebitoBruto += Number(c.totalFinal);
      totalDebitoLiquido += Number(c.totalFinal) - (Number(c.totalFinal) * 0.0079);
    }

    if (c.pagamento === "CREDITO") {
      totalCreditoBruto += Number(c.totalFinal);
      totalCreditoLiquido += Number(c.totalFinal) - (Number(c.totalFinal) * 0.0399);
    }

    c.itens.forEach(item => totalItensVendidos += item.qtd);
  });

  const saldoFinal =
    (totalDinheiro - totalTroco) +
    totalPix +
    totalDebitoLiquido +
    totalCreditoLiquido;

  Swal.fire({
    title: "📊 Fechamento do Dia",
    width: 650,
    html: `
      <p><b>Total de Comandas:</b> ${historico.length}</p>
      <p><b>Total de Itens Vendidos:</b> ${totalItensVendidos}</p>

      <hr>

      <p><b>💵 Total Recebido:</b> R$ ${totalRecebido.toFixed(2)}</p>
      <p><b>🟡 Troco Devolvido:</b> R$ ${totalTroco.toFixed(2)}</p>

      <hr>

      <p><b>💰 Dinheiro Líquido:</b> R$ ${(totalDinheiro - totalTroco).toFixed(2)}</p>
      <p><b>📱 PIX:</b> R$ ${totalPix.toFixed(2)}</p>

      <p><b>💳 Débito Bruto:</b> R$ ${totalDebitoBruto.toFixed(2)}</p>
      <p>Taxa Débito (0,79%): R$ ${(totalDebitoBruto * 0.0079).toFixed(2)}</p>
      <p><b>Débito Líquido:</b> R$ ${totalDebitoLiquido.toFixed(2)}</p>

      <p><b>💳 Crédito Bruto:</b> R$ ${totalCreditoBruto.toFixed(2)}</p>
      <p>Taxa Crédito (3,99%): R$ ${(totalCreditoBruto * 0.0399).toFixed(2)}</p>
      <p><b>Crédito Líquido:</b> R$ ${totalCreditoLiquido.toFixed(2)}</p>

      <hr>

      <h3><b>Saldo Final em Caixa:</b> R$ ${saldoFinal.toFixed(2)}</h3>
    `
  });
}

/* =========================================
   LIMPAR HISTÓRICO
========================================= */
function limparHistorico() {
  Swal.fire({
    title: "Tem certeza?",
    icon: "warning",
    showCancelButton: true
  }).then(r => {
    if (r.isConfirmed) {
      historico = [];
      Swal.fire("Histórico apagado!");
    }
  });
}
