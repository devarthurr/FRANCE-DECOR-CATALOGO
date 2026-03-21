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
  conteudo.innerHTML = `
    <div class="pagina-produto">
      <a href="#" class="botao-voltar">← Voltar ao catálogo</a>

      <img src="${produto.imagens[0]}" class="imagem-grande" id="imagemPrincipal">

      <div class="galeria-miniaturas">
        ${produto.imagens.map(img => `
          <img src="${img}" class="thumb">
        `).join("")}
      </div>

      <h2>${produto.nome}</h2>
      ${
        produto.preco 
        ? `<p style="font-weight:600; font-size:18px;">${produto.preco}</p>`
        : `<a href="https://wa.me/55SEUNUMERO" target="_blank" style="color:#0d2438; font-weight:600;">Consultar valor</a>`
      }
    </div>
  `;

  document.querySelector(".botao-voltar").onclick = () => {
    renderizarCatalogo();
  };

  const imagemPrincipal = document.getElementById("imagemPrincipal");

  document.querySelectorAll(".thumb").forEach(thumb => {
    thumb.onclick = () => {
      imagemPrincipal.style.opacity = "0";
      setTimeout(() => {
        imagemPrincipal.src = thumb.src;
        imagemPrincipal.style.opacity = "1";
      }, 200);
    };
  });
}

renderizarCatalogo();