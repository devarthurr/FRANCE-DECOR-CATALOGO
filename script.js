const conteudo = document.getElementById("conteudo");

/* ================= RENDER CATALOGO ================= */

function renderizarCatalogo() {
  conteudo.classList.remove("fade-in");
  void conteudo.offsetWidth;
  conteudo.classList.add("fade-in");

  conteudo.innerHTML = '<div class="catalogo"></div>';
  const catalogo = document.querySelector(".catalogo");

  produtos.forEach((produto, index) => {
    const card = document.createElement("div");
    card.className = "produto";
    card.style.animationDelay = `${index * 0.05}s`;

    card.innerHTML = `
      <img src="${produto.imagens[0]}" class="preview">
      <h3>${produto.nome}</h3>
    `;

    card.onclick = () => abrirProduto(produto);

    catalogo.appendChild(card);
  });
}

/* ================= ABRIR PRODUTO ================= */

function abrirProduto(produto) {
  conteudo.classList.remove("fade-in");
  void conteudo.offsetWidth;
  conteudo.classList.add("fade-in");

  conteudo.innerHTML = `
    <div class="pagina-produto slide-up">
      <a href="#" class="botao-voltar">← Voltar ao catálogo</a>

      <img src="${produto.imagens[0]}" class="imagem-grande" id="imagemPrincipal">

      <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:20px;">
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

/* ================= INICIAR ================= */

renderizarCatalogo();