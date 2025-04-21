'use strict';

/**
 * scripts.js - Funções JavaScript para o site da Agência m2a
 * Desenvolvido por Jota / José Guilherme Pandolfi
 * www.agenciam2a.com.br
 */

// Aguarda o carregamento completo do DOM antes de inicializar as funções
document.addEventListener('DOMContentLoaded', () => {
  // Inicializa todos os módulos funcionais do site
  inicializarPreloader();
  inicializarNavegacao();
  inicializarCursorPersonalizado();
  inicializarBotaoTopo();
  inicializarAnimacoesScroll();
  GerenciadorTooltips.inicializar();
  inicializarFormulario();
  inicializarBuscaPortfolio();
  inicializarPortfolio();
  inicializarModalPortfolio();
});

/**
 * Gerencia o modal de consentimento LGPD e integra com o preloader
 */
const inicializarConsentimentoLGPD = () => {
  const modal = document.getElementById('lgpd-modal');
  const botaoAceitar = document.getElementById('lgpd-aceitar');
  const botaoRejeitar = document.getElementById('lgpd-rejeitar');
  const botaoReconsiderar = document.getElementById('lgpd-reconsiderar');
  const mensagemRejeicao = document.getElementById('lgpd-mensagem-rejeicao');
  
  // Chave para armazenar o consentimento no localStorage
  const CHAVE_CONSENTIMENTO = 'agencia_m2a_lgpd_consentimento';
  const DATA_CONSENTIMENTO = 'agencia_m2a_lgpd_data';
  
  // Verifica se o usuário já deu consentimento
  const verificarConsentimento = () => {
    try {
      return localStorage.getItem(CHAVE_CONSENTIMENTO) === 'aceito';
    } catch (erro) {
      console.error('Erro ao acessar localStorage:', erro);
      return false;
    }
  };
  
  // Salva o consentimento no localStorage
  const salvarConsentimento = () => {
    try {
      localStorage.setItem(CHAVE_CONSENTIMENTO, 'aceito');
      localStorage.setItem(DATA_CONSENTIMENTO, new Date().toISOString());
      return true;
    } catch (erro) {
      console.error('Erro ao salvar no localStorage:', erro);
      return false;
    }
  };
  
  // Exibe o modal de consentimento
  const exibirModal = () => {
    modal.classList.add('ativo');
  };
  
  // Oculta o modal de consentimento
  const ocultarModal = () => {
    modal.classList.remove('ativo');
  };
  
  // Processa o aceite do usuário
  const aceitarTermos = () => {
    salvarConsentimento();
    ocultarModal();
    continuarCarregamento();
  };
  
  // Processa a rejeição do usuário
  const rejeitarTermos = () => {
    mensagemRejeicao.classList.add('ativo');
    botaoAceitar.style.display = 'none';
    botaoRejeitar.style.display = 'none';
  };
  
  // Permite ao usuário reconsiderar a rejeição
  const reconsiderarRejeicao = () => {
    mensagemRejeicao.classList.remove('ativo');
    botaoAceitar.style.display = '';
    botaoRejeitar.style.display = '';
  };
  
  // Configura os listeners de eventos
  const configurarEventos = () => {
    botaoAceitar.addEventListener('click', aceitarTermos);
    botaoRejeitar.addEventListener('click', rejeitarTermos);
    botaoReconsiderar.addEventListener('click', reconsiderarRejeicao);
  };
  
  // Inicializa o sistema de consentimento
  const inicializar = () => {
    configurarEventos();
    return verificarConsentimento();
  };
  
  return {
    inicializar,
    exibirModal
  };
};

/**
 * Gerencia o preloader exibido durante o carregamento da página
 */
const inicializarPreloader = () => {
  const preloader = document.getElementById('preloader');
  let podeContinuar = false;
  
  // Inicializa o sistema de consentimento LGPD
  const consentimentoLGPD = inicializarConsentimentoLGPD();
  
  // Verifica se o usuário já deu consentimento anteriormente
  const consentimentoExistente = consentimentoLGPD.inicializar();
  
  // Função para continuar o carregamento e remover o preloader
  window.continuarCarregamento = () => {
    podeContinuar = true;
    
    // Remove o preloader quando a página estiver completamente carregada
    if (document.readyState === 'complete') {
      finalizarPreloader();
    }
  };
  
  // Função para finalizar o preloader
  const finalizarPreloader = () => {
    if (!podeContinuar) return;
    
    setTimeout(() => {
      preloader.style.opacity = '0';
      setTimeout(() => {
        preloader.style.display = 'none';
      }, 500);
    }, 800);
  };
  
  // Se já houver consentimento, continua o carregamento
  if (consentimentoExistente) {
    continuarCarregamento();
  } else {
    // Caso contrário, exibe o modal após 1 segundo
    setTimeout(() => {
      consentimentoLGPD.exibirModal();
    }, 1000);
  }
  
  // Monitora o evento de carga completa da página
  window.addEventListener('load', () => {
    if (podeContinuar) {
      finalizarPreloader();
    }
  });
};

/**
 * Gerencia a navegação, menu mobile e comportamento do cabeçalho
 */
