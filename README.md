<h1 align="center"> Website da Agência m2a </h1>

<p align="center">
Website profissional desenvolvido com HTML, CSS e JavaScript puro para a Agência m2a, uma agência de marketing 360° que oferece soluções estratégicas em marketing digital. O site conta com design moderno em tema escuro, totalmente responsivo e repleto de recursos interativos que proporcionam uma experiência de usuário excepcional.
</p>

<p align="center">
<a href="https://agenciam2a.com.br/?utm_source=Projeto-Site-m2a-GitHub" target="_blank">🌐 Acesse o site em produção</a> e aproveite para conhecer todas as soluções e serviços oferecidos pela Agência m2a em um ambiente digital estrategicamente desenvolvido para proporcionar a melhor experiência ao usuário.
</p>

## 💡 Sobre o Projeto

Este website foi desenvolvido para atender às necessidades da Agência m2a, destacando sua identidade visual e serviços oferecidos. O projeto foi construído seguindo o conceito de **mobile-first** e incorpora as mais modernas técnicas de desenvolvimento web para garantir:

- **Performance excepcional** em todos os dispositivos
- **Experiência de usuário imersiva** com animações e efeitos visuais
- **Acessibilidade completa** para diferentes públicos
- **Conformidade com LGPD** (Lei Geral de Proteção de Dados)
- **Escalabilidade e manutenibilidade** através de código bem estruturado

