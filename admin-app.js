import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

// =====================================================================
// COLE A CHAVE DO SEU FIREBASE AQUI:
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
const storage = getStorage(app);

const loginScreen = document.getElementById('login-screen');
const dashboardScreen = document.getElementById('dashboard-screen');
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');
const categoryForm = document.getElementById('category-form');
const productForm = document.getElementById('product-form');
const categorySelect = document.getElementById('product-category');
const btnSalvarProduto = document.getElementById('btn-salvar-produto');

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
    const email = document.getElementById('admin-email').value;
    const password = document.getElementById('admin-password').value;
    signInWithEmailAndPassword(auth, email, password)
        .catch((error) => alert('Erro de acesso: Usuário ou senha incorretos.'));
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

    btnSalvarProduto.innerText = "Enviando imagens... Aguarde";
    btnSalvarProduto.disabled = true;

    try {
        const uploadPromises = [];

        for (let i = 0; i < imageFiles.length; i++) {
            const file = imageFiles[i];
            const imageRef = ref(storage, 'produtos/' + Date.now() + '_' + file.name);
            
            const uploadTask = uploadBytes(imageRef, file).then(async (snapshot) => {
                return await getDownloadURL(snapshot.ref);
            });
            
            uploadPromises.push(uploadTask);
        }

        const imageUrls = await Promise.all(uploadPromises);

        await addDoc(collection(db, "produtos"), {
            nome: name,
            descricao: desc,
            preco: price ? parseFloat(price) : null,
            categoria: category,
            imagens: imageUrls,
            dataCriacao: new Date()
        });

        alert('Produto e imagens adicionados com sucesso!');
        productForm.reset();
    } catch (e) {
        alert('Erro ao salvar: ' + e.message);
    } finally {
        btnSalvarProduto.innerText = "Adicionar ao Catálogo";
        btnSalvarProduto.disabled = false;
    }
});