const inicializarNavegacao = () => {
  const botaoMenu = document.querySelector('.botao-menu');
  const menuPrincipal = document.getElementById('menu-principal');
  const cabecalho = document.querySelector('.cabecalho');
  const linksMenu = document.querySelectorAll('.menu a');
  
  // Alterna a exibição do menu mobile
  botaoMenu?.addEventListener('click', () => {
    botaoMenu.classList.toggle('ativo');
    menuPrincipal.classList.toggle('ativo');
    botaoMenu.setAttribute('aria-expanded', 
      botaoMenu.classList.contains('ativo') ? 'true' : 'false');
  });
  
  // Fecha o menu mobile ao clicar em um link
  linksMenu.forEach(link => {
    link.addEventListener('click', () => {
      menuPrincipal.classList.remove('ativo');
      botaoMenu.classList.remove('ativo');
      botaoMenu.setAttribute('aria-expanded', 'false');
    });
  });
  
  // Reduz o tamanho do cabeçalho ao rolar a página
  const alterarEstadoCabecalho = () => {
    if (window.scrollY > 50) {
      cabecalho.classList.add('reduzido');
    } else {
      cabecalho.classList.remove('reduzido');
    }
  };
  
  // Verifica a posição inicial da página
  alterarEstadoCabecalho();
  
  // Atualiza o estado do cabeçalho durante a rolagem
  window.addEventListener('scroll', alterarEstadoCabecalho);
  
  // Destaca o item do menu correspondente à seção visível
  const destacarMenuAtivo = () => {
    const secoes = document.querySelectorAll('section[id]');
    
    secoes.forEach(secao => {
      const alturaTopo = window.scrollY;
      const offsetTopo = secao.offsetTop - 100;
      const alturaSecao = secao.offsetHeight;
      const idSecao = secao.getAttribute('id');
      
      if (alturaTopo >= offsetTopo && alturaTopo < offsetTopo + alturaSecao) {
        linksMenu.forEach(link => link.classList.remove('ativo'));
        
        const linkAtivo = document.querySelector(`.menu a[href="#${idSecao}"]`);
        if (linkAtivo) linkAtivo.classList.add('ativo');
      }
    });
  };
  
  window.addEventListener('scroll', destacarMenuAtivo);
};

/**
 * Controla o botão "Voltar ao Topo"
 */
const inicializarBotaoTopo = () => {
  const botaoTopo = document.getElementById('botaoTopo');
  
  // Mostra ou oculta o botão com base na posição da rolagem
  const alternarVisibilidadeBotao = () => {
    if (window.scrollY > 300) {
      botaoTopo.classList.add('visivel');
    } else {
      botaoTopo.classList.remove('visivel');
    }
  };
  
  // Verifica o estado inicial
  alternarVisibilidadeBotao();
  
  // Monitora a rolagem para atualizar a visibilidade
  window.addEventListener('scroll', alternarVisibilidadeBotao);
  
  // Rola suavemente para o topo quando clicado
  botaoTopo?.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
};

/**
 * Adiciona animações aos elementos conforme aparecem na viewport
 */
const inicializarAnimacoesScroll = () => {
  // Seleciona elementos para animar
  const elementosAnimados = document.querySelectorAll(
    '.titulo-secao, .subtitulo-secao, .card-servico, .item-vmv, ' +
    '.item-portfolio, .cliente, .form-contato, .info-contato'
  );
  
  // Verifica se os elementos estão visíveis na viewport
  const verificarVisibilidade = () => {
    const alturaJanela = window.innerHeight;
    const margemAtivacao = 150; // Distância antes do elemento entrar completamente na tela
    
    elementosAnimados.forEach(elemento => {
      const posicaoElemento = elemento.getBoundingClientRect().top;
      
      if (posicaoElemento < alturaJanela - margemAtivacao) {
        elemento.classList.add('animacao-aparecer');
      }
    });
  };
  
  // Executa verificação inicial após um breve atraso
  setTimeout(verificarVisibilidade, 300);
  
  // Monitora a rolagem para animar elementos adicionais
  window.addEventListener('scroll', verificarVisibilidade);
};

/**
 * Inicializa e controla a barra de carregamento
 */
const inicializarBarraCarregamento = () => {
  const barraContainer = document.getElementById('barra-carregamento-container');
  const barra = document.getElementById('barra-carregamento');
  
  // Função para mostrar a barra
  const mostrarBarra = () => {
    barraContainer.classList.add('visivel');
    barra.style.width = '5%'; // Começa com um pequeno progresso
  };
  
  // Função para esconder a barra
  const esconderBarra = () => {
    setTimeout(() => {
      barra.style.width = '100%'; // Completa a barra antes de esconder
      
      setTimeout(() => {
        barraContainer.classList.remove('visivel');
        barra.style.width = '0%'; // Reseta para o próximo uso
      }, 500);
    }, 200);
  };
  
  // Função para atualizar o progresso da barra
  const atualizarProgresso = (porcentagem) => {
    barra.style.width = `${Math.max(5, porcentagem)}%`; // Mínimo de 5% para visibilidade
  };
  
  return {
    mostrar: mostrarBarra,
    esconder: esconderBarra,
    atualizar: atualizarProgresso
  };
};

/**
 * Módulo responsável por gerenciar as funcionalidades do portfólio (Padrão de Módulo Revelador)
 */
