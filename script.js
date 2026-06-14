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
const categoriasContainer = document.getElementById("categorias");

// Variável para armazenar todos os produtos e não precisar carregar do zero toda hora
let todosProdutos = [];

const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if(entry.isIntersecting){
            entry.target.classList.add('show');
            scrollObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

// Nova função global que carrega Categorias e Produtos
async function carregarDados() {
    // 1. CARREGAR E EXIBIR AS CATEGORIAS
    const catSnap = await getDocs(collection(db, "categorias"));
    categoriasContainer.innerHTML = `<button class="categoriaAtiva" onclick="filtrarCategoria('Todos', this)">Todos</button>`;
    
    catSnap.forEach(doc => {
        const catNome = doc.data().nome;
        categoriasContainer.innerHTML += `<button onclick="filtrarCategoria('${catNome}', this)">${catNome}</button>`;
    });

    // 2. CARREGAR OS PRODUTOS
    const prodSnap = await getDocs(collection(db, "produtos"));
    todosProdutos = [];
    prodSnap.forEach(doc => {
        todosProdutos.push({ id: doc.id, ...doc.data() });
    });

    // 3. RENDERIZAR NA TELA (INICIA MOSTRANDO "TODOS")
    renderizarVitrine('Todos');
}

// Função para mudar a cor do botão da categoria e filtrar
window.filtrarCategoria = (categoria, btnElement) => {
    document.querySelectorAll("#categorias button").forEach(b => b.classList.remove("categoriaAtiva"));
    btnElement.classList.add("categoriaAtiva");
    
    renderizarVitrine(categoria);
};

// Constrói os cards na vitrine
function renderizarVitrine(categoria) {
    conteudo.innerHTML = "";
    
    let filtrados = todosProdutos;
    if (categoria !== 'Todos') {
        filtrados = todosProdutos.filter(p => p.categoria === categoria);
    }

    if (filtrados.length === 0) {
        conteudo.innerHTML = `<p style="text-align: center; color: var(--text-muted); grid-column: 1 / -1; margin-top: 20px;">Nenhum produto encontrado nesta categoria.</p>`;
        return;
    }

    filtrados.forEach((p) => {
        const div = document.createElement("div");
        div.className = "produto";
        
        // Verifica se o produto tem nome cadastrado
        const temNome = p.nome && p.nome.trim() !== "";
        
        // Se não tiver nome, remove a borda de baixo e estica a imagem
        div.innerHTML = `
            <div class="produto-img-container" style="${temNome ? '' : 'height: 100%; border-bottom: none;'}">
                <img src="${p.imagemCapa}" loading="lazy" alt="Produto">
            </div>
            ${temNome ? `<div class="produto-info"><h3>${p.nome}</h3></div>` : ''}
        `;
        
        div.onclick = () => abrirProduto(p);
        conteudo.appendChild(div);
        
        scrollObserver.observe(div);
    });
}

async function abrirProduto(produto) {
    const modal = document.getElementById("modal");
    modal.style.display = "flex";
    
    // Mostra o nome ou deixa vazio no modal se for opcional
    document.getElementById("produtoNome").innerText = produto.nome || "";
    document.getElementById("produtoDescricao").innerText = produto.descricao || "";
    
    const precoElement = document.getElementById("produtoPreco");
    if (produto.preco && parseFloat(produto.preco) > 0) {
        precoElement.innerText = "R$ " + parseFloat(produto.preco).toFixed(2).replace('.', ',');
    } else {
        precoElement.innerText = "Valor sob consulta";
    }

    // Link do Whats ajustado caso o nome seja vazio
    const telefoneZap = "SEU_NUMERO_AQUI"; // Coloque seu número aqui
    const nomeDoProduto = produto.nome ? produto.nome : "esse produto que vi no catálogo";
    const textoPronto = encodeURIComponent(`Olá, gostaria de saber mais detalhes sobre ${nomeDoProduto}`);
    
    document.getElementById("botaoWhatsapp").href = `https://wa.me/${telefoneZap}?text=${textoPronto}`;
    
    const imgPrincipal = document.getElementById("imagemPrincipal");
    imgPrincipal.src = produto.imagemCapa;

    const divMiniaturas = document.getElementById("miniaturas");
    divMiniaturas.innerHTML = "";

    const q = query(collection(db, "imagens_produtos"), where("produtoId", "==", produto.id));
    const snap = await getDocs(q);
    let galeria = [produto.imagemCapa];
    snap.forEach(d => galeria.push(d.data().stringImagem));

    let index = 0;
    
    const trocarImagem = (novoIndex) => {
        imgPrincipal.style.opacity = 0; 
        setTimeout(() => {
            index = novoIndex;
            imgPrincipal.src = galeria[index];
            imgPrincipal.style.opacity = 1; 

            document.querySelectorAll("#miniaturas img").forEach((img, idx) => {
                img.classList.toggle("ativa", idx === index);
            });
        }, 150); 
    };

    galeria.forEach((imgUrl, i) => {
        const img = document.createElement("img");
        img.src = imgUrl;
        if(i === 0) img.classList.add("ativa");
        img.onclick = () => trocarImagem(i);
        divMiniaturas.appendChild(img);
    });

    const carrosselContainer = document.getElementById("carrossel-container");
    document.querySelectorAll(".seta").forEach(s => s.remove());

    if (galeria.length > 1) {
        const btnEsq = document.createElement("button"); 
        btnEsq.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>`; 
        btnEsq.className = "seta"; 
        btnEsq.id = "setaEsquerda";
        
        const btnDir = document.createElement("button"); 
        btnDir.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>`; 
        btnDir.className = "seta"; 
        btnDir.id = "setaDireita";
        
        carrosselContainer.appendChild(btnEsq); 
        carrosselContainer.appendChild(btnDir);

        btnDir.onclick = (e) => { 
            e.stopPropagation();
            trocarImagem((index + 1) % galeria.length);
        };
        btnEsq.onclick = (e) => { 
            e.stopPropagation();
            trocarImagem((index - 1 + galeria.length) % galeria.length);
        };
    }
}

const fecharModal = () => document.getElementById("modal").style.display = "none";
document.getElementById("fecharModal").onclick = fecharModal;
window.onclick = (event) => { if (event.target == document.getElementById("modal")) fecharModal(); }

const btnTopo = document.getElementById("voltarTopo");
window.onscroll = () => {
    if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
        btnTopo.classList.add("visible");
    } else {
        btnTopo.classList.remove("visible");
    }
};
btnTopo.onclick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Inicia as duas rotinas (Categorias e Produtos)
window.onload = carregarDados;