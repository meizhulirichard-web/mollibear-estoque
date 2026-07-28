<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sistema de Estoque - Mollibear 🧸</title>
  
  <!-- Favicon (Link GitHub) -->
  <link rel="icon" href="https://github.com/meizhulirichard-web/mollibear-estoque/blob/main/mollibear%20logo.png?raw=true" type="image/png">
  
  <!-- Meta Tags para PWA -->
  <meta name="theme-color" content="#fffaf0">
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
    \"background_color\": \"#fffaf0\",
    \"theme_color\": \"#8b4513\",
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
      getDocs,
      updateDoc,
      deleteDoc,
      orderBy,
      limit
    } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

    // Importar bcrypt.js para criptografia de senhas
    import { hash, compare } from "https://cdn.skypack.dev/bcryptjs@2.4.3";

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

    // Função para migrar dados da estrutura antiga para a nova
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

    // Função para carregar todos os produtos de um tipo
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

    // Função para salvar um produto
    async function salvarProduto(produto, tipo) {
      try {
        const produtoRef = doc(db, `estoque_${tipo}`, produto.codigo);
        await setDoc(produtoRef, produto);
      } catch (error) {
        console.error("Erro ao salvar produto:", error);
      }
    }

    // Função para excluir um produto
    async function excluirProduto(codigo, tipo) {
      try {
        const produtoRef = doc(db, `estoque_${tipo}`, codigo);
        await setDoc(produtoRef, { excluido: true, dataExclusao: serverTimestamp() }, { merge: true });
      } catch (error) {
        console.error("Erro ao excluir produto:", error);
      }
    }

    // Função para atualizar quantidade com runTransaction
    async function atualizarQuantidadeTransacao(codigo, novaQuantidade, tipo, usuario) {
      try {
        const produtoRef = doc(db, `estoque_${tipo}`, codigo);
        
        await runTransaction(db, async (transaction) => {
          const docSnap = await transaction.get(produtoRef);
          
          if (!docSnap.exists()) {
            throw "Produto não encontrado!";
          }
          
          const produtoAtual = docSnap.data();
          const quantidadeAnterior = parseInt(produtoAtual.quantidade || 0);
          
          transaction.update(produtoRef, { quantidade: novaQuantidade });
          
          const historicoRef = collection(db, "historico");
          const novoHistorico = {
            data: serverTimestamp(),
            codigo: codigo,
            descricao: produtoAtual.descricao || "N/A",
            cor: produtoAtual.cor || "N/A",
            modelo: produtoAtual.modelo || "N/A",
            quantidadeAnterior: quantidadeAnterior,
            quantidadeNova: novaQuantidade,
            tipo: novaQuantidade > quantidadeAnterior ? "Entrada" : "Saída",
            usuario: usuario,
            modo: tipo
          };
          transaction.add(historicoRef, novoHistorico);
        });
        
        return true;
      } catch (error) {
        console.error("Erro na transação:", error);
        return false;
      }
    }

    // Função para observar mudanças em tempo real
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

    // Função para carregar histórico (ordenado por data, mais recentes primeiro)
    async function carregarHistorico(limite = 100) {
      try {
        const historicoCol = collection(db, "historico");
        const q = query(
          historicoCol,
          orderBy("data", "desc"),
          limit(limite)
        );
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

    // Função para adicionar ao histórico
    async function adicionarAoHistorico(operacao, usuario) {
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

    // Função para cadastrar usuário
    async function cadastrarUsuario(email, nome, senha, nivel = "funcionario") {
      try {
        const usuariosCol = collection(db, "usuarios");
        const usuarioRef = doc(usuariosCol, email);
        
        const senhaHash = await hash(senha, 10);
        
        await setDoc(usuarioRef, {
          email: email,
          nome: nome,
          senha: senhaHash,
          nivel: nivel,
          dataCadastro: serverTimestamp()
        });
        
        return true;
      } catch (error) {
        console.error("Erro ao cadastrar usuário:", error);
        return false;
      }
    }

    // Função para carregar usuários
    async function carregarUsuarios() {
      try {
        const usuariosCol = collection(db, "usuarios");
        const querySnapshot = await getDocs(usuariosCol);
        const usuarios = [];
        querySnapshot.forEach((doc) => {
          usuarios.push({ id: doc.id, ...doc.data() });
        });
        return usuarios;
      } catch (error) {
        console.error("Erro ao carregar usuários:", error);
        return [];
      }
    }

    // Função para atualizar nome de usuário
    async function atualizarNomeUsuario(email, novoNome) {
      try {
        const usuarioRef = doc(db, "usuarios", email);
        await updateDoc(usuarioRef, { nome: novoNome });
        return true;
      } catch (error) {
        console.error("Erro ao atualizar nome de usuário:", error);
        return false;
      }
    }

    // Função para excluir usuário
    async function excluirUsuario(email) {
      try {
        const usuarioRef = doc(db, "usuarios", email);
        await deleteDoc(usuarioRef);
        return true;
      } catch (error) {
        console.error("Erro ao excluir usuário:", error);
        return false;
      }
    }

    // Função para fazer login
    async function fazerLoginFirebase(email, senha) {
      try {
        const usuariosCol = collection(db, "usuarios");
        const q = query(usuariosCol, where("email", "==", email));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          return { sucesso: false, mensagem: "Usuário não encontrado!" };
        }
        
        const usuarioDoc = querySnapshot.docs[0];
        const usuario = usuarioDoc.data();
        
        const senhaCorreta = await compare(senha, usuario.senha);
        
        if (!senhaCorreta) {
          return { sucesso: false, mensagem: "Senha incorreta!" };
        }
        
        return { 
          sucesso: true, 
          usuario: {
            email: usuario.email,
            nome: usuario.nome,
            nivel: usuario.nivel
          }
        };
      } catch (error) {
        console.error("Erro ao fazer login:", error);
        return { sucesso: false, mensagem: "Erro ao fazer login!" };
      }
    }

    // Função para solicitar recuperação de senha
    async function solicitarRecuperacaoSenha(email) {
      try {
        const usuariosCol = collection(db, "usuarios");
        const q = query(usuariosCol, where("email", "==", email));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          return { sucesso: false, mensagem: "Email não encontrado!" };
        }
        
        // Gerar uma senha temporária
        const senhaTemporaria = Math.random().toString(36).substring(2, 10);
        const senhaHash = await hash(senhaTemporaria, 10);
        
        const usuarioRef = doc(db, "usuarios", email);
        await updateDoc(usuarioRef, { senha: senhaHash });
        
        return { 
          sucesso: true, 
          senhaTemporaria: senhaTemporaria,
          mensagem: `Senha temporária gerada: ${senhaTemporaria}`
        };
      } catch (error) {
        console.error("Erro ao solicitar recuperação de senha:", error);
        return { sucesso: false, mensagem: "Erro ao solicitar recuperação!" };
      }
    }

    // Tornar as funções globais
    window.carregarProdutos = carregarProdutos;
    window.salvarProduto = salvarProduto;
    window.excluirProduto = excluirProduto;
    window.observarMudancas = observarMudancas;
    window.atualizarQuantidadeTransacao = atualizarQuantidadeTransacao;
    window.carregarHistorico = carregarHistorico;
    window.adicionarAoHistorico = adicionarAoHistorico;
    window.migrarDadosAntigos = migrarDadosAntigos;
    window.cadastrarUsuario = cadastrarUsuario;
    window.carregarUsuarios = carregarUsuarios;
    window.atualizarNomeUsuario = atualizarNomeUsuario;
    window.excluirUsuario = excluirUsuario;
    window.fazerLoginFirebase = fazerLoginFirebase;
    window.solicitarRecuperacaoSenha = solicitarRecuperacaoSenha;
  </script>
</head>
<body>

<!-- Barra Superior Fixa -->
<header class="header-fixo">
  <div class="header-content">
    <div class="header-left">
      <img src="https://github.com/meizhulirichard-web/mollibear-estoque/blob/main/mollibear%20logo.png?raw=true" alt="Logo Mollibear" class="logo-img">
      <span class="title-text">🧸 SISTEMA DE ESTOQUE - MOLLIBEAR 🐻</span>
    </div>
    
    <div class="header-center">
      <input type="text" id="buscaProdutoHeader" class="input-fofo" placeholder="🔍 Buscar produto..." style="width: 300px; margin: 0 10px;">
      <select id="modoSelectHeader" class="button-fofo" style="padding: 10px; border-radius: 20px; border: 2px solid #8b4513; margin: 0 10px;">
        <option value="sala_p">🗺️ Sala P</option>
        <option value="estoque_g">📦 Estoque G</option>
        <option value="estoque_p">📦 Estoque P</option>
        <option value="estoque_m">📦 Estoque M</option>
      </select>
      <button id="produtosCadastradosBtnHeader" class="button-fofo">📋 Produtos</button>
      <button id="verHistoricoBtnHeader" class="button-fofo">📜 Histórico</button>
    </div>
    
    <div class="header-right">
      <button id="notificacoesBtn" class="button-fofo" style="position: relative;">
        🔔
        <span id="contadorNotificacoes" class="contador-notificacoes" style="display: none;">0</span>
      </button>
      <button id="configuracoesBtn" class="button-fofo">⚙️ Configurações</button>
      <div id="perfilUsuario" class="perfil-usuario" style="display: none;">
        <span id="nomeUsuario">👤 Convidado</span>
        <button id="logoutBtnHeader" class="button-fofo" style="margin-left: 10px;">🚪 Sair</button>
      </div>
      <button id="loginBtnHeader" class="button-fofo">🔑 Login</button>
    </div>
  </div>
</header>

<!-- Toast Notification -->
<div id="toast" class="toast" style="display: none;"></div>

<!-- Conteúdo Principal (com margin-top para não sobrepor a barra fixa) -->
<div class="app">

  <!-- Contadores Visuais -->
  <div class="contadores" id="contadores">
    <div class="contador">
      <span>📦 <strong>Produtos:</strong> <span id="totalProdutos">0</span></span>
    </div>
    <div class="contador">
      <span>📊 <strong>Quantidade Total:</strong> <span id="quantidadeTotal">0</span></span>
    </div>
    <div class="contador" id="contadorEstantes">
      <span>🗺️ <strong>Estantes Utilizadas:</strong> <span id="estantesUtilizadas">0/51</span></span>
    </div>
  </div>

  <div class="content">

    <aside id="asideCadastro">

      <div class="card">
        <h2>📦 CADASTRO DE PRODUTO</h2>

        <label>Código do Produto *</label>
        <input type="text" id="codigoProduto" class="input-fofo" placeholder="Ex: TB001">

        <label>Descrição *</label>
        <input type="text" id="descricaoProduto" class="input-fofo" placeholder="Ex: Ursinho de Pelúcia">

        <label>Cor (Não obrigatório)</label>
        <input type="text" id="corProduto" class="input-fofo" placeholder="Ex: Marrom, Branco, Rosa">

        <label>Modelo *</label>
        <input type="text" id="modeloProduto" class="input-fofo" placeholder="Ex: Grande, Médio, Pequeno">

        <label>Quantidade *</label>
        <input type="number" id="quantidadeProduto" class="input-fofo" min="0">

        <label>Data de Lançamento (Não obrigatório)</label>
        <input type="date" id="dataLancamento" class="input-fofo">

        <div class="row" id="estanteNivelRow">
          <div>
            <label>Estante *</label>
            <select id="estanteSelect" class="input-fofo"></select>
          </div>

          <div>
            <label>Nível *</label>
            <select id="nivelSelect" class="input-fofo">
              <option>A</option>
              <option>B</option>
              <option>C</option>
              <option>D</option>
              <option>E</option>
            </select>
          </div>
        </div>

        <button class="save button-fofo" id="salvarProdutoBtn">
          💾 Salvar Produto
        </button>
        <p id="erroCadastro" style="color: #d35f5f; margin-top: 8px; font-size: 16px;"></p>
      </div>

      <div class="card">
        <h2>🔍 BUSCAR PRODUTO</h2>

        <input type="text" id="buscaProduto" class="input-fofo" placeholder="Busque por código, descrição, cor, modelo">

        <div class="result" id="resultadoBusca"></div>
      </div>

    </aside>

    <main>
      <!-- Conteúdo dinâmico: Mapa (Sala P) ou Lista (Estoque G, P, M) -->
      <div id="conteudoDinamico">
        <!-- Mapa da Sala P (exibido por padrão) -->
        <div id="mapaContainer" style="display: block;">
          <h2>🗺️ MAPA DA SALA P</h2>
          <p style="text-align: center; color: #8b4513; font-size: 16px; margin-bottom: 10px;">
            🚪 <strong>Porta</strong> está localizada à esquerda da loja.
          </p>
          <div class="mapa-container">
            <svg id="mapa" viewBox="0 0 1200 800" class="mapa"></svg>
          </div>
          <div class="rodape">
            💡 Clique em uma estante para ver os produtos cadastrados! 🐻
          </div>
          <div class="legenda-mapa">
            <div class="legenda-item"><span class="cor-verde"></span> 0-25% (0-1 produto)</div>
            <div class="legenda-item"><span class="cor-amarelo"></span> 25-75% (2-3 produtos)</div>
            <div class="legenda-item"><span class="cor-vermelho"></span> 75-100% (4 produtos)</div>
            <div class="legenda-item"><span class="cor-vazio"></span> Vazia (0 produtos)</div>
          </div>
        </div>

        <!-- Lista do Estoque (oculto por padrão) -->
        <div id="estoqueContainer" style="display: none;">
          <h2 id="estoqueTitulo">📦 Estoque</h2>
          <p style="text-align: center; color: #8b4513; font-size: 16px; margin-bottom: 10px;">
            📋 Lista de todos os produtos em estoque.
          </p>
          <div class="estoque-list-container">
            <div id="listaEstoque"></div>
            <div class="paginacao" id="paginacao"></div>
          </div>
        </div>
      </div>

      <!-- Modal para Produtos Cadastrados -->
      <div id="produtosCadastradosModal" class="modal" style="display: none;">
        <div class="modal-content">
          <span class="close">&times;</span>
          <h2 id="tituloModalProdutos">📋 Produtos Cadastrados</h2>
          <div style="display: flex; gap: 10px; margin-bottom: 15px;">
            <input type="text" id="buscaProdutosModal" class="input-fofo" placeholder="Busque por código, descrição, cor, modelo" style="flex: 1;">
            <select id="ordenarModalPor" class="button-fofo" style="padding: 10px; border-radius: 20px; border: 2px solid #8b4513;">
              <option value="codigo">🔽 Ordenar por Código</option>
              <option value="descricao">🔽 Ordenar por Nome</option>
              <option value="quantidade">🔽 Ordenar por Quantidade</option>
              <option value="data">🔽 Ordenar por Data</option>
            </select>
            <button class="button-fofo" id="selecionarTodosBtn" style="padding: 10px 15px; background-color: #e6d4f1;">✅ Selecionar</button>
            <button class="button-fofo" id="excluirSelecionadosBtn" style="padding: 10px 15px; background-color: #f8c8c8;">🗑️ Excluir Selecionados</button>
          </div>
          <div id="listaProdutosCadastrados"></div>
          <div class="paginacao" id="paginacaoModal"></div>
        </div>
      </div>

      <!-- Modal para Produtos por Estante (apenas para Sala P) -->
      <div id="produtosEstanteModal" class="modal" style="display: none;">
        <div class="modal-content">
          <span class="close-estante">&times;</span>
          <h2 id="tituloProdutosEstante">📦 Produtos na Estante</h2>
          <div id="listaProdutosEstante"></div>
        </div>
      </div>

      <!-- Modal de Login -->
      <div id="loginModal" class="modal" style="display: none;">
        <div class="modal-content" style="width: 90%; max-width: 400px;">
          <span class="close-login">&times;</span>
          <h2>🔑 Login</h2>
          <label style="display: block; margin-top: 12px; font-weight: bold; color: #8b4513; font-size: 16px;">Email:</label>
          <input type="email" id="emailInput" class="input-fofo" placeholder="Digite seu email" style="margin-top: 6px;">
          <label style="display: block; margin-top: 12px; font-weight: bold; color: #8b4513; font-size: 16px;">Senha:</label>
          <input type="password" id="senhaInput" class="input-fofo" placeholder="Digite sua senha" style="margin-top: 6px;">
          <button class="button-fofo" id="esqueciSenhaBtn" style="margin-top: 10px; width: 100%; background-color: #fff3cd; color: #856404;">
            🔑 Esqueci a senha
          </button>
          <button class="button-fofo" id="entrarBtn" style="margin-top: 10px; width: 100%;">🔓 Entrar</button>
          <button class="button-fofo" id="cadastrarBtn" style="margin-top: 10px; width: 100%; background-color: #d4edda; color: #155724;">
            👤 Criar Conta
          </button>
          <p id="erroLogin" style="color: #d35f5f; margin-top: 8px; font-size: 16px; text-align: center;"></p>
        </div>
      </div>

      <!-- Modal para Recuperação de Senha -->
      <div id="recuperarSenhaModal" class="modal" style="display: none;">
        <div class="modal-content" style="width: 90%; max-width: 400px;">
          <span class="close-recuperar-senha">&times;</span>
          <h2>🔑 Recuperar Senha</h2>
          <p style="text-align: center; color: #8b4513; margin-bottom: 15px;">
            Digite seu email para receber uma senha temporária.
          </p>
          <label style="display: block; margin-top: 12px; font-weight: bold; color: #8b4513; font-size: 16px;">Email:</label>
          <input type="email" id="emailRecuperacao" class="input-fofo" placeholder="Digite seu email" style="margin-top: 6px;">
          <button class="button-fofo" id="solicitarRecuperacaoBtn" style="margin-top: 20px; width: 100%; background-color: #d4edda; color: #155724;">
            📧 Enviar Senha Temporária
          </button>
          <p id="erroRecuperacao" style="color: #d35f5f; margin-top: 8px; font-size: 16px; text-align: center;"></p>
        </div>
      </div>

      <!-- Modal para Cadastro de Usuário -->
      <div id="cadastroUsuarioModal" class="modal" style="display: none;">
        <div class="modal-content" style="width: 90%; max-width: 400px;">
          <span class="close-cadastro-usuario">&times;</span>
          <h2>👤 Criar Conta</h2>
          <label style="display: block; margin-top: 12px; font-weight: bold; color: #8b4513; font-size: 16px;">Email:</label>
          <input type="email" id="novoEmail" class="input-fofo" placeholder="Digite seu email" style="margin-top: 6px;">
          <label style="display: block; margin-top: 12px; font-weight: bold; color: #8b4513; font-size: 16px;">Nome:</label>
          <input type="text" id="novoNome" class="input-fofo" placeholder="Digite seu nome" style="margin-top: 6px;">
          <label style="display: block; margin-top: 12px; font-weight: bold; color: #8b4513; font-size: 16px;">Senha:</label>
          <input type="password" id="novaSenha" class="input-fofo" placeholder="Digite sua senha" style="margin-top: 6px;">
          <label style="display: block; margin-top: 12px; font-weight: bold; color: #8b4513; font-size: 16px;">Confirmar Senha:</label>
          <input type="password" id="confirmarSenha" class="input-fofo" placeholder="Confirme sua senha" style="margin-top: 6px;">
          <button class="button-fofo" id="criarContaBtn" style="margin-top: 20px; width: 100%; background-color: #d4edda; color: #155724;">
            ✅ Criar Conta
          </button>
          <p id="erroCadastroUsuario" style="color: #d35f5f; margin-top: 8px; font-size: 16px; text-align: center;"></p>
        </div>
      </div>

      <!-- Modal para Gerenciamento de Usuários -->
      <div id="gerenciarUsuariosModal" class="modal" style="display: none;">
        <div class="modal-content" style="width: 90%; max-width: 700px;">
          <span class="close-usuarios">&times;</span>
          <h2>👥 Gerenciamento de Usuários</h2>
          
          <!-- Formulário de Cadastro de Usuário -->
          <div class="card" style="margin-bottom: 20px;">
            <h3>📝 Cadastrar Novo Usuário</h3>
            <div style="display: flex; gap: 10px; margin-top: 10px;">
              <input type="email" id="novoEmailAdmin" class="input-fofo" placeholder="Email" style="flex: 1;">
              <input type="text" id="novoNomeAdmin" class="input-fofo" placeholder="Nome de Usuário" style="flex: 1;">
              <input type="password" id="novaSenhaAdmin" class="input-fofo" placeholder="Senha" style="flex: 1;">
            </div>
            <div style="margin-top: 10px;">
              <select id="novoNivelAdmin" class="input-fofo" style="width: 100%;">
                <option value="funcionario">Funcionário</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <button class="button-fofo" id="cadastrarUsuarioBtn" style="margin-top: 15px; width: 100%; background-color: #d4edda; color: #155724;">
              ✅ Cadastrar Usuário
            </button>
            <p id="erroCadastroUsuarioAdmin" style="color: #d35f5f; margin-top: 8px; font-size: 16px;"></p>
          </div>
          
          <!-- Lista de Usuários -->
          <div class="card">
            <h3>📋 Usuários Cadastrados</h3>
            <div id="listaUsuarios" style="max-height: 300px; overflow-y: auto; margin-top: 10px;"></div>
          </div>
        </div>
      </div>

      <!-- Modal para Editar Nome de Usuário -->
      <div id="editarUsuarioModal" class="modal" style="display: none;">
        <div class="modal-content" style="width: 90%; max-width: 400px;">
          <span class="close-editar-usuario">&times;</span>
          <h2>✏️ Editar Nome de Usuário</h2>
          <label style="display: block; margin-top: 12px; font-weight: bold; color: #8b4513; font-size: 16px;">Novo Nome:</label>
          <input type="text" id="novoNomeUsuario" class="input-fofo" placeholder="Digite o novo nome" style="margin-top: 6px;">
          <button class="button-fofo" id="salvarNomeUsuarioBtn" style="margin-top: 20px; width: 100%; background-color: #d4edda; color: #155724;">
            💾 Salvar
          </button>
          <p id="erroEditarUsuario" style="color: #d35f5f; margin-top: 8px; font-size: 16px; text-align: center;"></p>
        </div>
      </div>

      <!-- Modal para Histórico (Timeline) -->
      <div id="historicoModal" class="modal" style="display: none;">
        <div class="modal-content" style="width: 90%; max-width: 800px; max-height: 85%;">
          <span class="close-historico">&times;</span>
          <h2>📜 Histórico de Movimentações</h2>
          <div style="margin-bottom: 15px;">
            <input type="text" id="buscaHistorico" class="input-fofo" placeholder="Busque por código, descrição ou usuário" style="flex: 1;">
            <button class="button-fofo" id="buscarHistoricoBtn" style="margin-top: 0;">🔎 Buscar</button>
          </div>
          <div id="listaHistorico" style="max-height: 500px; overflow-y: auto;"></div>
        </div>
      </div>

      <!-- Modal para Configurações -->
      <div id="configuracoesModal" class="modal" style="display: none;">
        <div class="modal-content" style="width: 90%; max-width: 500px;">
          <span class="close-configuracoes">&times;</span>
          <h2>⚙️ Configurações</h2>
          <div class="card">
            <h3>👤 Minha Conta</h3>
            <p><strong>Email:</strong> <span id="emailUsuarioConfig"></span></p>
            <p><strong>Nome:</strong> <span id="nomeUsuarioConfig"></span></p>
            <p><strong>Nível:</strong> <span id="nivelUsuarioConfig"></span></p>
            <button class="button-fofo" id="editarPerfilBtn" style="margin-top: 15px; width: 100%; background-color: #e6d4f1;">
              ✏️ Editar Perfil
            </button>
          </div>
        </div>
      </div>

      <!-- Modal para Notificações -->
      <div id="notificacoesModal" class="modal" style="display: none;">
        <div class="modal-content" style="width: 90%; max-width: 500px; max-height: 70%;">
          <span class="close-notificacoes">&times;</span>
          <h2>🔔 Notificações</h2>
          <div id="listaNotificacoes" style="max-height: 400px; overflow-y: auto;"></div>
        </div>
      </div>

    </main>

  </div>

</div>

<script>
// Variáveis globais
let produtosSelecionados = [];
let modoAtual = 'sala_p';
let unsubscribeFirestore = null;
let produtosAtuais = [];
let paginaAtual = 1;
const itensPorPagina = 50;
let usuarioLogado = null;
let migracaoConcluida = localStorage.getItem('migracao_concluida') === 'true';
let notificacoes = [];

// Função para mostrar toast
function mostrarToast(mensagem, tipo = 'sucesso') {
  const toast = document.getElementById('toast');
  toast.textContent = mensagem;
  toast.className = `toast ${tipo}`;
  toast.style.display = 'block';
  
  setTimeout(() => {
    toast.style.display = 'none';
  }, 2000);
}

// Função para verificar se o usuário está logado
function estaLogado() {
  return localStorage.getItem('mollibear_logado') === 'true';
}

// Função para fazer login
async function fazerLogin() {
  const email = document.getElementById('emailInput').value.trim();
  const senha = document.getElementById('senhaInput').value;
  const erroLogin = document.getElementById('erroLogin');
  
  if (!email || !senha) {
    erroLogin.textContent = '❌ Preencha email e senha!';
    return;
  }
  
  try {
    const resultado = await window.fazerLoginFirebase(email, senha);
    
    if (resultado.sucesso) {
      localStorage.setItem('mollibear_logado', 'true');
      usuarioLogado = resultado.usuario;
      localStorage.setItem('mollibear_usuario', JSON.stringify(usuarioLogado));
      
      // Atualizar UI
      document.getElementById('loginModal').style.display = 'none';
      document.getElementById('loginBtnHeader').style.display = 'none';
      document.getElementById('logoutBtnHeader').style.display = 'block';
      document.getElementById('perfilUsuario').style.display = 'flex';
      document.getElementById('asideCadastro').style.display = 'flex';
      document.getElementById('nomeUsuario').textContent = `👤 ${usuarioLogado.nome}`;
      document.getElementById('emailUsuarioConfig').textContent = usuarioLogado.email;
      document.getElementById('nomeUsuarioConfig').textContent = usuarioLogado.nome;
      document.getElementById('nivelUsuarioConfig').textContent = usuarioLogado.nivel === 'admin' ? 'Administrador' : 'Funcionário';
      
      // Mostrar botão de gerenciar usuários apenas para admin
      if (usuarioLogado.nivel === 'admin') {
        document.getElementById('gerenciarUsuariosBtn').style.display = 'block';
      } else {
        document.getElementById('gerenciarUsuariosBtn').style.display = 'none';
      }
      
      erroLogin.textContent = '';
      
      // Executar migração se não foi feita ainda
      if (!migracaoConcluida) {
        executarMigracao();
      } else {
        iniciarListenerFirestore();
      }
      
      mostrarToast('✅ Login realizado com sucesso!');
    } else {
      erroLogin.textContent = resultado.mensagem;
    }
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    erroLogin.textContent = '❌ Erro ao fazer login!';
  }
}

// Função para fazer logout
function fazerLogout() {
  localStorage.removeItem('mollibear_logado');
  localStorage.removeItem('mollibear_usuario');
  usuarioLogado = null;
  
  document.getElementById('loginBtnHeader').style.display = 'block';
  document.getElementById('logoutBtnHeader').style.display = 'none';
  document.getElementById('gerenciarUsuariosBtn').style.display = 'none';
  document.getElementById('perfilUsuario').style.display = 'none';
  document.getElementById('asideCadastro').style.display = 'none';
  document.getElementById('nomeUsuario').textContent = '👤 Convidado';
  
  if (unsubscribeFirestore) {
    unsubscribeFirestore();
    unsubscribeFirestore = null;
  }
  
  mostrarToast('🚪 Você saiu do sistema.');
}

// Função para abrir o modal de login
function abrirModalLogin() {
  document.getElementById('loginModal').style.display = 'block';
  document.getElementById('emailInput').value = '';
  document.getElementById('senhaInput').value = '';
  document.getElementById('erroLogin').textContent = '';
}

// Função para fechar o modal de login
function fecharModalLogin() {
  document.getElementById('loginModal').style.display = 'none';
}

// Função para executar a migração
async function executarMigracao() {
  const notificacao = document.getElementById('notificacaoMigracao');
  
  if (notificacao) {
    notificacao.style.display = 'block';
  }
  
  try {
    const totalMigrados = await window.migrarDadosAntigos();
    
    migracaoConcluida = true;
    localStorage.setItem('migracao_concluida', 'true');
    
    if (notificacao) {
      setTimeout(() => {
        notificacao.style.display = 'none';
      }, 2000);
    }
    
    iniciarListenerFirestore();
    mostrarToast(`✅ Migração concluída! ${totalMigrados} produtos migrados.`);
    
  } catch (error) {
    console.error("Erro na migração:", error);
    if (notificacao) {
      notificacao.style.display = 'none';
    }
    mostrarToast('❌ Erro durante a migração.', 'erro');
  }
}

// Função para abrir modal de recuperação de senha
function abrirModalRecuperarSenha() {
  document.getElementById('loginModal').style.display = 'none';
  document.getElementById('recuperarSenhaModal').style.display = 'block';
  document.getElementById('emailRecuperacao').value = '';
  document.getElementById('erroRecuperacao').textContent = '';
}

// Função para fechar modal de recuperação de senha
function fecharModalRecuperarSenha() {
  document.getElementById('recuperarSenhaModal').style.display = 'none';
  document.getElementById('loginModal').style.display = 'block';
}

// Função para solicitar recuperação de senha
async function solicitarRecuperacao() {
  const email = document.getElementById('emailRecuperacao').value.trim();
  const erroRecuperacao = document.getElementById('erroRecuperacao');
  
  if (!email) {
    erroRecuperacao.textContent = '❌ Digite um email válido!';
    return;
  }
  
  try {
    const resultado = await window.solicitarRecuperacaoSenha(email);
    
    if (resultado.sucesso) {
      fecharModalRecuperarSenha();
      alert(`📧 Senha temporária: ${resultado.senhaTemporaria}\n\nUse esta senha para fazer login e depois altere sua senha.`);
      mostrarToast('📧 Senha temporária gerada!');
    } else {
      erroRecuperacao.textContent = resultado.mensagem;
    }
  } catch (error) {
    console.error("Erro ao solicitar recuperação:", error);
    erroRecuperacao.textContent = '❌ Erro ao solicitar recuperação!';
  }
}

// Função para abrir modal de cadastro de usuário
function abrirModalCadastroUsuario() {
  document.getElementById('loginModal').style.display = 'none';
  document.getElementById('cadastroUsuarioModal').style.display = 'block';
  document.getElementById('novoEmail').value = '';
  document.getElementById('novoNome').value = '';
  document.getElementById('novaSenha').value = '';
  document.getElementById('confirmarSenha').value = '';
  document.getElementById('erroCadastroUsuario').textContent = '';
}

// Função para fechar modal de cadastro de usuário
function fecharModalCadastroUsuario() {
  document.getElementById('cadastroUsuarioModal').style.display = 'none';
  document.getElementById('loginModal').style.display = 'block';
}

// Função para criar conta
async function criarConta() {
  const email = document.getElementById('novoEmail').value.trim();
  const nome = document.getElementById('novoNome').value.trim();
  const senha = document.getElementById('novaSenha').value;
  const confirmarSenha = document.getElementById('confirmarSenha').value;
  const erroCadastroUsuario = document.getElementById('erroCadastroUsuario');
  
  if (!email || !nome || !senha || !confirmarSenha) {
    erroCadastroUsuario.textContent = '❌ Preencha todos os campos!';
    return;
  }
  
  if (senha !== confirmarSenha) {
    erroCadastroUsuario.textContent = '❌ As senhas não coincidem!';
    return;
  }
  
  // Validar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    erroCadastroUsuario.textContent = '❌ Email inválido!';
    return;
  }
  
  // Verificar se o email já está cadastrado
  const usuarios = await window.carregarUsuarios();
  const emailJaExiste = usuarios.some(u => u.email === email);
  
  if (emailJaExiste) {
    erroCadastroUsuario.textContent = '❌ Este email já está cadastrado!';
    return;
  }
  
  const sucesso = await window.cadastrarUsuario(email, nome, senha, 'funcionario');
  
  if (sucesso) {
    fecharModalCadastroUsuario();
    mostrarToast('✅ Conta criada com sucesso! Faça login.');
    
    // Abrir modal de login
    abrirModalLogin();
    document.getElementById('emailInput').value = email;
  } else {
    erroCadastroUsuario.textContent = '❌ Erro ao criar conta!';
  }
}

