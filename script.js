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

function renderizar() {
  const catalogo = document.getElementById("catalogo");
  catalogo.innerHTML = "";

  const filtrados = categoriaAtual === "Todos"
    ? produtos
    : produtos.filter(p => p.categoria === categoriaAtual);

  filtrados.forEach(produto => {
    catalogo.innerHTML += `
      <div class="produto">
        <img src="${produto.imagem}">
        <h3>${produto.nome}</h3>
        ${
          produto.preco
          ? `<p class="preco">R$ ${produto.preco}</p>`
          : `<p style="color:#0b1c2d;font-weight:bold;">Consultar valor</p>`
        }
      </div>
    `;
  });
}