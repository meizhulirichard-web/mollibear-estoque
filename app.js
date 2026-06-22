/**
 * Sistema de Estoque - Mollibear
 * Arquivo Principal da Aplicação
 */

import {
  formatarData,
  formatarNumero,
  gerarCardProduto,
  gerarCardProdutoComAcoes,
  gerarHistoricoItem,
  gerarBotaoPaginacao,
  validarProduto,
  validarQuantidade,
  ordenarProdutos,
  filtrarProdutos,
  paginarItens,
  calcularTotalPaginas
} from './utils.js';

import {
  inicializarMapa,
  atualizarCoresEstantes,
  adicionarEventosEstantes,
  getEstantePorNumero
} from './mapa.js';

import {
  obterProdutos,
  obterProduto,
  adicionarProduto,
  atualizarProdutoEstoque,
  removerProduto,
  registrarEntrada,
  registrarSaida,
  buscarProdutos,
  buscarProdutosPaginados,
  obterEstatisticas,
  obterOcupacaoEstante,
  obterHistorico,
  obterProdutosPorEstante,
  observarProdutosEmTempoReal
} from './estoque.js';

// ============================================
// VARIÁVEIS GLOBAIS
// ============================================

const SENHA_ADMIN = "mollibear123";
let modoAtual = 'sala_p';
let produtosSelecionados = [];
let paginaAtual = { estoque: 1, modal: 1, historico: 1 };
let unsubscribeFirestore = null;
let mapa = null;

// ============================================
// FUNÇÕES DE AUTENTICAÇÃO
// ============================================

function estaLogado() {
  return localStorage.getItem('mollibear_logado') === 'true';
}

function fazerLogin() {
  const senha = document.getElementById('senhaInput').value;
  const erroLogin = document.getElementById('erroLogin');
  
  if (senha === SENHA_ADMIN) {
    localStorage.setItem('mollibear_logado', 'true');
    fecharModal('loginModal');
    document.getElementById('loginBtn').style.display = 'none';
    document.getElementById('logoutBtn').style.display = 'block';
    document.getElementById('asideCadastro').style.display = 'flex';
    erroLogin.textContent = '';
    
    // Iniciar listener do Firestore
    iniciarListenerFirestore();
    
    // Atualizar contadores
    atualizarContadores();
    
    alert('✅ Login realizado com sucesso!');
  } else {
    erroLogin.textContent = '❌ Senha incorreta!';
  }
}

function fazerLogout() {
  localStorage.removeItem('mollibear_logado');
  document.getElementById('loginBtn').style.display = 'block';
  document.getElementById('logoutBtn').style.display = 'none';
  document.getElementById('asideCadastro').style.display = 'none';
  
  // Parar listener do Firestore
  if (unsubscribeFirestore) {
    unsubscribeFirestore();
    unsubscribeFirestore = null;
  }
  
  alert('🚪 Você saiu do modo administrador.');
}

function abrirModal(modalId) {
  document.getElementById(modalId).classList.add('active');
}

function fecharModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
  produtosSelecionados = [];
}

// ============================================
// FUNÇÕES DE INICIALIZAÇÃO
// ============================================

function inicializarSelectEstantes() {
  const estanteSelect = document.getElementById('estanteSelect');
  estanteSelect.innerHTML = '';
  
  if (modoAtual === 'sala_p') {
    const { getTodasEstantes } = await import('./mapa.js');
    const estantes = getTodasEstantes();
    
    estantes.forEach(estante => {
      const option = document.createElement('option');
      option.value = estante.n;
      option.textContent = `Estante ${estante.n}`;
      estanteSelect.appendChild(option);
    });
    
    document.getElementById('estanteNivelRow').style.display = 'flex';
  } else {
    document.getElementById('estanteNivelRow').style.display = 'none';
  }
}

