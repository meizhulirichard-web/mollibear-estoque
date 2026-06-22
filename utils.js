/**
 * Sistema de Estoque - Mollibear
 * Funções Utilitárias
 */

// ============================================
// FUNÇÕES DE FORMATAÇÃO
// ============================================

/**
 * Formata uma data no formato DD/MM/AAAA
 * @param {string} data - Data no formato YYYY-MM-DD
 * @returns {string} - Data formatada
 */
function formatarData(data) {
  if (!data) return "Não informado";
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano}`;
}

/**
 * Formata um número para moeda brasileira (R$)
 * @param {number} valor - Valor a ser formatado
 * @returns {string} - Valor formatado
 */
function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
}

/**
 * Formata um número com separadores de milhar
 * @param {number} valor - Valor a ser formatado
 * @returns {string} - Valor formatado
 */
function formatarNumero(valor) {
  return new Intl.NumberFormat('pt-BR').format(valor);
}

// ============================================
// FUNÇÕES DE GERAÇÃO DE HTML
// ============================================

/**
 * Gera o HTML para um card de produto
 * @param {Object} produto - Dados do produto
 * @param {boolean} [mostrarEstante=false] - Se deve mostrar estante e nível
 * @param {boolean} [mostrarCheckbox=false] - Se deve mostrar checkbox
 * @param {number} [index=-1] - Índice para o checkbox (se aplicável)
 * @returns {string} - HTML do card do produto
 */
function gerarCardProduto(produto, mostrarEstante = false, mostrarCheckbox = false, index = -1) {
  const corHtml = produto.cor ? `<p><strong>🎨 Cor:</strong> ${produto.cor}</p>` : '';
  const estanteHtml = mostrarEstante && produto.estante ? 
    `<p><strong>📦 Estante:</strong> ${produto.estante}, <strong>Nível:</strong> ${produto.nivel || 'N/A'}</p>` : '';
  const dataHtml = produto.dataLancamento ? 
    `<p><strong>📅 Data de Lançamento:</strong> ${formatarData(produto.dataLancamento)}</p>` : '';
  
  const checkboxHtml = mostrarCheckbox ? 
    `<input type="checkbox" id="checkbox-${index}" class="produto-checkbox" data-id="${produto.id}" 
            data-codigo="${produto.codigo}" data-cor="${produto.cor || ''}" data-modelo="${produto.modelo}">` : '';
  
  return `
    <div class="produto-card" data-id="${produto.id}">
      ${checkboxHtml}
      <p><strong>📌 Código:</strong> ${produto.codigo}</p>
      <p><strong>📝 Descrição:</strong> ${produto.descricao}</p>
      ${corHtml}
      <p><strong>📐 Modelo:</strong> ${produto.modelo}</p>
      <p><strong>📊 Quantidade:</strong> ${formatarNumero(produto.quantidade)}</p>
      ${estanteHtml}
      ${dataHtml}
    </div>
  `;
}

/**
 * Gera o HTML para um card de produto com ações de movimentação
 * @param {Object} produto - Dados do produto
 * @param {boolean} [mostrarEstante=false] - Se deve mostrar estante e nível
 * @returns {string} - HTML do card do produto com botões de ação
 */
function gerarCardProdutoComAcoes(produto, mostrarEstante = false) {
  const corHtml = produto.cor ? `<p><strong>🎨 Cor:</strong> ${produto.cor}</p>` : '';
  const estanteHtml = mostrarEstante && produto.estante ? 
    `<p><strong>📦 Estante:</strong> ${produto.estante}, <strong>Nível:</strong> ${produto.nivel || 'N/A'}</p>` : '';
  const dataHtml = produto.dataLancamento ? 
    `<p><strong>📅 Data de Lançamento:</strong> ${formatarData(produto.dataLancamento)}</p>` : '';
  
  return `
    <div class="produto-card" data-id="${produto.id}" data-codigo="${produto.codigo}" 
         data-descricao="${produto.descricao}" data-quantidade="${produto.quantidade}" 
         ${produto.cor ? `data-cor="${produto.cor}"` : ''} data-modelo="${produto.modelo}"
         ${produto.estante ? `data-estante="${produto.estante}"` : ''} ${produto.nivel ? `data-nivel="${produto.nivel}"` : ''}>
      <p><strong>📌 Código:</strong> ${produto.codigo}</p>
      <p><strong>📝 Descrição:</strong> ${produto.descricao}</p>
      ${corHtml}
      <p><strong>📐 Modelo:</strong> ${produto.modelo}</p>
      <p><strong>📊 Quantidade:</strong> ${formatarNumero(produto.quantidade)}</p>
      ${estanteHtml}
      ${dataHtml}
      <div class="produto-card-actions">
        <button class="button-fofo button-entrada" data-id="${produto.id}" title="Registrar entrada">➕ Entrada</button>
        <button class="button-fofo button-saida" data-id="${produto.id}" title="Registrar saída">➖ Saída</button>
      </div>
    </div>
  `;
}

/**
 * Gera o HTML para um item do histórico
 * @param {Object} item - Item do histórico
 * @returns {string} - HTML do item do histórico
 */
function gerarHistoricoItem(item) {
  const data = new Date(item.data);
  const dataFormatada = data.toLocaleDateString('pt-BR');
  const horaFormatada = data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  
  const tipoMovimentacao = item.tipoMovimentacao === 'entrada' ? '➕' : '➖';
  const classeAcao = item.tipoMovimentacao === 'entrada' ? 'acao-entrada' : 'acao-saida';
  
  return `
    <div class="historico-item">
      <p class="data">📅 ${dataFormatada} às ${horaFormatada}</p>
      <p><strong>📌 Código:</strong> ${item.codigo} - ${item.descricao}</p>
      <p><strong>📊 Movimentação:</strong> <span class="${classeAcao}">${tipoMovimentacao} ${formatarNumero(item.quantidadeMovimentada)}</span></p>
      <p><strong>📈 Quantidade:</strong> ${formatarNumero(item.quantidadeAnterior)} → ${formatarNumero(item.quantidadeNova)}</p>
      ${item.usuario ? `<p><strong>👤 Usuário:</strong> ${item.usuario}</p>` : ''}
      ${item.observacao ? `<p><strong>📝 Observação:</strong> ${item.observacao}</p>` : ''}
    </div>
  `;
}

/**
 * Gera o HTML para um botão de paginação
 * @param {number} pagina - Número da página
 * @param {boolean} ativo - Se a página está ativa
 * @returns {string} - HTML do botão de paginação
 */
function gerarBotaoPaginacao(pagina, ativo = false) {
  const classe = ativo ? 'active' : '';
  return `<button class="${classe}" data-pagina="${pagina}">${pagina}</button>`;
}

// ============================================
// FUNÇÕES DE CÁLCULO
// ============================================

/**
 * Calcula a classe de ocupação com base na porcentagem
 * @param {number} porcentagem - Porcentagem de ocupação (0-100)
 * @returns {string} - Classe CSS para a ocupação
 */
function calcularOcupacaoClasse(porcentagem) {
  if (porcentagem === 0) return 'ocupacao-vazia';
  if (porcentagem <= 50) return 'ocupacao-baixa';
  if (porcentagem <= 80) return 'ocupacao-media';
  return 'ocupacao-alta';
}

/**
 * Calcula a porcentagem de ocupação de uma estante
 * @param {number} quantidadeAtual - Quantidade atual na estante
 * @param {number} [capacidadeMaxima=100] - Capacidade máxima da estante
 * @returns {number} - Porcentagem de ocupação (0-100)
 */
function calcularPorcentagemOcupacao(quantidadeAtual, capacidadeMaxima = 100) {
  return Math.min(100, Math.max(0, (quantidadeAtual / capacidadeMaxima) * 100));
}

// ============================================
// FUNÇÕES DE VALIDAÇÃO
// ============================================

/**
 * Valida se um produto tem todos os campos obrigatórios
 * @param {Object} produto - Dados do produto
 * @param {boolean} [requerEstante=false] - Se requer estante e nível
 * @returns {boolean} - Se o produto é válido
 */
function validarProduto(produto, requerEstante = false) {
  if (!produto.codigo || !produto.descricao || !produto.modelo || !produto.quantidade) {
    return false;
  }
  
  if (requerEstante && (!produto.estante || !produto.nivel)) {
    return false;
  }
  
  return true;
}

/**
 * Valida se uma quantidade é válida (número positivo)
 * @param {number|string} quantidade - Quantidade a validar
 * @returns {boolean} - Se a quantidade é válida
 */
function validarQuantidade(quantidade) {
  if (quantidade === undefined || quantidade === null || quantidade === '') {
    return false;
  }
  
  const num = parseInt(quantidade);
  return !isNaN(num) && num >= 0;
}

// ============================================
// FUNÇÕES DE ORDENAÇÃO
// ============================================

/**
 * Ordena uma lista de produtos por um campo específico
 * @param {Array} produtos - Lista de produtos
 * @param {string} campo - Campo para ordenar
 * @param {boolean} [crescente=true] - Ordenação crescente ou decrescente
 * @returns {Array} - Lista ordenada
 */
function ordenarProdutos(produtos, campo, crescente = true) {
  return [...produtos].sort((a, b) => {
    let valorA = a[campo];
    let valorB = b[campo];
    
    // Tratar datas
    if (campo === 'dataLancamento') {
      if (!valorA) return crescente ? 1 : -1;
      if (!valorB) return crescente ? -1 : 1;
      valorA = new Date(valorA);
      valorB = new Date(valorB);
    }
    
    // Tratar números
    if (typeof valorA === 'number' && typeof valorB === 'number') {
      return crescente ? valorA - valorB : valorB - valorA;
    }
    
    // Tratar strings
    if (typeof valorA === 'string' && typeof valorB === 'string') {
      valorA = valorA.toLowerCase();
      valorB = valorB.toLowerCase();
      return crescente ? valorA.localeCompare(valorB) : valorB.localeCompare(valorA);
    }
    
    return 0;
  });
}

// ============================================
// FUNÇÕES DE FILTRO
// ============================================

/**
 * Filtra uma lista de produtos por um termo de busca
 * @param {Array} produtos - Lista de produtos
 * @param {string} busca - Termo de busca
 * @returns {Array} - Lista filtrada
 */
function filtrarProdutos(produtos, busca) {
  if (!busca) return produtos;
  
  const buscaLower = busca.toLowerCase();
  return produtos.filter(produto => {
    return (
      (produto.codigo && produto.codigo.toLowerCase().includes(buscaLower)) ||
      (produto.descricao && produto.descricao.toLowerCase().includes(buscaLower)) ||
      (produto.cor && produto.cor.toLowerCase().includes(buscaLower)) ||
      (produto.modelo && produto.modelo.toLowerCase().includes(buscaLower)) ||
      (produto.estante && produto.estante.toString().includes(buscaLower)) ||
      (produto.dataLancamento && produto.dataLancamento.includes(buscaLower))
    );
  });
}

// ============================================
// FUNÇÕES DE PAGINAÇÃO
// ============================================

/**
 * Pagina uma lista de itens
 * @param {Array} itens - Lista de itens
 * @param {number} paginaAtual - Página atual (1-based)
 * @param {number} itensPorPagina - Itens por página
 * @returns {Array} - Itens da página atual
 */
function paginarItens(itens, paginaAtual, itensPorPagina) {
  const inicio = (paginaAtual - 1) * itensPorPagina;
  const fim = inicio + itensPorPagina;
  return itens.slice(inicio, fim);
}

/**
 * Calcula o número total de páginas
 * @param {number} totalItens - Total de itens
 * @param {number} itensPorPagina - Itens por página
 * @returns {number} - Número total de páginas
 */
function calcularTotalPaginas(totalItens, itensPorPagina) {
  return Math.ceil(totalItens / itensPorPagina);
}

// ============================================
// EXPORTAR FUNÇÕES
// ============================================

export {
  // Formatação
  formatarData,
  formatarMoeda,
  formatarNumero,
  
  // Geração de HTML
  gerarCardProduto,
  gerarCardProdutoComAcoes,
  gerarHistoricoItem,
  gerarBotaoPaginacao,
  
  // Cálculo
  calcularOcupacaoClasse,
  calcularPorcentagemOcupacao,
  
  // Validação
  validarProduto,
  validarQuantidade,
  
  // Ordenação
  ordenarProdutos,
  
  // Filtro
  filtrarProdutos,
  
  // Paginação
  paginarItens,
  calcularTotalPaginas
};