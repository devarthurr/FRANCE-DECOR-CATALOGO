import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, query, where } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// =====================================================================
// COLOQUE SUA CHAVE DO FIREBASE AQUI
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

const productForm = document.getElementById('product-form');
const categorySelect = document.getElementById('product-category');
const btnSalvarProduto = document.getElementById('btn-salvar-produto');
const btnCancelEdit = document.getElementById('btn-cancel-edit');
const productsTableBody = document.getElementById('products-table-body');
const formTitle = document.getElementById('form-title');

const categoryForm = document.getElementById('category-form');
const categoryFormTitle = document.getElementById('category-form-title');
const btnSalvarCategoria = document.getElementById('btn-salvar-categoria');
const btnCancelCategoryEdit = document.getElementById('btn-cancel-category-edit');
const categoriesTableBody = document.getElementById('categories-table-body');

let editModeId = null;
let editCategoryModeId = null;

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
        loadProducts();
    } else {
        loginScreen.style.display = 'flex';
        dashboardScreen.style.display = 'none';
    }
});

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('admin-email').value.trim();
    const password = document.getElementById('admin-password').value;
    signInWithEmailAndPassword(auth, email, password).catch((error) => alert('Erro de acesso: ' + error.code));
});

logoutBtn.addEventListener('click', () => signOut(auth));

async function loadCategories() {
    categorySelect.innerHTML = '<option value="">Nenhuma / Geral</option>';
    categoriesTableBody.innerHTML = '<tr><td colspan="2">Carregando categorias...</td></tr>';
    
    try {
        const querySnapshot = await getDocs(collection(db, "categorias"));
        categoriesTableBody.innerHTML = '';
        
        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            
            const option = document.createElement('option');
            option.value = data.nome; 
            option.textContent = data.nome;
            categorySelect.appendChild(option);

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${data.nome}</td>
                <td>
                    <button class="btn-small btn-warning btn-edit-category" data-id="${docSnap.id}" data-nome="${data.nome}">Editar</button>
                    <button class="btn-small btn-danger btn-delete-category" data-id="${docSnap.id}">Excluir</button>
                </td>
            `;
            categoriesTableBody.appendChild(tr);
        });

        document.querySelectorAll('.btn-edit-category').forEach(btn => {
            btn.addEventListener('click', (e) => iniciarEdicaoCategoria(e.target.getAttribute('data-id'), e.target.getAttribute('data-nome')));
        });
        document.querySelectorAll('.btn-delete-category').forEach(btn => {
            btn.addEventListener('click', (e) => excluirCategoria(e.target.getAttribute('data-id')));
        });

    } catch (e) {
        categoriesTableBody.innerHTML = '<tr><td colspan="2">Erro ao carregar categorias.</td></tr>';
    }
}

categoryForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nomeCategoria = document.getElementById('category-name').value;
    
    try {
        if (editCategoryModeId) {
            await updateDoc(doc(db, "categorias", editCategoryModeId), { nome: nomeCategoria });
            alert('Categoria atualizada com sucesso!');
            cancelarEdicaoCategoria();
        } else {
            await addDoc(collection(db, "categorias"), { nome: nomeCategoria });
            alert('Categoria adicionada!');
            categoryForm.reset();
        }
        loadCategories(); 
    } catch (e) {
        alert("Erro: " + e.message);
    }
});

function iniciarEdicaoCategoria(id, nomeAtual) {
    editCategoryModeId = id;
    document.getElementById('category-name').value = nomeAtual;
    
    categoryFormTitle.innerText = `Editar Categoria: ${nomeAtual}`;
    btnSalvarCategoria.innerText = "Salvar Alterações";
    btnCancelCategoryEdit.style.display = "inline-block";
    
    categoryFormTitle.scrollIntoView({ behavior: 'smooth' });
}

btnCancelCategoryEdit.addEventListener('click', cancelarEdicaoCategoria);

function cancelarEdicaoCategoria() {
    editCategoryModeId = null;
    categoryForm.reset();
    categoryFormTitle.innerText = "Nova Categoria";
    btnSalvarCategoria.innerText = "Salvar Categoria";
    btnCancelCategoryEdit.style.display = "none";
}

async function excluirCategoria(id) {
    if(!confirm("Atenção: Tem certeza que deseja excluir esta categoria?")) return;
    try {
        await deleteDoc(doc(db, "categorias", id));
        alert("Categoria excluída com sucesso!");
        loadCategories();
    } catch (e) {
        alert("Erro ao excluir: " + e.message);
    }
}

async function loadProducts() {
    productsTableBody.innerHTML = '<tr><td colspan="5">Carregando catálogo...</td></tr>';
    try {
        const querySnapshot = await getDocs(collection(db, "produtos"));
        productsTableBody.innerHTML = '';
        
        querySnapshot.forEach((documento) => {
            const data = documento.data();
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><img src="${data.imagemCapa || 'images/logo.png'}" alt="Capa"></td>
                <td>${data.nome || '<span style="color: #999; font-style: italic;">Sem Título</span>'}</td>
                <td>${data.categoria || '<span style="color: #999; font-style: italic;">Sem Categoria</span>'}</td>
                <td>${data.preco ? 'R$ ' + data.preco : 'Consultar'}</td>
                <td>
                    <button class="btn-small btn-warning btn-edit" data-id="${documento.id}">Editar</button>
                    <button class="btn-small btn-danger btn-delete" data-id="${documento.id}">Excluir</button>
                </td>
            `;
            productsTableBody.appendChild(tr);
        });

        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => iniciarEdicao(e.target.getAttribute('data-id')));
        });
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => excluirProduto(e.target.getAttribute('data-id')));
        });

    } catch (e) {
        productsTableBody.innerHTML = '<tr><td colspan="5">Erro ao carregar os produtos.</td></tr>';
    }
}