async function inicializarMapaSVG() {
  const svg = document.querySelector(".mapa");
  if (!svg) return null;
  
  const { inicializarMapa, adicionarEventosEstantes } = await import('./mapa.js');
  mapa = inicializarMapa(svg);
  
  // Adicionar eventos de clique
  adicionarEventosEstantes(mapa, (estanteNumero) => {
    if (modoAtual === 'sala_p') {
      exibirProdutosEstante(estanteNumero);
    }
  });
  
  return mapa;
}

function iniciarListenerFirestore() {
  // Parar listener anterior
  if (unsubscribeFirestore) {
    unsubscribeFirestore();
  }
  
  // Iniciar novo listener
  unsubscribeFirestore = observarProdutosEmTempoReal(modoAtual, async (produtos) => {
    // Atualizar lista de estoque se estiver no modo de estoque
    if (modoAtual !== 'sala_p') {
      await exibirListaEstoque();
    }
    
    // Atualizar cores das estantes no mapa
    if (modoAtual === 'sala_p' && mapa) {
      await atualizarCoresEstantes(mapa, produtos);
    }
    
    // Atualizar modal de produtos cadastrados se estiver aberto
    if (document.getElementById('produtosCadastradosModal').classList.contains('active')) {
      await filtrarProdutosModal();
    }
    
    // Atualizar contadores
    await atualizarContadores();
  });
}

// ============================================
// FUNÇÕES DE TROCA DE MODO
// ============================================

function salvarModoAtual() {
  localStorage.setItem('mollibear_modo_atual', modoAtual);
}

function carregarModoAtual() {
  const modoSalvo = localStorage.getItem('mollibear_modo_atual');
  if (modoSalvo) {
    modoAtual = modoSalvo;
    document.getElementById('modoSelect').value = modoSalvo;
    trocarModo();
  }
}

async function trocarModo() {
  modoAtual = document.getElementById('modoSelect').value;
  salvarModoAtual();
  
  // Parar listener anterior
  if (unsubscribeFirestore) {
    unsubscribeFirestore();
    unsubscribeFirestore = null;
  }
  
  // Atualizar visibilidade dos containers
  if (modoAtual === 'sala_p') {
    document.getElementById('mapaContainer').style.display = 'block';
    document.getElementById('estoqueContainer').style.display = 'none';
    document.getElementById('tituloModalProdutos').textContent = '📋 Produtos Cadastrados (Sala P)';
    document.getElementById('estoqueTitulo').textContent = '🗺️ MAPA DA SALA P';
  } else {
    document.getElementById('mapaContainer').style.display = 'none';
    document.getElementById('estoqueContainer').style.display = 'block';
    
    const nomesEstoque = {
      estoque_g: 'Estoque G',
      estoque_p: 'Estoque P',
      estoque_m: 'Estoque M'
    };
    
    document.getElementById('tituloModalProdutos').textContent = `📋 Produtos Cadastrados (${nomesEstoque[modoAtual] || 'Estoque'})`;
    document.getElementById('estoqueTitulo').textContent = `📦 ${nomesEstoque[modoAtual] || 'Estoque'}`;
    
    // Exibir lista de estoque
    await exibirListaEstoque();
  }
  
  // Atualizar select de estantes
  inicializarSelectEstantes();
  
  // Iniciar listener para o novo modo (se estiver logado)
  if (estaLogado()) {
    iniciarListenerFirestore();
  }
  
  // Atualizar contadores
  await atualizarContadores();
}

// ============================================
// FUNÇÕES DE EXIBIÇÃO
// ============================================

async function atualizarContadores() {
  if (!estaLogado()) return;
  
  const estatisticas = await obterEstatisticas(modoAtual);
  
  document.getElementById('totalProdutos').textContent = formatarNumero(estatisticas.totalProdutos);
  document.getElementById('totalQuantidade').textContent = formatarNumero(estatisticas.totalQuantidade);
  
  if (modoAtual === 'sala_p') {
    document.getElementById('estantesUtilizadas').textContent = estatisticas.estantesUtilizadas;
  } else {
    document.getElementById('estantesUtilizadas').textContent = '0';
  }
}

