let produtos = [];
let categoriaAtual = "Todos";

function adicionarProduto() {
  const nome = document.getElementById("nome").value;
  const categoria = document.getElementById("categoria").value;
  const preco = document.getElementById("preco").value;
  const imagem = document.getElementById("imagem").value;

  if (!nome || !categoria || !imagem) {
    alert("Preencha nome, categoria e nome da imagem.");
    return;
  }

  produtos.push({
    nome,
    categoria,
    preco: preco || null,
    imagem: "images/" + imagem
  });

  gerarCategorias();
  renderizar();
}

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
          : `<p>Consultar valor</p>`
        }
      </div>
    `;
  });
}