const GerenciadorPortfolio = (function() {
  // Variáveis privadas
  let trabalhosAdicionais = [
      {
          imagem: 'assets/img/portfolio/prit-app-eua-ingles.webp',
          titulo: 'Campanha Download de Apps EUA',
          cliente: 'Prit App'
      },
      {
          imagem: 'assets/img/portfolio/full-house-banda-los-compadres.webp',
          titulo: 'Divulgação Happy Hour',
          cliente: 'Full House Sports Bar'
      },
      {
          imagem: 'assets/img/portfolio/aldec-esquadrias-de-aluminio.webp',
          titulo: 'Divulgação serviços realizados',
          cliente: 'Aldec'
      },
      {
          imagem: 'assets/img/portfolio/atletica-proibidao-festa-lote-amigos.webp',
          titulo: 'Promoção de Evento',
          cliente: 'Atlética Unesp Jaboticabal'
      },
      {
          imagem: 'assets/img/portfolio/bruno-serralheiro.webp',
          titulo: 'Divulgação de Promoção',
          cliente: 'Bruno Serralheria'
      },
      {
          imagem: 'assets/img/portfolio/best-market-paes-quentinhos.webp',
          titulo: 'Institucional Novidades',
          cliente: 'Best Market'
      },
      {
          imagem: 'assets/img/portfolio/aftertcheca-rodeio.webp',
          titulo: 'Promoção de Evento',
          cliente: 'República Tcheca'
      },
      {
          imagem: 'assets/img/portfolio/atletica-copa-unesp.webp',
          titulo: 'Institucional',
          cliente: 'Atlética Unesp Jaboticabal'
      },
      {
          imagem: 'assets/img/portfolio/atletica-inter-bauru-basquete-feminino.webp',
          titulo: 'Institucional',
          cliente: 'Atlética Unesp Jaboticabal'
      }
  ];
  
  let modalHandler = null;
  let buscaHandler = null;
  let barraCarregamentoHandler = null;
  let trabalhosCarregados = false;
  
/**
 * Carrega novos trabalhos na galeria de portfólio
 * @private
 */
function carregarTrabalhos() {
  if (trabalhosCarregados) return;
  
  // Mostrar a barra de carregamento
  barraCarregamentoHandler.mostrar();
  
  const galeriaPortfolio = document.querySelector('.galeria-portfolio');
  let atrasoAnimacao = 100;
  let imagensCarregadas = 0;
  const totalImagens = trabalhosAdicionais.length;
  
  // Adiciona cada trabalho à galeria
  trabalhosAdicionais.forEach((trabalho, indice) => {
      const novoItem = document.createElement('div');
      novoItem.className = 'item-portfolio';
      
      // Adicionar índice como atributo data para rastreamento
      novoItem.dataset.indice = document.querySelectorAll('.item-portfolio').length + indice;
      
      // Cria o HTML do item com cliente formatado
      const clienteFormatado = trabalho.cliente.replace('Cliente:', '<b>Cliente:</b>');
      
      novoItem.innerHTML = `
          <img src="${trabalho.imagem}" alt="${trabalho.titulo}" loading="lazy">
          <div class="info-portfolio">
              <h3>${trabalho.titulo}</h3>
              <p>${clienteFormatado}</p>
          </div>
      `;
      
      // Adiciona o item à galeria
      galeriaPortfolio.appendChild(novoItem);
      
      // Monitora o carregamento da imagem
      const img = novoItem.querySelector('img');
      
      // Função que será chamada quando a imagem carregar
      const handleImageLoad = () => {
          imagensCarregadas++;
          
          // Calcula a porcentagem de progresso
          const progresso = (imagensCarregadas / totalImagens) * 100;
          
          // Atualiza a barra de carregamento
          barraCarregamentoHandler.atualizar(progresso);
          
          // Se todas as imagens foram carregadas, esconde a barra
          if (imagensCarregadas === totalImagens) {
              barraCarregamentoHandler.esconder();
          }
          
          // Aplica a animação de aparecimento com atraso
          setTimeout(() => {
              novoItem.classList.add('animacao-aparecer');
          }, atrasoAnimacao);
          
          atrasoAnimacao += 150;
          
          // Remove o listener após o carregamento
          img.removeEventListener('load', handleImageLoad);
      };
      
      // Se a imagem já estiver em cache, o evento 'load' pode não disparar
      if (img.complete) {
          handleImageLoad();
      } else {
          img.addEventListener('load', handleImageLoad);
      }
      
      // Para caso de erro no carregamento
      img.addEventListener('error', handleImageLoad);
  });
  
  trabalhosCarregados = true;
  
  const botaoCarregarMais = document.getElementById('carregarMais');
  if (botaoCarregarMais) {
      botaoCarregarMais.textContent = 'Todos os trabalhos carregados';
      botaoCarregarMais.disabled = true;
      botaoCarregarMais.classList.add('desabilitado');
  }
  
  // Atualiza os handlers
  if (modalHandler) modalHandler.atualizarItens();
  if (buscaHandler) buscaHandler.atualizarItens();
}
  
// Interface pública
return {
  // Inicializa as funcionalidades do portfólio
  inicializar: function(barraCarregamento) {
      barraCarregamentoHandler = barraCarregamento;
      
      const botaoCarregarMais = document.getElementById('carregarMais');
      if (!botaoCarregarMais) return;
      
      // Carrega trabalhos adicionais ao clicar no botão
      botaoCarregarMais.addEventListener('click', carregarTrabalhos);
  },
  
  // Obtém a lista de trabalhos adicionais
  getTrabalhosAdicionais: function() {
      return [...trabalhosAdicionais]; // Retorna uma cópia para evitar modificações externas
  },
  
  // Registra o handler do modal
  registrarModalHandler: function(handler) {
      modalHandler = handler;
  },
  
  // Registra o handler da busca
  registrarBuscaHandler: function(handler) {
      buscaHandler = handler;
  },
  
  // Verifica se os trabalhos já foram carregados
  estaoTrabalhosCarregados: function() {
      return trabalhosCarregados;
  }
};

})();

/**
 * Gerencia a funcionalidade "Ver mais trabalhos" na seção de Portfólio
 */
const inicializarPortfolio = () => {
  // Inicializa o controle da barra de carregamento
  const barraCarregamento = inicializarBarraCarregamento();
  
  // Inicializa o módulo do portfólio
  GerenciadorPortfolio.inicializar(barraCarregamento);
  
  // Retorna handlers para que outros módulos possam interagir
  return {
      getTrabalhosAdicionais: GerenciadorPortfolio.getTrabalhosAdicionais,
      estaoCarregados: GerenciadorPortfolio.estaoTrabalhosCarregados
  };
};

/**
 * Gerencia a validação e envio do formulário de contato
 */