async function exibirListaEstoque(pagina = 1) {
  paginaAtual.estoque = pagina;
  
  const ordenarPor = document.getElementById('ordenarPor')?.value || 'codigo';
  const busca = document.getElementById('buscaProduto')?.value || '';
  
  const { produtos, total, totalPaginas } = await buscarProdutosPaginados(modoAtual, {
    busca,
    ordenarPor,
    pagina,
    itensPorPagina: 50
  });
  
  const listaEstoque = document.getElementById('listaEstoque');
  listaEstoque.innerHTML = '';
  
  if (produtos.length === 0) {
    listaEstoque.innerHTML = '<p style="text-align: center; color: #d35f5f; font-size: 18px;">🐻 Nenhum produto cadastrado!</p>';
  } else {
    const mostrarEstante = modoAtual === 'sala_p';
    
    produtos.forEach(produto => {
      const cardHtml = gerarCardProdutoComAcoes(produto, mostrarEstante);
      listaEstoque.innerHTML += cardHtml;
    });
    
    // Adicionar eventos aos botões de entrada/saída
    document.querySelectorAll('.button-entrada').forEach(btn => {
      btn.addEventListener('click', () => {
        const produtoId = btn.getAttribute('data-id');
        abrirModalMovimentacao(produtoId, 'entrada');
      });
    });
    
    document.querySelectorAll('.button-saida').forEach(btn => {
      btn.addEventListener('click', () => {
        const produtoId = btn.getAttribute('data-id');
        abrirModalMovimentacao(produtoId, 'saida');
      });
    });
  }
  
  // Atualizar paginação
  atualizarPaginacao('estoquePagination', pagina, totalPaginas, (pag) => {
    exibirListaEstoque(pag);
  });
}

async function exibirProdutosEstante(estanteNumero) {
  const produtos = await obterProdutosPorEstante(modoAtual, estanteNumero);
  const modal = document.getElementById('produtosEstanteModal');
  const listaProdutos = document.getElementById('listaProdutosEstante');
  const titulo = document.getElementById('tituloProdutosEstante');
  const estanteNumeroSpan = document.getElementById('estanteNumero');
  
  titulo.textContent = `📦 Produtos na Estante ${estanteNumero}`;
  estanteNumeroSpan.textContent = estanteNumero;
  listaProdutos.innerHTML = '';
  
  if (produtos.length === 0) {
    listaProdutos.innerHTML = '<p style="text-align: center; color: #d35f5f; font-size: 18px;">🐻 Nenhum produto cadastrado nesta estante!</p>';
  } else {
    produtos.forEach(produto => {
      const cardHtml = gerarCardProduto(produto, true);
      listaProdutos.innerHTML += cardHtml;
    });
  }
  
  abrirModal('produtosEstanteModal');
}

async function filtrarProdutosModal(pagina = 1) {
  paginaAtual.modal = pagina;
  
  const busca = document.getElementById('buscaProdutosModal').value;
  const ordenarPor = document.getElementById('ordenarModalPor').value;
  
  const { produtos, total, totalPaginas } = await buscarProdutosPaginados(modoAtual, {
    busca,
    ordenarPor,
    pagina,
    itensPorPagina: 50
  });
  
  const listaProdutos = document.getElementById('listaProdutosCadastrados');
  listaProdutos.innerHTML = '';
  
  if (produtos.length === 0) {
    listaProdutos.innerHTML = '<p style="text-align: center; color: #d35f5f; font-size: 18px;">🐻 Nenhum produto encontrado!</p>';
  } else {
    const mostrarEstante = modoAtual === 'sala_p';
    
    produtos.forEach((produto, index) => {
      const cardHtml = gerarCardProduto(produto, mostrarEstante, true, index);
      listaProdutos.innerHTML += cardHtml;
    });
    
    // Adicionar eventos às checkboxes
    document.querySelectorAll('.produto-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', function() {
        const produtoId = this.getAttribute('data-id');
        const codigo = this.getAttribute('data-codigo');
        const cor = this.getAttribute('data-cor');
        const modelo = this.getAttribute('data-modelo');
        
        if (this.checked) {
          produtosSelecionados.push({ id: produtoId, codigo, cor, modelo });
        } else {
          produtosSelecionados = produtosSelecionados.filter(p => 
            p.id !== produtoId
          );
        }
      });
    });
  }
  
  // Atualizar paginação
  atualizarPaginacao('modalPagination', pagina, totalPaginas, (pag) => {
    filtrarProdutosModal(pag);
  });
}