O site apresenta a identidade visual da Agência m2a, utilizando sua paleta de cores oficial: magenta (#d62454), vinho claro (#690d34), vinho escuro (#4a002c), branco gelo (#f1f1f1) e cinza escuro (#3e3e3e), implementadas como variáveis CSS para manter a consistência em todo o projeto.

## 🚀 Tecnologias

Este projeto foi desenvolvido utilizando exclusivamente:

- **HTML5** semântico
- **CSS3** moderno com variáveis e flexbox/grid
- **JavaScript** puro (Vanilla JS) com ES6+
- **MySQL** para armazenamento e gerenciamento de dados
- **Sistema de variáveis de ambiente** com arquivos .env para configurações seguras
- **Git e GitHub** para versionamento

Sem dependências de frameworks ou bibliotecas externas, demonstrando maestria no desenvolvimento com tecnologias fundamentais da web.

## 💻 Técnicas e Boas Práticas

### 🗂️ **Arquitetura e Organização**

- **Padrão de Módulo Revelador (Revealing Module Pattern)** para encapsulamento
- **Código modular e componentizado** para facilitar manutenção
- **Nomenclatura BEM (Block Element Modifier)** para classes CSS
- **CSS organizado em seções numeradas** (20+ seções bem definidas)
- **Variáveis CSS** para consistência visual e manutenibilidade

### ⏱️ **Performance**

- **Lazy loading** de imagens
- **Debounce e throttling** para eventos de scroll e resize
- **Imagens em formato WebP** com compressão otimizada
- **Carregamento condicional** de recursos quando necessário

### 🛡️ **Segurança**

- **Validação e sanitização** de inputs de formulários
- **LocalStorage** com tratamento de exceções para dados de consentimento
- **LGPD compliant** com modal de consentimento e gestão de cookies
- **Tratamento defensivo** para todas as operações do DOM
- **Sistema de variáveis de ambiente** para proteção de credenciais
- **Headers de segurança** configurados para prevenção de ataques
- **Rate limiting** para prevenção de spam e ataques de força bruta
- **CORS configurado** para permitir apenas domínios autorizados

### **🎨 Interface e Experiência do Usuário (UI/UX)**

- **Consistência Visual** com uso sistemático de variáveis CSS para cores, espaçamentos e comportamentos
- **Feedback Visual** através de preloaders, tooltips, e estados interativos distintos
- **Hierarquia de Informação** com tipografia escalável e seções claramente delimitadas

### 🧏 **Acessibilidade**

- **Contraste adequado** para leitura em tema escuro
- **Semântica HTML5** apropriada para leitores de tela
- **Navegação por teclado** para todos os elementos interativos
- **Atributos ARIA** para melhor descrição de elementos
- **Prefers-reduced-motion** para respeitar preferências de usuário

## 🤖 Funcionalidades

### **⌨️ Recursos de Interface**

- **Preloader interativo** com verificação de consentimento LGPD
- **Cursor personalizado** com estados diferentes (normal, hover, loading)
- **Barra de carregamento** no topo durante requisições assíncronas
- **Efeito parallax horizontal** no banner principal usando camadas CSS
- **Menu de navegação responsivo** com animações suaves
- **Tooltips personalizados** para elementos informativos

### **📱 Layout e Responsividade**

- **Design responsivo completo** para todos os dispositivos
- **Grid adaptativo** com fallbacks para navegadores legados
- **Menu mobile** com animação de hamburger
- **Media queries** estrategicamente posicionadas em 4 breakpoints
- **Imagens responsivas** com proporções mantidas em diferentes telas

### **🔍 Portfólio Interativo**

- **Sistema de busca em tempo real** para trabalhos do portfólio
- **Modal de visualização de imagens** com navegação por teclado e gestos
- **Carregamento dinâmico** de mais trabalhos com feedback visual
- **Carrossel automático** para exibição de clientes
- **Filtro inteligente** que encontra trabalhos por keywords

### **📋 Formulário Avançado**

- **Máscara de telefone** com formatação automática
- **Validação em tempo real** dos campos
- **Feedback visual** de validação para usuários
- **Submissão assíncrona** com tratamento de erros

### **📊 Sistema Próprio de Rastreamento de Visitantes**

- **Tracker próprio** com identificação única persistente via UUID
- **Monitoramento de engajamento** com contagem de cliques totais e em elementos interativos
- **Geolocalização automática** baseada no IP do visitante
- **Captura de UTM parameters** para análise de campanhas
- **Duração de sessão** com precisão ao segundo
- **Notificações via Discord** para novos visitantes em tempo real
- **Persistência de identificação** entre visitas para análise de retorno

## 🔧 Estrutura do Projeto

O projeto segue uma estrutura clara e organizada:
```
📁 raiz
┣ 📁 api # Backend PHP para processamento do site
┣ 📁 assets
┃ ┣ 📁 icones # Ícones recorrentes otimizados
┃ ┗ 📁 img # Imagens otimizadas em WebP
┃   ┣ 📁 clientes # Logos de clientes para carrossel
┃   ┣ 📁 depoimentos # Fotos de clientes para depoimentos
┃   ┗ 📁 portfolio # Imagens de trabalhos realizados
┣ 📄 .gitignore # Configuração de arquivos ignorados pelo Git
┣ 📄 index.html # Documento HTML principal
┣ 📄 README.md # Documentação do projeto
┣ 📄 scripts.js # JavaScript modular com padrões modernos
┗ 📄 styles.css # Estilos CSS organizados em seções
```

## 🔄 Integração Backend-Frontend

- **API RESTful própria** para processamento de dados
- **Sistema de formulários** com validação em tempo real e no servidor
- **Proteção CSRF** em todas as requisições do formulário
- **Tratamento de erro robusto** com feedback visual ao usuário
- **Webhooks para Discord** para notificação instantânea de conversões
- **Sanitização e validação** de dados em ambas as pontas
- **Sistema de logs** para monitoramento e diagnóstico de problemas

## 🚦 Performance e Otimização

- **Pontuação PageSpeed Insights** acima de 90 em mobile e desktop
- **Tempo de carregamento** reduzido com técnicas de otimização
- **Web Vitals** otimizados (FCP, LCP, CLS, FID)
- **Cache inteligente** para recursos estáticos
- **Animações otimizadas** usando propriedades que não causam repaints

## 🔐 Privacidade e Conformidade LGPD

- **Modal de consentimento LGPD** com fluxo completo de aceite ou rejeição
- **Visualização dos termos de uso** integrada ao modal de consentimento
- **Armazenamento seguro** de preferências em localStorage com criptografia
- **Ativação condicional** de recursos de tracking apenas após consentimento
- **Notificações visuais** de política de cookies
- **APIs com proteção de dados** para tratamento seguro de informações pessoais

## 📋 Implementações Destacadas

- **Sistema de Modal LGPD**: Conforme legislação brasileira, com armazenamento seguro de consentimento
- **Módulo de Tooltips**: Implementação personalizada com detecção automática após rolagem
- **Gerenciador de Portfólio**: Utilizando padrão de módulo revelador para melhor organização
- **Barra de Carregamento**: Feedback visual preciso durante operações assíncronas
- **Máscara de Telefone**: Formatação automática seguindo padrões brasileiros
- **Carregamento Progressivo de Portfólio**: Interface com feedback visual durante carregamento de mais itens
- **Integração com Analytics Externos**: Microsoft Clarity e PostHog para análise avançada de comportamento
- **Rastreador de Visitantes**: Implementação proprietária para análise de comportamento respeitando LGPD
- **Sistema de Webhooks Discord**: Notificações em tempo real de novos leads e visitantes

## 🧾 Licença

Esse projeto está sob a licença MIT.

<p align="center">
  <img alt="License" src="https://img.shields.io/static/v1?label=license&message=MIT&color=49AA26&labelColor=000000">
</p>
