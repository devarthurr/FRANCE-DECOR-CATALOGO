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
      
      <a href="#" class="botao-voltar">← Voltar</a>

      <img src="${produto.imagens[0]}" class="imagem-grande" id="imagemPrincipal">

      <div class="galeria-miniaturas">
        ${produto.imagens.map(img => `
          <img src="${img}" class="thumb">
        `).join("")}
      </div>

      <h2>${produto.nome}</h2>

      ${
        produto.preco 
        ? `<p><strong>${produto.preco}</strong></p>`
        : `
        <a href="https://wa.me/55S83993314078" target="_blank" class="botao-whatsapp">
          <img src="https://cdn-icons-png.flaticon.com/512/733/733585.png">
          Consultar valor
        </a>`
      }

    </div>
  `;

  document.querySelector(".botao-voltar").onclick = () => {
    renderizarCatalogo();
  };

  const imagemPrincipal = document.getElementById("imagemPrincipal");

  document.querySelectorAll(".thumb").forEach(thumb => {
    thumb.onclick = () => {
      imagemPrincipal.src = thumb.src;
    };
  });
}

renderizarCatalogo();