async function buscarProduto() {
  const busca = document.getElementById('buscaProduto').value;
  const ordenarPor = document.getElementById('ordenarPor').value;
  
  // Busca automática (sem precisar clicar no botão)
  // Esta função é chamada pelo event listener do input
  await exibirListaEstoque(1);
}

// ============================================
// FUNÇÕES DE PAGINAÇÃO
// ============================================

function atualizarPaginacao(elementId, paginaAtual, totalPaginas, callback) {
  const pagination = document.getElementById(elementId);
  pagination.innerHTML = '';
  
  if (totalPaginas <= 1) return;
  
  // Botão Anterior
  const btnAnterior = document.createElement('button');
  btnAnterior.textContent = '←';
  btnAnterior.disabled = paginaAtual === 1;
  btnAnterior.addEventListener('click', () => {
    if (paginaAtual > 1) callback(paginaAtual - 1);
  });
  pagination.appendChild(btnAnterior);
  
  // Botões de página
  const maxBotoes = 5;
  let inicio = Math.max(1, paginaAtual - Math.floor(maxBotoes / 2));
  let fim = Math.min(totalPaginas, inicio + maxBotoes - 1);
  
  if (fim - inicio + 1 < maxBotoes) {
    inicio = Math.max(1, fim - maxBotoes + 1);
  }
  
  for (let i = inicio; i <= fim; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.classList.toggle('active', i === paginaAtual);
    btn.addEventListener('click', () => callback(i));
    pagination.appendChild(btn);
  }
  
  // Botão Próximo
  const btnProximo = document.createElement('button');
  btnProximo.textContent = '→';
  btnProximo.disabled = paginaAtual === totalPaginas;
  btnProximo.addEventListener('click', () => {
    if (paginaAtual < totalPaginas) callback(paginaAtual + 1);
  });
  pagination.appendChild(btnProximo);
}

// ============================================
// FUNÇÕES DE PRODUTOS
// ============================================

async function salvarProduto() {
  if (!estaLogado()) {
    alert('❌ Você não tem permissão para cadastrar produtos!');
    return;
  }
  
  const codigo = document.getElementById('codigoProduto').value.trim();
  const descricao = document.getElementById('descricaoProduto').value.trim();
  const cor = document.getElementById('corProduto').value.trim();
  const modelo = document.getElementById('modeloProduto').value.trim();
  const quantidade = document.getElementById('quantidadeProduto').value.trim();
  const dataLancamento = document.getElementById('dataLancamento').value;
  const estante = modoAtual === 'sala_p' ? document.getElementById('estanteSelect').value : null;
  const nivel = modoAtual === 'sala_p' ? document.getElementById('nivelSelect').value : null;
  const erroCadastro = document.getElementById('erroCadastro');
  
  // Validações
  if (!validarProduto({ codigo, descricao, modelo, quantidade }, modoAtual === 'sala_p')) {
    erroCadastro.textContent = '❌ Preencha todos os campos obrigatórios!';
    return;
  }
  
  // Verificar se já existe um produto com o mesmo código, cor e modelo
  const produtos = await obterProdutos(modoAtual);
  const produtoJaExiste = produtos.some(p => 
    p.codigo === codigo && 
    p.cor === cor && 
    p.modelo === modelo
  );
  
  if (produtoJaExiste) {
    erroCadastro.textContent = '❌ Este produto (código + cor + modelo) já está cadastrado!';
    return;
  }
  
  // Criar novo produto
  const novoProduto = {
    codigo,
    descricao,
    modelo,
    quantidade: parseInt(quantidade)
  };
  
  if (cor) novoProduto.cor = cor;
  if (dataLancamento) novoProduto.dataLancamento = dataLancamento;
  if (modoAtual === 'sala_p') {
    novoProduto.estante = estante;
    novoProduto.nivel = nivel;
  }
  
  try {
    await adicionarProduto(modoAtual, novoProduto);
    
    alert('💾 Produto salvo com sucesso!');
    erroCadastro.textContent = '';
    
    // Limpar campos
    document.getElementById('codigoProduto').value = '';
    document.getElementById('descricaoProduto').value = '';
    document.getElementById('corProduto').value = '';
    document.getElementById('modeloProduto').value = '';
    document.getElementById('quantidadeProduto').value = '';
    document.getElementById('dataLancamento').value = '';
    
    if (modoAtual === 'sala_p') {
      document.getElementById('estanteSelect').value = '';
      document.getElementById('nivelSelect').value = '';
    }
  } catch (error) {
    console.error("Erro ao salvar produto:", error);
    alert('❌ Erro ao salvar produto: ' + error.message);
  }
}

