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
  GerenciadorTracking.inicializar();
  inicializarNavegacao();
  inicializarCursorPersonalizado();
  inicializarBotaoTopo();
  inicializarBotaoWhatsApp();
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
    GerenciadorTracking.carregar();
    GerenciadorTracking.consentir();
    RastreadorVisitantes.iniciar();
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
  
  // Captura o clique no link da política de privacidade
  const linkPolitica = document.querySelector('.lgpd-texto a[href="#politica-privacidade"]');

  if (linkPolitica) {
    linkPolitica.addEventListener('click', async (e) => {
      e.preventDefault();

      try {
        // Faz a requisição para carregar o arquivo de texto
        const resposta = await fetch('assets/TERMOS-DE-USO-E-POLITICA-DE-PRIVACIDADE.txt');
        if (!resposta.ok) throw new Error('Falha ao carregar o arquivo de texto');
        const textoTermos = await resposta.text();

        // Cria o textarea somente leitura
        const textarea = document.createElement('textarea');
        textarea.readOnly = true;
        textarea.classList.add('lgpd-termos');
        textarea.value = textoTermos;

        // Insere o textarea no modal, entre a div.lgpd-texto e a div.lgpd-botoes
        const divTexto = document.querySelector('.lgpd-texto');
        const divBotoes = document.querySelector('.lgpd-botoes');

        if (divTexto && divBotoes) {
          // Remove textarea antigo se existir
          const textareaExistente = document.querySelector('.lgpd-termos');
          if (textareaExistente) textareaExistente.remove();

          divTexto.insertAdjacentElement('afterend', textarea);
        }
      } catch (erro) {
        console.error('Erro ao carregar os termos:', erro);
      }
    });
  }

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
 * Gerencia o carregamento e configuração de ferramentas de tracking (Clarity e PostHog)
 */
