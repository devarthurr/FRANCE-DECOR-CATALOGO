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
const campoPesquisa = document.getElementById("pesquisa");

let todosProdutos = [];
let categoriaAtual = null;
let botaoAtivoAtual = null;

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
    categoriasContainer.classList.add('active'); 
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
    const walk = (x - startX) * 2; 
    categoriasContainer.scrollLeft = scrollLeft - walk;
});


// ==========================================
// CARREGAMENTO INTELIGENTE
// ==========================================
async function carregarDados() {
    const catSnap = await getDocs(collection(db, "categorias"));
    categoriasContainer.innerHTML = "";
    
    let primeiraCategoria = null;
    let primeiroBotao = null;
    let temCategorias = false;
    
    catSnap.forEach(doc => {
        temCategorias = true;
        const catNome = doc.data().nome;
        
        const btn = document.createElement("button");
        btn.innerText = catNome;
        btn.onclick = function() { filtrarCategoria(catNome, this); };
        
        categoriasContainer.appendChild(btn);

        if (!primeiraCategoria) {
            primeiraCategoria = catNome;
            primeiroBotao = btn;
        }
    });

    const prodSnap = await getDocs(collection(db, "produtos"));
    todosProdutos = [];
    prodSnap.forEach(doc => {
        todosProdutos.push({ id: doc.id, ...doc.data() });
    });

    const wrapper = document.querySelector('.categorias-wrapper');

    if (temCategorias) {
        if (wrapper) wrapper.style.display = 'block';
        
        const temSemCategoria = todosProdutos.some(p => !p.categoria || p.categoria.trim() === "");
        if (temSemCategoria) {
            const btnOutros = document.createElement("button");
            btnOutros.innerText = "Geral";
            btnOutros.onclick = function() { filtrarCategoria('Geral', this); };
            categoriasContainer.appendChild(btnOutros);
            
            if (!primeiraCategoria) {
                primeiraCategoria = 'Geral';
                primeiroBotao = btnOutros;
            }
        }

        if (primeiraCategoria && primeiroBotao) {
            filtrarCategoria(primeiraCategoria, primeiroBotao);
        }
    } else {
        if (wrapper) wrapper.style.display = 'none';
        renderizarVitrineGeral();
    }
}

// Filtra produtos se tiver usando categorias
window.filtrarCategoria = (categoria, btnElement) => {
    // Se o usuário clicar numa categoria, limpa a barra de pesquisa
    campoPesquisa.value = "";
    
    categoriaAtual = categoria;
    botaoAtivoAtual = btnElement;

    document.querySelectorAll("#categorias button").forEach(b => b.classList.remove("categoriaAtiva"));
    btnElement.classList.add("categoriaAtiva");
    btnElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    
    conteudo.innerHTML = "";
    
    let filtrados = [];
    if (categoria === 'Geral') {
        filtrados = todosProdutos.filter(p => !p.categoria || p.categoria.trim() === "" || p.categoria === 'Geral');
    } else {
        filtrados = todosProdutos.filter(p => p.categoria === categoria);
    }

    if (filtrados.length === 0) {
        conteudo.innerHTML = `<p style="text-align: center; color: var(--text-muted); grid-column: 1 / -1; margin-top: 20px;">Nenhum produto encontrado nesta categoria.</p>`;
        return;
    }

    filtrados.forEach((p) => {
        const div = document.createElement("div");
        div.className = "produto";
        
        // Esconde nomes dentro das categorias específicas (Lookbook)
        div.innerHTML = `
            <div class="produto-img-container" style="height: 100%; border-bottom: none;">
                <img src="${p.imagemCapa}" loading="lazy" alt="Produto">
            </div>
        `;
        
        div.onclick = () => abrirProduto(p);
        conteudo.appendChild(div);
        scrollObserver.observe(div);
    });
};

// ==========================================
// LÓGICA DE PESQUISA EM TEMPO REAL
// ==========================================
campoPesquisa.addEventListener('input', (e) => {
    const termo = e.target.value.toLowerCase().trim();
    
    // Se apagar tudo da pesquisa, volta para onde estava
    if (termo === "") {
        if (categoriaAtual && botaoAtivoAtual) {
            filtrarCategoria(categoriaAtual, botaoAtivoAtual);
        } else {
            renderizarVitrineGeral();
        }
        return;
    }

    // Filtra produtos globalmente pelo nome ou descrição
    const filtrados = todosProdutos.filter(p => {
        const nomeStr = p.nome ? p.nome.toLowerCase() : "";
        const descStr = p.descricao ? p.descricao.toLowerCase() : "";
        return nomeStr.includes(termo) || descStr.includes(termo);
    });

    renderizarResultadoPesquisa(filtrados);
});

function renderizarResultadoPesquisa(filtrados) {
    conteudo.innerHTML = "";
    
    if (filtrados.length === 0) {
        conteudo.innerHTML = `<p style="text-align: center; color: var(--text-muted); grid-column: 1 / -1; margin-top: 20px;">Nenhum produto encontrado para: "<b>${campoPesquisa.value}</b>"</p>`;
        return;
    }

    // Na pesquisa global, sempre mostramos o nome do produto se houver, para o cliente saber o que encontrou
    filtrados.forEach((p) => {
        const div = document.createElement("div");
        div.className = "produto";
        
        const possuiNomeCadastrado = p.nome && p.nome.trim() !== "";
        div.innerHTML = `
            <div class="produto-img-container" style="${possuiNomeCadastrado ? '' : 'height: 100%; border-bottom: none;'}">
                <img src="${p.imagemCapa}" loading="lazy" alt="Produto">
            </div>
            ${possuiNomeCadastrado ? `<div class="produto-info"><h3>${p.nome}</h3></div>` : ''}
        `;
        
        div.onclick = () => abrirProduto(p);
        conteudo.appendChild(div);
        scrollObserver.observe(div);
    });
}

function renderizarVitrineGeral() {
    conteudo.innerHTML = "";
    
    if (todosProdutos.length === 0) {
        conteudo.innerHTML = `<p style="text-align: center; color: var(--text-muted); grid-column: 1 / -1; margin-top: 20px;">Nenhum produto cadastrado.</p>`;
        return;
    }

    todosProdutos.forEach((p) => {
        const div = document.createElement("div");
        div.className = "produto";
        
        const possuiNomeCadastrado = p.nome && p.nome.trim() !== "";
        div.innerHTML = `
            <div class="produto-img-container" style="${possuiNomeCadastrado ? '' : 'height: 100%; border-bottom: none;'}">
                <img src="${p.imagemCapa}" loading="lazy" alt="Produto">
            </div>
            ${possuiNomeCadastrado ? `<div class="produto-info"><h3>${p.nome}</h3></div>` : ''}
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

    const telefoneZap = "SEU_NUMERO_AQUI"; // <<<<<< COLOQUE SEU NÚMERO AQUI
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