async function abrirModalMovimentacao(produtoId, tipoMovimentacao) {
  const produto = await obterProduto(modoAtual, produtoId);
  if (!produto) {
    alert('❌ Produto não encontrado!');
    return;
  }
  
  const modal = document.getElementById('movimentacaoModal');
  const infoProduto = document.getElementById('infoProdutoMovimentacao');
  const quantidadeAtualInput = document.getElementById('quantidadeAtualMov');
  const entradaInput = document.getElementById('entradaMov');
  const saidaInput = document.getElementById('saidaMov');
  const resultadoInput = document.getElementById('resultadoMov');
  const observacaoInput = document.getElementById('observacaoMov');
  const confirmarBtn = document.getElementById('confirmarMovimentacaoBtn');
  
  // Limpar campos
  entradaInput.value = '0';
  saidaInput.value = '0';
  observacaoInput.value = '';
  
  // Configurar informações do produto
  infoProduto.innerHTML = `
    <p><strong>📌 Código:</strong> ${produto.codigo}</p>
    <p><strong>📝 Descrição:</strong> ${produto.descricao}</p>
    ${produto.cor ? `<p><strong>🎨 Cor:</strong> ${produto.cor}</p>` : ''}
    <p><strong>📐 Modelo:</strong> ${produto.modelo}</p>
    ${modoAtual === 'sala_p' ? `<p><strong>📦 Estante:</strong> ${produto.estante}, <strong>Nível:</strong> ${produto.nivel}</p>` : ''}
  `;
  
  // Configurar quantidade atual
  quantidadeAtualInput.value = produto.quantidade;
  
  // Configurar título do modal
  document.getElementById('tituloMovimentacao').textContent = 
    tipoMovimentacao === 'entrada' ? '📥 Registrar Entrada' : '📤 Registrar Saída';
  
  // Configurar botão de confirmar
  confirmarBtn.onclick = async () => {
    const entrada = parseInt(entradaInput.value) || 0;
    const saida = parseInt(saidaInput.value) || 0;
    const quantidade = tipoMovimentacao === 'entrada' ? entrada : -saida;
    
    if (quantidade === 0) {
      alert('❌ Informe uma quantidade válida!');
      return;
    }
    
    try {
      const novaQuantidade = tipoMovimentacao === 'entrada' 
        ? await registrarEntrada(modoAtual, produtoId, entrada, 'Administrador', observacaoInput.value)
        : await registrarSaida(modoAtual, produtoId, saida, 'Administrador', observacaoInput.value);
      
      alert(`✅ ${tipoMovimentacao === 'entrada' ? 'Entrada' : 'Saída'} registrada com sucesso! Nova quantidade: ${novaQuantidade}`);
      fecharModal('movimentacaoModal');
    } catch (error) {
      alert('❌ Erro ao registrar movimentação: ' + error.message);
    }
  };
  
  // Atualizar resultado quando entrada/saída mudarem
  const atualizarResultado = () => {
    const entrada = parseInt(entradaInput.value) || 0;
    const saida = parseInt(saidaInput.value) || 0;
    const quantidadeAtual = parseInt(quantidadeAtualInput.value) || 0;
    const resultado = tipoMovimentacao === 'entrada' 
      ? quantidadeAtual + entrada
      : quantidadeAtual - saida;
    
    resultadoInput.value = resultado;
  };
  
  entradaInput.addEventListener('input', atualizarResultado);
  saidaInput.addEventListener('input', atualizarResultado);
  
  // Atualizar resultado inicial
  atualizarResultado();
  
  // Abrir modal
  abrirModal('movimentacaoModal');
}

