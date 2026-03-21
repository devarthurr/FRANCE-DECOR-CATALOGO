const senhaCorreta = "1234";
let produtos = JSON.parse(localStorage.getItem("produtos")) || [];

function login() {
  const senha = document.getElementById("senha").value;
  if (senha === senhaCorreta) {
    document.getElementById("login-area").style.display = "none";
    document.getElementById("painel").style.display = "block";
    renderAdmin();
  } else {
    alert("Senha incorreta!");
  }
}

function salvar() {
  localStorage.setItem("produtos", JSON.stringify(produtos));
}

function adicionarProduto() {
  const nome = document.getElementById("nome").value;
  const preco = document.getElementById("preco").value;
  const categoria = document.getElementById("categoria").value;
  const imagensInput = document.getElementById("imagens");

  if (!nome || !categoria || imagensInput.files.length === 0) {
    alert("Preencha nome, categoria e selecione imagens!");
    return;
  }

  const arquivos = Array.from(imagensInput.files);
  let imagensBase64 = [];
  let carregadas = 0;

  arquivos.forEach((arquivo) => {
    const reader = new FileReader();

    reader.onload = function(e) {
      imagensBase64.push(e.target.result);
      carregadas++;

      if (carregadas === arquivos.length) {
        produtos.push({
          id: Date.now(),
          nome,
          preco: preco || null,
          categoria,
          imagens: imagensBase64
        });

        salvar();
        renderAdmin();
      }
    };

    reader.readAsDataURL(arquivo);
  });

  document.getElementById("nome").value = "";
  document.getElementById("preco").value = "";
  document.getElementById("categoria").value = "";
  imagensInput.value = "";
}

function excluirProduto(id) {
  produtos = produtos.filter(p => p.id !== id);
  salvar();
  renderAdmin();
}

function renderAdmin() {
  const lista = document.getElementById("lista-admin");
  lista.innerHTML = "";

  produtos.forEach(p => {
    lista.innerHTML += `
      <div style="margin:10px; background:#fff; padding:10px;">
        ${p.nome} - ${p.categoria}
        <button onclick="excluirProduto(${p.id})">Excluir</button>
      </div>
    `;
  });
}