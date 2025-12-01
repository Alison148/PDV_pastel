/* =========================================
   VARIÁVEIS
========================================= */
let comandaAtual = null;
let comandas = {};
let historico = [];

/* =========================================
   GERAR COMANDAS
========================================= */
function gerarComandas() {
  const lista = document.getElementById("listaComandas");
  lista.innerHTML = "";

  for (let i = 1; i <= 20; i++) {
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
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: "Adicionar"
  });

  const nome = document.getElementById("novoNome").value;
  const preco = parseFloat(document.getElementById("novoPreco").value);

  if (!nome || !preco) {
    Swal.fire("Erro", "Preencha nome e preço corretamente!", "error");
    return;
  }

  produtos.push({ nome, preco });
  gerarProdutos();

  Swal.fire("Produto adicionado!", `${nome} - R$ ${preco.toFixed(2)}`, "success");
}

/* =========================================
   SELECIONAR COMANDA
========================================= */
function selecionarComanda(num, btn) {
  comandaAtual = num;

  if (!comandas[num]) {
    comandas[num] = { nome: "", itens: [], total: 0, valorPago: null };
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
   AUMENTAR / DIMINUIR QUANTIDADE
========================================= */
function aumentarQtd(i) {
  comandas[comandaAtual].itens[i].qtd++;
  atualizarTotal();
}

function diminuirQtd(i) {
  const item = comandas[comandaAtual].itens[i];

  if (item.qtd > 1) {
    item.qtd--;
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

  const itens = comandas[comandaAtual].itens;
  let total = 0;

  const lista = document.getElementById("listaItens");
  lista.innerHTML = "";

  itens.forEach((item, i) => {
    const subtotal = item.preco * item.qtd;
    total += subtotal;

    const div = document.createElement("div");
    div.className = "item-card";

    div.innerHTML = `
      <div class="item-info">
        ${item.nome}<br><small>${item.qtd}x</small>
      </div>

      <div>
        <button class="qty-btn qty-remove" onclick="diminuirQtd(${i})">-</button>
        <button class="qty-btn qty-add" onclick="aumentarQtd(${i})">+</button>
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

  doc.setFontSize(16);
  doc.text("Comprovante - PDV Pastelaria", 10, 10);

  doc.setFontSize(12);
  doc.text("Cliente: " + c.nome, 10, 20);
  doc.text("Data: " + new Date().toLocaleString(), 10, 30);

  doc.text("Itens:", 10, 45);

  let y = 55;
  c.itens.forEach(item => {
    doc.text(`${item.nome} (${item.qtd}x) - R$ ${(item.preco * item.qtd).toFixed(2)}`, 10, y);
    y += 8;
  });

  y += 10;

  doc.text("Pagamento: " + c.pagamento, 10, y);
  y += 8;

  if (c.pagamento === "CARTÃO") {
    const taxa = c.totalFinal - c.total;
    doc.text("Taxa Cartão (0,79%): R$ " + taxa.toFixed(2), 10, y);
    y += 8;
  }

  doc.text("Total Final: R$ " + c.totalFinal.toFixed(2), 10, y);
  y += 8;

  if (c.valorPago !== null) {
    doc.text("Valor Pago: R$ " + c.valorPago.toFixed(2), 10, y);
    y += 8;
    doc.text("Troco: R$ " + c.troco.toFixed(2), 10, y);
  }

  doc.save(`Comanda_${c.nome}.pdf`);
}

/* =========================================
   FINALIZAR COMANDA
========================================= */
async function finalizarComanda() {
  if (comandaAtual === null) return;

  const c = comandas[comandaAtual];

  if (!c.nome.trim()) {
    Swal.fire("Digite o nome do cliente!");
    return;
  }

  let totalFinal = c.total;
  const forma = document.getElementById("pagamento").value;
  let troco = 0;
  let valorPago = null;

  if (forma === "CARTÃO") {
    totalFinal += totalFinal * 0.0079;
  }

  if (forma === "DINHEIRO") {
    const resultado = await Swal.fire({
      title: "Valor Pago",
      input: "number",
      showCancelButton: true
    });

    valorPago = parseFloat(resultado.value);

    if (!valorPago || valorPago < totalFinal) {
      Swal.fire("Erro", "Valor insuficiente!", "error");
      return;
    }

    troco = valorPago - totalFinal;
  }

  c.valorPago = valorPago;
  c.troco = troco;
  c.totalFinal = totalFinal;
  c.pagamento = forma;

  let htmlItens = "";
  c.itens.forEach(item => {
    htmlItens += `<li>${item.nome} (${item.qtd}x) - R$ ${(item.preco * item.qtd).toFixed(2)}</li>`;
  });

  Swal.fire({
    title: "Pré-visualização da Comanda",
    html: `
      <b>Cliente:</b> ${c.nome}<br>
      <b>Pagamento:</b> ${forma}<br><br>

      <b>Itens:</b>
      <ul style="text-align:left;">${htmlItens}</ul>

      <b>Total Final:</b> R$ ${totalFinal.toFixed(2)}<br>

      ${valorPago !== null ? `<b>Valor Pago:</b> R$ ${valorPago.toFixed(2)}<br>` : ""}
      ${valorPago !== null ? `<b>Troco:</b> R$ ${troco.toFixed(2)}<br>` : ""}
    `,
    showCancelButton: true,
    confirmButtonText: "Gerar PDF",
    cancelButtonText: "Cancelar"
  }).then(result => {
    if (result.isConfirmed) {
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
   SALVAR HISTÓRICO
========================================= */
function salvarHistorico(c) {
  historico.push({
    cliente: c.nome,
    itens: [...c.itens],
    total: c.totalFinal,
    pagamento: c.pagamento,
    troco: c.troco,
    valorPago: c.valorPago,
    data: new Date().toLocaleString()
  });
}

/* =========================================
   VER HISTÓRICO
========================================= */
function verHistorico() {
  let html = "";

  if (historico.length === 0) {
    html = "<p>Nenhuma comanda finalizada ainda.</p>";
  } else {
    historico.forEach((h, index) => {
      html += `
        <div class="historico-item mb-3">
          <h5>Comanda ${index + 1} - ${h.cliente}</h5>
          <p><b>Data:</b> ${h.data}</p>

          <ul>
            ${h.itens.map(item => `
              <li>${item.nome} (${item.qtd}x) - R$ ${(item.preco * item.qtd).toFixed(2)}</li>
            `).join("")}
          </ul>

          <p><b>Total:</b> R$ ${h.total.toFixed(2)}</p>
          <p><b>Valor Pago:</b> R$ ${h.valorPago ? h.valorPago.toFixed(2) : '-'}</p>
          <p><b>Troco:</b> R$ ${h.troco ? h.troco.toFixed(2) : '-'}</p>
          <p><b>Pagamento:</b> ${h.pagamento}</p>
        </div>
        <hr>
      `;
    });
  }

  Swal.fire({
    title: "Histórico de Comandas",
    html: `<div style="text-align:left; max-height:400px; overflow-y:auto;">${html}</div>`,
    width: 650
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

/* =========================================
   🔥 FECHAMENTO DO DIA
========================================= */
function fechamentoDoDia() {
  if (historico.length === 0) {
    Swal.fire("Nenhuma venda registrada hoje!");
    return;
  }

  let totalDia = 0;
  let totalDinheiro = 0;
  let totalCartao = 0;
  let totalPix = 0;

  let totalItensVendidos = 0;

  historico.forEach(c => {
    totalDia += c.total;

    if (c.pagamento === "DINHEIRO") totalDinheiro += c.valorPago;
    if (c.pagamento === "CARTÃO") totalCartao += c.total;
    if (c.pagamento === "PIX") totalPix += c.total;

    c.itens.forEach(item => {
      totalItensVendidos += item.qtd;
    });
  });

  Swal.fire({
    title: "📊 Fechamento do Dia",
    html: `
      <p><b>Total de Comandas:</b> ${historico.length}</p>
      <p><b>Total de Itens Vendidos:</b> ${totalItensVendidos}</p>
      <hr>

      <p><b>💵 Dinheiro:</b> R$ ${totalDinheiro.toFixed(2)}</p>
      <p><b>💳 Cartão (0.79% aplicado):</b> R$ ${totalCartao.toFixed(2)}</p>
      <p><b>📱 PIX:</b> R$ ${totalPix.toFixed(2)}</p>

      <hr>
      <h3><b>TOTAL DO DIA:</b> R$ ${totalDia.toFixed(2)}</h3>
    `,
    width: 600
  });
}

/* =========================================
   FIM DO ARQUIVO
========================================= */
// Código finalizado. Todas as funcionalidades implementadas.