// ============================================
// FUNÇÕES DE SELEÇÃO E EXCLUSÃO
// ============================================

async function selecionarTodos() {
  if (!estaLogado()) {
    alert('❌ Você não tem permissão para selecionar produtos!');
    return;
  }
  
  const busca = document.getElementById('buscaProdutosModal').value;
  const ordenarPor = document.getElementById('ordenarModalPor').value;
  
  const { produtos } = await buscarProdutosPaginados(modoAtual, {
    busca,
    ordenarPor,
    itensPorPagina: 10000 // Buscar todos para seleção
  });
  
  produtosSelecionados = [...produtos];
  
  // Marcar todas as checkboxes
  document.querySelectorAll('.produto-checkbox').forEach(checkbox => {
    checkbox.checked = true;
  });
  
  alert(`✅ ${produtos.length} produtos selecionados!`);
}

async function excluirSelecionados() {
  if (!estaLogado()) {
    alert('❌ Você não tem permissão para excluir produtos!');
    return;
  }
  
  if (produtosSelecionados.length === 0) {
    alert('❌ Nenhum produto selecionado!');
    return;
  }
  
  if (confirm(`🐻 Tem certeza que deseja excluir ${produtosSelecionados.length} produtos selecionados?`)) {
    try {
      for (const produto of produtosSelecionados) {
        await removerProduto(modoAtual, produto.id);
      }
      
      produtosSelecionados = [];
      await filtrarProdutosModal();
      alert(`🗑️ ${produtosSelecionados.length} produtos excluídos com sucesso!`);
    } catch (error) {
      console.error("Erro ao excluir produtos:", error);
      alert('❌ Erro ao excluir produtos: ' + error.message);
    }
  }
}

// ============================================
// FUNÇÕES DE HISTÓRICO
// ============================================

async function exibirHistorico(pagina = 1) {
  paginaAtual.historico = pagina;
  
  const dataInicio = document.getElementById('historicoDataInicio').value;
  const dataFim = document.getElementById('historicoDataFim').value;
  
  const { historico, total, totalPaginas } = await obterHistorico(modoAtual, {
    dataInicio: dataInicio ? new Date(dataInicio) : null,
    dataFim: dataFim ? new Date(dataFim) : null,
    pagina,
    itensPorPagina: 50
  });
  
  const listaHistorico = document.getElementById('listaHistorico');
  listaHistorico.innerHTML = '';
  
  if (historico.length === 0) {
    listaHistorico.innerHTML = '<p style="text-align: center; color: #d35f5f; font-size: 18px;">🐻 Nenhum registro de histórico encontrado!</p>';
  } else {
    historico.forEach(item => {
      const itemHtml = gerarHistoricoItem(item);
      listaHistorico.innerHTML += itemHtml;
    });
  }
  
  // Atualizar paginação
  atualizarPaginacao('historicoPagination', pagina, totalPaginas, (pag) => {
    exibirHistorico(pag);
  });
}

// ============================================
// FUNÇÕES DE INICIALIZAÇÃO DA APLICAÇÃO
// ============================================