const inicializarFormulario = () => {
  const formulario = document.getElementById('formularioContato');
  
  if (!formulario) return;
  
  // Valida formato de e-mail
  const validarEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };
  
  // Valida formato de telefone
  const validarTelefone = (telefone) => {
    const apenasNumeros = telefone.replace(/\D/g, '');
    return apenasNumeros.length >= 11;
  };
  
  // Adiciona máscara ao campo de telefone
  const campoTelefone = document.getElementById('telefone');
  if (campoTelefone) {
    // Aplica máscara durante digitação
    campoTelefone.addEventListener('input', (e) => {
      // Remove caracteres não numéricos, exceto parênteses em posições válidas
      let valor = e.target.value;
      let valorFiltrado = '';
      
      for (let i = 0; i < valor.length; i++) {
        const char = valor.charAt(i);
        if (/\d/.test(char)) { // Se for dígito
          valorFiltrado += char;
        } else if (char === '(' && i === 0) { // Parêntese de abertura na posição 0
          valorFiltrado += char;
        } else if (char === ')' && i === 3) { // Parêntese de fechamento na posição 3
          valorFiltrado += char;
        }
        // Ignora outros caracteres
      }
      
      // Extrai apenas os dígitos para aplicar a formatação
      const numeros = valorFiltrado.replace(/\D/g, '');
      
      // Aplica a formatação com base na quantidade de dígitos
      let resultado = '';
      if (numeros.length === 0) {
        resultado = '';
      } else if (numeros.length <= 2) {
        // DDD parcial ou completo
        resultado = numeros.length === 1 ? `(${numeros}` : `(${numeros}`;
      } else if (numeros.length <= 6) {
        // DDD + início do telefone
        resultado = `(${numeros.substring(0, 2)}) ${numeros.substring(2)}`;
      } else if (numeros.length <= 10) {
        // DDD + telefone com 8 dígitos (4+4)
        resultado = `(${numeros.substring(0, 2)}) ${numeros.substring(2, 6)}-${numeros.substring(6)}`;
      } else {
        // DDD + telefone com 9 dígitos (5+4)
        resultado = `(${numeros.substring(0, 2)}) ${numeros.substring(2, 7)}-${numeros.substring(7, 11)}`;
      }
      
      // Atualiza o valor no campo
      e.target.value = resultado;
    });
    
    // Impede a inserção de caracteres não permitidos no keydown
    campoTelefone.addEventListener('keydown', (e) => {
      // Permite: backspace, delete, tab, escape, enter
      if (['Backspace', 'Delete', 'Tab', 'Escape', 'Enter'].includes(e.key) ||
          // Permite: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
          (e.key.toLowerCase() === 'a' && e.ctrlKey) ||
          (e.key.toLowerCase() === 'c' && e.ctrlKey) ||
          (e.key.toLowerCase() === 'v' && e.ctrlKey) ||
          (e.key.toLowerCase() === 'x' && e.ctrlKey) ||
          // Permite: home, end, setas direcionais
          ['Home', 'End', 'ArrowLeft', 'ArrowRight'].includes(e.key) ||
          // Permite: parênteses em posições específicas
          (e.key === '(' && e.target.selectionStart === 0) ||
          (e.key === ')' && e.target.selectionStart === 3) ||
          // Permite: números
          /^[0-9]$/.test(e.key)) {
        return;
      }
      
      // Bloqueia qualquer tecla não permitida
      e.preventDefault();
    });
  }

  // Processa o envio do formulário
  formulario.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const telefone = document.getElementById('telefone').value;
    const empresa = document.getElementById('empresa').value;
    const mensagem = document.getElementById('mensagem').value;
    
    // Validação básica dos campos
    if (nome.trim().length < 3) {
      exibirMensagem('Por favor, informe seu nome completo.', 'erro');
      return;
    }
    
    if (!validarEmail(email)) {
      exibirMensagem('Por favor, informe um e-mail válido.', 'erro');
      return;
    }
    
    if (!validarTelefone(telefone)) {
      exibirMensagem('Por favor, informe um telefone válido.', 'erro');
      return;
    }
    
    // Coleta serviços selecionados
    const servicosSelecionados = Array.from(
      document.querySelectorAll('input[name="servicos[]"]:checked')
    ).map(checkbox => checkbox.value);
    
    // Dados para envio
    const dadosFormulario = {
      nome,
      email,
      telefone,
      empresa,
      mensagem,
      servicos: servicosSelecionados
    };
    
    // Simulação de envio (em produção, substituir por chamada à API real)
    try {
      // Desabilita botão durante o processamento
      const botaoEnviar = formulario.querySelector('button[type="submit"]');
      botaoEnviar.disabled = true;
      botaoEnviar.textContent = 'Enviando...';
      
      // Simulação de delay de processamento (remover em produção)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Sucesso no envio
      exibirMensagem('Mensagem enviada com sucesso! Em breve entraremos em contato.', 'sucesso');
      formulario.reset();
      
    } catch (erro) {
      console.error('Erro ao enviar o formulário:', erro);
      exibirMensagem('Ocorreu um erro ao enviar sua mensagem. Por favor, tente novamente.', 'erro');
      
    } finally {
      // Restaura o estado do botão
      const botaoEnviar = formulario.querySelector('button[type="submit"]');
      botaoEnviar.disabled = false;
      botaoEnviar.textContent = 'Enviar mensagem';
    }
  });
  
  // Exibe mensagem de feedback ao usuário
  const exibirMensagem = (texto, tipo) => {
    // Verifica se já existe uma mensagem e remove
    const mensagemExistente = document.querySelector('.mensagem-feedback');
    if (mensagemExistente) {
      mensagemExistente.remove();
    }
    
    // Cria elemento de mensagem
    const mensagem = document.createElement('div');
    mensagem.className = `mensagem-feedback ${tipo}`;
    mensagem.textContent = texto;
    
    // Adiciona ao DOM
    formulario.prepend(mensagem);
    
    // Remove após alguns segundos
    if (tipo === 'sucesso') {
      setTimeout(() => {
        mensagem.classList.add('desaparecer');
        setTimeout(() => mensagem.remove(), 500);
      }, 5000);
    }
  };
};

/**
 * Gerencia o cursor personalizado
 */
