let categoriaAtual = "Todos";
const whatsappNumero = "5511999999999"; // COLOQUE SEU NUMERO AQUI

window.onload = function () {
  gerarCategorias();
  renderizarCatalogo();
};

function gerarCategorias() {
  const nav = document.getElementById("categorias");
  const categorias = ["Todos", ...new Set(produtos.map(p => p.categoria))];

  nav.innerHTML = "";

  categorias.forEach(cat => {
    nav.innerHTML += `<button onclick="filtrar('${cat}')">${cat}</button>`;
  });
}

function filtrar(cat) {
  categoriaAtual = cat;
  renderizarCatalogo();
}

function renderizarCatalogo() {
  const catalogo = document.getElementById("catalogo");
  catalogo.innerHTML = "";

  const filtrados = categoriaAtual === "Todos"
    ? produtos
    : produtos.filter(p => p.categoria === categoriaAtual);

  filtrados.forEach((produto, index) => {
    catalogo.innerHTML += `
      <div class="produto" onclick="abrirProduto(${index})">
        <img src="${produto.imagens[0]}" class="preview">
        <h3>${produto.nome}</h3>
        ${
          produto.preco
          ? `<p class="preco">R$ ${produto.preco}</p>`
          : `<p class="preco">Consultar valor</p>`
        }
      </div>
    `;
  });
}

function abrirProduto(index) {
  const produto = produtos[index];
  const catalogo = document.getElementById("catalogo");

  let galeria = "";
  produto.imagens.forEach(img => {
    galeria += `<img src="${img}" class="thumb" onclick="trocarImagem('${img}')">`;
  });

  catalogo.innerHTML = `
    <div class="pagina-produto">
      <button onclick="renderizarCatalogo()" class="voltar">← Voltar</button>

      <div class="produto-detalhe">
        <img src="${produto.imagens[0]}" id="imagemPrincipal" class="imagem-grande">

        <div class="miniaturas">
          ${galeria}
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