async function inicializarApp() {
  // Carregar modo atual
  carregarModoAtual();
  
  // Inicializar select de estantes
  inicializarSelectEstantes();
  
  // Inicializar mapa SVG
  await inicializarMapaSVG();
  
  // Verificar se está logado
  if (estaLogado()) {
    document.getElementById('loginBtn').style.display = 'none';
    document.getElementById('logoutBtn').style.display = 'block';
    document.getElementById('asideCadastro').style.display = 'flex';
    
    // Iniciar listener do Firestore
    iniciarListenerFirestore();
    
    // Atualizar contadores
    await atualizarContadores();
    
    // Exibir lista de estoque se não for Sala P
    if (modoAtual !== 'sala_p') {
      await exibirListaEstoque();
    }
  } else {
    document.getElementById('loginBtn').style.display = 'block';
    document.getElementById('logoutBtn').style.display = 'none';
    document.getElementById('asideCadastro').style.display = 'none';
  }
  
  // Adicionar event listeners
  adicionarEventListeners();
}

function adicionarEventListeners() {
  // Botões de login/logout
  document.getElementById('loginBtn')?.addEventListener('click', () => abrirModal('loginModal'));
  document.getElementById('logoutBtn')?.addEventListener('click', fazerLogout);
  document.getElementById('entrarBtn')?.addEventListener('click', fazerLogin);
  document.querySelector('.close-login')?.addEventListener('click', () => fecharModal('loginModal'));
  
  // Botões de modo
  document.getElementById('modoSelect')?.addEventListener('change', trocarModo);
  
  // Botões de ação
  document.getElementById('refreshBtn')?.addEventListener('click', async () => {
    await atualizarContadores();
    if (modoAtual !== 'sala_p') {
      await exibirListaEstoque();
    }
    alert('🔄 Dados atualizados com sucesso!');
  });
  
  document.getElementById('produtosCadastradosBtn')?.addEventListener('click', async () => {
    await filtrarProdutosModal();
    abrirModal('produtosCadastradosModal');
  });
  
  document.getElementById('historicoBtn')?.addEventListener('click', async () => {
    await exibirHistorico();
    abrirModal('historicoModal');
  });
  
  // Botões de modal
  document.querySelector('.close')?.addEventListener('click', () => fecharModal('produtosCadastradosModal'));
  document.querySelector('.close-estante')?.addEventListener('click', () => fecharModal('produtosEstanteModal'));
  document.querySelector('.close-movimentacao')?.addEventListener('click', () => fecharModal('movimentacaoModal'));
  document.querySelector('.close-historico')?.addEventListener('click', () => fecharModal('historicoModal'));
  
  // Botões de ação nos modais
  document.getElementById('salvarProdutoBtn')?.addEventListener('click', salvarProduto);
  document.getElementById('buscarNoModalBtn')?.addEventListener('click', () => filtrarProdutosModal(1));
  document.getElementById('selecionarTodosBtn')?.addEventListener('click', selecionarTodos);
  document.getElementById('excluirSelecionadosBtn')?.addEventListener('click', excluirSelecionados);
  document.getElementById('filtrarHistoricoBtn')?.addEventListener('click', () => exibirHistorico(1));
  
  // Ordenação
  document.getElementById('ordenarPor')?.addEventListener('change', () => exibirListaEstoque(1));
  document.getElementById('ordenarModalPor')?.addEventListener('change', () => filtrarProdutosModal(1));
  
  // Busca automática
  document.getElementById('buscaProduto')?.addEventListener('input', () => {
    // Debounce para evitar muitas chamadas
    clearTimeout(window.buscaTimeout);
    window.buscaTimeout = setTimeout(() => {
      exibirListaEstoque(1);
    }, 500);
  });
  
  document.getElementById('buscaProdutosModal')?.addEventListener('input', () => {
    clearTimeout(window.buscaModalTimeout);
    window.buscaModalTimeout = setTimeout(() => {
      filtrarProdutosModal(1);
    }, 500);
  });
  
  // Fechar modais ao clicar fora
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        fecharModal(modal.id);
      }
    });
  });
}

// ============================================
// INICIALIZAR APLICAÇÃO
// ============================================

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', inicializarApp);