const inicializarCursorPersonalizado = () => {
  const cursorPrincipal = document.createElement('div');
  cursorPrincipal.className = 'cursor-principal';
  
  // SVG da seta personalizada (formato triangular)
  cursorPrincipal.innerHTML = `
<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24"><path stroke="#f1f1f1" stroke-width="1.5" d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87a.5.5 0 0 0 .35-.85L6.35 2.85a.5.5 0 0 0-.85.35Z"</path></svg>
`;
  
  document.body.appendChild(cursorPrincipal);

  let posX = 0, posY = 0;
  document.addEventListener('mousemove', e => {
    posX = e.clientX;
    posY = e.clientY;
    
    cursorPrincipal.style.left = `${posX}px`;
    cursorPrincipal.style.top = `${posY}px`;
  });

  // Elementos clicáveis
  const elementosClicaveis = document.querySelectorAll('a, button, .botao-primario, .item-portfolio, [role="button"]');
  
  // Oculta o cursor personalizado sobre elementos clicáveis
  elementosClicaveis.forEach(el => {
    el.addEventListener('mouseover', () => {
      cursorPrincipal.classList.add('sobre-clicavel');
    });
    
    el.addEventListener('mouseout', () => {
      cursorPrincipal.classList.remove('sobre-clicavel');
    });
  });

  // Oculta o cursor personalizado sobre campos de texto
  document.querySelectorAll('input, textarea').forEach(el => {
    el.addEventListener('mouseover', () => {
      cursorPrincipal.classList.add('sobre-clicavel');
    });
    
    el.addEventListener('mouseout', () => {
      cursorPrincipal.classList.remove('sobre-clicavel');
    });
  });
};

/**
 * Gerencia tooltips personalizados para o site da Agência m2a
 */
const GerenciadorTooltips = (function() {
  // Variáveis privadas
  let tooltipContainer;
  let tooltipTexto;
  let elementoAtual = null;
  let mobileTimerId = null;
  let tooltipVisivel = false;
  let lastMouseX = 0;
  let lastMouseY = 0;
  let scrollTimeout = null;
  
  /**
   * Inicializa os tooltips e configura eventos
   * @private
   */
  function inicializar() {
    tooltipContainer = document.getElementById('tooltip-personalizado');
    tooltipTexto = tooltipContainer.querySelector('.tooltip-texto');
    
    // Detectar todos elementos com tooltips
    const elementosComTooltip = document.querySelectorAll('[data-tooltip]');
    
    // Adicionar eventos para cada elemento
    elementosComTooltip.forEach(elemento => {
      // Em dispositivos desktop
      elemento.addEventListener('mouseenter', e => mostrarTooltip(e, elemento));
      elemento.addEventListener('mouseleave', esconderTooltip);
      elemento.addEventListener('mousemove', e => posicionarTooltip(e));
      
      // Em dispositivos mobile (touch)
      elemento.addEventListener('touchstart', e => {
        // Prevenir gestos de scroll padrão
        e.preventDefault();
        
        // Se já tiver um tooltip aberto em outro elemento, fecha
        if (elementoAtual && elementoAtual !== elemento) {
          esconderTooltip();
        }
        
        // Toggle do tooltip atual
        if (elementoAtual === elemento) {
          esconderTooltip();
        } else {
          mostrarTooltip(e, elemento);
          
          // Esconder após um tempo em dispositivos touch
          clearTimeout(mobileTimerId);
          mobileTimerId = setTimeout(esconderTooltip, 3000);
        }
      });
      
      // Acessibilidade via teclado
      elemento.addEventListener('focus', e => mostrarTooltip(e, elemento));
      elemento.addEventListener('blur', esconderTooltip);
      
      // Garantir que os elementos possam receber foco
      if (!elemento.getAttribute('tabindex')) {
        elemento.setAttribute('tabindex', '0');
      }
      
      // Adicionar atributos de acessibilidade
      elemento.setAttribute('aria-describedby', 'tooltip-personalizado');
    });
    
    // Esconder tooltip ao clicar em qualquer lugar (para dispositivos touch)
    document.addEventListener('touchstart', e => {
      if (tooltipVisivel && (!elementoAtual || !elementoAtual.contains(e.target))) {
        esconderTooltip();
      }
    });
    
    // Esconder tooltip ao rolar a página
    document.addEventListener('scroll', () => {
      if (tooltipVisivel) {
        esconderTooltip();
      }
    });
    
    // Rastrear posição do mouse
    document.addEventListener('mousemove', (e) => {
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    });
    
    // Verificar elementos sob o cursor após o scroll
    window.addEventListener('scroll', () => {
      // Esconder tooltip durante o scroll para evitar posicionamento incorreto
      if (tooltipVisivel) {
        esconderTooltip();
      }
      
      // Usando debounce para melhorar performance
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        verificarElementosSobCursor();
      }, 200); // 200ms após parar de rolar
    });
  }
  
  /**
   * Verifica se há elementos com tooltip sob o cursor
   * @private
   */
  function verificarElementosSobCursor() {
    if (lastMouseX === 0 && lastMouseY === 0) return;
    
    // Obtém o elemento na posição atual do mouse
    const elementoSobCursor = document.elementFromPoint(lastMouseX, lastMouseY);
    
    if (!elementoSobCursor) return;
    
    // Verifica se o elemento ou algum de seus pais tem data-tooltip
    let elemento = elementoSobCursor;
    while (elemento && elemento !== document.body) {
      if (elemento.hasAttribute('data-tooltip')) {
        // Mostra o tooltip para o elemento encontrado
        mostrarTooltip({ clientX: lastMouseX, clientY: lastMouseY }, elemento);
        return;
      }
      elemento = elemento.parentElement;
    }
  }
  
  /**
   * Mostra o tooltip com o conteúdo adequado
   * @private
   */
  function mostrarTooltip(evento, elemento) {
    const conteudoTooltip = elemento.getAttribute('data-tooltip');
    
    if (!conteudoTooltip) return;
    
    tooltipTexto.innerHTML = conteudoTooltip;
    elementoAtual = elemento;
    tooltipVisivel = true;
    
    // Posicionar o tooltip
    posicionarTooltip(evento);
    
    // Mostrar o tooltip
    tooltipContainer.classList.add('visivel');
    tooltipContainer.setAttribute('aria-hidden', 'false');
  }
  
  /**
   * Esconde o tooltip
   * @private
   */
  function esconderTooltip() {
    tooltipContainer.classList.remove('visivel');
    tooltipContainer.setAttribute('aria-hidden', 'true');
    elementoAtual = null;
    tooltipVisivel = false;
    clearTimeout(mobileTimerId);
  }
  
  /**
   * Posiciona o tooltip junto ao mouse ou elemento
   * @private
   */
  function posicionarTooltip(evento) {
    if (!elementoAtual) return;
    
    const isTouchDevice = evento.type === 'touchstart';
    
    if (isTouchDevice) {
      // Posicionamento para dispositivos touch (centralizado acima do elemento)
      const rect = elementoAtual.getBoundingClientRect();
      const elementoX = rect.left + (rect.width / 2);
      const elementoY = rect.top;
      
      tooltipContainer.style.left = `${elementoX}px`;
      tooltipContainer.style.top = `${elementoY - 10}px`;
    } else {
      // Posicionamento seguindo o cursor
      const mouseX = evento.clientX;
      const mouseY = evento.clientY;
      
      tooltipContainer.style.left = `${mouseX}px`;
      tooltipContainer.style.top = `${mouseY - 10}px`;
    }
  }
  
  /**
   * Adiciona tooltip a um elemento dinamicamente
   * @public
   */
  function adicionarTooltip(elemento, texto) {
    if (!elemento || !texto) return;
    
    elemento.setAttribute('data-tooltip', texto);
    
    // Remover eventos existentes para evitar duplicação
    elemento.removeEventListener('mouseenter', e => mostrarTooltip(e, elemento));
    elemento.removeEventListener('mouseleave', esconderTooltip);
    
    // Adicionar novos eventos
    elemento.addEventListener('mouseenter', e => mostrarTooltip(e, elemento));
    elemento.addEventListener('mouseleave', esconderTooltip);
    elemento.addEventListener('mousemove', e => posicionarTooltip(e));
    
    // Acessibilidade
    if (!elemento.getAttribute('tabindex')) {
      elemento.setAttribute('tabindex', '0');
    }
    elemento.setAttribute('aria-describedby', 'tooltip-personalizado');
  }
  
  // Interface pública
  return {
    inicializar: inicializar,
    adicionarTooltip: adicionarTooltip
  };
})();

