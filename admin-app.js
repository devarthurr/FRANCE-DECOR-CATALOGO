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

// =========================================
// FUNÇÃO PARA COMPRIMIR IMAGENS E ACELERAR UPLOAD
// =========================================
const comprimirImagem = (file, maxWidth = 1200, maxHeight = 1200, quality = 0.8) => {
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

                canvas.toBlob((blob) => {
                    resolve(new File([blob], file.name, {
                        type: 'image/jpeg',
                        lastModified: Date.now()
                    }));
                }, 'image/jpeg', quality);
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
    const email = document.getElementById('admin-email').value;
    const password = document.getElementById('admin-password').value;
    signInWithEmailAndPassword(auth, email, password)
        .catch(() => alert('Erro de acesso: Usuário ou senha incorretos.'));
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

    btnSalvarProduto.innerText = "Processando e enviando... Aguarde";
    btnSalvarProduto.disabled = true;

    try {
        const uploadPromises = [];

        // Comprime e envia cada imagem selecionada
        for (let i = 0; i < imageFiles.length; i++) {
            // Aqui a mágica acontece: comprime o arquivo antes de subir
            const compressedFile = await comprimirImagem(imageFiles[i]);
            
            const imageRef = ref(storage, 'produtos/' + Date.now() + '_' + compressedFile.name);
            
            const uploadTask = uploadBytes(imageRef, compressedFile).then(async (snapshot) => {
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

        alert('Produto adicionado com sucesso!');
        productForm.reset();
    } catch (e) {
        alert('Erro ao salvar: ' + e.message);
    } finally {
        btnSalvarProduto.innerText = "Adicionar ao Catálogo";
        btnSalvarProduto.disabled = false;
    }
});