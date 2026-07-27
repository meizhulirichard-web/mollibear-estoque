<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sistema de Estoque - Mollibear 🧸</title>
  
  <!-- Favicon (Link GitHub) -->
  <link rel="icon" href="https://github.com/meizhulirichard-web/mollibear-estoque/blob/main/mollibear%20logo.png?raw=true" type="image/png">
  
  <!-- Meta Tags para PWA -->
  <meta name="theme-color" content="#fff8f0">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="Mollibear Estoque">
  <meta name="description" content="Sistema de Estoque da Mollibear">
  
  <!-- Ícones para iOS (Link GitHub) -->
  <link rel="apple-touch-icon" href="https://github.com/meizhulirichard-web/mollibear-estoque/blob/main/mollibear%20logo.png?raw=true">
  <link rel="apple-touch-icon" sizes="180x180" href="https://github.com/meizhulirichard-web/mollibear-estoque/blob/main/mollibear%20logo.png?raw=true">
  <link rel="apple-touch-icon" sizes="152x152" href="https://github.com/meizhulirichard-web/mollibear-estoque/blob/main/mollibear%20logo.png?raw=true">
  <link rel="apple-touch-icon" sizes="167x167" href="https://github.com/meizhulirichard-web/mollibear-estoque/blob/main/mollibear%20logo.png?raw=true">
  
  <!-- Manifest para PWA (inline) -->
  <link rel="manifest" href="data:application/json;charset=utf-8,
  {
    \"name\": \"Mollibear Estoque\",
    \"short_name\": \"Mollibear\",
    \"description\": \"Sistema de Estoque da Mollibear\",
    \"start_url\": \"/\",
    \"display\": \"standalone\",
    \"background_color\": \"#fff8f0\",
    \"theme_color\": \"#ff9a8b\",
    \"icons\": [
      {
        \"src\": \"https://github.com/meizhulirichard-web/mollibear-estoque/blob/main/mollibear%20logo.png?raw=true\",
        \"sizes\": \"192x192\",
        \"type\": \"image/png\"
      },
      {
        \"src\": \"https://github.com/meizhulirichard-web/mollibear-estoque/blob/main/mollibear%20logo.png?raw=true\",
        \"sizes\": \"512x512\",
        \"type\": \"image/png\"
      }
    ]
  }">

  <!-- Firebase SDK v10 -->
  <script type="module">
    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
    import { 
      getFirestore, 
      collection, 
      doc, 
      getDoc, 
      setDoc, 
      onSnapshot,
      runTransaction,
      addDoc,
      serverTimestamp,
      query,
      where,
      getDocs 
    } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

    const firebaseConfig = {
      apiKey: "AIzaSyD3j7NdARKWfcyQcaG5dX6VAghuTfCMX68",
      authDomain: "mollibear-estoque.firebaseapp.com",
      projectId: "mollibear-estoque",
      storageBucket: "mollibear-estoque.firebasestorage.app",
      messagingSenderId: "168767505828",
      appId: "1:168767505828:web:50410e7841162296572d31",
      measurementId: "G-QM20K794M8"
    };

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    // Função para migrar dados da estrutura antiga para a nova (CORRIGIDA)
    async function migrarDadosAntigos() {
      const tipos = ['sala_p', 'estoque_g', 'estoque_p', 'estoque_m'];
      let totalMigrados = 0;
      
      for (const tipo of tipos) {
        try {
          const docRef = doc(db, "estoque", `produtos_${tipo}`);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const dadosAntigos = docSnap.data();
            const produtos = dadosAntigos.produtos || [];
            
            for (const produto of produtos) {
              const produtoRef = doc(db, `estoque_${tipo}`, produto.codigo);
              const produtoSnap = await getDoc(produtoRef);
              
              if (!produtoSnap.exists()) {
                await setDoc(produtoRef, produto);
                totalMigrados++;
              }
            }
            console.log(`✅ Migrados ${produtos.length} produtos de ${tipo}`);
          }
        } catch (error) {
          console.error(`❌ Erro ao migrar dados de ${tipo}:`, error);
        }
      }
      return totalMigrados;
    }

    async function carregarProdutos(tipo) {
      try {
        const produtosCol = collection(db, `estoque_${tipo}`);
        const querySnapshot = await getDocs(produtosCol);
        const produtos = [];
        querySnapshot.forEach((doc) => {
          if (!doc.data().excluido) {
            produtos.push({ id: doc.id, ...doc.data() });
          }
        });
        return produtos;
      } catch (error) {
        console.error("Erro ao carregar produtos:", error);
        return [];
      }
    }

    async function salvarProduto(produto, tipo) {
      try {
        const produtoRef = doc(db, `estoque_${tipo}`, produto.codigo);
        await setDoc(produtoRef, produto);
      } catch (error) {
        console.error("Erro ao salvar produto:", error);
      }
    }

    async function excluirProduto(codigo, tipo) {
      try {
        const produtoRef = doc(db, `estoque_${tipo}`, codigo);
        await setDoc(produtoRef, { excluido: true, dataExclusao: serverTimestamp() }, { merge: true });
      } catch (error) {
        console.error("Erro ao excluir produto:", error);
      }
    }

    async function atualizarQuantidadeTransacao(codigo, novaQuantidade, tipo, usuario = "Administrador") {
      try {
        const produtoRef = doc(db, `estoque_${tipo}`, codigo);
        await runTransaction(db, async (transaction) => {
          const docSnap = await transaction.get(produtoRef);
          if (!docSnap.exists()) throw "Produto não encontrado!";
          const produtoAtual = docSnap.data();
          const quantidadeAnterior = parseInt(produtoAtual.quantidade || 0);
          transaction.update(produtoRef, { quantidade: novaQuantidade });
          const historicoRef = collection(db, "historico");
          transaction.add(historicoRef, {
            data: serverTimestamp(),
            codigo: codigo,
            descricao: produtoAtual.descricao || "N/A",
            cor: produtoAtual.cor || "N/A",
            modelo: produtoAtual.modelo || "N/A",
            quantidadeAnterior: quantidadeAnterior,
            quantidadeNova: novaQuantidade,
            tipo: "Atualização de Quantidade",
            usuario: usuario,
            modo: tipo
          });
        });
        return true;
      } catch (error) {
        console.error("Erro na transação:", error);
        return false;
      }
    }

    function observarMudancas(tipo, callback) {
      const produtosCol = collection(db, `estoque_${tipo}`);
      return onSnapshot(produtosCol, (querySnapshot) => {
        const produtos = [];
        querySnapshot.forEach((doc) => {
          if (!doc.data().excluido) {
            produtos.push({ id: doc.id, ...doc.data() });
          }
        });
        callback(produtos);
      });
    }

    async function carregarHistorico() {
      try {
        const historicoCol = collection(db, "historico");
        const q = query(historicoCol, where("data", ">=", new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)));
        const querySnapshot = await getDocs(q);
        const historico = [];
        querySnapshot.forEach((doc) => {
          historico.push({ id: doc.id, ...doc.data() });
        });
        return historico.sort((a, b) => b.data.toDate() - a.data.toDate());
      } catch (error) {
        console.error("Erro ao carregar histórico:", error);
        return [];
      }
    }

    async function adicionarAoHistorico(operacao, usuario = "Administrador") {
      try {
        const historicoRef = collection(db, "historico");
        await addDoc(historicoRef, {
          data: serverTimestamp(),
          ...operacao,
          usuario: usuario
        });
      } catch (error) {
        console.error("Erro ao adicionar ao histórico:", error);
      }
    }

    window.carregarProdutos = carregarProdutos;
    window.salvarProduto = salvarProduto;
    window.excluirProduto = excluirProduto;
    window.observarMudancas = observarMudancas;
    window.atualizarQuantidadeTransacao = atualizarQuantidadeTransacao;
    window.carregarHistorico = carregarHistorico;
    window.adicionarAoHistorico = adicionarAoHistorico;
    window.migrarDadosAntigos = migrarDadosAntigos;
  </script>
  
  <!-- Font Awesome para ícones -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>

