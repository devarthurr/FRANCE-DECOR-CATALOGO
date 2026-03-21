let categoriaAtual = "Todos";

window.onload = function () {
  gerarCategorias();
  renderizar();
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
  renderizar();
}

function trocarImagem(idProduto, novaImagem) {
  document.getElementById("img-" + idProduto).src = novaImagem;
}

function renderizar() {
  const catalogo = document.getElementById("catalogo");
  catalogo.innerHTML = "";

  const filtrados = categoriaAtual === "Todos"
    ? produtos
    : produtos.filter(p => p.categoria === categoriaAtual);

  filtrados.forEach((produto, index) => {

    let galeriaHTML = "";
    produto.imagens.forEach(img => {
      galeriaHTML += `
        <img src="${img}" onclick="trocarImagem(${index}, '${img}')">
      `;
    });

    catalogo.innerHTML += `
      <div class="produto">
        <img src="${produto.imagens[0]}" id="img-${index}">
        <h3>${produto.nome}</h3>
        ${
          produto.preco
          ? `<p class="preco">R$ ${produto.preco}</p>`
          : `<p class="preco">Consultar valor</p>`
        }
        <div class="galeria">
          ${galeriaHTML}
        </div>
      </div>
    `;
  });
}