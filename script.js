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

let todosProdutos = [];

const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if(entry.isIntersecting){
            entry.target.classList.add('show');
            scrollObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

// ==========================================
// LÓGICA DO ARRASTE (DRAG TO SCROLL)
// ==========================================
let isDown = false;
let startX;
let scrollLeft;

categoriasContainer.addEventListener('mousedown', (e) => {
    isDown = true;
    categoriasContainer.classList.add('active'); // Ativa cursor grabbing e bloqueia clique
    startX = e.pageX - categoriasContainer.offsetLeft;
    scrollLeft = categoriasContainer.scrollLeft;
});

categoriasContainer.addEventListener('mouseleave', () => {
    isDown = false;
    categoriasContainer.classList.remove('active');
});

categoriasContainer.addEventListener('mouseup', () => {
    isDown = false;
    categoriasContainer.classList.remove('active');
});

categoriasContainer.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - categoriasContainer.offsetLeft;
    const walk = (x - startX) * 2; // O "2" é a velocidade de rolagem (aumente para rolar mais rápido)
    categoriasContainer.scrollLeft = scrollLeft - walk;
});


// Carrega categorias e produtos do Firebase
async function carregarDados() {
    // 1. CARREGAR AS CATEGORIAS 
    const catSnap = await getDocs(collection(db, "categorias"));
    categoriasContainer.innerHTML = "";
    
    let primeiraCategoria = null;
    let primeiroBotao = null;
    
    catSnap.forEach(doc => {
        const catNome = doc.data().nome;
        
        // Cria o botão da categoria dinamicamente
        const btn = document.createElement("button");
        btn.innerText = catNome;
        btn.onclick = function() { filtrarCategoria(catNome, this); };
        
        categoriasContainer.appendChild(btn);

        // Guarda a primeira categoria para ativar ao abrir o site
        if (!primeiraCategoria) {
            primeiraCategoria = catNome;
            primeiroBotao = btn;
        }
    });

    // 2. CARREGAR PRODUTOS
    const prodSnap = await getDocs(collection(db, "produtos"));
    todosProdutos = [];
    prodSnap.forEach(doc => {
        todosProdutos.push({ id: doc.id, ...doc.data() });
    });

    // Inicia mostrando a primeira categoria carregada do banco
    if (primeiraCategoria && primeiroBotao) {
        filtrarCategoria(primeiraCategoria, primeiroBotao);
    } else {
        conteudo.innerHTML = `<p style="text-align: center; color: var(--text-muted); grid-column: 1 / -1; margin-top: 20px;">Nenhuma categoria ou produto cadastrado.</p>`;
    }
}

window.filtrarCategoria = (categoria, btnElement) => {
    document.querySelectorAll("#categorias button").forEach(b => b.classList.remove("categoriaAtiva"));
    btnElement.classList.add("categoriaAtiva");
    
    // Rola de forma suave para garantir que o botão inteiro fique visível
    btnElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    
    renderizarVitrine(categoria);
};

function renderizarVitrine(categoria) {
    conteudo.innerHTML = "";
    
    // Como a aba 'Todos' já não existe, filtramos sempre pela categoria selecionada
    let filtrados = todosProdutos.filter(p => p.categoria === categoria);

    if (filtrados.length === 0) {
        conteudo.innerHTML = `<p style="text-align: center; color: var(--text-muted); grid-column: 1 / -1; margin-top: 20px;">Nenhum produto encontrado nesta categoria.</p>`;
        return;
    }

    filtrados.forEach((p) => {
        const div = document.createElement("div");
        div.className = "produto";
        
        // Sem a aba "Todos", os cards são sempre 100% preenchidos pela imagem (estilo álbum)
        div.innerHTML = `
            <div class="produto-img-container" style="height: 100%; border-bottom: none;">
                <img src="${p.imagemCapa}" loading="lazy" alt="Produto">
            </div>
        `;
        
        div.onclick = () => abrirProduto(p);
        conteudo.appendChild(div);
        
        scrollObserver.observe(div);
    });
}

async function abrirProduto(produto) {
    const modal = document.getElementById("modal");
    modal.style.display = "flex";
    
    document.getElementById("produtoNome").innerText = produto.nome || "";
    document.getElementById("produtoDescricao").innerText = produto.descricao || "";
    
    const precoElement = document.getElementById("produtoPreco");
    if (produto.preco && parseFloat(produto.preco) > 0) {
        precoElement.innerText = "R$ " + parseFloat(produto.preco).toFixed(2).replace('.', ',');
    } else {
        precoElement.innerText = "Valor sob consulta";
    }

    const telefoneZap = "SEU_NUMERO_AQUI"; // Coloque o seu número de WhatsApp aqui!
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

window.onload = carregarDados;