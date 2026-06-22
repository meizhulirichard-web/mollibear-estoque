/**
 * Sistema de Estoque - Mollibear
 * Funções de Estoque
 */

import {
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
  observarProdutos
} from './firebase.js';

import {
  formatarData,
  validarProduto,
  validarQuantidade,
  ordenarProdutos,
  filtrarProdutos,
  paginarItens,
  calcularTotalPaginas
} from './utils.js';

// ============================================
// FUNÇÕES PRINCIPAIS DE ESTOQUE
// ============================================

/**
 * Obtém todos os produtos de um tipo de estoque
 * @param {string} tipo - Tipo do estoque (ex: 'sala_p', 'estoque_g')
 * @returns {Promise<Array>} - Lista de produtos
 */
async function obterProdutos(tipo) {
  return await carregarProdutos(tipo);
}

/**
 * Obtém um produto específico
 * @param {string} tipo - Tipo do estoque
 * @param {string} produtoId - ID do produto
 * @returns {Promise<Object|null>} - Produto ou null
 */
async function obterProduto(tipo, produtoId) {
  return await carregarProduto(tipo, produtoId);
}

/**
 * Adiciona um novo produto
 * @param {string} tipo - Tipo do estoque
 * @param {Object} produto - Dados do produto
 * @returns {Promise<string>} - ID do produto salvo
 */
async function adicionarProduto(tipo, produto) {
  if (!validarProduto(produto, tipo === 'sala_p')) {
    throw new Error("Dados do produto inválidos!");
  }
  
  return await salvarProduto(tipo, produto);
}

/**
 * Atualiza um produto existente
 * @param {string} tipo - Tipo do estoque
 * @param {string} produtoId - ID do produto
 * @param {Object} dados - Dados para atualizar
 * @returns {Promise<void>}
 */
async function atualizarProdutoEstoque(tipo, produtoId, dados) {
  await atualizarProduto(tipo, produtoId, dados);
}

/**
 * Exclui um produto
 * @param {string} tipo - Tipo do estoque
 * @param {string} produtoId - ID do produto
 * @returns {Promise<void>}
 */
async function removerProduto(tipo, produtoId) {
  await excluirProduto(tipo, produtoId);
}

// ============================================
// FUNÇÕES DE MOVIMENTAÇÃO
// ============================================

/**
 * Registra uma entrada de produtos
 * @param {string} tipo - Tipo do estoque
 * @param {string} produtoId - ID do produto
 * @param {number} quantidade - Quantidade a entrar
 * @param {string} usuario - Usuário que fez a alteração
 * @param {string} observacao - Observação da movimentação
 * @returns {Promise<number>} - Nova quantidade
 */
async function registrarEntrada(tipo, produtoId, quantidade, usuario, observacao = '') {
  if (!validarQuantidade(quantidade)) {
    throw new Error("Quantidade inválida!");
  }
  
  return await atualizarQuantidadeComTransacao(tipo, produtoId, quantidade, usuario, observacao);
}

/**
 * Registra uma saída de produtos
 * @param {string} tipo - Tipo do estoque
 * @param {string} produtoId - ID do produto
 * @param {number} quantidade - Quantidade a sair
 * @param {string} usuario - Usuário que fez a alteração
 * @param {string} observacao - Observação da movimentação
 * @returns {Promise<number>} - Nova quantidade
 */
async function registrarSaida(tipo, produtoId, quantidade, usuario, observacao = '') {
  if (!validarQuantidade(quantidade)) {
    throw new Error("Quantidade inválida!");
  }
  
  return await atualizarQuantidadeComTransacao(tipo, produtoId, -quantidade, usuario, observacao);
}

// ============================================
// FUNÇÕES DE BUSCA E FILTRO
// ============================================

/**
 * Busca produtos com filtros
 * @param {string} tipo - Tipo do estoque
 * @param {string} [busca] - Termo de busca
 * @param {string} [ordenarPor] - Campo para ordenar
 * @param {boolean} [crescente=true] - Ordenação crescente
 * @returns {Promise<Array>} - Lista de produtos filtrados e ordenados
 */
async function buscarProdutos(tipo, busca = '', ordenarPor = 'codigo', crescente = true) {
  const produtos = await carregarProdutos(tipo);
  
  // Filtrar
  const produtosFiltrados = filtrarProdutos(produtos, busca);
  
  // Ordenar
  return ordenarProdutos(produtosFiltrados, ordenarPor, crescente);
}