<div class="app">

  <header>
    <div class="header-content">
      <div class="logo-title">
        <img src="https://github.com/meizhulirichard-web/mollibear-estoque/blob/main/mollibear%20logo.png?raw=true" alt="Logo Mollibear" class="logo-img">
        <div class="title-text">
          <h1>🧸 Mollibear Estoque</h1>
          <p>Sistema de Gestão de Produtos</p>
        </div>
      </div>
      
      <div class="header-actions">
        <div class="contadores">
          <div class="contador">
            <i class="fas fa-box"></i>
            <div class="contador-info">
              <span>Produtos</span>
              <strong id="totalProdutos">0</strong>
            </div>
          </div>
          <div class="contador">
            <i class="fas fa-chart-bar"></i>
            <div class="contador-info">
              <span>Quantidade</span>
              <strong id="quantidadeTotal">0</strong>
            </div>
          </div>
          <div class="contador" id="contadorEstantes">
            <i class="fas fa-map-marked-alt"></i>
            <div class="contador-info">
              <span>Estantes</span>
              <strong id="estantesUtilizadas">0/51</strong>
            </div>
          </div>
        </div>
        
        <div class="user-actions">
          <select id="modoSelect" class="select-fofo">
            <option value="sala_p">🗺️ Sala P</option>
            <option value="estoque_g">📦 Estoque G</option>
            <option value="estoque_p">📦 Estoque P</option>
            <option value="estoque_m">📦 Estoque M</option>
          </select>
          <button id="refreshBtn" class="btn btn-secondary" title="Atualizar dados">
            <i class="fas fa-sync-alt"></i> Atualizar
          </button>
          <button id="produtosCadastradosBtn" class="btn btn-primary">
            <i class="fas fa-list"></i> Todos os Produtos
          </button>
          <button id="verHistoricoBtn" class="btn btn-info">
            <i class="fas fa-history"></i> Histórico
          </button>
          <button id="loginBtn" class="btn btn-login" style="display: none;">
            <i class="fas fa-lock"></i> Login
          </button>
          <button id="logoutBtn" class="btn btn-logout" style="display: none;">
            <i class="fas fa-sign-out-alt"></i> Sair
          </button>
        </div>
      </div>
    </div>
    
    <!-- Notificação de Migração -->
    <div id="notificacaoMigracao" class="notificacao" style="display: none;">
      <p><i class="fas fa-exchange-alt"></i> <strong>Migrando dados...</strong> <span id="contadorMigracao">0</span> produtos</p>
      <div class="barra-progresso">
        <div id="progressoMigracao" class="progresso"></div>
      </div>
    </div>
  </header>

  <div class="content">

    <aside id="asideCadastro" class="sidebar">
      <div class="card">
        <div class="card-header">
          <h2><i class="fas fa-plus-circle"></i> Cadastrar Produto</h2>
        </div>
        <div class="card-body">
          <div class="form-group">
            <label><i class="fas fa-barcode"></i> Código *</label>
            <input type="text" id="codigoProduto" class="input-fofo" placeholder="Ex: TB001">
          </div>
          
          <div class="form-group">
            <label><i class="fas fa-tag"></i> Descrição *</label>
            <input type="text" id="descricaoProduto" class="input-fofo" placeholder="Ex: Ursinho de Pelúcia">
          </div>
          
          <div class="form-group">
            <label><i class="fas fa-palette"></i> Cor</label>
            <input type="text" id="corProduto" class="input-fofo" placeholder="Ex: Marrom, Branco">
          </div>
          
          <div class="form-group">
            <label><i class="fas fa-cube"></i> Modelo *</label>
            <input type="text" id="modeloProduto" class="input-fofo" placeholder="Ex: Grande, Médio">
          </div>
          
          <div class="form-group">
            <label><i class="fas fa-hashtag"></i> Quantidade *</label>
            <input type="number" id="quantidadeProduto" class="input-fofo" min="0" placeholder="0">
          </div>
          
          <div class="form-group">
            <label><i class="fas fa-calendar-alt"></i> Data de Lançamento</label>
            <input type="date" id="dataLancamento" class="input-fofo">
          </div>
          
          <div class="form-row" id="estanteNivelRow">
            <div class="form-group">
              <label><i class="fas fa-map-marker-alt"></i> Estante *</label>
              <select id="estanteSelect" class="input-fofo"></select>
            </div>
            <div class="form-group">
              <label><i class="fas fa-layer-group"></i> Nível *</label>
              <select id="nivelSelect" class="input-fofo">
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
                <option value="E">E</option>
              </select>
            </div>
          </div>
          
          <button id="salvarProdutoBtn" class="btn btn-success btn-block">
            <i class="fas fa-save"></i> Salvar Produto
          </button>
          <p id="erroCadastro" class="erro-message"></p>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h2><i class="fas fa-search"></i> Buscar Produto</h2>
        </div>
        <div class="card-body">
          <input type="text" id="buscaProduto" class="input-fofo" placeholder="Busque por código, descrição, cor, modelo...">
          <div class="result" id="resultadoBusca"></div>
        </div>
      </div>
    </aside>

    <main class="main-content">
      <div id="conteudoDinamico">
        <!-- Mapa da Sala P -->
        <div id="mapaContainer" style="display: none;">
          <div class="section-header">
            <h2><i class="fas fa-map"></i> Mapa da Sala P</h2>
            <p class="section-description">🚪 <strong>Porta</strong> está localizada à esquerda da loja.</p>
          </div>
          <div class="mapa-container">
            <svg id="mapa" viewBox="0 0 1200 800" class="mapa"></svg>
          </div>
          <div class="rodape">
            <i class="fas fa-lightbulb"></i> Clique em uma estante para ver os produtos!
          </div>
          <div class="legenda-mapa">
            <div class="legenda-item"><span class="cor-verde"></span> 0-25% (0-1 produto)</div>
            <div class="legenda-item"><span class="cor-amarelo"></span> 25-75% (2-3 produtos)</div>
            <div class="legenda-item"><span class="cor-vermelho"></span> 75-100% (4 produtos)</div>
            <div class="legenda-item"><span class="cor-vazio"></span> Vazia</div>
          </div>
        </div>

        <!-- Lista do Estoque -->
        <div id="estoqueContainer" style="display: none;">
          <div class="section-header">
            <h2 id="estoqueTitulo"><i class="fas fa-boxes"></i> Estoque</h2>
            <p class="section-description">Lista de todos os produtos em estoque.</p>
          </div>
          <div class="estoque-list-container">
            <div id="listaEstoque"></div>
            <div class="paginacao" id="paginacao"></div>
          </div>
        </div>
      </div>
    </main>

    <!-- Modal para Produtos Cadastrados -->
    <div id="produtosCadastradosModal" class="modal" style="display: none;">
      <div class="modal-content">
        <div class="modal-header">
          <h2 id="tituloModalProdutos"><i class="fas fa-list"></i> Todos os Produtos</h2>
          <span class="close">&times;</span>
        </div>
        <div class="modal-body">
          <div class="modal-filters">
            <input type="text" id="buscaProdutosModal" class="input-fofo" placeholder="Busque por código, descrição, cor, modelo..." style="flex: 1;">
            <select id="ordenarModalPor" class="select-fofo">
              <option value="codigo">Ordenar por Código</option>
              <option value="descricao">Ordenar por Nome</option>
              <option value="quantidade">Ordenar por Quantidade</option>
              <option value="data">Ordenar por Data</option>
            </select>
            <button id="selecionarTodosBtn" class="btn btn-info">
              <i class="fas fa-check-circle"></i> Selecionar Todos
            </button>
            <button id="excluirSelecionadosBtn" class="btn btn-danger">
              <i class="fas fa-trash"></i> Excluir Selecionados
            </button>
          </div>
          <div id="listaProdutosCadastrados"></div>
          <div class="paginacao" id="paginacaoModal"></div>
        </div>
      </div>
    </div>

    <!-- Modal para Produtos por Estante -->
    <div id="produtosEstanteModal" class="modal" style="display: none;">
      <div class="modal-content">
        <div class="modal-header">
          <h2 id="tituloProdutosEstante"><i class="fas fa-box-open"></i> Produtos na Estante</h2>
          <span class="close-estante">&times;</span>
        </div>
        <div class="modal-body">
          <div id="listaProdutosEstante"></div>
        </div>
      </div>
    </div>

    <!-- Modal de Login -->
    <div id="loginModal" class="modal" style="display: none;">
      <div class="modal-content" style="width: 90%; max-width: 400px;">
        <div class="modal-header">
          <h2><i class="fas fa-lock"></i> Login de Administrador</h2>
          <span class="close-login">&times;</span>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label><i class="fas fa-key"></i> Senha:</label>
            <input type="password" id="senhaInput" class="input-fofo" placeholder="Digite a senha">
          </div>
          <button id="entrarBtn" class="btn btn-primary btn-block">
            <i class="fas fa-sign-in-alt"></i> Entrar
          </button>
          <p id="erroLogin" class="erro-message"></p>
        </div>
      </div>
    </div>

    <!-- Modal para Histórico -->
    <div id="historicoModal" class="modal" style="display: none;">
      <div class="modal-content" style="width: 90%; max-width: 900px; max-height: 85%;">
        <div class="modal-header">
          <h2><i class="fas fa-history"></i> Histórico de Movimentações</h2>
          <span class="close-historico">&times;</span>
        </div>
        <div class="modal-body">
          <div class="modal-filters">
            <input type="text" id="buscaHistorico" class="input-fofo" placeholder="Busque por código, descrição ou usuário..." style="flex: 1;">
            <button id="buscarHistoricoBtn" class="btn btn-primary">
              <i class="fas fa-search"></i> Buscar
            </button>
          </div>
          <div id="listaHistorico" style="max-height: 500px; overflow-y: auto;"></div>
        </div>
      </div>
    </div>

  </div>

