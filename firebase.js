/**
 * Sistema de Estoque - Mollibear
 * Configuração e funções do Firebase
 */

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD3j7NdARKWfcyQcaG5dX6VAghuTfCMX68",
  authDomain: "mollibear-estoque.firebaseapp.com",
  projectId: "mollibear-estoque",
  storageBucket: "mollibear-estoque.firebasestorage.app",
  messagingSenderId: "168767505828",
  appId: "1:168767505828:web:50410e7841162296572d31",
  measurementId: "G-QM20K794M8"
};

// Inicializar Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  runTransaction,
  orderBy,
  limit,
  startAfter 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ============================================
// FUNÇÕES DE PRODUTOS
// ============================================

/**
 * Carrega todos os produtos de um tipo específico
 * @param {string} tipo - Tipo do estoque (ex: 'sala_p', 'estoque_g')
 * @returns {Promise<Array>} - Lista de produtos
 */
async function carregarProdutos(tipo) {
  try {
    const produtosCol = collection(db, `estoque/${tipo}/produtos`);
    const querySnapshot = await getDocs(produtosCol);
    const produtos = [];
    
    querySnapshot.forEach((doc) => {
      produtos.push({ id: doc.id, ...doc.data() });
    });
    
    return produtos;
  } catch (error) {
    console.error("Erro ao carregar produtos:", error);
    return [];
  }
}

/**
 * Carrega um produto específico
 * @param {string} tipo - Tipo do estoque
 * @param {string} produtoId - ID do produto
 * @returns {Promise<Object|null>} - Produto ou null
 */