/**
 * Busca produtos com paginação
 * @param {string} tipo - Tipo do estoque
 * @param {Object} [opcoes] - Opções de busca
 * @param {string} [opcoes.busca] - Termo de busca
 * @param {string} [opcoes.ordenarPor] - Campo para ordenar
 * @param {number} [opcoes.pagina=1] - Página atual
 * @param {number} [opcoes.itensPorPagina=50] - Itens por página
 * @returns {Promise<{produtos: Array, total: number, totalPaginas: number}>}
 */
async function buscarProdutosPaginados(tipo, opcoes = {}) {
  const {
    busca = '',
    ordenarPor = 'codigo',
    pagina = 1,
    itensPorPagina = 50
  } = opcoes;
  
  const produtos = await buscarProdutos(tipo, busca, ordenarPor);
  const total = produtos.length;
  const totalPaginas = calcularTotalPaginas(total, itensPorPagina);
  const produtosPaginados = paginarItens(produtos, pagina, itensPorPagina);
  
  return {
    produtos: produtosPaginados,
    total,
    totalPaginas
  };
}

// ============================================
// FUNÇÕES DE ESTATÍSTICAS
// ============================================

/**
 * Obtém estatísticas do estoque
 * @param {string} tipo - Tipo do estoque
 * @returns {Promise<Object>} - Estatísticas (totalProdutos, totalQuantidade, estantesUtilizadas)
 */
async function obterEstatisticas(tipo) {
  const [totalProdutos, totalQuantidade, estantesUtilizadas] = await Promise.all([
    contarProdutos(tipo),
    calcularQuantidadeTotal(tipo),
    contarEstantesUtilizadas(tipo)
  ]);
  
  return {
    totalProdutos,
    totalQuantidade,
    estantesUtilizadas
  };
}

/**
 * Obtém a ocupação de uma estante específica
 * @param {string} tipo - Tipo do estoque
 * @param {number} estanteNumero - Número da estante
 * @returns {Promise<number>} - Porcentagem de ocupação (0-100)
 */
async function obterOcupacaoEstante(tipo, estanteNumero) {
  return await calcularOcupacaoEstante(tipo, estanteNumero);
}

// ============================================
// FUNÇÕES DE HISTÓRICO
// ============================================

/**
 * Obtém o histórico de movimentações
 * @param {string} tipo - Tipo do estoque
 * @param {Object} [opcoes] - Opções de filtro
 * @param {Date} [opcoes.dataInicio] - Data inicial
 * @param {Date} [opcoes.dataFim] - Data final
 * @param {number} [opcoes.pagina=1] - Página atual
 * @param {number} [opcoes.itensPorPagina=50] - Itens por página
 * @returns {Promise<{historico: Array, total: number, totalPaginas: number}>}
 */
async function obterHistorico(tipo, opcoes = {}) {
  const {
    dataInicio,
    dataFim,
    pagina = 1,
    itensPorPagina = 50
  } = opcoes;
  
  const historico = await carregarHistorico(tipo, dataInicio, dataFim);
  const total = historico.length;
  const totalPaginas = calcularTotalPaginas(total, itensPorPagina);
  const historicoPaginado = paginarItens(historico, pagina, itensPorPagina);
  
  return {
    historico: historicoPaginado,
    total,
    totalPaginas
  };
}

// ============================================
// FUNÇÕES DE PRODUTOS POR ESTANTE
// ============================================

/**
 * Obtém produtos de uma estante específica
 * @param {string} tipo - Tipo do estoque
 * @param {number} estanteNumero - Número da estante
 * @returns {Promise<Array>} - Lista de produtos da estante
 */
async function obterProdutosPorEstante(tipo, estanteNumero) {
  const produtos = await carregarProdutos(tipo);
  return produtos.filter(produto => produto.estante === estanteNumero);
}

// ============================================
// LISTENERS EM TEMPO REAL
// ============================================

/**
 * Observa mudanças em tempo real nos produtos
 * @param {string} tipo - Tipo do estoque
 * @param {Function} callback - Função de callback para atualizações
 * @returns {Function} - Função para cancelar o listener
 */
function observarProdutosEmTempoReal(tipo, callback) {
  return observarProdutos(tipo, callback);
}

// ============================================
// EXPORTAR FUNÇÕES
// ============================================

export {
  // Funções principais
  obterProdutos,
  obterProduto,
  adicionarProduto,
  atualizarProdutoEstoque,
  removerProduto,
  
  // Movimentação
  registrarEntrada,
  registrarSaida,
  
  // Busca e filtro
  buscarProdutos,
  buscarProdutosPaginados,
  
  // Estatísticas
  obterEstatisticas,
  obterOcupacaoEstante,
  
  // Histórico
  obterHistorico,
  
  // Produtos por estante
  obterProdutosPorEstante,
  
  // Listeners
  observarProdutosEmTempoReal
};