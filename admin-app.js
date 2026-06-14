import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// =====================================================================
// COLE SUA CHAVE AQUI
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

// Conversor de Imagem para Base64 (Armazenamento Gratuito via Texto)
const converterParaBase64 = (file, maxWidth = 900, maxHeight = 900, quality = 0.6) => {
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
    
    signInWithEmailAndPassword(auth, email, password)
        .catch((error) => {
            console.error("Erro completo:", error);
            alert('Erro do Firebase: ' + error.code + '\n(Verifique se o e-mail/senha estão corretos ou se o provedor está ativado no painel)');
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

    if (imageFiles.length === 0) return alert('Selecione pelo menos uma imagem.');

    btnSalvarProduto.innerText = "Processando e salvando... Aguarde";
    btnSalvarProduto.disabled = true;

    try {
        const base64Images = [];

        for (let i = 0; i < imageFiles.length; i++) {
            const base64String = await converterParaBase64(imageFiles[i]);
            base64Images.push(base64String);
        }

        await addDoc(collection(db, "produtos"), {
            nome: name,
            descricao: desc,
            preco: price ? parseFloat(price) : null,
            categoria: category,
            imagens: base64Images,
            dataCriacao: new Date()
        });

        alert('Produto adicionado com sucesso!');
        productForm.reset();
    } catch (e) {
        alert('Erro ao salvar no Firestore: ' + e.message);
    } finally {
        btnSalvarProduto.innerText = "Adicionar ao Catálogo";
        btnSalvarProduto.disabled = false;
    }
});