async function carregarProduto(tipo, produtoId) {
  try {
    const docRef = doc(db, `estoque/${tipo}/produtos`, produtoId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  } catch (error) {
    console.error("Erro ao carregar produto:", error);
    return null;
  }
}

/**
 * Salva um novo produto
 * @param {string} tipo - Tipo do estoque
 * @param {Object} produto - Dados do produto
 * @returns {Promise<string>} - ID do produto salvo
 */
async function salvarProduto(tipo, produto) {
  try {
    const produtosCol = collection(db, `estoque/${tipo}/produtos`);
    const docRef = doc(produtosCol);
    await setDoc(docRef, produto);
    return docRef.id;
  } catch (error) {
    console.error("Erro ao salvar produto:", error);
    throw error;
  }
}

/**
 * Atualiza um produto
 * @param {string} tipo - Tipo do estoque
 * @param {string} produtoId - ID do produto
 * @param {Object} dados - Dados para atualizar
 * @returns {Promise<void>}
 */
async function atualizarProduto(tipo, produtoId, dados) {
  try {
    const docRef = doc(db, `estoque/${tipo}/produtos`, produtoId);
    await updateDoc(docRef, dados);
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    throw error;
  }
}

/**
 * Exclui um produto
 * @param {string} tipo - Tipo do estoque
 * @param {string} produtoId - ID do produto
 * @returns {Promise<void>}
 */
async function excluirProduto(tipo, produtoId) {
  try {
    const docRef = doc(db, `estoque/${tipo}/produtos`, produtoId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Erro ao excluir produto:", error);
    throw error;
  }
}

/**
 * Atualiza a quantidade de um produto usando transação (evita conflitos)
 * @param {string} tipo - Tipo do estoque
 * @param {string} produtoId - ID do produto
 * @param {number} quantidade - Quantidade a ser adicionada (positiva ou negativa)
 * @param {string} usuario - Usuário que fez a alteração
 * @param {string} observacao - Observação da movimentação
 * @returns {Promise<number>} - Nova quantidade
 */
async function atualizarQuantidadeComTransacao(tipo, produtoId, quantidade, usuario, observacao) {
  try {
    const docRef = doc(db, `estoque/${tipo}/produtos`, produtoId);
    
    const novaQuantidade = await runTransaction(db, async (transaction) => {
      const docSnap = await transaction.get(docRef);
      if (!docSnap.exists()) {
        throw new Error("Produto não encontrado!");
      }
      
      const dados = docSnap.data();
      const quantidadeAtual = parseInt(dados.quantidade) || 0;
      const novaQuantidade = quantidadeAtual + quantidade;
      
      if (novaQuantidade < 0) {
        throw new Error("Quantidade não pode ser negativa!");
      }
      
      // Atualiza o produto
      transaction.update(docRef, { quantidade: novaQuantidade });
      
      // Registra no histórico
      const historicoCol = collection(db, `estoque/${tipo}/historico`);
      const historicoRef = doc(historicoCol);
      transaction.set(historicoRef, {
        produtoId: produtoId,
        codigo: dados.codigo,
        descricao: dados.descricao,
        quantidadeAnterior: quantidadeAtual,
        quantidadeNova: novaQuantidade,
        tipoMovimentacao: quantidade > 0 ? "entrada" : "saida",
        quantidadeMovimentada: Math.abs(quantidade),
        usuario: usuario,
        observacao: observacao,
        data: new Date().toISOString()
      });
      
      return novaQuantidade;
    });
    
    return novaQuantidade;
  } catch (error) {
    console.error("Erro na transação:", error);
    throw error;
  }
}

// ============================================
// FUNÇÕES DE HISTÓRICO
// ============================================

/**
 * Carrega o histórico de movimentações
 * @param {string} tipo - Tipo do estoque
 * @param {Date} [dataInicio] - Data inicial (opcional)
 * @param {Date} [dataFim] - Data final (opcional)
 * @returns {Promise<Array>} - Lista de registros do histórico
 */
async function carregarHistorico(tipo, dataInicio, dataFim) {
  try {
    let historicoCol = collection(db, `estoque/${tipo}/historico`);
    let queryConstraints = [];
    
    if (dataInicio) {
      queryConstraints.push(where("data", ">=", dataInicio.toISOString()));
    }
    if (dataFim) {
      queryConstraints.push(where("data", "<=", dataFim.toISOString()));
    }
    
    // Ordenar por data (mais recente primeiro)
    queryConstraints.push(orderBy("data", "desc"));
    
    const q = query(historicoCol, ...queryConstraints);
    const querySnapshot = await getDocs(q);
    const historico = [];
    
    querySnapshot.forEach((doc) => {
      historico.push({ id: doc.id, ...doc.data() });
    });
    
    return historico;
  } catch (error) {
    console.error("Erro ao carregar histórico:", error);
    return [];
  }
}

// ============================================
// FUNÇÕES DE ESTATÍSTICAS
// ============================================

/**
 * Conta o total de produtos em um tipo de estoque
 * @param {string} tipo - Tipo do estoque
 * @returns {Promise<number>} - Total de produtos
 */
async function contarProdutos(tipo) {
  try {
    const produtosCol = collection(db, `estoque/${tipo}/produtos`);
    const querySnapshot = await getDocs(produtosCol);
    return querySnapshot.size;
  } catch (error) {
    console.error("Erro ao contar produtos:", error);
    return 0;
  }
}

/**
 * Calcula a quantidade total de itens em um tipo de estoque
 * @param {string} tipo - Tipo do estoque
 * @returns {Promise<number>} - Quantidade total
 */
async function calcularQuantidadeTotal(tipo) {
  try {
    const produtosCol = collection(db, `estoque/${tipo}/produtos`);
    const querySnapshot = await getDocs(produtosCol);
    let total = 0;
    
    querySnapshot.forEach((doc) => {
      const dados = doc.data();
      total += parseInt(dados.quantidade) || 0;
    });
    
    return total;
  } catch (error) {
    console.error("Erro ao calcular quantidade total:", error);
    return 0;
  }
}

/**
 * Conta quantas estantes estão sendo usadas em um tipo de estoque
 * @param {string} tipo - Tipo do estoque (apenas para 'sala_p')
 * @returns {Promise<number>} - Número de estantes utilizadas
 */
async function contarEstantesUtilizadas(tipo) {
  if (tipo !== 'sala_p') {
    return 0; // Apenas para Sala P
  }
  
  try {
    const produtosCol = collection(db, `estoque/${tipo}/produtos`);
    const querySnapshot = await getDocs(produtosCol);
    const estantes = new Set();
    
    querySnapshot.forEach((doc) => {
      const dados = doc.data();
      if (dados.estante) {
        estantes.add(dados.estante);
      }
    });
    
    return estantes.size;
  } catch (error) {
    console.error("Erro ao contar estantes utilizadas:", error);
    return 0;
  }
}

/**
 * Calcula a ocupação de uma estante específica
 * @param {string} tipo - Tipo do estoque
 * @param {number} estanteNumero - Número da estante
 * @returns {Promise<number>} - Porcentagem de ocupação (0-100)
 */
async function calcularOcupacaoEstante(tipo, estanteNumero) {
  if (tipo !== 'sala_p') {
    return 0; // Apenas para Sala P
  }
  
  try {
    const produtosCol = collection(db, `estoque/${tipo}/produtos`);
    const q = query(produtosCol, where("estante", "==", estanteNumero.toString()));
    const querySnapshot = await getDocs(q);
    
    let total = 0;
    let maxPorEstante = 0;
    
    querySnapshot.forEach((doc) => {
      const dados = doc.data();
      total += parseInt(dados.quantidade) || 0;
      // Supondo que cada estante pode ter até 100 itens (ajuste conforme necessário)
      maxPorEstante = 100;
    });
    
    return Math.min(100, (total / maxPorEstante) * 100);
  } catch (error) {
    console.error("Erro ao calcular ocupação da estante:", error);
    return 0;
  }
}

// ============================================
// FUNÇÕES DE BUSCA E PAGINAÇÃO
// ============================================

/**
 * Busca produtos com paginação
 * @param {string} tipo - Tipo do estoque
 * @param {string} [busca] - Termo de busca (opcional)
 * @param {string} [ordenarPor] - Campo para ordenar (opcional)
 * @param {number} [limitNum] - Limite de resultados por página
 * @param {DocumentSnapshot} [startAfterDoc] - Documento para começar após (para paginação)
 * @returns {Promise<{produtos: Array, lastVisible: DocumentSnapshot}>}
 */
async function buscarProdutosPaginado(tipo, busca = '', ordenarPor = 'codigo', limitNum = 50, startAfterDoc = null) {
  try {
    const produtosCol = collection(db, `estoque/${tipo}/produtos`);
    let queryConstraints = [];
    
    // Filtro de busca
    if (busca) {
      // Para busca em múltiplos campos, precisamos de uma abordagem diferente
      // Por enquanto, vamos buscar por código ou descrição
      queryConstraints.push(
        where("codigo", ">=", busca),
        where("codigo", "<=", busca + "\uf8ff")
      );
    }
    
    // Ordenação
    queryConstraints.push(orderBy(ordenarPor));
    
    // Limite
    queryConstraints.push(limit(limitNum));
    
    // Paginação
    if (startAfterDoc) {
      queryConstraints.push(startAfter(startAfterDoc));
    }
    
    const q = query(produtosCol, ...queryConstraints);
    const querySnapshot = await getDocs(q);
    
    const produtos = [];
    querySnapshot.forEach((doc) => {
      produtos.push({ id: doc.id, ...doc.data() });
    });
    
    return {
      produtos: produtos,
      lastVisible: querySnapshot.docs[querySnapshot.docs.length - 1] || null
    };
  } catch (error) {
    console.error("Erro ao buscar produtos paginados:", error);
    return { produtos: [], lastVisible: null };
  }
}

// ============================================
// LISTENERS EM TEMPO REAL
// ============================================

/**
 * Observa mudanças em tempo real nos produtos de um tipo de estoque
 * @param {string} tipo - Tipo do estoque
 * @param {Function} callback - Função de callback para atualizações
 * @returns {Function} - Função para cancelar o listener
 */
function observarProdutos(tipo, callback) {
  const produtosCol = collection(db, `estoque/${tipo}/produtos`);
  return onSnapshot(produtosCol, (querySnapshot) => {
    const produtos = [];
    querySnapshot.forEach((doc) => {
      produtos.push({ id: doc.id, ...doc.data() });
    });
    callback(produtos);
  });
}

/**
 * Observa mudanças em tempo real no histórico de um tipo de estoque
 * @param {string} tipo - Tipo do estoque
 * @param {Function} callback - Função de callback para atualizações
 * @returns {Function} - Função para cancelar o listener
 */
function observarHistorico(tipo, callback) {
  const historicoCol = collection(db, `estoque/${tipo}/historico`);
  return onSnapshot(historicoCol, (querySnapshot) => {
    const historico = [];
    querySnapshot.forEach((doc) => {
      historico.push({ id: doc.id, ...doc.data() });
    });
    callback(historico);
  });
}

// ============================================
// EXPORTAR FUNÇÕES
// ============================================

export {
  db,
  carregarProdutos,
  carregarProduto,
  salvarProduto,
  atualizarProduto,
  excluirProduto,
  atualizarQuantidadeComTransacao,
  carregarHistorico,
  contarProdutos,
  calcularQuantidadeTotal,
  contarEstantesUtilizadas,
  calcularOcupacaoEstante,
  buscarProdutosPaginado,
  observarProdutos,
  observarHistorico
};