/**
 * Inicializa o sistema de busca no portfólio
 */
const inicializarBuscaPortfolio = () => {
  const campoBusca = document.getElementById('campoBuscaPortfolio');
  const infoResultados = document.getElementById('resultadosBusca');
  const galeriaPortfolio = document.querySelector('.galeria-portfolio');
  
  // Elemento para exibir quando não houver resultados
  const semResultados = document.createElement('div');
  semResultados.className = 'sem-resultados';
  semResultados.textContent = 'Nenhum trabalho corresponde à sua busca. Tente outros termos.';
  galeriaPortfolio.appendChild(semResultados);
  
  // Armazenar todos os itens do portfólio (visíveis e ocultos)
  let todosItens = [];
  let itensTrabalhosAdicionais = []; // Armazenar referência aos itens adicionais
  let dicionarioTermos = {};
  let termoBuscaAtual = ''; // Armazenar o termo de busca atual
  
  // Função para inicializar o dicionário de termos
  const inicializarDicionarioTermos = () => {
      // Capturar itens visíveis
      const itensVisiveis = document.querySelectorAll('.item-portfolio');
      todosItens = Array.from(itensVisiveis);
      
      // Adicionar referência aos itens adicionais que ainda serão carregados
      if (!GerenciadorPortfolio.estaoTrabalhosCarregados() && itensTrabalhosAdicionais.length === 0) {
          // Acessando os trabalhos adicionais através do módulo
          const trabalhosAdicionais = GerenciadorPortfolio.getTrabalhosAdicionais();
          trabalhosAdicionais.forEach((trabalho, indice) => {
              itensTrabalhosAdicionais.push({
                  virtual: true, // Indicador de que é um item virtual (ainda não carregado)
                  indice: todosItens.length + indice,
                  dados: trabalho
              });
          });
      }
      
      atualizarDicionario();
  };
  
  // Função para atualizar o dicionário de termos
  const atualizarDicionario = () => {
    dicionarioTermos = {}; // Resetar o dicionário
    
    // Indexar os itens visíveis
    todosItens.forEach((item, indice) => {
      indexarItem(item, indice, false);
    });
    
    // Indexar os itens virtuais (não carregados)
    itensTrabalhosAdicionais.forEach(item => {
      if (item.virtual) {
        indexarItemVirtual(item);
      }
    });
    
    // Reaplicar filtro se houver busca em andamento
    if (termoBuscaAtual.trim()) {
      filtrarPortfolio(termoBuscaAtual);
    }
  };
  
  // Indexar um item visível no DOM
  const indexarItem = (item, indice, isAdicional) => {
    const imagem = item.querySelector('img');
    const titulo = item.querySelector('.info-portfolio h3')?.textContent || '';
    const cliente = item.querySelector('.info-portfolio p')?.textContent || '';
    
    // Texto completo do item
    const textoCompleto = `${imagem.alt} ${titulo} ${cliente}`.toLowerCase();
    
    // Armazenar texto completo no atributo data para acesso rápido
    item.dataset.textoCompleto = textoCompleto;
    item.dataset.indice = indice;
    
    // Adicionar ao dicionário de termos
    adicionarAoDicionario(textoCompleto, indice);
    
    // Se for um item adicional que foi carregado, remover da lista de virtuais
    if (isAdicional) {
      itensTrabalhosAdicionais = itensTrabalhosAdicionais.filter(item => 
        item.indice !== indice || !item.virtual
      );
    }
  };
  
  // Indexar um item virtual (ainda não carregado)
  const indexarItemVirtual = (item) => {
    const { dados, indice } = item;
    
    // Texto completo do item virtual
    const textoCompleto = `${dados.titulo} ${dados.cliente}`.toLowerCase();
    
    // Adicionar ao dicionário de termos
    adicionarAoDicionario(textoCompleto, indice);
  };
  
  // Adicionar termos ao dicionário
  const adicionarAoDicionario = (textoCompleto, indice) => {
    // Separar em termos individuais
    const termos = textoCompleto
      .split(/\s+/) // Divide por espaços
      .filter(termo => termo.length > 2) // Ignora termos muito curtos
      .map(termo => termo.replace(/[^\w\sáàâãéèêíïóôõöúüç]/g, '')); // Remove caracteres especiais
    
    // Adicionar cada termo ao dicionário
    termos.forEach(termo => {
      if (!dicionarioTermos[termo]) {
        dicionarioTermos[termo] = [];
      }
      
      // Evitar duplicados
      if (!dicionarioTermos[termo].includes(indice)) {
        dicionarioTermos[termo].push(indice);
      }
    });
  };
  
  // Função para filtrar o portfólio
  const filtrarPortfolio = (termoBusca) => {
    termoBuscaAtual = termoBusca; // Armazenar o termo atual
    const termoLimpo = termoBusca.trim().toLowerCase();
    
    // Se a busca estiver vazia, mostrar todos os itens
    if (!termoLimpo) {
      todosItens.forEach(item => {
        item.style.display = '';
        item.classList.remove('item-filtrado');
      });
      
      semResultados.classList.remove('visivel');
      infoResultados.textContent = '';
      infoResultados.classList.remove('visivel');
      return;
    }
    
    // Dividir o termo de busca em palavras individuais
    const termosBusca = termoLimpo.split(/\s+/).filter(termo => termo.length > 2);
    
    // Conjunto para armazenar os índices dos itens correspondentes
    let indicesCorrespondentes = new Set();
    let indicesVirtuais = new Set(); // Para itens ainda não carregados
    
    // Se tivermos apenas um termo, usamos o dicionário
    if (termosBusca.length === 1) {
      const termo = termosBusca[0];
      
      // Buscar no dicionário
      Object.keys(dicionarioTermos).forEach(chave => {
        if (chave.includes(termo)) {
          dicionarioTermos[chave].forEach(indice => {
            // Verificar se é um item virtual ou real
            const itemVirtual = itensTrabalhosAdicionais.find(
              item => item.indice === indice && item.virtual
            );
            
            if (itemVirtual) {
              indicesVirtuais.add(indice);
            } else {
              indicesCorrespondentes.add(indice);
            }
          });
        }
      });
    } 
    // Se tivermos múltiplos termos, fazemos uma busca completa
    else {
      // Verificar itens visíveis
      todosItens.forEach((item, indice) => {
        const textoCompleto = item.dataset.textoCompleto;
        if (termosBusca.every(termo => textoCompleto.includes(termo))) {
          indicesCorrespondentes.add(indice);
        }
      });
      
      // Verificar itens virtuais
      itensTrabalhosAdicionais.forEach(item => {
        if (item.virtual) {
          const textoCompleto = `${item.dados.titulo} ${item.dados.cliente}`.toLowerCase();
          if (termosBusca.every(termo => textoCompleto.includes(termo))) {
            indicesVirtuais.add(item.indice);
          }
        }
      });
    }
    
    // Se temos resultados nos itens virtuais, verificar se o botão "Ver mais" está visível
    const temResultadosVirtuais = indicesVirtuais.size > 0;
    const botaoCarregarMais = document.getElementById('carregarMais');
    
    // Aplicar filtragem nos itens visíveis
    let contadorVisiveis = 0;
    
    todosItens.forEach((item, indice) => {
      const corresponde = indicesCorrespondentes.has(Number(item.dataset.indice));
      
      if (corresponde) {
        item.style.display = '';
        item.classList.add('item-filtrado');
        contadorVisiveis++;
      } else {
        item.style.display = 'none';
        item.classList.remove('item-filtrado');
      }
    });
    
    // Atualizar informações de resultados
    const totalResultados = contadorVisiveis + indicesVirtuais.size;
    
    if (totalResultados === 0) {
      semResultados.classList.add('visivel');
      infoResultados.textContent = 'Nenhum resultado encontrado';
    } else {
      semResultados.classList.remove('visivel');
      
      // Mensagem específica para itens não carregados
      if (temResultadosVirtuais && botaoCarregarMais && !botaoCarregarMais.disabled) {
        if (contadorVisiveis === 0) {
          infoResultados.innerHTML = `<strong>${indicesVirtuais.size}</strong> ${indicesVirtuais.size === 1 ? 'resultado encontrado' : 'resultados encontrados'} (clique em "Ver mais trabalhos" para visualizar)`;
        } else {
          infoResultados.innerHTML = `<strong>${totalResultados}</strong> ${totalResultados === 1 ? 'resultado encontrado' : 'resultados encontrados'} (${indicesVirtuais.size} em trabalhos ainda não carregados)`;
        }
      } else {
        infoResultados.textContent = `${contadorVisiveis} ${contadorVisiveis === 1 ? 'resultado encontrado' : 'resultados encontrados'}`;
      }
    }
    
    infoResultados.classList.add('visivel');
  };
  
  // Inicializar dicionário após carregar a página
  inicializarDicionarioTermos();
  
  // Event listener para digitação no campo de busca (com debounce)
  let timeoutBusca;
  campoBusca.addEventListener('input', () => {
    clearTimeout(timeoutBusca);
    timeoutBusca = setTimeout(() => {
      filtrarPortfolio(campoBusca.value);
    }, 300); // Aguarda 300ms após o usuário parar de digitar
  });
  
  // Função para atualizar os itens quando novos são carregados
  const atualizarItens = (novoItens) => {
    // Adicionar novos itens à lista de todos os itens
    todosItens = Array.from(document.querySelectorAll('.item-portfolio'));
    
    // Atualizar o dicionário
    atualizarDicionario();
    
    // Se houver uma busca em andamento, reaplicar o filtro
    if (termoBuscaAtual.trim()) {
      filtrarPortfolio(termoBuscaAtual);
    }
  };
  
  // Registra este handler com o GerenciadorPortfolio
  GerenciadorPortfolio.registrarBuscaHandler({
    atualizarDicionario,
    atualizarItens,
    filtrarPortfolio
  });

  return {
    atualizarDicionario,
    atualizarItens,
    filtrarPortfolio
  };
};