</div>

<script>
// Senha de administrador
const SENHA_ADMIN = "mollibear123";

// Variáveis globais
let produtosSelecionados = [];
let modoAtual = localStorage.getItem('mollibear_modo_atual') || 'sala_p';
let unsubscribeFirestore = null;
let produtosAtuais = [];
let paginaAtual = 1;
const itensPorPagina = 50;
let usuarioLogado = "";
let migracaoConcluida = localStorage.getItem('migracao_concluida') === 'true';

// Função para verificar se o usuário está logado
function estaLogado() {
  return localStorage.getItem('mollibear_logado') === 'true';
}

// Função para fazer login
function fazerLogin() {
  const senha = document.getElementById('senhaInput').value;
  const erroLogin = document.getElementById('erroLogin');
  
  if (senha === SENHA_ADMIN) {
    localStorage.setItem('mollibear_logado', 'true');
    usuarioLogado = "Administrador";
    document.getElementById('loginModal').style.display = 'none';
    document.getElementById('loginBtn').style.display = 'none';
    document.getElementById('logoutBtn').style.display = 'flex';
    document.getElementById('asideCadastro').style.display = 'flex';
    erroLogin.textContent = '';
    
    if (!migracaoConcluida) {
      executarMigracao();
    } else {
      iniciarListenerFirestore();
    }
  } else {
    erroLogin.textContent = '❌ Senha incorreta!';
  }
}

// Função para executar a migração
async function executarMigracao() {
  const notificacao = document.getElementById('notificacaoMigracao');
  const contador = document.getElementById('contadorMigracao');
  const progresso = document.getElementById('progressoMigracao');
  
  if (!notificacao) {
    const divNotificacao = document.createElement('div');
    divNotificacao.id = 'notificacaoMigracao';
    divNotificacao.className = 'notificacao';
    divNotificacao.innerHTML = `
      <p><i class="fas fa-exchange-alt"></i> <strong>Migrando dados...</strong> <span id="contadorMigracao">0</span> produtos</p>
      <div class="barra-progresso">
        <div id="progressoMigracao" class="progresso"></div>
      </div>
    `;
    document.querySelector('header').insertBefore(divNotificacao, document.querySelector('.header-actions'));
  }
  
  try {
    const totalMigrados = await window.migrarDadosAntigos();
    if (document.getElementById('contadorMigracao')) {
      document.getElementById('contadorMigracao').textContent = totalMigrados;
    }
    if (document.getElementById('progressoMigracao')) {
      document.getElementById('progressoMigracao').style.width = '100%';
    }
    migracaoConcluida = true;
    localStorage.setItem('migracao_concluida', 'true');
    setTimeout(() => {
      const notificacao = document.getElementById('notificacaoMigracao');
      if (notificacao) notificacao.style.display = 'none';
    }, 2000);
    iniciarListenerFirestore();
  } catch (error) {
    console.error("Erro na migração:", error);
    const notificacao = document.getElementById('notificacaoMigracao');
    if (notificacao) notificacao.style.display = 'none';
  }
}

// Função para fazer logout
function fazerLogout() {
  localStorage.removeItem('mollibear_logado');
  usuarioLogado = "";
  document.getElementById('loginBtn').style.display = 'flex';
  document.getElementById('logoutBtn').style.display = 'none';
  document.getElementById('asideCadastro').style.display = 'none';
  if (unsubscribeFirestore) {
    unsubscribeFirestore();
    unsubscribeFirestore = null;
  }
}

// Função para abrir o modal de login
function abrirModalLogin() {
  document.getElementById('loginModal').style.display = 'block';
  document.getElementById('senhaInput').value = '';
  document.getElementById('erroLogin').textContent = '';
}

// Função para fechar o modal de login
function fecharModalLogin() {
  document.getElementById('loginModal').style.display = 'none';
}

