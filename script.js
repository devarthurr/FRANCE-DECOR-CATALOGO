const conteudo = document.getElementById("conteudo");

function mostrarProdutos() {
  conteudo.innerHTML = `<div class="catalogo"></div>`;
  const catalogo = document.querySelector(".catalogo");

  produtos.forEach((produto, index) => {
    catalogo.innerHTML += `
      <div class="produto" onclick="abrirProduto(${index})">
        <img src="${produto.imagens[0]}" class="preview">
        <h3>${produto.nome}</h3>
        <p class="preco">
          ${produto.preco ? "R$ " + produto.preco : "Consultar valor"}
        </p>
      </div>
    `;
  });
}

function abrirProduto(index) {
  const produto = produtos[index];

  conteudo.innerHTML = `
    <div class="pagina-produto">
      <button class="voltar" onclick="mostrarProdutos()">Voltar</button>

      <div class="detalhe-container">

        <div class="galeria">
          <img src="${produto.imagens[0]}" class="imagem-grande" id="imagemPrincipal">

          <div class="miniaturas">
            ${produto.imagens.map(img =>
              `<img src="${img}" class="thumb" onclick="trocarImagem('${img}')">`
            ).join("")}
          </div>
        </div>

        <div>
          <h2>${produto.nome}</h2>
          <p>${produto.preco ? "R$ " + produto.preco : "Consultar valor"}</p>

          <a href="https://wa.me/SEUNUMEROAQUI" target="_blank">
            <button class="whatsapp">Falar no WhatsApp</button>
          </a>
        </div>

      </div>
    </div>
  `;
}

function trocarImagem(src) {
  document.getElementById("imagemPrincipal").src = src;
}

mostrarProdutos();