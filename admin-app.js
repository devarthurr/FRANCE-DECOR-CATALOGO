import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// =====================================================================
// COLOQUE SUA CHAVE DO FIREBASE AQUI
const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "SEU_PROJETO.firebaseapp.com",
    projectId: "SEU_PROJETO",
    storageBucket: "SEU_PROJETO.appspot.com",
    messagingSenderId: "SEU_SENDER_ID",
    appId: "SEU_APP_ID"
};
// =====================================================================

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const loginScreen = document.getElementById('login-screen');
const dashboardScreen = document.getElementById('dashboard-screen');
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');
const categoryForm = document.getElementById('category-form');
const productForm = document.getElementById('product-form');
const categorySelect = document.getElementById('product-category');
const btnSalvarProduto = document.getElementById('btn-salvar-produto');

// Conversor e compressor calibrado para aceitar até 50 imagens sem travar o processamento
const converterParaBase64 = (file, maxWidth = 800, maxHeight = 800, quality = 0.5) => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = event => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > height && width > maxWidth) {
                    height *= maxWidth / width;
                    width = maxWidth;
                } else if (height > maxHeight) {
                    width *= maxHeight / height;
                    height = maxHeight;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                const base64String = canvas.toDataURL('image/jpeg', quality);
                resolve(base64String);
            };
        };
    });
};

onAuthStateChanged(auth, (user) => {
    if (user) {
        loginScreen.style.display = 'none';
        dashboardScreen.style.display = 'block';
        loadCategories();
    } else {
        loginScreen.style.display = 'flex';
        dashboardScreen.style.display = 'none';
    }
});

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('admin-email').value.trim();
    const password = document.getElementById('admin-password').value;
    
    signInWithEmailAndPassword(auth, email, password).catch((error) => {
        alert('Erro do Firebase: ' + error.code + '\nVerifique as credenciais na aba Authentication.');
    });
});

logoutBtn.addEventListener('click', () => signOut(auth));

categoryForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('category-name').value;
    try {
        await addDoc(collection(db, "categorias"), { nome: name });
        alert('Categoria adicionada!');
        categoryForm.reset();
        loadCategories();
    } catch (e) {
        alert("Erro: " + e.message);
    }
});

async function loadCategories() {
    categorySelect.innerHTML = '<option value="">Selecione uma categoria...</option>';
    const querySnapshot = await getDocs(collection(db, "categorias"));
    querySnapshot.forEach((doc) => {
        const option = document.createElement('option');
        option.value = doc.data().nome; 
        option.textContent = doc.data().nome;
        categorySelect.appendChild(option);
    });
}

productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('product-name').value;
    const desc = document.getElementById('product-description').value;
    const price = document.getElementById('product-price').value;
    const category = document.getElementById('product-category').value;
    const imageFiles = document.getElementById('product-image').files;

    if (imageFiles.length === 0) return alert('Selecione ao menos uma imagem.');
    if (imageFiles.length > 50) return alert('O limite máximo permitido é de 50 imagens por produto.');

    btnSalvarProduto.innerText = `Processando ${imageFiles.length} imagens...`;
    btnSalvarProduto.disabled = true;

    try {
        // 1. Processa e salva a primeira imagem como capa indexada
        const capaBase64 = await converterParaBase64(imageFiles[0]);

        // 2. Cria o registro base do produto
        const produtoDoc = await addDoc(collection(db, "produtos"), {
            nome: name,
            descricao: desc,
            preco: price ? parseFloat(price) : null,
            categoria: category,
            imagemCapa: capaBase64,
            dataCriacao: new Date()
        });

        const produtoId = produtoDoc.id;

        // 3. Salva todas as imagens da galeria de forma desvinculada (bypassa limite de tamanho por doc)
        for (let i = 0; i < imageFiles.length; i++) {
            btnSalvarProduto.innerText = `Salvando imagem ${i + 1} de ${imageFiles.length}...`;
            const fotoBase64 = await converterParaBase64(imageFiles[i]);
            
            await addDoc(collection(db, "imagens_produtos"), {
                produtoId: produtoId,
                stringImagem: fotoBase64,
                ordem: i
            });
        }

        alert('Produto com galeria completa salvo com sucesso!');
        productForm.reset();
    } catch (e) {
        alert('Erro ao salvar no Firestore: ' + e.message);
    } finally {
        btnSalvarProduto.innerText = "Adicionar ao Catálogo";
        btnSalvarProduto.disabled = false;
    }
});