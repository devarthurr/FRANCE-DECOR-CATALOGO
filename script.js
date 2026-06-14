import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// =====================================================================
// COLE A CHAVE DO SEU FIREBASE AQUI:
const firebaseConfig = {
  apiKey: "AIzaSyDZmLPqGnmDYU1H8MjPuo1aIXe7loFKxWQ",
  authDomain: "francedecor-ec604.firebaseapp.com",
  projectId: "francedecor-ec604",
  storageBucket: "francedecor-ec604.firebasestorage.app",
  messagingSenderId: "1063148304350",
  appId: "1:1063148304350:web:2cd8c35130352aaa718f4f"
};
// =====================================================================

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const conteudo = document.getElementById("conteudo");
const pesquisa = document.getElementById("pesquisa");
const categoriasDiv = document.getElementById("categorias");

let produtos = []; 
let categoriaAtual = "Todos";
let produtosFiltrados = [];

async function carregarCatalogoFirebase() {
    try {
        const querySnapshot = await getDocs(collection(db, "produtos"));
        produtos = [];
        
        querySnapshot.forEach((doc) => {
            const dados = doc.data();
            produtos.push({
                id: doc.id,
                nome: dados.nome,
                categoria: dados.categoria || "Geral", 
                preco: dados.preco ? dados.preco.toFixed(2).replace('.', ',') : "",
                descricao: dados.descricao || "Descrição não disponível.",
                imagens: dados.imagens && dados.imagens.length > 0 ? dados.imagens : ["images/logo.png"]
            });
        });

        produtosFiltrados = [...produtos];
        criarCategorias();
        renderizarCatalogo();

    } catch (error) {
        console.error("Erro ao carregar do Firebase:", error);
        conteudo.innerHTML = `<p style="text-align:center; width:100%;">Erro ao carregar os produtos. Verifique sua conexão ou configuração.</p>`;
    }
}

function criarCategorias() {
    const categorias = ["Todos", ...new Set(produtos.map(produto => produto.categoria))];
    categoriasDiv.innerHTML = "";

    categorias.forEach(categoria => {
        const botao = document.createElement("button");
        botao.innerText = categoria;
        if (categoria == categoriaAtual) {
            botao.classList.add("categoriaAtiva");
        }
        botao.onclick = () => {
            categoriaAtual = categoria;
            filtrarProdutos();
        };
        categoriasDiv.appendChild(botao);
    });
}

function filtrarProdutos() {
    const texto = pesquisa.value.toLowerCase();
    produtosFiltrados = produtos.filter(produto => {
        const categoriaValida = categoriaAtual == "Todos" || produto.categoria == categoriaAtual;
        const pesquisaValida = produto.nome.toLowerCase().includes(texto);
        return categoriaValida && pesquisaValida;
    });
    criarCategorias();
    renderizarCatalogo();
}

function renderizarCatalogo() {
    conteudo.innerHTML = "";
    produtosFiltrados.forEach(produto => {
        const card = document.createElement("div");
        card.className = "produto mostrar"; 
        card.innerHTML = `
            <img src="${produto.imagens[0]}" alt="${produto.nome}">
            <div class="produto-info">
                <h3>${produto.nome}</h3>
                <p>${produto.categoria}</p>
                <div class="preco">${produto.preco ? "R$ " + produto.preco : "Consultar"}</div>
            </div>
        `;
        card.onclick = () => abrirProduto(produto);
        conteudo.appendChild(card);
    });
}

function abrirProduto(produto) {
    const modal = document.getElementById("modal");
    modal.style.display = "flex";

    document.getElementById("produtoNome").innerText = produto.nome;
    document.getElementById("produtoDescricao").innerText = produto.descricao;
    document.getElementById("produtoPreco").innerText = produto.preco ? "R$ " + produto.preco : "Consulte o valor";

    const imagemPrincipal = document.getElementById("imagemPrincipal");
    imagemPrincipal.src = produto.imagens[0]; 

    const miniaturas = document.getElementById("miniaturas");
    miniaturas.innerHTML = "";
    
    produto.imagens.forEach(imagem => {
        const img = document.createElement("img");
        img.src = imagem;
        img.onclick = () => {
            imagemPrincipal.src = imagem;
        };
        miniaturas.appendChild(img);
    });

    const mensagem = `Olá! Tenho interesse no produto: ${produto.nome}`;
    document.getElementById("botaoWhatsapp").href = `https://wa.me/5583993167766?text=${encodeURIComponent(mensagem)}`;
}

document.getElementById("fecharModal").onclick = () => {
    document.getElementById("modal").style.display = "none";
};

window.onclick = function(event){
    const modal = document.getElementById("modal");
    if(event.target == modal){
        modal.style.display = "none";
    }
}

pesquisa.addEventListener("keyup", () => {
    filtrarProdutos();
});

const voltarTopo = document.getElementById("voltarTopo");
window.addEventListener("scroll", () => {
    if(window.scrollY > 300) voltarTopo.style.display = "block";
    else voltarTopo.style.display = "none";
});

voltarTopo.onclick = () => {
    window.scrollTo({ top:0, behavior:"smooth" });
};

window.onload = async () => {
    document.getElementById("loader").style.display = "flex";
    await carregarCatalogoFirebase();
    document.getElementById("loader").style.display = "none";
};