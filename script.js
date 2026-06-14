import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// =====================================================================
// COLOQUE SUA CHAVE DO FIREBASE AQUI
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
const categoriesDiv = document.getElementById("categorias");

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
                imagemCapa: dados.imagemCapa || "images/logo.png"
            });
        });

        produtosFiltrados = [...produtos];
        criarCategorias();
        renderizarCatalogo();

    } catch (error) {
        console.error("Erro ao carregar do Firebase:", error);
        conteudo.innerHTML = `<p style="text-align:center; width:100%;">Erro ao carregar o catálogo.</p>`;
    }
}

function criarCategorias() {
    const categorias = ["Todos", ...new Set(produtos.map(produto => produto.categoria))];
    categoriesDiv.innerHTML = "";

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
        categoriesDiv.appendChild(botao);
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
            <img src="${produto.imagemCapa}" alt="${produto.nome}">
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

async function abrirProduto(produto) {
    const modal = document.getElementById("modal");
    modal.style.display = "flex";

    document.getElementById("produtoNome").innerText = produto.nome;
    document.getElementById("produtoDescricao").innerText = produto.descricao;
    document.getElementById("produtoPreco").innerText = produto.preco ? "R$ " + produto.preco : "Consulte o valor";

    const imagemPrincipal = document.getElementById("imagemPrincipal");
    imagemPrincipal.src = produto.imagemCapa;

    const miniaturas = document.getElementById("miniaturas");
    miniaturas.innerHTML = "<p style='font-size:12px; opacity:0.5;'>Carregando galeria...</p>";

    const mensagem = `Olá! Tenho interesse no produto: ${produto.nome}`;
    document.getElementById("botaoWhatsapp").href = `https://wa.me/5583993167766?text=${encodeURIComponent(mensagem)}`;

    try {
        const q = query(collection(db, "imagens_produtos"), where("produtoId", "==", produto.id));
        const querySnapshot = await getDocs(q);
        
        let imagensArray = [];
        querySnapshot.forEach((doc) => {
            imagensArray.push(doc.data());
        });

        // CORREÇÃO DO ERRO: Ordena no lado do cliente para evitar erro de índice composto no Firebase
        imagensArray.sort((a, b) => a.ordem - b.ordem);

        miniaturas.innerHTML = "";

        // Adiciona a primeira imagem como miniatura inicial
        const imgCapa = document.createElement("img");
        imgCapa.src = produto.imagemCapa;
        imgCapa.onclick = () => { imagemPrincipal.src = produto.imagemCapa; };
        miniaturas.appendChild(imgCapa);

        imagensArray.forEach((imgData) => {
            const img = document.createElement("img");
            img.src = imgData.stringImagem;
            img.onclick = () => {
                imagemPrincipal.src = imgData.stringImagem;
            };
            miniaturas.appendChild(img);
        });

    } catch (err) {
        console.error("Erro ao carregar galeria:", err);
        miniaturas.innerHTML = "";
    }
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