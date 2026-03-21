let produtos = JSON.parse(localStorage.getItem("produtos")) || [];
let categoriaAtual = "Todos";

window.onload = function () {
  gerarCategorias();
  renderizar();
};

function salvarProdutos() {
  localStorage.setItem("produtos", JSON.stringify(produtos));
}

function abrirLogin() {
  document.getElementById("loginModal").style.display = "block";
}

function fazerLogin() {
  const usuario = document.getElementById("loginUsuario").value;
  const senha = document.getElementById("loginSenha").value;

  if (usuario === "DECORFRANCE" && senha === "2026") {
    document.getElementById("loginModal").style.display = "none";
    document.getElementById("adminPanel").style.display = "block";
  } else {
    alert("Login inválido");
  }
}

function fecharAdmin() {
  document.getElementById("adminPanel").style.display = "none";
}

function adicionarProduto() {
  const nome = document.getElementById("nome").value;
  const categoria = document.getElementById("categoria").value;
  const preco = document.getElementById("preco").value;
  const imagem = document.getElementById("imagem").value;

  if (!nome || !categoria || !imagem) {
    alert("Preencha nome, categoria e imagem.");
    return;
  }

  produtos.push({
    nome,
    categoria,
    preco: preco || null,
    imagem: "images/" + imagem
  });

  salvarProdutos();
  gerarCategorias();
  renderizar();

  // limpar campos
  document.getElementById("nome").value = "";
  document.getElementById("categoria").value = "";
  document.getElementById("preco").value = "";
  document.getElementById("imagem").value = "";
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
          : `<p style="color:#0b1c2d;font-weight:bold;">Consultar valor</p>`
        }
      </div>
    `;
  });
}