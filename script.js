const conteudo = document.getElementById("conteudo");

function renderizarCatalogo() {
  conteudo.innerHTML = '<div class="catalogo"></div>';
  const catalogo = document.querySelector(".catalogo");

  produtos.forEach((produto) => {
    const card = document.createElement("div");
    card.className = "produto";

    card.innerHTML = `
      <img src="${produto.imagens[0]}" class="preview">
      <h3>${produto.nome}</h3>
    `;

    card.onclick = () => abrirProduto(produto);
    catalogo.appendChild(card);
  });
}

function abrirProduto(produto) {

  let imagemAtual = 0;

  conteudo.innerHTML = `
    <div class="pagina-produto">
      
      <a href="#" class="botao-voltar">← Voltar</a>

      <div class="slider-container">
        <button class="seta esquerda">❮</button>
        <img src="${produto.imagens[0]}" class="imagem-grande" id="imagemPrincipal">
        <button class="seta direita">❯</button>
      </div>

      <h2>${produto.nome}</h2>

      ${
        produto.preco 
        ? `<p><strong>${produto.preco}</strong></p>`
        : `
        <a href="https://wa.me/55SEUNUMERO" target="_blank" class="botao-whatsapp">
          <img src="https://cdn-icons-png.flaticon.com/512/733/733585.png">
          Consultar valor
        </a>`
      }

    </div>
  `;

  const imagemPrincipal = document.getElementById("imagemPrincipal");

  document.querySelector(".esquerda").onclick = () => {
    imagemAtual--;
    if (imagemAtual < 0) {
      imagemAtual = produto.imagens.length - 1;
    }
    imagemPrincipal.src = produto.imagens[imagemAtual];
  };

  document.querySelector(".direita").onclick = () => {
    imagemAtual++;
    if (imagemAtual >= produto.imagens.length) {
      imagemAtual = 0;
    }
    imagemPrincipal.src = produto.imagens[imagemAtual];
  };

  document.querySelector(".botao-voltar").onclick = () => {
    renderizarCatalogo();
  };
}

renderizarCatalogo();