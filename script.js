let categoriaAtual = "Todos";
const whatsappNumero = "5511999999999"; // COLOQUE SEU NÚMERO

window.onload = function () {
  gerarCategorias();
  renderizarCatalogo();
};

function gerarCategorias() {
  const nav = document.getElementById("categorias");
  const categorias = ["Todos", ...new Set(produtos.map(p => p.categoria))];

  nav.innerHTML = "";

  categorias.forEach(cat => {
    const btn = document.createElement("button");
    btn.textContent = cat;
    btn.onclick = () => {
      categoriaAtual = cat;
      renderizarCatalogo();
    };
    nav.appendChild(btn);
  });
}

function renderizarCatalogo() {
  const conteudo = document.getElementById("conteudo");
  conteudo.innerHTML = "";

  const filtrados = categoriaAtual === "Todos"
    ? produtos
    : produtos.filter(p => p.categoria === categoriaAtual);

  const grid = document.createElement("div");
  grid.className = "catalogo";

  filtrados.forEach(produto => {
    const indexReal = produtos.indexOf(produto);

    const card = document.createElement("div");
    card.className = "produto";
    card.onclick = () => abrirProduto(indexReal);

    card.innerHTML = `
      <img src="${produto.imagens[0]}" class="preview">
      <h3>${produto.nome}</h3>
      ${
        produto.preco
        ? `<p class="preco">R$ ${produto.preco}</p>`
        : `<p class="preco">Consultar valor</p>`
      }
    `;

    grid.appendChild(card);
  });

  conteudo.appendChild(grid);
}

function abrirProduto(index) {
  const produto = produtos[index];
  const conteudo = document.getElementById("conteudo");

  let thumbs = "";
  produto.imagens.forEach(img => {
    thumbs += `<img src="${img}" class="thumb" onclick="trocarImagem('${img}')">`;
  });

  conteudo.innerHTML = `
    <div class="pagina-produto">
      <button class="voltar" onclick="renderizarCatalogo()">← Voltar</button>

      <div class="detalhe-container">

        <div class="galeria">
          <img src="${produto.imagens[0]}" id="imagemPrincipal" class="imagem-grande">
          <div class="miniaturas">
            ${thumbs}
          </div>
        </div>

        <div class="info">
          <h2>${produto.nome}</h2>
          <p>${produto.descricao}</p>
          ${
            produto.preco
            ? `<h3>R$ ${produto.preco}</h3>`
            : `<h3>Consultar valor</h3>`
          }

          <a href="https://wa.me/${whatsappNumero}?text=Olá, tenho interesse no produto ${produto.nome}" target="_blank">
            <button class="whatsapp">Falar no WhatsApp</button>
          </a>

        </div>

      </div>
    </div>
  `;
}

function trocarImagem(nova) {
  document.getElementById("imagemPrincipal").src = nova;
}