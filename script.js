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

// Animação de Scroll (Intersection Observer)
const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if(entry.isIntersecting){
            entry.target.classList.add('show');
            scrollObserver.unobserve(entry.target); // Anima apenas 1 vez
        }
    });
}, { threshold: 0.1 });

async function carregarCatalogo() {
    // Aqui você pode adicionar lógica de loading visual se quiser
    const snapshot = await getDocs(collection(db, "produtos"));
    conteudo.innerHTML = "";
    snapshot.forEach((doc) => {
        const p = doc.data();
        const div = document.createElement("div");
        div.className = "produto";
        div.innerHTML = `
            <img src="${p.imagemCapa}" loading="lazy" alt="${p.nome}">
            <div class="produto-info">
                <h3>${p.nome}</h3>
                <div class="preco">R$ ${p.preco}</div>
            </div>
        `;
        div.onclick = () => abrirProduto({id: doc.id, ...p});
        conteudo.appendChild(div);
        
        // Observa o card recém-criado para animar
        scrollObserver.observe(div);
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

    // Miniaturas
    const divMiniaturas = document.getElementById("miniaturas");
    divMiniaturas.innerHTML = "";

    // Busca imagens da galeria
    const q = query(collection(db, "imagens_produtos"), where("produtoId", "==", produto.id));
    const snap = await getDocs(q);
    let galeria = [produto.imagemCapa];
    snap.forEach(d => galeria.push(d.data().stringImagem));

    let index = 0;
    
    // Função para trocar imagem com efeito de Fade
    const trocarImagem = (novoIndex) => {
        imgPrincipal.style.opacity = 0; // Inicia o fade out
        
        setTimeout(() => {
            index = novoIndex;
            imgPrincipal.src = galeria[index];
            imgPrincipal.style.opacity = 1; // Fade in

            // Atualiza destaque na miniatura
            document.querySelectorAll("#miniaturas img").forEach((img, idx) => {
                img.classList.toggle("ativa", idx === index);
            });
        }, 150); // Tempo do fade out antes de trocar o source
    };

    // Cria as miniaturas visuais
    galeria.forEach((imgUrl, i) => {
        const img = document.createElement("img");
        img.src = imgUrl;
        if(i === 0) img.classList.add("ativa");
        img.onclick = () => trocarImagem(i);
        divMiniaturas.appendChild(img);
    });

    const carrosselContainer = document.getElementById("carrossel-container");
    
    // Remove setas anteriores para evitar duplicidade
    document.querySelectorAll(".seta").forEach(s => s.remove());

    // Adiciona setas premium em formato SVG se houver mais de uma imagem
    if (galeria.length > 1) {
        const btnEsq = document.createElement("button"); 
        // Ícone de seta elegante
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

// Lógica de fechar modal
const fecharModal = () => document.getElementById("modal").style.display = "none";
document.getElementById("fecharModal").onclick = fecharModal;
window.onclick = (event) => { if (event.target == document.getElementById("modal")) fecharModal(); }

// Lógica do botão Voltar ao Topo
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

// Inicia aplicação
window.onload = carregarCatalogo;