async function excluirProduto(id) {
    if(!confirm("CUIDADO: Tem certeza que deseja excluir este produto e todas as suas fotos?")) return;
    try {
        await deleteDoc(doc(db, "produtos", id));
        const q = query(collection(db, "imagens_produtos"), where("produtoId", "==", id));
        const imgSnapshot = await getDocs(q);
        for (const d of imgSnapshot.docs) {
            await deleteDoc(doc(db, "imagens_produtos", d.id));
        }
        alert("Produto excluído!");
        loadProducts();
    } catch (e) {
        alert("Erro ao excluir: " + e.message);
    }
}

async function iniciarEdicao(id) {
    try {
        const docSnap = await getDoc(doc(db, "produtos", id));
        if (docSnap.exists()) {
            const data = docSnap.data();
            document.getElementById('product-name').value = data.nome || "";
            document.getElementById('product-description').value = data.descricao || "";
            document.getElementById('product-category').value = data.categoria || "";
            document.getElementById('product-price').value = data.preco || "";
            
            editModeId = id;
            formTitle.innerText = `Editar Produto: ${data.nome || "Sem título"}`;
            btnSalvarProduto.innerText = "Salvar Alterações";
            btnCancelEdit.style.display = "inline-block";
            
            document.getElementById('product-cover').removeAttribute('required');
            formTitle.scrollIntoView({ behavior: 'smooth' });
        }
    } catch(e) {
        alert("Erro ao carregar os dados: " + e.message);
    }
}

btnCancelEdit.addEventListener('click', cancelarEdicao);

function cancelarEdicao() {
    editModeId = null;
    productForm.reset();
    formTitle.innerText = "Novo Produto";
    btnSalvarProduto.innerText = "Adicionar ao Catálogo";
    btnCancelEdit.style.display = "none";
    document.getElementById('product-cover').setAttribute('required', 'true');
}

productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('product-name').value;
    const desc = document.getElementById('product-description').value;
    const price = document.getElementById('product-price').value;
    const category = document.getElementById('product-category').value;
    
    const coverFile = document.getElementById('product-cover').files[0];
    const galleryFiles = document.getElementById('product-gallery').files;

    if (galleryFiles.length > 50) return alert('O limite máximo é de 50 imagens na galeria.');

    btnSalvarProduto.innerText = "Processando informações... Aguarde";
    btnSalvarProduto.disabled = true;

    try {
        if (editModeId) {
            const updateData = {
                nome: name,
                descricao: desc,
                preco: price ? parseFloat(price) : null,
                categoria: category
            };

            if (coverFile) {
                btnSalvarProduto.innerText = "Atualizando a capa...";
                updateData.imagemCapa = await converterParaBase64(coverFile);
            }

            if (galleryFiles.length > 0) {
                const q = query(collection(db, "imagens_produtos"), where("produtoId", "==", editModeId));
                const currentImages = await getDocs(q);
                let startIndex = currentImages.size;

                for (let i = 0; i < galleryFiles.length; i++) {
                    btnSalvarProduto.innerText = `Adicionando imagem ${i + 1} à galeria...`;
                    const fotoBase64 = await converterParaBase64(galleryFiles[i]);
                    await addDoc(collection(db, "imagens_produtos"), {
                        produtoId: editModeId,
                        stringImagem: fotoBase64,
                        ordem: startIndex + i
                    });
                }
            }

            await updateDoc(doc(db, "produtos", editModeId), updateData);
            alert('Produto atualizado com sucesso!');
            cancelarEdicao();

        } else {
            if (!coverFile) {
                btnSalvarProduto.disabled = false;
                btnSalvarProduto.innerText = "Adicionar ao Catálogo";
                return alert('Você precisa selecionar a Imagem Principal (Capa).');
            }

            btnSalvarProduto.innerText = "Processando capa...";
            const capaBase64 = await converterParaBase64(coverFile);

            const produtoDoc = await addDoc(collection(db, "produtos"), {
                nome: name,
                descricao: desc,
                preco: price ? parseFloat(price) : null,
                categoria: category, // Será vazio se não selecionar
                imagemCapa: capaBase64,
                dataCriacao: new Date()
            });

            if (galleryFiles.length > 0) {
                for (let i = 0; i < galleryFiles.length; i++) {
                    btnSalvarProduto.innerText = `Salvando imagem ${i + 1} da galeria...`;
                    const fotoBase64 = await converterParaBase64(galleryFiles[i]);
                    await addDoc(collection(db, "imagens_produtos"), {
                        produtoId: produtoDoc.id,
                        stringImagem: fotoBase64,
                        ordem: i
                    });
                }
            }

            alert('Produto novo salvo com sucesso!');
            productForm.reset();
        }

        loadProducts();
    } catch (e) {
        alert('Erro ao salvar: ' + e.message);
    } finally {
        btnSalvarProduto.innerText = editModeId ? "Salvar Alterações" : "Adicionar ao Catálogo";
        btnSalvarProduto.disabled = false;
    }
});