// Função para formatar data para timeline
function formatarDataTimeline(data) {
  if (!data) return "--:--";
  if (data instanceof Object && data.toDate) {
    const date = data.toDate();
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }
  return "--:--";
}

// Função para formatar data completa
function formatarData(data) {
  if (!data) return "Não informado";
  if (data instanceof Object && data.toDate) {
    const date = data.toDate();
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR');
  }
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano}`;
}

// Função para calcular porcentagem de ocupação de uma estante (100% = 4 produtos)
function calcularPorcentagemOcupacao(estanteNumero) {
  const produtosEstante = produtosAtuais.filter(p => p.estante == estanteNumero);
  const quantidadeProdutos = produtosEstante.length;
  return (quantidadeProdutos / 4) * 100;
}

// Função para determinar a cor da estante com base na ocupação
function getCorEstante(estanteNumero) {
  const porcentagem = calcularPorcentagemOcupacao(estanteNumero);
  if (porcentagem === 0) return "#f5e6d3";
  if (porcentagem <= 25) return "#d4edda";
  if (porcentagem <= 75) return "#fff3cd";
  return "#f8d7da";
}

// Função para gerar ID único para o input de quantidade
function gerarIdInput(codigo) {
  return `quantidade-${codigo}`;
}

// Função para gerar card de produto (REUTILIZÁVEL)
function gerarCardProduto(produto, mostrarEstanteNivel = true, mostrarCheckbox = false, index = null) {
  const idInput = gerarIdInput(produto.codigo);
  
  return `
    <div style="margin-bottom: 15px; padding: 12px; border: 2px solid #f5e6d3; border-radius: 8px; background-color: #fffaf0; display: flex; justify-content: space-between; align-items: center; flex-direction: column; position: relative;">
      ${mostrarCheckbox ? `
        <input type="checkbox" id="checkbox-${index}" style="position: absolute; top: 10px; right: 10px; width: 20px; height: 20px;" 
          ${produtosSelecionados.some(p => p.codigo === produto.codigo && p.cor === produto.cor && p.modelo === produto.modelo) ? 'checked' : ''}>
      ` : ''}
      
      <div style="flex: 1; width: 100%;">
        <p style="margin: 5px 0; font-size: 16px;"><strong>📌 Código:</strong> ${produto.codigo}</p>
        <p style="margin: 5px 0; font-size: 16px;"><strong>📝 Descrição:</strong> ${produto.descricao}</p>
        ${produto.cor ? `<p style="margin: 5px 0; font-size: 16px;"><strong>🎨 Cor:</strong> ${produto.cor}</p>` : ''}
        <p style="margin: 5px 0; font-size: 16px;"><strong>📐 Modelo:</strong> ${produto.modelo}</p>
        ${mostrarEstanteNivel && produto.estante ? `<p style="margin: 5px 0; font-size: 16px;"><strong>📦 Estante:</strong> ${produto.estante}, <strong>Nível:</strong> ${produto.nivel}</p>` : ''}
        <div style="display: flex; align-items: center; gap: 10px; margin: 5px 0;">
          <p style="margin: 0; font-size: 16px;"><strong>📊 Quantidade:</strong></p>
          <input type="number" id="${idInput}" value="${produto.quantidade || 0}" 
            style="width: 80px; padding: 6px; border: 2px solid #8b4513; border-radius: 8px; text-align: center; font-size: 16px;" 
            min="0">
          <button class="button-salvar-quantidade" onclick="salvarQuantidade('${produto.codigo}', '${idInput}', '${modoAtual}')">💾</button>
        </div>
        ${produto.dataLancamento ? `<p style="margin: 5px 0; font-size: 16px;"><strong>📅 Data:</strong> ${formatarData(produto.dataLancamento)}</p>` : ''}
      </div>
    </div>
  `;
}

// Função para salvar a quantidade editada (USANDO TRANSAÇÃO)
async function salvarQuantidade(codigo, inputId, tipo) {
  if (!estaLogado()) {
    mostrarToast('❌ Você não tem permissão para alterar quantidades!', 'erro');
    return;
  }
  
  const novaQuantidade = parseInt(document.getElementById(inputId).value);
  
  if (isNaN(novaQuantidade) || novaQuantidade < 0) {
    mostrarToast('❌ Insira uma quantidade válida (número positivo)!', 'erro');
    const produtos = await window.carregarProdutos(tipo);
    const produto = produtos.find(p => p.codigo === codigo);
    if (produto) {
      document.getElementById(inputId).value = produto.quantidade || 0;
    }
    return;
  }
  
  const sucesso = await window.atualizarQuantidadeTransacao(codigo, novaQuantidade, tipo, usuarioLogado.nome);
  
  if (sucesso) {
    mostrarToast('✅ Quantidade atualizada!');
    adiconarNotificacao(`Quantidade de ${codigo} atualizada para ${novaQuantidade}`);
  } else {
    mostrarToast('❌ Erro ao atualizar quantidade.', 'erro');
    const produtos = await window.carregarProdutos(tipo);
    const produto = produtos.find(p => p.codigo === codigo);
    if (produto) {
      document.getElementById(inputId).value = produto.quantidade || 0;
    }
  }
}

// Função para adiconar notificação
function adiconarNotificacao(mensagem) {
  notificacoes.unshift({
    id: Date.now(),
    mensagem: mensagem,
    data: new Date(),
    lida: false
  });
  
  // Atualizar contador
  const naoLidas = notificacoes.filter(n => !n.lida).length;
  const contador = document.getElementById('contadorNotificacoes');
  if (naoLidas > 0) {
    contador.textContent = naoLidas;
    contador.style.display = 'inline';
  } else {
    contador.style.display = 'none';
  }
  
  // Salvar no localStorage (para persistência)
  localStorage.setItem('mollibear_notificacoes', JSON.stringify(notificacoes));
}

// Função para marcar notificações como lidas
function marcarNotificacoesComoLidas() {
  notificacoes.forEach(n => n.lida = true);
  const contador = document.getElementById('contadorNotificacoes');
  contador.style.display = 'none';
  localStorage.setItem('mollibear_notificacoes', JSON.stringify(notificacoes));
}

// Função para atualizar contadores
function atualizarContadores() {
  const totalProdutos = produtosAtuais.length;
  const quantidadeTotal = produtosAtuais.reduce((sum, p) => sum + parseInt(p.quantidade || 0), 0);
  
  document.getElementById('totalProdutos').textContent = totalProdutos;
  document.getElementById('quantidadeTotal').textContent = quantidadeTotal.toLocaleString('pt-BR');
  
  if (modoAtual === 'sala_p') {
    const estantesOcupadas = new Set(produtosAtuais.filter(p => p.estante).map(p => p.estante)).size;
    document.getElementById('estantesUtilizadas').textContent = `${estantesOcupadas}/51`;
    document.getElementById('contadorEstantes').style.display = 'block';
  } else {
    document.getElementById('contadorEstantes').style.display = 'none';
  }
}

// Função para ordenar produtos
function ordenarProdutos(produtos, por) {
  return [...produtos].sort((a, b) => {
    switch (por) {
      case 'codigo':
        return a.codigo.localeCompare(b.codigo);
      case 'descricao':
        return a.descricao.localeCompare(b.descricao);
      case 'quantidade':
        return (b.quantidade || 0) - (a.quantidade || 0);
      case 'data':
        if (!a.dataLancamento && !b.dataLancamento) return 0;
        if (!a.dataLancamento) return 1;
        if (!b.dataLancamento) return -1;
        return new Date(b.dataLancamento) - new Date(a.dataLancamento);
      default:
        return 0;
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
  
  let html = '<div style="display: flex; justify-content: center; gap: 10px; margin-top: 20px;">';
  
  if (paginaAtual > 1) {
    html += `<button class="button-fofo" onclick="${callback}(${paginaAtual - 1})" style="padding: 8px 16px;">← Anterior</button>`;
  }
  
  for (let i = 1; i <= totalPaginas; i++) {
    html += `<button class="button-fofo ${i === paginaAtual ? 'active' : ''}" onclick="${callback}(${i})" style="padding: 8px 16px;">${i}</button>`;
  }
  
  if (paginaAtual < totalPaginas) {
    html += `<button class="button-fofo" onclick="${callback}(${paginaAtual + 1})" style="padding: 8px 16px;">Próximo →</button>`;
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
  modoAtual = document.getElementById('modoSelectHeader').value;
  document.getElementById('modoSelect').value = modoAtual;
  salvarModoAtual();
  
  if (unsubscribeFirestore) {
    unsubscribeFirestore();
    unsubscribeFirestore = null;
  }
  
  if (modoAtual === 'sala_p') {
    document.getElementById('mapaContainer').style.display = 'block';
    document.getElementById('estoqueContainer').style.display = 'none';
    document.getElementById('tituloModalProdutos').textContent = '📋 Produtos Cadastrados (Sala P)';
    document.getElementById('estoqueTitulo').textContent = '🗺️ MAPA DA SALA P';
    
    atualizarCoresEstantes();
    document.getElementById('contadorEstantes').style.display = 'block';
    document.getElementById('buscaProduto').placeholder = "Busque por código, descrição, cor, modelo ou estante";
    document.getElementById('buscaProdutosModal').placeholder = "Busque por código, descrição, cor, modelo ou estante";
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
    
    document.getElementById('contadorEstantes').style.display = 'none';
    document.getElementById('buscaProduto').placeholder = "Busque por código, descrição, cor, modelo";
    document.getElementById('buscaProdutosModal').placeholder = "Busque por código, descrição, cor, modelo";
    
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
    listaEstoque.innerHTML = '<p style="text-align: center; color: #d35f5f; font-size: 18px;">🐻 Nenhum produto cadastrado!</p>';
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
  
  titulo.textContent = `📦 Produtos na Estante ${estanteNumero} (Sala P)`;
  listaProdutos.innerHTML = '';
  
  if (produtosEstante.length === 0) {
    listaProdutos.innerHTML = '<p style="text-align: center; color: #d35f5f; font-size: 18px;">🐻 Nenhum produto cadastrado nesta estante!</p>';
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
    listaProdutos.innerHTML = '<p style="text-align: center; color: #d35f5f; font-size: 18px;">🐻 Nenhum produto encontrado!</p>';
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
    mostrarToast('❌ Você não tem permissão para selecionar produtos!', 'erro');
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
  
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(checkbox => {
    const index = checkbox.id.replace('checkbox-', '');
    const produto = produtosFiltrados[index];
    if (produto) {
      checkbox.checked = true;
    }
  });
  
  mostrarToast(`✅ ${produtosFiltrados.length} produtos selecionados!`);
}

// Função para excluir produtos selecionados
async function excluirSelecionados() {
  if (!estaLogado()) {
    mostrarToast('❌ Você não tem permissão para excluir produtos!', 'erro');
    return;
  }
  
  if (produtosSelecionados.length === 0) {
    mostrarToast('❌ Nenhum produto selecionado!', 'erro');
    return;
  }
  
  if (confirm(`🐻 Tem certeza que deseja excluir ${produtosSelecionados.length} produtos selecionados?`)) {
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
      }, usuarioLogado.nome);
      
      adiconarNotificacao(`Produto ${produto.codigo} excluído`);
    }
    
    produtosSelecionados = [];
    await filtrarProdutosModal();
    mostrarToast(`🗑️ ${produtosSelecionados.length} produtos excluídos!`);
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
    mostrarToast('❌ Você não tem permissão para cadastrar produtos!', 'erro');
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
    erroCadastro.textContent = '❌ Este código de produto já está cadastrado!';
    return;
  }
  
  if (modoAtual === 'sala_p') {
    const nivelOcupado = await verificarNivelOcupado(estante, nivel);
    if (nivelOcupado) {
      const confirmar = confirm(`⚠️ Já existe um produto cadastrado no nível ${nivel} da estante ${estante}. Deseja cadastrar mesmo assim?`);
      if (!confirmar) {
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
  }, usuarioLogado.nome);
  
  mostrarToast('✅ Produto salvo com sucesso!');
  adiconarNotificacao(`Produto ${codigo} cadastrado`);
  
  erroCadastro.textContent = '';
  
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
    resultadoBusca.innerHTML = '<p style="text-align: center; color: #d35f5f; font-size: 16px;">🐻 Nenhum produto encontrado!</p>';
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

// Função para salvar o modo atual no localStorage
function salvarModoAtual() {
  localStorage.setItem('mollibear_modo_atual', modoAtual);
}

// Função para carregar o modo atual do localStorage
function carregarModoAtual() {
  const modoSalvo = localStorage.getItem('mollibear_modo_atual');
  if (modoSalvo) {
    modoAtual = modoSalvo;
    document.getElementById('modoSelect').value = modoSalvo;
    document.getElementById('modoSelectHeader').value = modoSalvo;
  }
}

// Função para exibir histórico (Timeline)
async function exibirHistorico() {
  const modal = document.getElementById('historicoModal');
  const listaHistorico = document.getElementById('listaHistorico');
  
  const historico = await window.carregarHistorico(100);
  
  if (historico.length === 0) {
    listaHistorico.innerHTML = '<p style="text-align: center; color: #d35f5f; font-size: 18px;">📜 Nenhum registro no histórico!</p>';
  } else {
    listaHistorico.innerHTML = '<div class="timeline">' +
      historico.map(item => {
        const hora = formatarDataTimeline(item.data);
        const tipo = item.tipo;
        const usuario = item.usuario || 'Desconhecido';
        const codigo = item.codigo || 'N/A';
        const descricao = item.descricao || 'N/A';
        const quantidadeAnterior = item.quantidadeAnterior || 0;
        const quantidadeNova = item.quantidadeNova || 0;
        const diferenca = quantidadeNova - quantidadeAnterior;
        const simbolo = diferenca >= 0 ? '+' : '';
        
        let corDiferenca = '#28a745'; // Verde para entrada
        if (diferenca < 0) {
          corDiferenca = '#dc3545'; // Vermelho para saída
        } else if (tipo === 'Cadastro') {
          corDiferenca = '#007bff'; // Azul para cadastro
        } else if (tipo === 'Exclusão') {
          corDiferenca = '#6c757d'; // Cinza para exclusão
        }
        
        let acao;
        if (tipo === 'Cadastro') {
          acao = `Cadastro`;
        } else if (tipo === 'Exclusão') {
          acao = `Exclusão`;
        } else if (diferenca > 0) {
          acao = `Entrada`;
        } else if (diferenca < 0) {
          acao = `Saída`;
        } else {
          acao = `Atualização`;
        }
        
        return `
          <div class="timeline-item">
            <div class="timeline-time">${hora}</div>
            <div class="timeline-content">
              <div class="timeline-header">
                <strong>${usuario}</strong>
                <span class="timeline-acao" style="color: ${corDiferenca}; margin-left: 10px;">${acao}</span>
              </div>
              <div class="timeline-details">
                ${tipo !== 'Exclusão' ? `
                  <span class="timeline-diferenca" style="color: ${corDiferenca}; font-weight: bold;">${simbolo}${Math.abs(diferenca)}</span>
                ` : ''}
                <span class="timeline-codigo">${codigo}</span>
                ${descricao !== 'N/A' ? `<span class="timeline-descricao">- ${descricao}</span>` : ''}
              </div>
            </div>
          </div>
        `;
      }).join('') +
    '</div>';
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
  const historico = await window.carregarHistorico(100);
  const listaHistorico = document.getElementById('listaHistorico');
  
  const historicoFiltrado = historico.filter(item => 
    item.codigo.toLowerCase().includes(busca) || 
    item.descricao.toLowerCase().includes(busca) || 
    item.usuario.toLowerCase().includes(busca) ||
    item.tipo.toLowerCase().includes(busca)
  );
  
  if (historicoFiltrado.length === 0) {
    listaHistorico.innerHTML = '<p style="text-align: center; color: #d35f5f; font-size: 18px;">📜 Nenhum registro encontrado!</p>';
  } else {
    listaHistorico.innerHTML = '<div class="timeline">' +
      historicoFiltrado.map(item => {
        const hora = formatarDataTimeline(item.data);
        const tipo = item.tipo;
        const usuario = item.usuario || 'Desconhecido';
        const codigo = item.codigo || 'N/A';
        const descricao = item.descricao || 'N/A';
        const quantidadeAnterior = item.quantidadeAnterior || 0;
        const quantidadeNova = item.quantidadeNova || 0;
        const diferenca = quantidadeNova - quantidadeAnterior;
        const simbolo = diferenca >= 0 ? '+' : '';
        
        let corDiferenca = '#28a745';
        if (diferenca < 0) {
          corDiferenca = '#dc3545';
        } else if (tipo === 'Cadastro') {
          corDiferenca = '#007bff';
        } else if (tipo === 'Exclusão') {
          corDiferenca = '#6c757d';
        }
        
        let acao;
        if (tipo === 'Cadastro') {
          acao = `Cadastro`;
        } else if (tipo === 'Exclusão') {
          acao = `Exclusão`;
        } else if (diferenca > 0) {
          acao = `Entrada`;
        } else if (diferenca < 0) {
          acao = `Saída`;
        } else {
          acao = `Atualização`;
        }
        
        return `
          <div class="timeline-item">
            <div class="timeline-time">${hora}</div>
            <div class="timeline-content">
              <div class="timeline-header">
                <strong>${usuario}</strong>
                <span class="timeline-acao" style="color: ${corDiferenca}; margin-left: 10px;">${acao}</span>
              </div>
              <div class="timeline-details">
                ${tipo !== 'Exclusão' ? `
                  <span class="timeline-diferenca" style="color: ${corDiferenca}; font-weight: bold;">${simbolo}${Math.abs(diferenca)}</span>
                ` : ''}
                <span class="timeline-codigo">${codigo}</span>
                ${descricao !== 'N/A' ? `<span class="timeline-descricao">- ${descricao}</span>` : ''}
              </div>
            </div>
          </div>
        `;
      }).join('') +
    '</div>';
  }
}

// Função para abrir modal de configurações
function abrirModalConfiguracoes() {
  if (!estaLogado()) {
    mostrarToast('❌ Faça login para acessar as configurações!', 'erro');
    return;
  }
  document.getElementById('configuracoesModal').style.display = 'block';
}

// Função para fechar modal de configurações
function fecharModalConfiguracoes() {
  document.getElementById('configuracoesModal').style.display = 'none';
}

// Função para abrir modal de notificações
function abrirModalNotificacoes() {
  if (!estaLogado()) {
    mostrarToast('❌ Faça login para ver as notificações!', 'erro');
    return;
  }
  
  const modal = document.getElementById('notificacoesModal');
  const listaNotificacoes = document.getElementById('listaNotificacoes');
  
  if (notificacoes.length === 0) {
    listaNotificacoes.innerHTML = '<p style="text-align: center; color: #d35f5f; font-size: 18px;">🔔 Nenhuma notificação!</p>';
  } else {
    listaNotificacoes.innerHTML = notificacoes.map(notificacao => `
      <div class="notificacao-item ${notificacao.lida ? 'lida' : 'nao-lida'}" onclick="marcarComoLida(${notificacao.id})">
        <p>${notificacao.mensagem}</p>
        <span class="notificacao-hora">${formatarDataTimeline(notificacao.data)}</span>
      </div>
    `).join('');
  }
  
  modal.style.display = 'block';
  marcarNotificacoesComoLidas();
}

// Função para fechar modal de notificações
function fecharModalNotificacoes() {
  document.getElementById('notificacoesModal').style.display = 'none';
}

// Função para marcar notificação como lida
function marcarComoLida(id) {
  const notificacao = notificacoes.find(n => n.id === id);
  if (notificacao) {
    notificacao.lida = true;
    localStorage.setItem('mollibear_notificacoes', JSON.stringify(notificacoes));
    
    // Atualizar contador
    const naoLidas = notificacoes.filter(n => !n.lida).length;
    const contador = document.getElementById('contadorNotificacoes');
    if (naoLidas > 0) {
      contador.textContent = naoLidas;
      contador.style.display = 'inline';
    } else {
      contador.style.display = 'none';
    }
  }
}

// Função para abrir modal de editar perfil
function abrirModalEditarPerfil() {
  fecharModalConfiguracoes();
  abrirEditarUsuario(usuarioLogado.email, usuarioLogado.nome);
}

// Função para abrir modal de gerenciamento de usuários
async function abrirGerenciarUsuarios() {
  const modal = document.getElementById('gerenciarUsuariosModal');
  modal.style.display = 'block';
  
  await listarUsuarios();
}

// Função para fechar modal de gerenciamento de usuários
function fecharModalUsuarios() {
  document.getElementById('gerenciarUsuariosModal').style.display = 'none';
}

// Função para listar usuários
async function listarUsuarios() {
  const listaUsuarios = document.getElementById('listaUsuarios');
  const usuarios = await window.carregarUsuarios();
  
  if (usuarios.length === 0) {
    listaUsuarios.innerHTML = '<p style="text-align: center; color: #d35f5f; font-size: 16px;">👥 Nenhum usuário cadastrado!</p>';
    return;
  }
  
  listaUsuarios.innerHTML = '<table style="width: 100%; border-collapse: collapse;">' +
    '<thead>' +
      '<tr style="background-color: var(--bege-claro);">' +
        '<th style="padding: 8px; border: 1px solid #8b4513; text-align: left;">Email</th>' +
        '<th style="padding: 8px; border: 1px solid #8b4513; text-align: left;">Nome</th>' +
        '<th style="padding: 8px; border: 1px solid #8b4513; text-align: left;">Nível</th>' +
        '<th style="padding: 8px; border: 1px solid #8b4513; text-align: left;">Ações</th>' +
      '</tr>' +
    '</thead>' +
    '<tbody>' +
      usuarios.map(usuario => `
        <tr style="border-bottom: 1px solid #f5e6d3;">
          <td style="padding: 8px; border-bottom: 1px solid #f5e6d3;">${usuario.email}</td>
          <td style="padding: 8px; border-bottom: 1px solid #f5e6d3;">${usuario.nome}</td>
          <td style="padding: 8px; border-bottom: 1px solid #f5e6d3;">${usuario.nivel === 'admin' ? 'Administrador' : 'Funcionário'}</td>
          <td style="padding: 8px; border-bottom: 1px solid #f5e6d3;">
            <button class="button-fofo" onclick="abrirEditarUsuario('${usuario.email}', '${usuario.nome}')" style="padding: 6px 12px; font-size: 14px; margin-right: 5px;">✏️ Editar</button>
            ${usuarioLogado.email !== usuario.email ? `
              <button class="button-fofo" onclick="confirmarExcluirUsuario('${usuario.email}')" style="padding: 6px 12px; font-size: 14px; background-color: #f8c8c8; color: #721c24;">🗑️ Excluir</button>
            ` : ''}
          </td>
        </tr>
      `).join('') +
    '</tbody>' +
  '</table>';
}

// Função para abrir modal de editar usuário
function abrirEditarUsuario(email, nomeAtual) {
  document.getElementById('editarUsuarioModal').style.display = 'block';
  document.getElementById('novoNomeUsuario').value = nomeAtual;
  document.getElementById('editarUsuarioModal').dataset.email = email;
}

// Função para fechar modal de editar usuário
function fecharModalEditarUsuario() {
  document.getElementById('editarUsuarioModal').style.display = 'none';
}

// Função para salvar novo nome de usuário
async function salvarNomeUsuario() {
  const email = document.getElementById('editarUsuarioModal').dataset.email;
  const novoNome = document.getElementById('novoNomeUsuario').value.trim();
  const erroEditarUsuario = document.getElementById('erroEditarUsuario');
  
  if (!novoNome) {
    erroEditarUsuario.textContent = '❌ Digite um nome válido!';
    return;
  }
  
  const sucesso = await window.atualizarNomeUsuario(email, novoNome);
  
  if (sucesso) {
    fecharModalEditarUsuario();
    mostrarToast('✅ Nome de usuário atualizado com sucesso!');
    
    // Atualizar o nome do usuário logado se for o próprio usuário
    if (usuarioLogado && usuarioLogado.email === email) {
      usuarioLogado.nome = novoNome;
      document.getElementById('nomeUsuario').textContent = `👤 ${novoNome}`;
      document.getElementById('nomeUsuarioConfig').textContent = novoNome;
      localStorage.setItem('mollibear_usuario', JSON.stringify(usuarioLogado));
    }
    
    // Atualizar a lista de usuários
    await listarUsuarios();
  } else {
    erroEditarUsuario.textContent = '❌ Erro ao atualizar nome de usuário!';
  }
}

// Função para confirmar exclusão de usuário
function confirmarExcluirUsuario(email) {
  if (confirm(`🐻 Tem certeza que deseja excluir o usuário ${email}?`)) {
    excluirUsuario(email);
  }
}

// Função para excluir usuário
async function excluirUsuario(email) {
  const sucesso = await window.excluirUsuario(email);
  
  if (sucesso) {
    mostrarToast('✅ Usuário excluído com sucesso!');
    await listarUsuarios();
  } else {
    mostrarToast('❌ Erro ao excluir usuário!', 'erro');
  }
}

// Função para cadastrar novo usuário (Admin)
async function cadastrarNovoUsuarioAdmin() {
  const email = document.getElementById('novoEmailAdmin').value.trim();
  const nome = document.getElementById('novoNomeAdmin').value.trim();
  const senha = document.getElementById('novaSenhaAdmin').value;
  const nivel = document.getElementById('novoNivelAdmin').value;
  const erroCadastroUsuarioAdmin = document.getElementById('erroCadastroUsuarioAdmin');
  
  if (!email || !nome || !senha) {
    erroCadastroUsuarioAdmin.textContent = '❌ Preencha todos os campos!';
    return;
  }
  
  // Validar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    erroCadastroUsuarioAdmin.textContent = '❌ Email inválido!';
    return;
  }
  
  // Verificar se o email já está cadastrado
  const usuarios = await window.carregarUsuarios();
  const emailJaExiste = usuarios.some(u => u.email === email);
  
  if (emailJaExiste) {
    erroCadastroUsuarioAdmin.textContent = '❌ Este email já está cadastrado!';
    return;
  }
  
  const sucesso = await window.cadastrarUsuario(email, nome, senha, nivel);
  
  if (sucesso) {
    mostrarToast('✅ Usuário cadastrado com sucesso!');
    
    // Limpar campos
    document.getElementById('novoEmailAdmin').value = '';
    document.getElementById('novoNomeAdmin').value = '';
    document.getElementById('novaSenhaAdmin').value = '';
    document.getElementById('novoNivelAdmin').value = 'funcionario';
    
    // Atualizar lista de usuários
    await listarUsuarios();
  } else {
    erroCadastroUsuarioAdmin.textContent = '❌ Erro ao cadastrar usuário!';
  }
}

// Dados das estantes (apenas para Sala P) - ESTANTES 17-21 MOVIDAS 280px PARA A ESQUERDA
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
  
  atualizarCoresEstantes();

  // Adicionar eventos aos botões
  document.getElementById('salvarProdutoBtn').addEventListener('click', salvarProduto);
  document.getElementById('buscaProduto').addEventListener('input', buscarProduto);
  document.getElementById('produtosCadastradosBtn').addEventListener('click', exibirProdutosCadastrados);
  document.getElementById('produtosCadastradosBtnHeader').addEventListener('click', exibirProdutosCadastrados);
  document.querySelector('.close').addEventListener('click', fecharModal);
  document.getElementById('buscaProdutosModal').addEventListener('input', () => filtrarProdutosModal(1));
  document.getElementById('ordenarPor').addEventListener('change', () => {
    if (modoAtual !== 'sala_p') exibirListaEstoque(1);
  });
  document.getElementById('ordenarModalPor').addEventListener('change', () => filtrarProdutosModal(1));
  document.querySelector('.close-estante').addEventListener('click', fecharModalEstante);
  document.getElementById('selecionarTodosBtn').addEventListener('click', selecionarTodos);
  document.getElementById('excluirSelecionadosBtn').addEventListener('click', excluirSelecionados);
  document.getElementById('loginBtnHeader').addEventListener('click', abrirModalLogin);
  document.getElementById('logoutBtnHeader').addEventListener('click', fazerLogout);
  document.getElementById('entrarBtn').addEventListener('click', fazerLogin);
  document.querySelector('.close-login').addEventListener('click', fecharModalLogin);
  document.getElementById('modoSelect').addEventListener('change', trocarModo);
  document.getElementById('modoSelectHeader').addEventListener('change', trocarModo);
  document.getElementById('refreshBtn').addEventListener('click', () => {
    if (modoAtual !== 'sala_p') exibirListaEstoque();
    else atualizarCoresEstantes();
  });
  document.getElementById('verHistoricoBtn').addEventListener('click', exibirHistorico);
  document.getElementById('verHistoricoBtnHeader').addEventListener('click', exibirHistorico);
  document.querySelector('.close-historico').addEventListener('click', fecharModalHistorico);
  document.getElementById('buscarHistoricoBtn').addEventListener('click', buscarNoHistorico);
  document.getElementById('gerenciarUsuariosBtn').addEventListener('click', abrirGerenciarUsuarios);
  document.querySelector('.close-usuarios').addEventListener('click', fecharModalUsuarios);
  document.getElementById('cadastrarUsuarioBtn').addEventListener('click', cadastrarNovoUsuarioAdmin);
  document.querySelector('.close-editar-usuario').addEventListener('click', fecharModalEditarUsuario);
  document.getElementById('salvarNomeUsuarioBtn').addEventListener('click', salvarNomeUsuario);
  document.getElementById('esqueciSenhaBtn').addEventListener('click', abrirModalRecuperarSenha);
  document.querySelector('.close-recuperar-senha').addEventListener('click', fecharModalRecuperarSenha);
  document.getElementById('solicitarRecuperacaoBtn').addEventListener('click', solicitarRecuperacao);
  document.getElementById('cadastrarBtn').addEventListener('click', abrirModalCadastroUsuario);
  document.querySelector('.close-cadastro-usuario').addEventListener('click', fecharModalCadastroUsuario);
  document.getElementById('criarContaBtn').addEventListener('click', criarConta);
  document.getElementById('configuracoesBtn').addEventListener('click', abrirModalConfiguracoes);
  document.querySelector('.close-configuracoes').addEventListener('click', fecharModalConfiguracoes);
  document.getElementById('editarPerfilBtn').addEventListener('click', abrirModalEditarPerfil);
  document.getElementById('notificacoesBtn').addEventListener('click', abrirModalNotificacoes);
  document.querySelector('.close-notificacoes').addEventListener('click', fecharModalNotificacoes);

  // Inicializar o select de estantes
  preencherSelectEstantes();

  // Carregar o modo atual do localStorage
  carregarModoAtual();

  // Carregar notificações do localStorage
  const notificacoesSalvas = localStorage.getItem('mollibear_notificacoes');
  if (notificacoesSalvas) {
    notificacoes = JSON.parse(notificacoesSalvas);
    const naoLidas = notificacoes.filter(n => !n.lida).length;
    const contador = document.getElementById('contadorNotificacoes');
    if (naoLidas > 0) {
      contador.textContent = naoLidas;
      contador.style.display = 'inline';
    }
  }

  // Verificar se o usuário já está logado
  if (estaLogado()) {
    const usuarioSalvo = localStorage.getItem('mollibear_usuario');
    if (usuarioSalvo) {
      usuarioLogado = JSON.parse(usuarioSalvo);
    }
    
    document.getElementById('loginBtnHeader').style.display = 'none';
    document.getElementById('logoutBtnHeader').style.display = 'block';
    document.getElementById('perfilUsuario').style.display = 'flex';
    document.getElementById('asideCadastro').style.display = 'flex';
    document.getElementById('nomeUsuario').textContent = `👤 ${usuarioLogado.nome}`;
    document.getElementById('emailUsuarioConfig').textContent = usuarioLogado.email;
    document.getElementById('nomeUsuarioConfig').textContent = usuarioLogado.nome;
    document.getElementById('nivelUsuarioConfig').textContent = usuarioLogado.nivel === 'admin' ? 'Administrador' : 'Funcionário';
    
    if (usuarioLogado.nivel === 'admin') {
      document.getElementById('gerenciarUsuariosBtn').style.display = 'block';
    } else {
      document.getElementById('gerenciarUsuariosBtn').style.display = 'none';
    }
    
    if (!migracaoConcluida) {
      executarMigracao();
    } else {
      iniciarListenerFirestore();
    }
  } else {
    document.getElementById('loginBtnHeader').style.display = 'block';
    document.getElementById('logoutBtnHeader').style.display = 'none';
    document.getElementById('gerenciarUsuariosBtn').style.display = 'none';
    document.getElementById('perfilUsuario').style.display = 'none';
    document.getElementById('asideCadastro').style.display = 'none';
    document.getElementById('nomeUsuario').textContent = '👤 Convidado';
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
  porta.setAttribute("fill", "#8b4513");
  porta.setAttribute("stroke", "#000");
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
    rect.setAttribute("stroke", "#8b4513");
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
    texto.setAttribute("fill", "#8b4513");
    texto.setAttribute("font-size", "16");
    texto.setAttribute("font-weight", "bold");
    texto.textContent = estante.n;
    
    svg.appendChild(texto);
  });
}
</script>

<style>
  :root {
    --bege-claro: #f5e6d3;
    --bege-escuro: #8b4513;
    --bege-fundo: #fffaf0;
    --rosa-suave: #f8c8c8;
    --azul-suave: #d4e6f1;
    --roxo-suave: #e6d4f1;
    --verde: #d4edda;
    --amarelo: #fff3cd;
    --vermelho: #f8d7da;
  }

  body {
    margin: 0;
    padding: 0;
    background-color: var(--bege-fundo);
    font-family: 'Comic Sans MS', cursive, sans-serif;
    font-size: 16px;
  }

  /* Barra Superior Fixa */
  .header-fixo {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    background: var(--bege-fundo);
    border-bottom: 2px solid var(--bege-claro);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    padding: 10px 0;
  }

  .header-content {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .header-left, .header-center, .header-right {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .header-left {
    flex: 1;
  }

  .header-center {
    flex: 2;
    justify-content: center;
  }

  .header-right {
    flex: 1;
    justify-content: flex-end;
  }

  .title-text {
    font-size: 20px;
    font-weight: bold;
    color: var(--bege-escuro);
  }

  .logo-img {
    height: 50px;
    width: auto;
    border-radius: 50%;
    border: 2px solid var(--bege-escuro);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .perfil-usuario {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .contador-notificacoes {
    position: absolute;
    top: -5px;
    right: -5px;
    background: #dc3545;
    color: white;
    border-radius: 50%;
    padding: 2px 6px;
    font-size: 12px;
    font-weight: bold;
  }

  /* Conteúdo principal com margin-top para não sobrepor a barra fixa */
  .app {
    max-width: 1400px;
    margin: 0 auto;
    padding: 10px;
    padding-top: 80px; /* Espaço para a barra fixa */
  }

  .contadores {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-bottom: 15px;
    flex-wrap: wrap;
  }

  .contador {
    background: var(--bege-fundo);
    border: 2px solid var(--bege-claro);
    border-radius: 12px;
    padding: 10px 15px;
    font-size: 16px;
    color: var(--bege-escuro);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
  }

  .button-historico {
    background: none;
    border: none;
    color: var(--bege-escuro);
    font-family: 'Comic Sans MS', cursive, sans-serif;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    padding: 0;
    text-decoration: underline;
  }

  .button-historico:hover {
    color: var(--bege-escuro);
    opacity: 0.8;
  }

  .notificacao {
    background: #fff3cd;
    border: 2px solid #ffc107;
    border-radius: 12px;
    padding: 15px;
    margin-bottom: 15px;
    text-align: center;
    font-size: 16px;
    color: #856404;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    display: none;
  }

  .barra-progresso {
    width: 100%;
    height: 20px;
    background-color: #e9ecef;
    border-radius: 10px;
    margin-top: 10px;
    overflow: hidden;
  }

  .progresso {
    height: 100%;
    background-color: #ffc107;
    width: 0%;
    transition: width 0.5s;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
  }

  .actions button, .actions select {
    margin: 5px;
    cursor: pointer;
  }

  .button-fofo {
    padding: 12px 20px;
    background-color: var(--bege-claro);
    color: var(--bege-escuro);
    border: 2px solid var(--bege-escuro);
    border-radius: 20px;
    font-family: 'Comic Sans MS', cursive, sans-serif;
    font-weight: bold;
    font-size: 16px;
    transition: all 0.3s;
  }

  .button-fofo:hover {
    background-color: var(--bege-escuro);
    color: var(--bege-fundo);
    transform: scale(1.05);
  }

  .button-fofo.active {
    background-color: var(--bege-escuro);
    color: var(--bege-fundo);
  }

  .button-salvar-quantidade {
    padding: 6px 12px;
    background-color: #d4edda;
    color: #155724;
    border: 2px solid #28a745;
    border-radius: 8px;
    font-family: 'Comic Sans MS', cursive, sans-serif;
    font-weight: bold;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .button-salvar-quantidade:hover {
    background-color: #28a745;
    color: white;
    transform: scale(1.05);
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  aside {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  main {
    width: 100%;
  }

  .card {
    background: var(--bege-fundo);
    border: 2px solid var(--bege-claro);
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  .card h2, .card h3 {
    margin-top: 0;
    font-size: 20px;
    color: var(--bege-escuro);
    border-bottom: 2px solid var(--bege-claro);
    padding-bottom: 10px;
  }

  .card h3 {
    font-size: 18px;
  }

  .card label {
    display: block;
    margin-top: 12px;
    font-weight: bold;
    color: var(--bege-escuro);
    font-size: 16px;
  }

  .input-fofo {
    width: 100%;
    padding: 12px;
    margin-top: 6px;
    border: 2px solid var(--bege-claro);
    border-radius: 8px;
    background-color: #fff;
    font-family: 'Comic Sans MS', cursive, sans-serif;
    font-size: 16px;
  }

  .input-fofo:focus {
    border-color: var(--bege-escuro);
    outline: none;
  }

  .row {
    display: flex;
    gap: 10px;
  }

  .row div {
    flex: 1;
  }

  .save {
    margin-top: 20px;
    width: 100%;
    font-size: 16px;
  }

  .mapa-container {
    width: 100%;
    overflow-x: auto;
    border: 2px solid var(--bege-claro);
    border-radius: 12px;
    background-color: var(--bege-fundo);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  .mapa {
    width: 100%;
    height: auto;
    min-width: 800px;
    display: block;
  }

  .estoque-list-container {
    width: 100%;
    border: 2px solid var(--bege-claro);
    border-radius: 12px;
    background-color: var(--bege-fundo);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    padding: 15px;
  }

  .rodape {
    margin-top: 15px;
    font-style: italic;
    color: var(--bege-escuro);
    text-align: center;
    font-size: 18px;
  }

  .result {
    margin-top: 16px;
    padding: 12px;
    border: 2px solid var(--bege-claro);
    border-radius: 8px;
    background: var(--bege-fundo);
    font-size: 16px;
  }

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
    z-index: 2000;
  }

  .modal-content {
    background: var(--bege-fundo);
    padding: 25px;
    border-radius: 12px;
    width: 90%;
    max-width: 700px;
    max-height: 80%;
    overflow: auto;
    border: 2px solid var(--bege-claro);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  }

  .modal-content h2 {
    color: var(--bege-escuro);
    margin-top: 0;
    text-align: center;
    font-size: 22px;
  }

  .close, .close-estante, .close-login, .close-historico, .close-usuarios, .close-editar-usuario, .close-recuperar-senha, .close-cadastro-usuario, .close-configuracoes, .close-notificacoes {
    float: right;
    font-size: 28px;
    cursor: pointer;
    color: var(--bege-escuro);
  }

  .close:hover, .close-estante:hover, .close-login:hover, .close-historico:hover, .close-usuarios:hover, .close-editar-usuario:hover, .close-recuperar-senha:hover, .close-cadastro-usuario:hover, .close-configuracoes:hover, .close-notificacoes:hover {
    color: #ff6b6b;
  }

  .estante {
    cursor: pointer;
    transition: all 0.2s;
  }

  .estante:hover {
    opacity: 0.8;
    stroke-width: 2;
  }

  .numero {
    font-size: 16px;
    font-weight: bold;
  }

  input[type="date"],
  input[type="email"],
  input[type="password"],
  input[type="text"],
  input[type="number"] {
    padding: 10px;
    border: 2px solid var(--bege-claro);
    border-radius: 8px;
    background-color: #fff;
    font-family: 'Comic Sans MS', cursive, sans-serif;
    font-size: 16px;
    width: 100%;
  }

  input[type="number"] {
    padding: 6px;
  }

  input[type="number"]:focus,
  input[type="email"]:focus,
  input[type="password"]:focus,
  input[type="text"]:focus {
    border-color: var(--bege-escuro);
    outline: none;
  }

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
    gap: 5px;
    font-size: 14px;
    color: var(--bege-escuro);
  }

  .cor-verde, .cor-amarelo, .cor-vermelho, .cor-vazio {
    display: inline-block;
    width: 20px;
    height: 20px;
    border-radius: 4px;
    border: 1px solid #8b4513;
  }

  .cor-verde { background-color: var(--verde); }
  .cor-amarelo { background-color: var(--amarelo); }
  .cor-vermelho { background-color: var(--vermelho); }
  .cor-vazio { background-color: #f5e6d3; }

  .paginacao {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-top: 20px;
  }

  .paginacao button {
    padding: 8px 16px;
    border-radius: 8px;
  }

  /* Estilo para a tabela do histórico */
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
  }

  th {
    background-color: var(--bege-claro);
    padding: 10px;
    border: 1px solid #8b4513;
    text-align: left;
    font-weight: bold;
    color: var(--bege-escuro);
  }

  td {
    padding: 10px;
    border-bottom: 1px solid #f5e6d3;
    color: var(--bege-escuro);
  }

  tr:hover {
    background-color: rgba(245, 230, 211, 0.3);
  }

  /* Toast Notification */
  .toast {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #fff;
    border: 2px solid var(--bege-escuro);
    border-radius: 8px;
    padding: 12px 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    font-size: 16px;
    z-index: 3000;
    animation: slideIn 0.3s ease-out;
  }

  .toast.sucesso {
    background: #d4edda;
    color: #155724;
    border-color: #28a745;
  }

  .toast.erro {
    background: #f8d7da;
    color: #721c24;
    border-color: #dc3545;
  }

  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  /* Timeline */
  .timeline {
    position: relative;
    padding-left: 30px;
    list-style: none;
  }

  .timeline:before {
    content: '';
    position: absolute;
    left: 10px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: var(--bege-escuro);
  }

  .timeline-item {
    position: relative;
    padding-bottom: 20px;
    padding-left: 20px;
  }

  .timeline-item:before {
    content: '';
    position: absolute;
    left: -30px;
    top: 5px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--bege-escuro);
    border: 2px solid #fff;
  }

  .timeline-time {
    font-size: 14px;
    color: #6c757d;
    margin-bottom: 5px;
  }

  .timeline-content {
    background: var(--bege-fundo);
    border: 1px solid var(--bege-claro);
    border-radius: 8px;
    padding: 12px;
    margin-left: 10px;
  }

  .timeline-header {
    display: flex;
    align-items: center;
    margin-bottom: 5px;
  }

  .timeline-acao {
    font-size: 14px;
    font-weight: bold;
  }

  .timeline-details {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .timeline-diferenca {
    font-size: 16px;
  }

  .timeline-codigo {
    font-weight: bold;
    color: var(--bege-escuro);
  }

  .timeline-descricao {
    font-size: 14px;
    color: #6c757d;
  }

  /* Notificações */
  .notificacao-item {
    padding: 12px;
    border-bottom: 1px solid var(--bege-claro);
    cursor: pointer;
    transition: background 0.2s;
  }

  .notificacao-item:hover {
    background: rgba(245, 230, 211, 0.3);
  }

  .notificacao-item.nao-lida {
    background: rgba(253, 230, 138, 0.2);
    font-weight: bold;
  }

  .notificacao-item.lida {
    opacity: 0.8;
  }

  .notificacao-hora {
    font-size: 12px;
    color: #6c757d;
    display: block;
    margin-top: 5px;
  }

  /* Media Queries para responsividade */
  @media (min-width: 768px) {
    .content {
      flex-direction: row;
    }
    
    aside {
      width: 300px;
    }
    
    main {
      flex: 1;
    }
    
    .header-center {
      flex: 3;
    }
    
    .mapa-container {
      min-width: auto;
    }
    
    .mapa {
      min-width: auto;
    }
  }

  @media (max-width: 768px) {
    .header-content {
      flex-direction: column;
      gap: 10px;
    }
    
    .header-left, .header-center, .header-right {
      flex: 1;
      width: 100%;
      justify-content: center;
    }
    
    .title-text {
      font-size: 18px;
    }
    
    .logo-img {
      height: 40px;
    }
    
    .header-center {
      order: 3;
    }
    
    .header-right {
      order: 2;
    }
  }
</style>

</body>
</html>
