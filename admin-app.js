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
const categoryForm = document.getElementById('category-form');
const productForm = document.getElementById('product-form');
const categorySelect = document.getElementById('product-category');
const btnSalvarProduto = document.getElementById('btn-salvar-produto');
const btnCancelEdit = document.getElementById('btn-cancel-edit');
const productsTableBody = document.getElementById('products-table-body');
const formTitle = document.getElementById('form-title');

let editModeId = null; // Variável que controla se estamos criando ou editando

// Conversor de imagens
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
        loadProducts(); // Carrega a tabela assim que logar
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

// =========================================
// GESTÃO DE CATEGORIAS
// =========================================
categoryForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        await addDoc(collection(db, "categorias"), { nome: document.getElementById('category-name').value });
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

// =========================================
// CARREGAR LISTA DE PRODUTOS
// =========================================
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
                <td>${data.nome}</td>
                <td>${data.categoria}</td>
                <td>${data.preco ? 'R$ ' + data.preco : 'Consultar'}</td>
                <td>
                    <button class="btn-small btn-warning btn-edit" data-id="${documento.id}">Editar</button>
                    <button class="btn-small btn-danger btn-delete" data-id="${documento.id}">Excluir</button>
                </td>
            `;
            productsTableBody.appendChild(tr);
        });

        // Configura os botões da tabela
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

// =========================================
// EXCLUIR PRODUTO
// =========================================
async function excluirProduto(id) {
    if(!confirm("CUIDADO: Tem certeza que deseja excluir este produto e todas as suas fotos? Essa ação não pode ser desfeita.")) return;
    
    try {
        // Exclui o documento principal do produto
        await deleteDoc(doc(db, "produtos", id));
        
        // Localiza e exclui as imagens vinculadas da galeria
        const q = query(collection(db, "imagens_produtos"), where("produtoId", "==", id));
        const imgSnapshot = await getDocs(q);
        
        for (const d of imgSnapshot.docs) {
            await deleteDoc(doc(db, "imagens_produtos", d.id));
        }

        alert("Produto excluído com sucesso!");
        loadProducts(); // Atualiza a tabela
    } catch (e) {
        alert("Erro ao excluir: " + e.message);
    }
}

// =========================================
// INICIAR MODO EDIÇÃO
// =========================================
async function iniciarEdicao(id) {
    try {
        const docSnap = await getDoc(doc(db, "produtos", id));
        if (docSnap.exists()) {
            const data = docSnap.data();
            
            document.getElementById('product-name').value = data.nome;
            document.getElementById('product-description').value = data.descricao;
            document.getElementById('product-category').value = data.categoria;
            document.getElementById('product-price').value = data.preco || "";
            
            editModeId = id; // Ativa a flag de edição
            formTitle.innerText = `Editar Produto: ${data.nome}`;
            btnSalvarProduto.innerText = "Salvar Alterações";
            btnCancelEdit.style.display = "inline-block";
            
            // A imagem passa a ser opcional (se não enviar nada, mantém a atual)
            document.getElementById('product-image').removeAttribute('required');
            
            // Rola a tela suavemente para o formulário
            formTitle.scrollIntoView({ behavior: 'smooth' });
        }
    } catch(e) {
        alert("Erro ao carregar os dados: " + e.message);
    }
}

// =========================================
// CANCELAR EDIÇÃO
// =========================================
btnCancelEdit.addEventListener('click', cancelarEdicao);

function cancelarEdicao() {
    editModeId = null;
    productForm.reset();
    formTitle.innerText = "Novo Produto";
    btnSalvarProduto.innerText = "Adicionar ao Catálogo";
    btnCancelEdit.style.display = "none";
    document.getElementById('product-image').setAttribute('required', 'true');
}

// =========================================
// SALVAR (NOVO OU ATUALIZAÇÃO)
// =========================================
productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('product-name').value;
    const desc = document.getElementById('product-description').value;
    const price = document.getElementById('product-price').value;
    const category = document.getElementById('product-category').value;
    const imageFiles = document.getElementById('product-image').files;

    if (imageFiles.length > 50) return alert('O limite máximo é de 50 imagens.');

    btnSalvarProduto.innerText = "Processando informações... Aguarde";
    btnSalvarProduto.disabled = true;

    try {
        if (editModeId) {
            // ------- LÓGICA DE ATUALIZAÇÃO -------
            const updateData = {
                nome: name,
                descricao: desc,
                preco: price ? parseFloat(price) : null,
                categoria: category
            };

            // Se selecionou novas fotos, converte e adiciona à galeria existente
            if (imageFiles.length > 0) {
                // Descobre quantas fotos já existem para dar a sequência correta
                const q = query(collection(db, "imagens_produtos"), where("produtoId", "==", editModeId));
                const currentImages = await getDocs(q);
                let startIndex = currentImages.size;

                for (let i = 0; i < imageFiles.length; i++) {
                    btnSalvarProduto.innerText = `Adicionando imagem ${i + 1}...`;
                    const fotoBase64 = await converterParaBase64(imageFiles[i]);
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
            // ------- LÓGICA DE CRIAÇÃO (PRODUTO NOVO) -------
            if (imageFiles.length === 0) {
                btnSalvarProduto.disabled = false;
                btnSalvarProduto.innerText = "Adicionar ao Catálogo";
                return alert('Selecione ao menos uma imagem para o novo produto.');
            }

            const capaBase64 = await converterParaBase64(imageFiles[0]);

            const produtoDoc = await addDoc(collection(db, "produtos"), {
                nome: name,
                descricao: desc,
                preco: price ? parseFloat(price) : null,
                categoria: category,
                imagemCapa: capaBase64,
                dataCriacao: new Date()
            });

            for (let i = 0; i < imageFiles.length; i++) {
                btnSalvarProduto.innerText = `Salvando imagem ${i + 1}...`;
                const fotoBase64 = await converterParaBase64(imageFiles[i]);
                await addDoc(collection(db, "imagens_produtos"), {
                    produtoId: produtoDoc.id,
                    stringImagem: fotoBase64,
                    ordem: i
                });
            }

            alert('Produto novo salvo com sucesso!');
            productForm.reset();
        }

        loadProducts(); // Atualiza a tabela imediatamente
    } catch (e) {
        alert('Erro ao salvar no Firestore: ' + e.message);
    } finally {
        btnSalvarProduto.innerText = editModeId ? "Salvar Alterações" : "Adicionar ao Catálogo";
        btnSalvarProduto.disabled = false;
    }
});