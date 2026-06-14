import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDZmLPqGnmDYU1H8MjPuo1aIXe7loFKxWQ",
  authDomain: "francedecor-ec604.firebaseapp.com",
  projectId: "francedecor-ec604",
  storageBucket: "francedecor-ec604.firebasestorage.app",
  messagingSenderId: "1063148304350",
  appId: "1:1063148304350:web:2cd8c35130352aaa718f4f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const conteudo = document.getElementById("conteudo");
const pesquisa = document.getElementById("pesquisa");

let produtos = [];

async function carregarCatalogo() {
    const querySnapshot = await getDocs(collection(db, "produtos"));
    produtos = [];
    querySnapshot.forEach((doc) => {
        produtos.push({ id: doc.id, ...doc.data() });
    });
    renderizar(produtos);
}

function renderizar(lista) {
    conteudo.innerHTML = "";
    lista.forEach(p => {
        const div = document.createElement("div");
        div.className = "produto";
        div.innerHTML = `<img src="${p.imagemCapa}" alt="${p.nome}"><div class="produto-info"><h3>${p.nome}</h3><div class="preco">R$ ${p.preco}</div></div>`;
        div.onclick = () => abrirProduto(p);
        conteudo.appendChild(div);
    });
}

async function abrirProduto(produto) {
    const modal = document.getElementById("modal");
    modal.style.display = "flex";
    
    document.getElementById("produtoNome").innerText = produto.nome;
    document.getElementById("produtoDescricao").innerText = produto.descricao;
    document.getElementById("produtoPreco").innerText = "R$ " + produto.preco;
    
    const imgPrincipal = document.getElementById("imagemPrincipal");
    imgPrincipal.src = produto.imagemCapa;

    // Buscar Galeria
    const q = query(collection(db, "imagens_produtos"), where("produtoId", "==", produto.id));
    const snapshot = await getDocs(q);
    let galeria = [produto.imagemCapa];
    snapshot.forEach(doc => galeria.push(doc.data().stringImagem));

    // Lógica das Setas
    let index = 0;
    const containerEsq = document.querySelector(".modal-esquerda");
    document.querySelectorAll(".seta").forEach(s => s.remove());

    const btnEsq = document.createElement("button"); btnEsq.innerHTML = "&#10094;"; btnEsq.className = "seta"; btnEsq.id = "setaEsquerda";
    const btnDir = document.createElement("button"); btnDir.innerHTML = "&#10095;"; btnDir.className = "seta"; btnDir.id = "setaDireita";
    containerEsq.appendChild(btnEsq); containerEsq.appendChild(btnDir);

    btnDir.onclick = () => { index = (index + 1) % galeria.length; imgPrincipal.src = galeria[index]; };
    btnEsq.onclick = () => { index = (index - 1 + galeria.length) % galeria.length; imgPrincipal.src = galeria[index]; };
}

document.getElementById("fecharModal").onclick = () => document.getElementById("modal").style.display = "none";
window.onload = carregarCatalogo;