/**
 * Inicializa o modal para visualização das imagens do portfólio
 */
const inicializarModalPortfolio = () => {
  // Elementos do DOM
  const modal = document.getElementById('modal-portfolio');
  const btnFechar = document.getElementById('btn-fechar-modal');
  const btnAnterior = document.getElementById('btn-anterior-modal');
  const btnProximo = document.getElementById('btn-proximo-modal');
  const imgModal = document.getElementById('img-modal');
  const legendaModal = document.getElementById('legenda-modal');
  
  // Variáveis para controle do portfólio
  let itensPortfolio = [];
  let indiceAtual = 0;
  
  // Inicializa o modal atribuindo eventos aos itens do portfólio
  const inicializar = () => {
    // Seleciona todos os itens de portfólio
    itensPortfolio = document.querySelectorAll('.item-portfolio');
    
    // Adiciona evento de clique em cada item
    itensPortfolio.forEach((item, indice) => {
      item.addEventListener('click', () => abrirModal(indice));
    });
    
    // Eventos dos botões do modal
    btnFechar.addEventListener('click', fecharModal);
    btnAnterior.addEventListener('click', mostrarAnterior);
    btnProximo.addEventListener('click', mostrarProximo);
    
    // Fechamento do modal ao clicar fora da imagem
    modal.addEventListener('click', (e) => {
      if (e.target === modal) fecharModal();
    });
    
    // Navegação por teclado
    document.addEventListener('keydown', controlarTeclado);
    
    // Eventos de touch para dispositivos móveis
    let toqueInicial = 0;
    let toqueFinal = 0;
    
    modal.addEventListener('touchstart', (e) => {
      toqueInicial = e.changedTouches[0].clientX;
    });
    
    modal.addEventListener('touchend', (e) => {
      toqueFinal = e.changedTouches[0].clientX;
      
      // Detecção de direção do gesto
      const diferenca = toqueFinal - toqueInicial;
      if (Math.abs(diferenca) > 50) { // Limiar para considerar como gesto
        if (diferenca > 0) {
          mostrarAnterior(); // Gesto da esquerda para direita: imagem anterior
        } else {
          mostrarProximo(); // Gesto da direita para esquerda: próxima imagem
        }
      }
    });
  };
  
  // Função para abrir o modal com imagem específica
  const abrirModal = (indice) => {
    if (indice < 0 || indice >= itensPortfolio.length) return;
    
    indiceAtual = indice;
    const item = itensPortfolio[indice];
    const imagem = item.querySelector('img');
    const titulo = item.querySelector('.info-portfolio h3')?.textContent || '';
    const cliente = item.querySelector('.info-portfolio p')?.textContent || '';
    
    // Atualiza o conteúdo do modal
    imgModal.src = imagem.src;
    imgModal.alt = imagem.alt;
    legendaModal.innerHTML = `<strong>${titulo}</strong><br>${cliente}`;
    
    // Atualiza visibilidade dos botões de navegação
    atualizarBotoesNavegacao();
    
    // Mostra o modal
    modal.classList.add('modal-ativo');
    document.body.style.overflow = 'hidden'; // Impede rolagem do fundo
    
    // Mantém o cursor personalizado visível, mas ajusta seu z-index
    const cursorPrincipal = document.querySelector('.cursor-principal');
    if (cursorPrincipal) {
      cursorPrincipal.style.zIndex = '10002'; // Valor maior que o z-index do modal
    }
  };
  
  // Função para fechar o modal
  const fecharModal = () => {
    modal.classList.remove('modal-ativo');
    document.body.style.overflow = ''; // Restaura rolagem do fundo
    
    // Restaura o z-index original do cursor personalizado
    const cursorPrincipal = document.querySelector('.cursor-principal');
    if (cursorPrincipal) {
      cursorPrincipal.style.zIndex = '9999'; // Valor original do z-index
    }
  };
  
  // Função para mostrar imagem anterior
  const mostrarAnterior = () => {
    if (indiceAtual > 0) {
      abrirModal(indiceAtual - 1);
    }
  };
  
  // Função para mostrar próxima imagem
  const mostrarProximo = () => {
    if (indiceAtual < itensPortfolio.length - 1) {
      abrirModal(indiceAtual + 1);
    }
  };
  
  // Atualiza visibilidade dos botões de navegação
  const atualizarBotoesNavegacao = () => {
    // Mostrar ou ocultar botões com base na posição atual
    btnAnterior.style.visibility = indiceAtual > 0 ? 'visible' : 'hidden';
    btnProximo.style.visibility = indiceAtual < itensPortfolio.length - 1 ? 'visible' : 'hidden';
  };
  
  // Controle por teclado
  const controlarTeclado = (e) => {
    if (!modal.classList.contains('modal-ativo')) return;
    
    switch (e.key) {
      case 'Escape':
        fecharModal();
        break;
      case 'ArrowLeft':
        mostrarAnterior();
        break;
      case 'ArrowRight':
        mostrarProximo();
        break;
    }
  };
  
  // Inicializa o modal
  inicializar();
  
  // Função para atualizar os itens do portfólio quando novos são adicionados
  const atualizarItens = () => {
    itensPortfolio = document.querySelectorAll('.item-portfolio');
    
    // Adiciona evento de clique nos novos itens
    itensPortfolio.forEach((item, indice) => {
      // Remove evento anterior para evitar duplicação
      item.replaceWith(item.cloneNode(true));
    });
    
    // Reassocia eventos após clonagem
    itensPortfolio = document.querySelectorAll('.item-portfolio');
    itensPortfolio.forEach((item, indice) => {
      item.addEventListener('click', () => abrirModal(indice));
    });
  };
  
  // Registra este handler com o GerenciadorPortfolio
  GerenciadorPortfolio.registrarModalHandler({
    atualizarItens
  });

  // Retorna função para atualizar itens, para ser chamada quando novos itens são adicionados
  return {
    atualizarItens
  };
};


/**
 * Inicializa funcionalidades adicionais quando necessário
 */
window.addEventListener('load', () => {
  // Adiciona smooth scroll para links âncora
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const alvo = document.querySelector(this.getAttribute('href'));
      if (alvo) {
        alvo.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
});
