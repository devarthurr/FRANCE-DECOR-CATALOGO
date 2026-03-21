let produtos = JSON.parse(localStorage.getItem("produtos")) || [];
let categoriaAtual = "Todos";

function gerarCategorias() {
  const menu = document.getElementById("menu-categorias");
  menu.innerHTML = "";

  const categorias = ["Todos", ...new Set(produtos.map(p => p.categoria))];

  categorias.forEach(cat => {
    menu.innerHTML += `
      <button onclick="filtrarCategoria('${cat}')">${cat}</button>
    `;
  });
}

function filtrarCategoria(cat) {
  categoriaAtual = cat;
  renderizar();
}

function renderizar() {
  const catalogo = document.getElementById("catalogo");
  catalogo.innerHTML = "";

  const produtosFiltrados = categoriaAtual === "Todos"
    ? produtos
    : produtos.filter(p => p.categoria === categoriaAtual);

  produtosFiltrados.forEach(produto => {

    let miniaturas = "";
    produto.imagens.forEach(img => {
      miniaturas += `<img src="${img}" onclick="trocarImagem('${produto.id}','${img}')">`;
    });

    catalogo.innerHTML += `
      <div class="produto">
        <img src="${produto.imagens[0]}" class="imagem-principal" id="img-${produto.id}">
        <div class="miniaturas">${miniaturas}</div>
        <div class="produto-info">
          <h3>${produto.nome}</h3>
          ${
            produto.preco
            ? `<p class="preco">R$ ${produto.preco}</p>
               <a target="_blank" href="https://wa.me/5599999999999?text=Olá, tenho interesse no produto ${produto.nome}">
               <button class="btn-whats">Comprar</button></a>`
            : `<a target="_blank" href="https://wa.me/5599999999999?text=Olá, gostaria de consultar o valor do produto ${produto.nome}">
               <button class="btn-whats">Consultar valor</button></a>`
          }
        </div>
      </div>
    `;
  });
}

function trocarImagem(id, nova) {
  document.getElementById("img-" + id).src = nova;
}

gerarCategorias();
renderizar();