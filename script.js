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

// Animação de Scroll
const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if(entry.isIntersecting){
            entry.target.classList.add('show');
            scrollObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

async function carregarCatalogo() {
    const snapshot = await getDocs(collection(db, "produtos"));
    conteudo.innerHTML = "";
    snapshot.forEach((doc) => {
        const p = doc.data();
        const div = document.createElement("div");
        div.className = "produto";
        
        // Apenas a imagem e o nome na vitrine
        div.innerHTML = `
            <div class="produto-img-container">
                <img src="${p.imagemCapa}" loading="lazy" alt="${p.nome}">
            </div>
            <div class="produto-info">
                <h3>${p.nome}</h3>
            </div>
        `;
        
        div.onclick = () => abrirProduto({id: doc.id, ...p});
        conteudo.appendChild(div);
        
        scrollObserver.observe(div);
    });
}

async function abrirProduto(produto) {
    const modal = document.getElementById("modal");
    modal.style.display = "flex";
    
    document.getElementById("produtoNome").innerText = produto.nome;
    document.getElementById("produtoDescricao").innerText = produto.descricao;
    
    // ==========================================
    // Lógica para mostrar ou não o preço
    // ==========================================
    const precoElement = document.getElementById("produtoPreco");
    if (produto.preco && parseFloat(produto.preco) > 0) {
        // Se tiver preço, formata bonito com vírgula
        precoElement.innerText = "R$ " + parseFloat(produto.preco).toFixed(2).replace('.', ',');
    } else {
        // Se não tiver preço, pede para consultar
        precoElement.innerText = "Valor sob consulta";
    }

    // ==========================================
    // Cria o link dinâmico pro WhatsApp
    // ==========================================
    const telefoneZap = "83993167766"; // Coloque seu número aqui. Ex: 5583999999999
    const textoPronto = encodeURIComponent(`Olá, gostaria de saber mais detalhes sobre o produto: ${produto.nome}`);
    document.getElementById("botaoWhatsapp").href = `https://wa.me/${telefoneZap}?text=${textoPronto}`;
    
    const imgPrincipal = document.getElementById("imagemPrincipal");
    imgPrincipal.src = produto.imagemCapa;

    // Miniaturas
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

window.onload = carregarCatalogo;