const GerenciadorTracking = (function() {
  // IDs e configurações
  const CLARITY_PROJECT_ID = 'm1ee0kdf17';
  const POSTHOG_API_KEY = 'phc_rJ0hkpCluCUtcgqmE3NDKnPyyNnGlbmG01cnbsb79E5';
  const POSTHOG_API_HOST = 'https://us.i.posthog.com';
  
  // Status de carregamento
  let clarityCarregado = false;
  let posthogCarregado = false;
  
  /**
   * Carrega o script do Microsoft Clarity dinamicamente
   */
  function carregarClarity() {
    if (clarityCarregado) return;
    
    try {
      // Configura a função global clarity
      window.clarity = window.clarity || function(){(window.clarity.q = window.clarity.q || []).push(arguments)};
      
      // Cria o elemento de script
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.clarity.ms/tag/${CLARITY_PROJECT_ID}`;
      
      // Adiciona ao head
      const primeiroScript = document.getElementsByTagName('script')[0];
      primeiroScript.parentNode.insertBefore(script, primeiroScript);
      
      // Sinaliza que o Clarity foi carregado
      clarityCarregado = true;
      
      console.log('Microsoft Clarity carregado com sucesso');
    } catch (erro) {
      console.error('Erro ao carregar Microsoft Clarity:', erro);
    }
  }
  
  /**
   * Carrega o script do PostHog dinamicamente
   */
  function carregarPostHog() {
    if (posthogCarregado) return;
    
    try {
      // Inicializa o objeto posthog
      window.posthog = window.posthog || [];
      
      // Função para carregar o PostHog
      !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSurveysLoaded onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey canRenderSurveyAsync identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug getPageViewId captureTraceFeedback captureTraceMetric".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
      
      // Inicializa o PostHog
      posthog.init(POSTHOG_API_KEY, {
        api_host: POSTHOG_API_HOST,
        person_profiles: 'identified_only',
      });
      
      // Sinaliza que o PostHog foi carregado
      posthogCarregado = true;
      
      console.log('PostHog carregado com sucesso');
    } catch (erro) {
      console.error('Erro ao carregar PostHog:', erro);
    }
  }
  
  /**
   * Ativa o consentimento no Clarity e PostHog
   */
  function ativarConsentimento() {
    // Pequeno atraso para garantir que os scripts foram carregados
    setTimeout(() => {
      // Ativa consentimento no Clarity
      if (typeof window.clarity === 'function') {
        window.clarity('consent');
        console.log('Consentimento ativado no Microsoft Clarity');
      }
      
      // Ativa consentimento no PostHog (opt_in_capturing)
      if (typeof window.posthog === 'object' && typeof window.posthog.opt_in_capturing === 'function') {
        window.posthog.opt_in_capturing();
        console.log('Consentimento ativado no PostHog');
      }
    }, 1000);
  }
  
  /**
   * Carrega todas as ferramentas de tracking
   */
  function carregarFerramentas() {
    carregarClarity();
    carregarPostHog();
    ativarConsentimento();
  }

  /**
   * Gerencia o rastreamento de visitantes para o sistema próprio da Agência m2a
   */
  const RastreadorVisitantes = (function() {
    // Configurações
    const INTERVALO_ENVIO = 30000; // 30 segundos entre envios
    const URL_API = '/api/registrar-visitante.php';
    const URL_VERIFICACAO = '/api/verificar-visitante.php';
    
    // Variáveis de estado
    let visitanteUUID;
    let novoVisitante = true;
    let totalCliques = 0;
    let cliquesElementosClicaveis = 0;
    let inicioPagina = Date.now();
    let duracaoSessao = 0;
    let rastreamentoIniciado = false;
    let intervaloDuracao;
    
    /**
     * Gera ou recupera um identificador único para o visitante
     */
    function gerarOuRecuperarUUID() {
      // Tentar obter UUID existente
      let uuid = localStorage.getItem('agencia_m2a_visitante_uuid');
      
      // Se não existir, gerar um novo
      if (!uuid) {
        uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
        
        localStorage.setItem('agencia_m2a_visitante_uuid', uuid);
        novoVisitante = true;
      } else {
        // Verificar se esse UUID já existe no banco de dados
        verificarSeEhNovoVisitante(uuid);
      }
      
      return uuid;
    }
    
    /**
     * Verifica na API se o visitante já existe no banco de dados
     * @param {string} uuid - Identificador do visitante
     */
    async function verificarSeEhNovoVisitante(uuid) {
      try {
        const resposta = await fetch(`${URL_VERIFICACAO}?uuid=${encodeURIComponent(uuid)}`);
        if (resposta.ok) {
          const dados = await resposta.json();
          novoVisitante = !dados.existe;
        }
      } catch (erro) {
        console.error('Erro ao verificar visitante:', erro);
        // Em caso de erro, assume que é um novo visitante
        novoVisitante = true;
      }
    }
    
    /**
     * Coleta os parâmetros UTM da URL
     * @return {Object} Objeto contendo os parâmetros UTM
     */
    function obterParametrosUTM() {
      const urlParams = new URLSearchParams(window.location.search);
      return {
        utm_source: urlParams.get('utm_source') || '',
        utm_medium: urlParams.get('utm_medium') || '',
        utm_campaign: urlParams.get('utm_campaign') || '',
        utm_content: urlParams.get('utm_content') || '',
        utm_term: urlParams.get('utm_term') || ''
      };
    }
    
    /**
     * Coleta dados sobre a sessão e o dispositivo
     * @return {Object} Dados coletados
     */
    function coletarDadosSessao() {
      return {
        dimensao_tela: `${window.innerWidth}x${window.innerHeight}`,
        referrer: document.referrer || '',
        ...obterParametrosUTM()
      };
    }
    
    /**
     * Inicia o rastreamento dos cliques
     */
    function rastrearCliques() {
      document.addEventListener('click', function(evento) {
        totalCliques++;
        
        // Verifica se o elemento clicado é clicável
        const elementoClicado = evento.target;
        const elementosClicaveis = [
          'A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'LABEL',
          'DETAILS', 'SUMMARY', '[role="button"]'
        ];
        
        // Verifica se o elemento ou seus pais são clicáveis
        let elemento = elementoClicado;
        let ehClicavel = false;
        
        while (elemento && elemento !== document.body) {
          if (elementosClicaveis.includes(elemento.tagName) || 
              elemento.hasAttribute('role') || 
              getComputedStyle(elemento).cursor === 'pointer') {
            ehClicavel = true;
            break;
          }
          elemento = elemento.parentElement;
        }
        
        if (ehClicavel) {
          cliquesElementosClicaveis++;
        }
      }, true);
    }
    
    /**
     * Atualiza a duração da sessão
     */
    function atualizarDuracaoSessao() {
      duracaoSessao = Math.floor((Date.now() - inicioPagina) / 1000);
    }
    
    /**
     * Envia os dados para a API
     */
    async function enviarDados() {
      if (!rastreamentoIniciado) return;
      
      // Atualiza a duração da sessão
      atualizarDuracaoSessao();
      
      // Prepara os dados para envio
      const dados = {
        uuid: visitanteUUID,
        novo_visitante: novoVisitante,
        total_cliques: totalCliques,
        cliques_elementos_clicaveis: cliquesElementosClicaveis,
        duracao_sessao: duracaoSessao,
        ...coletarDadosSessao()
      };
      
      try {
        const resposta = await fetch(URL_API, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          },
          body: JSON.stringify(dados),
          credentials: 'same-origin'
        });
        
        if (!resposta.ok) {
          throw new Error(`Erro HTTP: ${resposta.status}`);
        }
        
        // Se o envio foi bem-sucedido, marca como não sendo mais novo visitante
        novoVisitante = false;
        
        console.log('Dados de rastreamento enviados com sucesso');
      } catch (erro) {
        console.error('Erro ao enviar dados de rastreamento:', erro);
      }
    }
    
    /**
     * Configura os eventos da sessão (antes de fechar a página, etc.)
     */
    function configurarEventosSessao() {
      // Enviar dados antes do usuário sair da página
      window.addEventListener('beforeunload', function() {
        // Usa sendBeacon para envio assíncrono que continua mesmo quando a página está fechando
        atualizarDuracaoSessao();
        
        const dados = {
          uuid: visitanteUUID,
          novo_visitante: novoVisitante,
          total_cliques: totalCliques,
          cliques_elementos_clicaveis: cliquesElementosClicaveis,
          duracao_sessao: duracaoSessao,
          ...coletarDadosSessao()
        };
        
        // Usar sendBeacon para garantir que os dados sejam enviados mesmo que a página esteja fechando
        if (navigator.sendBeacon) {
          navigator.sendBeacon(URL_API, JSON.stringify(dados));
        } else {
          // Fallback para fetch caso sendBeacon não seja suportado
          fetch(URL_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados),
            keepalive: true
          }).catch(e => console.error('Erro no envio final de dados:', e));
        }
      });
      
      // Manter rastreamento de duração mesmo quando a guia estiver em segundo plano
      document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'hidden') {
          // Usuário saiu da página, enviar dados atuais
          enviarDados();
        }
      });
    }
    
    /**
     * Inicia o rastreamento de visitantes
     */
    function iniciar() {
      if (rastreamentoIniciado) return;
      
      try {
        // Gera ou recupera o UUID do visitante
        visitanteUUID = gerarOuRecuperarUUID();
        
        // Inicia o rastreamento de cliques
        rastrearCliques();
        
        // Configura eventos da sessão
        configurarEventosSessao();
        
        // Envia dados iniciais
        enviarDados();
        
        // Configura envio periódico de dados
        intervaloDuracao = setInterval(function() {
          enviarDados();
        }, INTERVALO_ENVIO);
        
        rastreamentoIniciado = true;
        console.log('Rastreamento de visitantes iniciado');
      } catch (erro) {
        console.error('Erro ao iniciar rastreamento:', erro);
      }
    }
    
    /**
     * Para o rastreamento de visitantes
     */
    function parar() {
      if (!rastreamentoIniciado) return;
      
      // Limpa o intervalo
      clearInterval(intervaloDuracao);
      
      // Envia dados finais
      enviarDados();
      
      rastreamentoIniciado = false;
      console.log('Rastreamento de visitantes parado');
    }
    
    // Interface pública
    return {
      iniciar,
      parar,
      enviarDados
    };
})();

  
  /**
   * Inicializa o tracking caso o consentimento já exista
   */
  function inicializarComConsentimentoExistente() {
    try {
      const consentimentoExistente = localStorage.getItem('agencia_m2a_lgpd_consentimento') === 'aceito';
      
      if (consentimentoExistente) {
        carregarFerramentas();
        
        // Iniciar também o rastreamento próprio se já houver consentimento
        if (typeof RastreadorVisitantes === 'object' && typeof RastreadorVisitantes.iniciar === 'function') {
          RastreadorVisitantes.iniciar();
        }
      }
    } catch (erro) {
      console.error('Erro ao verificar consentimento para tracking:', erro);
    }
  }
  
  // Interface pública
  return {
    inicializar: inicializarComConsentimentoExistente,
    carregar: carregarFerramentas,
    consentir: ativarConsentimento
  };
})();

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
 * Configura o botão flutuante de WhatsApp para rolar até o formulário
 */
const inicializarBotaoWhatsApp = () => {
  const botaoWhatsApp = document.querySelector('.botao-whatsapp');
  const formularioContato = document.querySelector('.form-contato');
  
  if (!botaoWhatsApp || !formularioContato) return;
  
  botaoWhatsApp.addEventListener('click', (e) => {
    // Previne comportamento padrão de abrir o WhatsApp diretamente
    e.preventDefault();
    
    // Obtém a seção de contato para rolagem
    const secaoContato = document.getElementById('contato');
    
    // Rola a página até a seção de contato
    secaoContato.scrollIntoView({ behavior: 'smooth' });
    
    // Após a rolagem, destaca o formulário com a animação de contorno piscante
    setTimeout(() => {
      // Remove a classe caso já estivesse aplicada anteriormente
      formularioContato.classList.remove('form-destacado');
      
      // Força um reflow para garantir que a animação funcione mesmo se clicado novamente
      void formularioContato.offsetWidth;
      
      // Adiciona a classe para iniciar a animação
      formularioContato.classList.add('form-destacado');
      
      // Remove a classe após a animação terminar
      setTimeout(() => {
        formularioContato.classList.remove('form-destacado');
      }, 2500); // Duração aproximada das 3 piscadas (3 * 0.8s)
    }, 800); // Tempo aproximado para rolagem terminar
  });
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
  console.log('Inicializando formulário de contato');
  const formulario = document.getElementById('formularioContato');
  console.log('Formulário capturado:', formulario);
  
  if (!formulario) {
    console.error('Formulário não encontrado no DOM');
    return;
  }
  
  // Gera um token CSRF para segurança nas requisições
  const gerarTokenCSRF = () => {
    console.log('Gerando novo token CSRF');
    const randomBytes = new Uint8Array(16);
    window.crypto.getRandomValues(randomBytes);
    return Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('');
  };
  
  // Armazena token CSRF em sessionStorage
  const tokenCSRF = sessionStorage.getItem('csrf_token') || gerarTokenCSRF();
  console.log('Token CSRF:', tokenCSRF);
  sessionStorage.setItem('csrf_token', tokenCSRF);
  
  // Valida formato de e-mail
  const validarEmail = (email) => {
    console.log('Validando email:', email);
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const resultado = regex.test(email);
    console.log('Email é válido?', resultado);
    return resultado;
  };
  
  // Valida formato de telefone
  const validarTelefone = (telefone) => {
    console.log('Validando telefone:', telefone);
    const apenasNumeros = telefone.replace(/\D/g, '');
    const resultado = apenasNumeros.length >= 10 && apenasNumeros.length <= 11;
    console.log('Telefone é válido?', resultado, 'Números:', apenasNumeros.length);
    return resultado;
  };
  
  // Adiciona máscara ao campo de telefone
  const campoTelefone = document.getElementById('telefone');
  console.log('Campo telefone encontrado:', campoTelefone);
  if (campoTelefone) {
    // Aplica máscara durante digitação
    campoTelefone.addEventListener('input', (e) => {
      console.log('Input em telefone:', e.target.value);
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
      
      console.log('Telefone formatado:', resultado);
      // Atualiza o valor no campo
      e.target.value = resultado;
    });
    
    // Impede a inserção de caracteres não permitidos no keydown
    campoTelefone.addEventListener('keydown', (e) => {
      // Código existente para validação de teclas
    });
  }
  
  // Controle anti-spam
  let ultimoEnvio = 0;
  const intervaloMinimo = 10000; // 10 segundos entre envios
  
  // Processa o envio do formulário
  formulario.addEventListener('submit', async (e) => {
    console.log('Formulário submetido');
    e.preventDefault();
    
    // Proteção contra envios múltiplos (throttling)
    const agora = Date.now();
    if (agora - ultimoEnvio < intervaloMinimo) {
      console.log('Envio muito rápido, bloqueado pelo throttling');
      exibirMensagem('Por favor, aguarde alguns segundos antes de enviar novamente.', 'erro');
      return;
    }
    
    // Coleta e valida os dados do formulário
    console.log('Coletando dados do formulário');
    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const telefone = document.getElementById('telefone').value;
    const empresa = document.getElementById('empresa').value || '';
    const mensagem = document.getElementById('mensagem').value;
    
    console.log('Dados coletados:', { nome, email, telefone, empresa, mensagem });
    
    // Validação básica dos campos
    if (nome.trim().length < 3) {
      console.log('Nome inválido');
      exibirMensagem('Por favor, informe seu nome completo.', 'erro');
      return;
    }
    
    if (!validarEmail(email)) {
      console.log('Email inválido');
      exibirMensagem('Por favor, informe um e-mail válido.', 'erro');
      return;
    }
    
    if (!validarTelefone(telefone)) {
      console.log('Telefone inválido');
      exibirMensagem('Por favor, informe um telefone válido.', 'erro');
      return;
    }
    
    // Validação do campo de mensagem
    if (mensagem.trim().length === 0) {
      console.log('Mensagem vazia');
      exibirMensagem('Por favor, informe uma mensagem.', 'erro');
      return;
    }
    
    // Coleta serviços selecionados com seus textos reais
    console.log('Coletando serviços selecionados');
    const servicosSelecionados = Array.from(
      document.querySelectorAll('input[name="servicos[]"]:checked')
    ).map(checkbox => checkbox.parentNode.querySelector('label').textContent.trim());
    
    console.log('Serviços selecionados:', servicosSelecionados);
    
    const servicosTexto = servicosSelecionados.length > 0 
      ? servicosSelecionados.join(', ') 
      : '';
    
    // Formata a mensagem para WhatsApp
    console.log('Formatando mensagem para WhatsApp');
    const mensagemWhatsapp = `Olá! Eu estou vindo pelo site da Agência m2a!

*Nome:* ${nome}
*E-mail:* ${email}
*Telefone/WhatsApp:* ${telefone}
*Empresa:* ${empresa || 'Não informada'}
*Serviços de interesse:* ${servicosTexto || 'Não especificados'}

*Mensagem:* 
${mensagem}`;

    // Número de WhatsApp da Agência m2a 
    const numeroWhatsapp = '5516992229082';
    
    // Cria a URL do WhatsApp com a mensagem formatada
    const urlWhatsapp = `https://wa.me/${numeroWhatsapp}?text=${encodeURIComponent(mensagemWhatsapp)}`;
    console.log('URL do WhatsApp:', urlWhatsapp);
    
    // Desabilita botão durante o processamento
    const botaoEnviar = formulario.querySelector('button[type="submit"]');
    console.log('Desabilitando botão de envio');
    botaoEnviar.disabled = true;
    botaoEnviar.textContent = 'Enviando...';
    
    try {
      // Exibe barra de carregamento
      console.log('Inicializando barra de carregamento');
      const barraCarregamento = inicializarBarraCarregamento();
      if (!barraCarregamento) {
        console.error('Falha ao inicializar barra de carregamento');
      } else {
        barraCarregamento.mostrar();
      }
      
      // Prepara os dados para enviar à API
      console.log('Preparando dados para a API');
      const dadosFormulario = {
        nome,
        email,
        telefone,
        empresa,
        mensagem,
        servicos: servicosSelecionados,
        csrf_token: tokenCSRF
      };

      // Atualiza barra para 25% após validação inicial
      console.log('Atualizando barra: 25%');
      barraCarregamento?.atualizar(25);
      
      // Envia os dados para a API PHP
      console.log('Enviando dados para a API...');
      console.log('URL da API:', '/api/processar-formulario.php');
      const resposta = await fetch('/api/processar-formulario.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': tokenCSRF,
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(dadosFormulario),
        credentials: 'same-origin'
      });
      
      console.log('Resposta da API recebida:', resposta);
      console.log('Status da resposta:', resposta.status);
      
      // Atualiza barra de progresso
      console.log('Atualizando barra: 50%');
      barraCarregamento?.atualizar(50);
      
      // Verifica a resposta da API
      if (!resposta.ok) {
        console.error('Resposta da API não OK:', resposta.status);
        const erro = await resposta.json();
        console.error('Dados do erro:', erro);
        throw new Error(erro.erro || 'Erro ao processar solicitação');
      }
      
      // Atualiza barra para 75%
      console.log('Atualizando barra: 75%');
      barraCarregamento?.atualizar(75);
      
      // Registra momento do envio bem-sucedido
      ultimoEnvio = Date.now();
      
      // Exibe mensagem de sucesso
      console.log('Exibindo mensagem de sucesso');
      exibirMensagem('Mensagem enviada com sucesso! Redirecionando para o WhatsApp...', 'sucesso');
      
      // Reset do formulário
      console.log('Resetando formulário');
      formulario.reset();
      
      // Abre WhatsApp em nova aba após pequeno delay
      console.log('Preparando para abrir WhatsApp em 1 segundo');
      setTimeout(() => {
        console.log('Abrindo WhatsApp:', urlWhatsapp);
        window.open(urlWhatsapp, '_blank');
        barraCarregamento?.esconder();
      }, 1000);
      
    } catch (erro) {
      console.error('Erro detalhado:', erro);
      console.error('Erro ao enviar o formulário:', erro.message);
      console.error('Stack trace:', erro.stack);
      exibirMensagem(`Ocorreu um erro ao enviar: ${erro.message}. Os dados não foram salvos, mas você será redirecionado ao WhatsApp.`, 'erro');
      
      // Mesmo com erro na API, redireciona para WhatsApp após delay
      console.log('Redirecionando para WhatsApp mesmo com erro (em 3s)');
      setTimeout(() => {
        window.open(urlWhatsapp, '_blank');
      }, 3000);
      
    } finally {
      // Restaura o estado do botão
      console.log('Restaurando estado do botão');
      botaoEnviar.disabled = false;
      botaoEnviar.textContent = 'Enviar mensagem';
    }
  });
  
  // Exibe mensagem de feedback ao usuário
  const exibirMensagem = (texto, tipo) => {
    console.log(`Exibindo mensagem: "${texto}" (${tipo})`);
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