// Função para formatar data
function formatarData(data) {
  if (!data) return "Não informado";
  if (data instanceof Object && data.toDate) {
    const date = data.toDate();
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano}`;
}

// Função para calcular porcentagem de ocupação de uma estante
function calcularPorcentagemOcupacao(estanteNumero) {
  const produtosEstante = produtosAtuais.filter(p => p.estante == estanteNumero);
  return (produtosEstante.length / 4) * 100;
}

// Função para determinar a cor da estante
function getCorEstante(estanteNumero) {
  const porcentagem = calcularPorcentagemOcupacao(estanteNumero);
  if (porcentagem === 0) return "#f8f9fa";
  if (porcentagem <= 25) return "#d4edda";
  if (porcentagem <= 75) return "#fff3cd";
  return "#f8d7da";
}

// Função para gerar ID único para o input de quantidade
function gerarIdInput(codigo) {
  return `quantidade-${codigo}`;
}

// Função para gerar card de produto
function gerarCardProduto(produto, mostrarEstanteNivel = true, mostrarCheckbox = false, index = null) {
  const idInput = gerarIdInput(produto.codigo);
  
  return `
    <div class="produto-card">
      ${mostrarCheckbox ? `
        <input type="checkbox" id="checkbox-${index}" class="checkbox-produto" 
          ${produtosSelecionados.some(p => p.codigo === produto.codigo && p.cor === produto.cor && p.modelo === produto.modelo) ? 'checked' : ''}>
      ` : ''}
      
      <div class="produto-info">
        <div class="produto-header">
          <div class="produto-codigo">
            <i class="fas fa-barcode"></i> <strong>${produto.codigo}</strong>
          </div>
          <div class="produto-descricao">
            <i class="fas fa-tag"></i> ${produto.descricao}
          </div>
        </div>
        
        <div class="produto-details">
          ${produto.cor ? `<div class="produto-detail"><i class="fas fa-palette"></i> <strong>Cor:</strong> ${produto.cor}</div>` : ''}
          <div class="produto-detail"><i class="fas fa-cube"></i> <strong>Modelo:</strong> ${produto.modelo}</div>
          ${mostrarEstanteNivel && produto.estante ? `
            <div class="produto-detail">
              <i class="fas fa-map-marker-alt"></i> <strong>Estante:</strong> ${produto.estante}, <strong>Nível:</strong> ${produto.nivel}
            </div>
          ` : ''}
          ${produto.dataLancamento ? `<div class="produto-detail"><i class="fas fa-calendar-alt"></i> <strong>Data:</strong> ${formatarData(produto.dataLancamento)}</div>` : ''}
        </div>
        
        <div class="produto-quantidade">
          <div class="quantidade-label">
            <i class="fas fa-hashtag"></i> <strong>Quantidade:</strong>
          </div>
          <div class="quantidade-input-group">
            <input type="number" id="${idInput}" value="${produto.quantidade || 0}" 
              class="input-quantidade" min="0">
            <button class="btn btn-save-quantidade" onclick="salvarQuantidade('${produto.codigo}', '${idInput}', '${modoAtual}')" title="Salvar">
              <i class="fas fa-check"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Função para salvar a quantidade editada
async function salvarQuantidade(codigo, inputId, tipo) {
  if (!estaLogado()) {
    alert('❌ Você não tem permissão para alterar quantidades!');
    return;
  }
  
  const novaQuantidade = parseInt(document.getElementById(inputId).value);
  
  if (isNaN(novaQuantidade) || novaQuantidade < 0) {
    alert('❌ Insira uma quantidade válida (número positivo)!');
    const produtos = await window.carregarProdutos(tipo);
    const produto = produtos.find(p => p.codigo === codigo);
    if (produto) document.getElementById(inputId).value = produto.quantidade || 0;
    return;
  }
  
  const sucesso = await window.atualizarQuantidadeTransacao(codigo, novaQuantidade, tipo, usuarioLogado);
  if (!sucesso) {
    alert('❌ Erro ao atualizar quantidade. Tente novamente.');
    const produtos = await window.carregarProdutos(tipo);
    const produto = produtos.find(p => p.codigo === codigo);
    if (produto) document.getElementById(inputId).value = produto.quantidade || 0;
  }
}

// Função para atualizar contadores
function atualizarContadores() {
  const totalProdutos = produtosAtuais.length;
  const quantidadeTotal = produtosAtuais.reduce((sum, p) => sum + parseInt(p.quantidade || 0), 0);
  
  document.getElementById('totalProdutos').textContent = totalProdutos.toLocaleString('pt-BR');
  document.getElementById('quantidadeTotal').textContent = quantidadeTotal.toLocaleString('pt-BR');
  
  if (modoAtual === 'sala_p') {
    const estantesOcupadas = new Set(produtosAtuais.filter(p => p.estante).map(p => p.estante)).size;
    document.getElementById('estantesUtilizadas').textContent = `${estantesOcupadas}/51`;
    document.getElementById('contadorEstantes').style.display = 'flex';
  } else {
    document.getElementById('contadorEstantes').style.display = 'none';
  }
}

// Função para ordenar produtos
function ordenarProdutos(produtos, por) {
  return [...produtos].sort((a, b) => {
    switch (por) {
      case 'codigo': return a.codigo.localeCompare(b.codigo);
      case 'descricao': return a.descricao.localeCompare(b.descricao);
      case 'quantidade': return (b.quantidade || 0) - (a.quantidade || 0);
      case 'data':
        if (!a.dataLancamento && !b.dataLancamento) return 0;
        if (!a.dataLancamento) return 1;
        if (!b.dataLancamento) return -1;
        return new Date(b.dataLancamento) - new Date(a.dataLancamento);
      default: return 0;
    }
  });
}

// Função para paginar produtos
function paginarProdutos(produtos, pagina = 1) {
  const start = (pagina - 1) * itensPorPagina;
  const end = start + itensPorPagina;
  return produtos.slice(start, end);
}

// Função para gerar paginação
function gerarPaginacao(produtos, containerId, callback) {
  const container = document.getElementById(containerId);
  const totalPaginas = Math.ceil(produtos.length / itensPorPagina);
  
  if (totalPaginas <= 1) {
    container.innerHTML = '';
    return;
  }
  
  let html = '<div class="paginacao-group">';
  
  if (paginaAtual > 1) {
    html += `<button class="btn btn-paginacao" onclick="${callback}(${paginaAtual - 1})"><i class="fas fa-chevron-left"></i> Anterior</button>`;
  }
  
  for (let i = 1; i <= totalPaginas; i++) {
    html += `<button class="btn btn-paginacao ${i === paginaAtual ? 'active' : ''}" onclick="${callback}(${i})">${i}</button>`;
  }
  
  if (paginaAtual < totalPaginas) {
    html += `<button class="btn btn-paginacao" onclick="${callback}(${paginaAtual + 1})">Próximo <i class="fas fa-chevron-right"></i></button>`;
  }
  
  html += '</div>';
  container.innerHTML = html;
}

// Função para preencher o select de estantes
function preencherSelectEstantes() {
  const estanteSelect = document.getElementById('estanteSelect');
  estanteSelect.innerHTML = '';
  
  if (modoAtual === 'sala_p') {
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

// Função para trocar entre Sala P e Estoques
async function trocarModo() {
  modoAtual = document.getElementById('modoSelect').value;
  localStorage.setItem('mollibear_modo_atual', modoAtual);
  
  if (unsubscribeFirestore) {
    unsubscribeFirestore();
    unsubscribeFirestore = null;
  }
  
  if (modoAtual === 'sala_p') {
    document.getElementById('mapaContainer').style.display = 'block';
    document.getElementById('estoqueContainer').style.display = 'none';
    document.getElementById('tituloModalProdutos').innerHTML = '<i class="fas fa-list"></i> Todos os Produtos (Sala P)';
    document.getElementById('estoqueTitulo').innerHTML = '<i class="fas fa-map"></i> Mapa da Sala P';
    
    atualizarCoresEstantes();
    document.getElementById('contadorEstantes').style.display = 'flex';
    document.getElementById('buscaProduto').placeholder = "Busque por código, descrição, cor, modelo ou estante...";
    document.getElementById('buscaProdutosModal').placeholder = "Busque por código, descrição, cor, modelo ou estante...";
  } else {
    document.getElementById('mapaContainer').style.display = 'none';
    document.getElementById('estoqueContainer').style.display = 'block';
    
    const nomesEstoque = {
      estoque_g: 'Estoque G',
      estoque_p: 'Estoque P',
      estoque_m: 'Estoque M'
    };
    document.getElementById('tituloModalProdutos').innerHTML = `<i class="fas fa-list"></i> Todos os Produtos (${nomesEstoque[modoAtual] || 'Estoque'})`;
    document.getElementById('estoqueTitulo').innerHTML = `<i class="fas fa-boxes"></i> ${nomesEstoque[modoAtual] || 'Estoque'}`;
    
    document.getElementById('contadorEstantes').style.display = 'none';
    document.getElementById('buscaProduto').placeholder = "Busque por código, descrição, cor, modelo...";
    document.getElementById('buscaProdutosModal').placeholder = "Busque por código, descrição, cor, modelo...";
    
    await exibirListaEstoque();
  }
  
  preencherSelectEstantes();
  
  if (estaLogado()) {
    if (!migracaoConcluida) {
      executarMigracao();
    } else {
      iniciarListenerFirestore();
    }
  }
  
  if (document.getElementById('produtosCadastradosModal').style.display === 'block') {
    await filtrarProdutosModal();
  }
}

// Função para exibir a lista de produtos do Estoque
async function exibirListaEstoque(pagina = 1) {
  paginaAtual = pagina;
  const produtos = ordenarProdutos(produtosAtuais, document.getElementById('ordenarPor').value);
  const produtosPaginados = paginarProdutos(produtos, pagina);
  const listaEstoque = document.getElementById('listaEstoque');
  
  listaEstoque.innerHTML = '';
  
  if (produtosPaginados.length === 0) {
    listaEstoque.innerHTML = '<div class="empty-message"><i class="fas fa-box-open"></i> Nenhum produto cadastrado!</div>';
  } else {
    const mostrarEstante = modoAtual === 'sala_p';
    produtosPaginados.forEach((produto) => {
      listaEstoque.innerHTML += gerarCardProduto(produto, mostrarEstante);
    });
  }
  
  gerarPaginacao(produtos, 'paginacao', (pag) => {
    paginaAtual = pag;
    exibirListaEstoque(pag);
  });
}

// Função para verificar se o nível da estante já tem um produto
async function verificarNivelOcupado(estante, nivel) {
  return produtosAtuais.some(produto => produto.estante == estante && produto.nivel === nivel);
}

// Função para exibir os produtos de uma estante em um modal
async function exibirProdutosEstante(estanteNumero) {
  const produtosEstante = produtosAtuais.filter(produto => produto.estante == estanteNumero);
  const modal = document.getElementById('produtosEstanteModal');
  const listaProdutos = document.getElementById('listaProdutosEstante');
  const titulo = document.getElementById('tituloProdutosEstante');
  
  titulo.innerHTML = `<i class="fas fa-box-open"></i> Produtos na Estante ${estanteNumero} (Sala P)`;
  listaProdutos.innerHTML = '';
  
  if (produtosEstante.length === 0) {
    listaProdutos.innerHTML = '<div class="empty-message"><i class="fas fa-box-open"></i> Nenhum produto nesta estante!</div>';
  } else {
    produtosEstante.forEach((produto) => {
      listaProdutos.innerHTML += gerarCardProduto(produto, true);
    });
  }
  
  modal.style.display = 'block';
}

// Função para fechar o modal de estante
function fecharModalEstante() {
  document.getElementById('produtosEstanteModal').style.display = 'none';
}

// Função para filtrar produtos no modal
async function filtrarProdutosModal(pagina = 1) {
  paginaAtual = pagina;
  const busca = document.getElementById('buscaProdutosModal').value.toLowerCase();
  const ordenarPor = document.getElementById('ordenarModalPor').value;
  
  const produtos = await window.carregarProdutos(modoAtual);
  
  const produtosFiltrados = produtos.filter(produto => 
    produto.codigo.toLowerCase().includes(busca) || 
    produto.descricao.toLowerCase().includes(busca) || 
    (produto.cor && produto.cor.toLowerCase().includes(busca)) ||
    produto.modelo.toLowerCase().includes(busca) ||
    (modoAtual === 'sala_p' && produto.estante && produto.estante.toString().includes(busca)) ||
    (produto.dataLancamento && produto.dataLancamento.includes(busca))
  );
  
  const produtosOrdenados = ordenarProdutos(produtosFiltrados, ordenarPor);
  const produtosPaginados = paginarProdutos(produtosOrdenados, pagina);
  const listaProdutos = document.getElementById('listaProdutosCadastrados');
  
  listaProdutos.innerHTML = '';
  
  if (produtosPaginados.length === 0) {
    listaProdutos.innerHTML = '<div class="empty-message"><i class="fas fa-search"></i> Nenhum produto encontrado!</div>';
  } else {
    const mostrarEstante = modoAtual === 'sala_p';
    produtosPaginados.forEach((produto, index) => {
      const globalIndex = produtosOrdenados.indexOf(produto);
      listaProdutos.innerHTML += gerarCardProduto(produto, mostrarEstante, true, globalIndex);
    });
  }
  
  gerarPaginacao(produtosOrdenados, 'paginacaoModal', (pag) => {
    paginaAtual = pag;
    filtrarProdutosModal(pag);
  });
}

// Função para selecionar todos os produtos
async function selecionarTodos() {
  if (!estaLogado()) {
    alert('❌ Você não tem permissão para selecionar produtos!');
    return;
  }
  
  const busca = document.getElementById('buscaProdutosModal').value.toLowerCase();
  const produtos = await window.carregarProdutos(modoAtual);
  const produtosFiltrados = produtos.filter(produto => 
    produto.codigo.toLowerCase().includes(busca) || 
    produto.descricao.toLowerCase().includes(busca) || 
    (produto.cor && produto.cor.toLowerCase().includes(busca)) ||
    produto.modelo.toLowerCase().includes(busca) ||
    (modoAtual === 'sala_p' && produto.estante && produto.estante.toString().includes(busca)) ||
    (produto.dataLancamento && produto.dataLancamento.includes(busca))
  );
  
  produtosSelecionados = [...produtosFiltrados];
  
  const checkboxes = document.querySelectorAll('.checkbox-produto');
  checkboxes.forEach(checkbox => {
    const index = checkbox.id.replace('checkbox-', '');
    const produto = produtosFiltrados[index];
    if (produto) checkbox.checked = true;
  });
  
  alert(`✅ ${produtosFiltrados.length} produtos selecionados!`);
}

// Função para excluir produtos selecionados
async function excluirSelecionados() {
  if (!estaLogado()) {
    alert('❌ Você não tem permissão para excluir produtos!');
    return;
  }
  
  if (produtosSelecionados.length === 0) {
    alert('❌ Nenhum produto selecionado!');
    return;
  }
  
  if (confirm(`🐻 Tem certeza que deseja excluir ${produtosSelecionados.length} produtos?`)) {
    for (const produto of produtosSelecionados) {
      await window.excluirProduto(produto.codigo, modoAtual);
      await window.adicionarAoHistorico({
        tipo: "Exclusão",
        codigo: produto.codigo,
        descricao: produto.descricao || "N/A",
        cor: produto.cor || "N/A",
        modelo: produto.modelo || "N/A",
        quantidadeAnterior: produto.quantidade || 0,
        quantidadeNova: 0
      }, usuarioLogado);
    }
    produtosSelecionados = [];
    await filtrarProdutosModal();
    alert(`🗑️ ${produtosSelecionados.length} produtos excluídos!`);
  }
}

// Função para exibir todos os produtos cadastrados
async function exibirProdutosCadastrados() {
  const modal = document.getElementById('produtosCadastradosModal');
  modal.style.display = 'block';
  produtosSelecionados = [];
  await filtrarProdutosModal();
}

// Função para fechar o modal
function fecharModal() {
  document.getElementById('produtosCadastradosModal').style.display = 'none';
  produtosSelecionados = [];
}

// Função para salvar um novo produto
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
  
  if (!codigo || !descricao || !modelo || !quantidade) {
    erroCadastro.textContent = '❌ Preencha todos os campos obrigatórios!';
    return;
  }
  
  if (modoAtual === 'sala_p' && (!estante || !nivel)) {
    erroCadastro.textContent = '❌ Preencha estante e nível!';
    return;
  }
  
  const produtos = await window.carregarProdutos(modoAtual);
  const produtoJaExiste = produtos.some(produto => produto.codigo === codigo);
  
  if (produtoJaExiste) {
    erroCadastro.textContent = '❌ Este código já está cadastrado!';
    return;
  }
  
  if (modoAtual === 'sala_p') {
    const nivelOcupado = await verificarNivelOcupado(estante, nivel);
    if (nivelOcupado) {
      if (!confirm(`⚠️ Já existe um produto no nível ${nivel} da estante ${estante}. Deseja cadastrar mesmo assim?`)) {
        return;
      }
    }
  }
  
  const novoProduto = { codigo, descricao, modelo, quantidade };
  if (cor) novoProduto.cor = cor;
  if (dataLancamento) novoProduto.dataLancamento = dataLancamento;
  if (modoAtual === 'sala_p') {
    novoProduto.estante = estante;
    novoProduto.nivel = nivel;
  }
  
  await window.salvarProduto(novoProduto, modoAtual);
  await window.adicionarAoHistorico({
    tipo: "Cadastro",
    codigo: codigo,
    descricao: descricao,
    cor: cor || "N/A",
    modelo: modelo,
    quantidadeAnterior: 0,
    quantidadeNova: parseInt(quantidade)
  }, usuarioLogado);
  
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
}

// Função para buscar um produto (automática)
async function buscarProduto() {
  const busca = document.getElementById('buscaProduto').value.toLowerCase();
  const produtos = await window.carregarProdutos(modoAtual);
  const resultadoBusca = document.getElementById('resultadoBusca');
  
  const produtosEncontrados = produtos.filter(produto => 
    produto.codigo.toLowerCase().includes(busca) || 
    produto.descricao.toLowerCase().includes(busca) || 
    (produto.cor && produto.cor.toLowerCase().includes(busca)) ||
    produto.modelo.toLowerCase().includes(busca) ||
    (modoAtual === 'sala_p' && produto.estante && produto.estante.toString().includes(busca)) ||
    (produto.dataLancamento && produto.dataLancamento.includes(busca))
  );
  
  if (produtosEncontrados.length === 0) {
    resultadoBusca.innerHTML = '<div class="empty-message"><i class="fas fa-search"></i> Nenhum produto encontrado!</div>';
  } else {
    resultadoBusca.innerHTML = '';
    const mostrarEstante = modoAtual === 'sala_p';
    produtosEncontrados.forEach(produto => {
      resultadoBusca.innerHTML += gerarCardProduto(produto, mostrarEstante);
    });
  }
}

// Função para iniciar o listener do Firestore
function iniciarListenerFirestore() {
  if (unsubscribeFirestore) {
    unsubscribeFirestore();
  }
  
  unsubscribeFirestore = window.observarMudancas(modoAtual, async (produtos) => {
    produtosAtuais = produtos;
    atualizarContadores();
    
    if (modoAtual !== 'sala_p') {
      await exibirListaEstoque();
    } else {
      atualizarCoresEstantes();
    }
    
    if (document.getElementById('produtosCadastradosModal').style.display === 'block') {
      await filtrarProdutosModal();
    }
  });
}

// Função para exibir histórico
async function exibirHistorico() {
  const modal = document.getElementById('historicoModal');
  const listaHistorico = document.getElementById('listaHistorico');
  
  const historico = await window.carregarHistorico();
  
  if (historico.length === 0) {
    listaHistorico.innerHTML = '<div class="empty-message"><i class="fas fa-history"></i> Nenhum registro no histórico!</div>';
  } else {
    listaHistorico.innerHTML = `
      <table class="historico-table">
        <thead>
          <tr>
            <th>Data</th>
            <th>Tipo</th>
            <th>Código</th>
            <th>Descrição</th>
            <th>Qtd. Anterior</th>
            <th>Qtd. Nova</th>
            <th>Usuário</th>
          </tr>
        </thead>
        <tbody>
          ${historico.map(item => `
            <tr>
              <td>${formatarData(item.data)}</td>
              <td><span class="tipo-badge ${item.tipo === 'Cadastro' ? 'cadastro' : item.tipo === 'Atualização de Quantidade' ? 'atualizacao' : 'exclusao'}">${item.tipo}</span></td>
              <td>${item.codigo}</td>
              <td>${item.descricao}</td>
              <td>${item.quantidadeAnterior}</td>
              <td>${item.quantidadeNova}</td>
              <td>${item.usuario}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }
  
  modal.style.display = 'block';
}

// Função para fechar o modal de histórico
function fecharModalHistorico() {
  document.getElementById('historicoModal').style.display = 'none';
}

// Função para buscar no histórico
async function buscarNoHistorico() {
  const busca = document.getElementById('buscaHistorico').value.toLowerCase();
  const historico = await window.carregarHistorico();
  const listaHistorico = document.getElementById('listaHistorico');
  
  const historicoFiltrado = historico.filter(item => 
    item.codigo.toLowerCase().includes(busca) || 
    item.descricao.toLowerCase().includes(busca) || 
    item.usuario.toLowerCase().includes(busca) ||
    item.tipo.toLowerCase().includes(busca)
  );
  
  if (historicoFiltrado.length === 0) {
    listaHistorico.innerHTML = '<div class="empty-message"><i class="fas fa-search"></i> Nenhum registro encontrado!</div>';
  } else {
    listaHistorico.innerHTML = `
      <table class="historico-table">
        <thead>
          <tr>
            <th>Data</th>
            <th>Tipo</th>
            <th>Código</th>
            <th>Descrição</th>
            <th>Qtd. Anterior</th>
            <th>Qtd. Nova</th>
            <th>Usuário</th>
          </tr>
        </thead>
        <tbody>
          ${historicoFiltrado.map(item => `
            <tr>
              <td>${formatarData(item.data)}</td>
              <td><span class="tipo-badge ${item.tipo === 'Cadastro' ? 'cadastro' : item.tipo === 'Atualização de Quantidade' ? 'atualizacao' : 'exclusao'}">${item.tipo}</span></td>
              <td>${item.codigo}</td>
              <td>${item.descricao}</td>
              <td>${item.quantidadeAnterior}</td>
              <td>${item.quantidadeNova}</td>
              <td>${item.usuario}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }
}

// Dados das estantes (apenas para Sala P)
const estantes = [
  {n:1, x:20, y:600, w:50, h:80},
  {n:2, x:20, y:510, w:50, h:80},
  {n:3, x:20, y:420, w:50, h:80},
  {n:4, x:20, y:330, w:50, h:80},
  {n:5, x:20, y:240, w:50, h:80},
  {n:6, x:20, y:150, w:50, h:80},
  {n:7, x:100, y:20, w:100, h:40},
  {n:8, x:210, y:20, w:100, h:40},
  {n:9, x:700, y:20, w:100, h:40},
  {n:10, x:810, y:20, w:100, h:40},
  {n:11, x:920, y:20, w:100, h:40},
  {n:12, x:1030, y:20, w:100, h:40},
  {n:16, x:1120, y:600, w:50, h:80},
  {n:15, x:1120, y:445, w:50, h:80},
  {n:14, x:1120, y:365, w:50, h:80},
  {n:13, x:1120, y:285, w:50, h:80},
  {n:17, x:750, y:700, w:100, h:40},
  {n:18, x:640, y:700, w:100, h:40},
  {n:19, x:530, y:700, w:100, h:40},
  {n:20, x:420, y:700, w:100, h:40},
  {n:21, x:310, y:700, w:100, h:40},
  {n:22, x:410, y:550, w:100, h:40},
  {n:23, x:520, y:550, w:100, h:40},
  {n:24, x:630, y:550, w:100, h:40},
  {n:25, x:740, y:550, w:100, h:40},
  {n:26, x:850, y:550, w:100, h:40},
  {n:27, x:410, y:600, w:100, h:40},
  {n:28, x:520, y:600, w:100, h:40},
  {n:29, x:630, y:600, w:100, h:40},
  {n:30, x:740, y:600, w:100, h:40},
  {n:31, x:850, y:600, w:100, h:40},
  {n:32, x:410, y:400, w:100, h:40},
  {n:33, x:520, y:400, w:100, h:40},
  {n:34, x:630, y:400, w:100, h:40},
  {n:35, x:740, y:400, w:100, h:40},
  {n:36, x:850, y:400, w:100, h:40},
  {n:37, x:320, y:400, w:40, h:100},
  {n:38, x:410, y:450, w:100, h:40},
  {n:39, x:520, y:450, w:100, h:40},
  {n:40, x:630, y:450, w:100, h:40},
  {n:41, x:740, y:450, w:100, h:40},
  {n:42, x:850, y:450, w:100, h:40},
  {n:43, x:500, y:200, w:100, h:40},
  {n:44, x:610, y:200, w:100, h:40},
  {n:45, x:720, y:200, w:100, h:40},
  {n:46, x:830, y:200, w:100, h:40},
  {n:47, x:500, y:250, w:100, h:40},
  {n:48, x:610, y:250, w:100, h:40},
  {n:49, x:720, y:250, w:100, h:40},
  {n:50, x:830, y:250, w:100, h:40},
  {n:51, x:960, y:200, w:40, h:100}
];

// Inicializar o SVG e os eventos
document.addEventListener('DOMContentLoaded', async () => {
  const svg = document.querySelector(".mapa");
  const NS = "http://www.w3.org/2000/svg";
  
  // Carregar o modo atual do localStorage
  carregarModoAtual();
  
  // Definir o display inicial com base no modoAtual
  if (modoAtual === 'sala_p') {
    document.getElementById('mapaContainer').style.display = 'block';
    document.getElementById('estoqueContainer').style.display = 'none';
  } else {
    document.getElementById('mapaContainer').style.display = 'none';
    document.getElementById('estoqueContainer').style.display = 'block';
  }
  
  atualizarCoresEstantes();

  // Adicionar eventos aos botões
  document.getElementById('salvarProdutoBtn').addEventListener('click', salvarProduto);
  document.getElementById('buscaProduto').addEventListener('input', buscarProduto);
  document.getElementById('produtosCadastradosBtn').addEventListener('click', exibirProdutosCadastrados);
  document.querySelector('.close').addEventListener('click', fecharModal);
  document.getElementById('buscaProdutosModal').addEventListener('input', () => filtrarProdutosModal(1));
  document.getElementById('ordenarPor').addEventListener('change', () => {
    if (modoAtual !== 'sala_p') exibirListaEstoque(1);
  });
  document.getElementById('ordenarModalPor').addEventListener('change', () => filtrarProdutosModal(1));
  document.querySelector('.close-estante').addEventListener('click', fecharModalEstante);
  document.getElementById('selecionarTodosBtn').addEventListener('click', selecionarTodos);
  document.getElementById('excluirSelecionadosBtn').addEventListener('click', excluirSelecionados);
  document.getElementById('loginBtn').addEventListener('click', abrirModalLogin);
  document.getElementById('logoutBtn').addEventListener('click', fazerLogout);
  document.getElementById('entrarBtn').addEventListener('click', fazerLogin);
  document.querySelector('.close-login').addEventListener('click', fecharModalLogin);
  document.getElementById('modoSelect').addEventListener('change', trocarModo);
  document.getElementById('refreshBtn').addEventListener('click', () => {
    if (modoAtual !== 'sala_p') exibirListaEstoque();
    else atualizarCoresEstantes();
  });
  document.getElementById('verHistoricoBtn').addEventListener('click', exibirHistorico);
  document.querySelector('.close-historico').addEventListener('click', fecharModalHistorico);
  document.getElementById('buscarHistoricoBtn').addEventListener('click', buscarNoHistorico);

  // Inicializar o select de estantes
  preencherSelectEstantes();

  // Verificar se o usuário já está logado
  if (estaLogado()) {
    document.getElementById('loginBtn').style.display = 'none';
    document.getElementById('logoutBtn').style.display = 'flex';
    document.getElementById('asideCadastro').style.display = 'flex';
    usuarioLogado = "Administrador";
    
    if (!migracaoConcluida) {
      executarMigracao();
    } else {
      iniciarListenerFirestore();
    }
  } else {
    document.getElementById('loginBtn').style.display = 'flex';
    document.getElementById('logoutBtn').style.display = 'none';
    document.getElementById('asideCadastro').style.display = 'none';
  }
});

// Função para atualizar cores das estantes no mapa
function atualizarCoresEstantes() {
  const svg = document.querySelector(".mapa");
  const NS = "http://www.w3.org/2000/svg";
  
  svg.innerHTML = '';
  
  // Adicionar porta
  const porta = document.createElementNS(NS, "rect");
  porta.setAttribute("x", 10);
  porta.setAttribute("y", 700);
  porta.setAttribute("width", 30);
  porta.setAttribute("height", 60);
  porta.setAttribute("fill", "#6c757d");
  porta.setAttribute("stroke", "#495057");
  porta.setAttribute("stroke-width", "2");
  svg.appendChild(porta);
  
  const textoPorta = document.createElementNS(NS, "text");
  textoPorta.setAttribute("x", 25);
  textoPorta.setAttribute("y", 730);
  textoPorta.setAttribute("text-anchor", "middle");
  textoPorta.setAttribute("fill", "#fff");
  textoPorta.setAttribute("font-size", "12");
  textoPorta.setAttribute("font-weight", "bold");
  textoPorta.setAttribute("transform", "rotate(-90, 25, 730)");
  textoPorta.textContent = "PORTAS";
  svg.appendChild(textoPorta);
  
  // Adicionar estantes com cores baseadas na ocupação
  estantes.forEach(estante => {
    const cor = getCorEstante(estante.n);
    
    const rect = document.createElementNS(NS, "rect");
    rect.setAttribute("x", estante.x);
    rect.setAttribute("y", estante.y);
    rect.setAttribute("width", estante.w);
    rect.setAttribute("height", estante.h);
    rect.setAttribute("rx", 5);
    rect.setAttribute("fill", cor);
    rect.setAttribute("class", "estante");
    rect.setAttribute("stroke", "#dee2e6");
    rect.setAttribute("stroke-width", "1");
    rect.setAttribute("data-estante", estante.n);
    
    rect.addEventListener("click", () => {
      if (modoAtual === 'sala_p') {
        exibirProdutosEstante(estante.n);
      }
    });
    
    svg.appendChild(rect);
    
    const texto = document.createElementNS(NS, "text");
    texto.setAttribute("x", estante.x + estante.w / 2);
    texto.setAttribute("y", estante.y + estante.h / 2);
    texto.setAttribute("class", "numero");
    texto.setAttribute("text-anchor", "middle");
    texto.setAttribute("dominant-baseline", "middle");
    texto.setAttribute("fill", "#495057");
    texto.setAttribute("font-size", "16");
    texto.setAttribute("font-weight", "bold");
    texto.textContent = estante.n;
    
    svg.appendChild(texto);
  });
}
</script>

<style>
  :root {
    --primary: #ff9a8b;
    --primary-dark: #f77062;
    --secondary: #4ecdc4;
    --success: #95e1d3;
    --info: #a8e6cf;
    --warning: #f3d34a;
    --danger: #ff6b6b;
    --light: #f8f9fa;
    --dark: #343a40;
    --white: #fff;
    --gray: #6c757d;
    --gray-light: #e9ecef;
    --gray-dark: #495057;
    --beige: #fff8f0;
    --shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
    --border-radius: 8px;
    --border-radius-lg: 12px;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    margin: 0;
    padding: 0;
    background-color: var(--beige);
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    font-size: 16px;
    color: var(--dark);
  }

  .app {
    max-width: 1400px;
    margin: 0 auto;
    padding: 20px;
  }

  /* Header */
  header {
    background: var(--white);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow);
    margin-bottom: 20px;
    padding: 20px;
  }

  .header-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .logo-title {
    display: flex;
    align-items: center;
    gap: 15px;
  }

  .logo-img {
    height: 70px;
    width: auto;
    border-radius: 50%;
    border: 3px solid var(--primary);
    box-shadow: var(--shadow);
  }

  .title-text h1 {
    font-size: 28px;
    color: var(--primary);
    margin-bottom: 5px;
  }

  .title-text p {
    color: var(--gray);
    font-size: 16px;
  }

  .header-actions {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .contadores {
    display: flex;
    justify-content: center;
    gap: 20px;
    flex-wrap: wrap;
  }

  .contador {
    display: flex;
    align-items: center;
    gap: 10px;
    background: var(--light);
    border-radius: var(--border-radius);
    padding: 12px 16px;
    box-shadow: var(--shadow);
    min-width: 150px;
  }

  .contador i {
    color: var(--primary);
    font-size: 20px;
  }

  .contador-info {
    display: flex;
    flex-direction: column;
  }

  .contador-info span {
    font-size: 14px;
    color: var(--gray);
  }

  .contador-info strong {
    font-size: 18px;
    color: var(--dark);
  }

  .user-actions {
    display: flex;
    justify-content: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  /* Botões */
  .btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    border: none;
    border-radius: var(--border-radius);
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: var(--shadow);
  }

  .btn i {
    font-size: 16px;
  }

  .btn-primary {
    background: var(--primary);
    color: var(--white);
  }

  .btn-primary:hover {
    background: var(--primary-dark);
    transform: translateY(-2px);
  }

  .btn-secondary {
    background: var(--light);
    color: var(--dark);
    border: 1px solid var(--gray-light);
  }

  .btn-secondary:hover {
    background: var(--gray-light);
    transform: translateY(-2px);
  }

  .btn-success {
    background: var(--success);
    color: var(--dark);
  }

  .btn-success:hover {
    background: #78d6c6;
    transform: translateY(-2px);
  }

  .btn-info {
    background: var(--info);
    color: var(--dark);
  }

  .btn-info:hover {
    background: #88d8c0;
    transform: translateY(-2px);
  }

  .btn-danger {
    background: var(--danger);
    color: var(--white);
  }

  .btn-danger:hover {
    background: #ff5252;
    transform: translateY(-2px);
  }

  .btn-login {
    background: var(--warning);
    color: var(--dark);
  }

  .btn-login:hover {
    background: #e6c240;
    transform: translateY(-2px);
  }

  .btn-logout {
    background: var(--gray);
    color: var(--white);
  }

  .btn-logout:hover {
    background: var(--gray-dark);
    transform: translateY(-2px);
  }

  .btn-block {
    width: 100%;
  }

  .btn-paginacao {
    background: var(--white);
    color: var(--primary);
    border: 1px solid var(--primary);
    padding: 8px 12px;
    min-width: 40px;
  }

  .btn-paginacao:hover {
    background: var(--primary);
    color: var(--white);
  }

  .btn-paginacao.active {
    background: var(--primary);
    color: var(--white);
  }

  .btn-save-quantidade {
    background: var(--success);
    color: var(--dark);
    padding: 6px 10px;
    border-radius: var(--border-radius);
    border: none;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-save-quantidade:hover {
    background: #78d6c6;
    transform: scale(1.1);
  }

  /* Select */
  .select-fofo {
    padding: 10px 16px;
    border: 2px solid var(--gray-light);
    border-radius: var(--border-radius);
    background: var(--white);
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    font-size: 16px;
    color: var(--dark);
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: var(--shadow);
  }

  .select-fofo:focus {
    border-color: var(--primary);
    outline: none;
  }

  /* Inputs */
  .input-fofo {
    width: 100%;
    padding: 12px 16px;
    border: 2px solid var(--gray-light);
    border-radius: var(--border-radius);
    background: var(--white);
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    font-size: 16px;
    color: var(--dark);
    transition: all 0.3s;
    box-shadow: var(--shadow);
  }

  .input-fofo:focus {
    border-color: var(--primary);
    outline: none;
  }

  .input-quantidade {
    width: 80px;
    padding: 8px 12px;
    border: 2px solid var(--gray-light);
    border-radius: var(--border-radius);
    background: var(--white);
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    font-size: 16px;
    color: var(--dark);
    text-align: center;
    transition: all 0.3s;
  }

  .input-quantidade:focus {
    border-color: var(--primary);
    outline: none;
  }

  /* Content */
  .content {
    display: flex;
    gap: 20px;
  }

  /* Sidebar */
  .sidebar {
    width: 100%;
    max-width: 350px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  /* Main Content */
  .main-content {
    flex: 1;
  }

  /* Cards */
  .card {
    background: var(--white);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow);
    overflow: hidden;
  }

  .card-header {
    background: linear-gradient(135deg, var(--primary), var(--primary-dark));
    color: var(--white);
    padding: 15px 20px;
  }

  .card-header h2 {
    margin: 0;
    font-size: 18px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .card-body {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  /* Form Groups */
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .form-group label {
    font-size: 14px;
    font-weight: 600;
    color: var(--dark);
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .form-group label i {
    color: var(--primary);
  }

  .form-row {
    display: flex;
    gap: 15px;
  }

  .form-row .form-group {
    flex: 1;
  }

  /* Produto Card */
  .produto-card {
    background: var(--white);
    border: 1px solid var(--gray-light);
    border-radius: var(--border-radius);
    padding: 15px;
    margin-bottom: 15px;
    box-shadow: var(--shadow);
    transition: all 0.3s;
    position: relative;
  }

  .produto-card:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-2px);
  }

  .checkbox-produto {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 20px;
    height: 20px;
    cursor: pointer;
  }

  .produto-info {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .produto-header {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .produto-codigo {
    font-size: 16px;
    color: var(--primary);
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .produto-descricao {
    font-size: 16px;
    color: var(--dark);
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .produto-details {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .produto-detail {
    font-size: 14px;
    color: var(--gray);
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .produto-quantidade {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid var(--gray-light);
  }

  .quantidade-label {
    font-size: 14px;
    color: var(--dark);
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .quantidade-input-group {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* Section Header */
  .section-header {
    margin-bottom: 20px;
  }

  .section-header h2 {
    font-size: 24px;
    color: var(--primary);
    margin-bottom: 5px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .section-description {
    color: var(--gray);
    font-size: 16px;
    text-align: center;
  }

  /* Mapa */
  .mapa-container {
    width: 100%;
    overflow-x: auto;
    border: 1px solid var(--gray-light);
    border-radius: var(--border-radius);
    background: var(--white);
    box-shadow: var(--shadow);
    margin-bottom: 20px;
  }

  .mapa {
    width: 100%;
    height: auto;
    min-width: 800px;
    display: block;
  }

  .rodape {
    text-align: center;
    color: var(--gray);
    font-size: 16px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .rodape i {
    color: var(--primary);
  }

  /* Legenda do Mapa */
  .legenda-mapa {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 15px;
    flex-wrap: wrap;
  }

  .legenda-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: var(--dark);
  }

  .cor-verde, .cor-amarelo, .cor-vermelho, .cor-vazio {
    display: inline-block;
    width: 20px;
    height: 20px;
    border-radius: 4px;
    border: 1px solid var(--gray-light);
  }

  .cor-verde { background-color: var(--success); }
  .cor-amarelo { background-color: var(--warning); }
  .cor-vermelho { background-color: var(--danger); }
  .cor-vazio { background-color: var(--light); }

  /* Estoque List Container */
  .estoque-list-container {
    background: var(--white);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow);
    padding: 20px;
  }

  /* Pagination */
  .paginacao-group {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-top: 20px;
    flex-wrap: wrap;
  }

  /* Empty Message */
  .empty-message {
    text-align: center;
    padding: 20px;
    color: var(--gray);
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .empty-message i {
    color: var(--primary);
    font-size: 20px;
  }

  /* Error Message */
  .erro-message {
    color: var(--danger);
    font-size: 16px;
    text-align: center;
    margin-top: 10px;
  }

  /* Modal */
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal-content {
    background: var(--white);
    border-radius: var(--border-radius-lg);
    width: 90%;
    max-width: 800px;
    max-height: 85%;
    overflow: auto;
    box-shadow: var(--shadow-lg);
  }

  .modal-header {
    background: linear-gradient(135deg, var(--primary), var(--primary-dark));
    color: var(--white);
    padding: 15px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;
  }

  .modal-header h2 {
    margin: 0;
    font-size: 20px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .close, .close-estante, .close-login, .close-historico {
    font-size: 24px;
    cursor: pointer;
    color: var(--white);
    transition: all 0.3s;
  }

  .close:hover, .close-estante:hover, .close-login:hover, .close-historico:hover {
    color: var(--light);
    transform: scale(1.2);
  }

  .modal-body {
    padding: 20px;
  }

  .modal-filters {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }

  .modal-filters .input-fofo, .modal-filters .select-fofo {
    flex: 1;
    min-width: 200px;
  }

  /* Histórico Table */
  .historico-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
  }

  .historico-table th {
    background: var(--primary);
    color: var(--white);
    padding: 12px;
    text-align: left;
    font-weight: 600;
  }

  .historico-table td {
    padding: 12px;
    border-bottom: 1px solid var(--gray-light);
    color: var(--dark);
  }

  .historico-table tr:hover {
    background: rgba(255, 154, 139, 0.1);
  }

  .tipo-badge {
    padding: 4px 8px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    display: inline-block;
  }

  .tipo-badge.cadastro {
    background: rgba(78, 205, 196, 0.2);
    color: var(--secondary);
  }

  .tipo-badge.atualizacao {
    background: rgba(149, 225, 211, 0.2);
    color: var(--success);
  }

  .tipo-badge.exclusao {
    background: rgba(255, 107, 107, 0.2);
    color: var(--danger);
  }

  /* Notificação */
  .notificacao {
    background: var(--warning);
    border-radius: var(--border-radius);
    padding: 15px;
    margin-bottom: 15px;
    text-align: center;
    font-size: 16px;
    color: var(--dark);
    box-shadow: var(--shadow);
    display: none;
  }

  .barra-progresso {
    width: 100%;
    height: 20px;
    background-color: var(--gray-light);
    border-radius: 10px;
    margin-top: 10px;
    overflow: hidden;
  }

  .progresso {
    height: 100%;
    background-color: var(--primary);
    width: 0%;
    transition: width 0.5s;
    border-radius: 10px;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .app {
      padding: 10px;
    }

    .content {
      flex-direction: column;
    }

    .sidebar {
      max-width: 100%;
    }

    .contadores {
      justify-content: center;
    }

    .user-actions {
      justify-content: center;
    }

    .form-row {
      flex-direction: column;
    }

    .modal-content {
      width: 95%;
      max-height: 90%;
    }

    .modal-filters {
      flex-direction: column;
    }

    .modal-filters .input-fofo, .modal-filters .select-fofo {
      width: 100%;
    }
  }
</style>

</body>
</html>
