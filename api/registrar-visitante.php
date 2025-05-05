<?php
/**
 * API para processamento de dados de tracking de visitantes
 * 
 * Este script processa dados de visitantes enviados pelo frontend,
 * valida, sanitiza e armazena no banco de dados MySQL.
 * 
 * @author Jota / José Guilherme Pandolfi - Agência m2a
 * @version 1.0
 */

// Definir token de acesso seguro
define('ACESSO_SEGURO', true);

// Incluir arquivos necessários
require_once 'config.php';
require_once 'funcoes.php';

// Webhook para o Discord (carregado do .env com fallback para config.php)
define('DISCORD_WEBHOOK_URL', !empty($_ENV['DISCORD_WEBHOOK_VISITANTES']) 
    ? $_ENV['DISCORD_WEBHOOK_VISITANTES'] 
    : DISCORD_WEBHOOK_VISITANTES);

// Lista de domínios permitidos para o CORS
$dominiosPermitidos = [
    'https://agenciam2a.com.br',
    'https://agenciam2a.net'
];

// Obter o domínio de origem da requisição
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

// Verificar se o domínio está na lista de permitidos
if (in_array($origin, $dominiosPermitidos)) {
    // Definir o cabeçalho com o domínio específico da requisição
    header("Access-Control-Allow-Origin: $origin");
    // Importante para caches intermediários
    header("Vary: Origin");
} else {
    // Caso o domínio não esteja na lista, definir um padrão
    header("Access-Control-Allow-Origin: https://agenciam2a.com.br");
    header("Vary: Origin");
}

// Configurar cabeçalhos CORS para permitir requisições do seu domínio
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Tratar pré-requisição OPTIONS (usado em CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Verificar se a requisição é POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respostaJson(['erro' => 'Método não permitido'], 405);
}

// Obter e decodificar dados JSON do corpo da requisição
$corpoRequisicao = file_get_contents('php://input');
$dadosVisitante = json_decode($corpoRequisicao, true);

// Verificar se os dados foram recebidos corretamente
if (json_last_error() !== JSON_ERROR_NONE) {
    respostaJson(['erro' => 'Formato de dados inválido'], 400);
}

// Validar o UUID do visitante (campo obrigatório)
if (empty($dadosVisitante['uuid'])) {
    respostaJson(['erro' => 'Identificador de visitante (UUID) é obrigatório'], 400);
}

// Sanitizar campos
$uuid = sanitizarEntrada($dadosVisitante['uuid']);
$novoVisitante = !empty($dadosVisitante['novo_visitante']);
$dimensaoTela = !empty($dadosVisitante['dimensao_tela']) ? sanitizarEntrada($dadosVisitante['dimensao_tela']) : '';
$referrer = !empty($dadosVisitante['referrer']) ? sanitizarEntrada($dadosVisitante['referrer']) : '';
$totalCliques = !empty($dadosVisitante['total_cliques']) ? intval($dadosVisitante['total_cliques']) : 0;
$cliquesElementosClicaveis = !empty($dadosVisitante['cliques_elementos_clicaveis']) ? intval($dadosVisitante['cliques_elementos_clicaveis']) : 0;
$duracaoSessao = !empty($dadosVisitante['duracao_sessao']) ? intval($dadosVisitante['duracao_sessao']) : 0;

// Extrair e sanitizar parâmetros UTM
$utmSource = !empty($dadosVisitante['utm_source']) ? sanitizarEntrada($dadosVisitante['utm_source']) : '';
$utmMedium = !empty($dadosVisitante['utm_medium']) ? sanitizarEntrada($dadosVisitante['utm_medium']) : '';
$utmCampaign = !empty($dadosVisitante['utm_campaign']) ? sanitizarEntrada($dadosVisitante['utm_campaign']) : '';
$utmContent = !empty($dadosVisitante['utm_content']) ? sanitizarEntrada($dadosVisitante['utm_content']) : '';
$utmTerm = !empty($dadosVisitante['utm_term']) ? sanitizarEntrada($dadosVisitante['utm_term']) : '';

// Obter dados de rastreamento automáticos
$ipCliente = obterIPCliente();
$ehMovel = eDispositivoMovel();
$navegador = obterNavegador();
$sistemaOperacional = obterSistemaOperacional();
$marcaDispositivo = obterMarcaDispositivo();

// Obter geolocalização baseada no IP
$infoGeo = obterGeoInfoIP($ipCliente);

// Log para monitoramento (opcional)
registrarEvento("Novo visitante registrado - UUID: $uuid", "INFO");

// Função para enviar notificação ao Discord (adicionar antes do bloco try-catch da conexão com o banco)
function enviarNotificacaoDiscordVisitante($dadosVisitante) {
    $corMagenta = 14032980; // #D62454 em decimal
    $dataHora = date('d/m/Y H:i:s');
    
    $embed = [
        'title' => '🌐 Novo Visitante Registrado',
        'color' => $corMagenta,
        'fields' => [
            [
                'name' => '🆔 UUID',
                'value' => "`{$dadosVisitante['uuid']}`",
                'inline' => false
            ],
            [
                'name' => '📍 Localização',
                'value' => "{$dadosVisitante['cidade']}, {$dadosVisitante['estado']}, {$dadosVisitante['pais']}",
                'inline' => true
            ],
            [
                'name' => '📡 IP e Provedor',
                'value' => "`{$dadosVisitante['ip']}`\n{$dadosVisitante['provedor']}",
                'inline' => true
            ],
            [
                'name' => '💻 Dispositivo',
                'value' => "{$dadosVisitante['marca_dispositivo']} ({$dadosVisitante['sistema_operacional']})",
                'inline' => true
            ],
            [
                'name' => '🌐 Navegador',
                'value' => $dadosVisitante['web_browser'],
                'inline' => true
            ],
            [
                'name' => '⏱️ Duração Sessão',
                'value' => "{$dadosVisitante['duracao_sessao']} segundos",
                'inline' => true
            ],
            [
                'name' => '🔗 Origem',
                'value' => $dadosVisitante['referrer'] ? "[Link]({$dadosVisitante['referrer']})" : 'Direto',
                'inline' => true
            ]
        ],
        'footer' => [
            'text' => "Registrado em: $dataHora"
        ]
    ];

    // Adicionar UTMs se existirem
    $utmFields = [];
    foreach (['source', 'medium', 'campaign', 'content', 'term'] as $utm) {
        if (!empty($dadosVisitante["utm_$utm"])) {
            $utmFields[] = [
                'name' => "UTM $utm",
                'value' => $dadosVisitante["utm_$utm"],
                'inline' => true
            ];
        }
    }
    
    if (!empty($utmFields)) {
        $embed['fields'] = array_merge($embed['fields'], $utmFields);
    }

    $mensagem = [
        'username' => 'Site Agência m2a',
        'avatar_url' => 'https://agenciam2a.com.br/assets/img/logo-icon.png',
        'embeds' => [$embed]
    ];

    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => DISCORD_WEBHOOK_URL,
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_SSL_VERIFYHOST => 2,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_POSTFIELDS => json_encode($mensagem, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
        CURLOPT_USERAGENT => 'AgenciaM2A/1.0'
    ]);
    
    $resposta = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

// Verificação detalhada
    if (curl_errno($ch)) {
        registrarEvento('Erro cURL: ' . curl_error($ch), 'ERRO');
    } elseif ($httpCode !== 204) {
        registrarEvento("Resposta Discord: HTTP $httpCode - $resposta", "ERRO");
    }
    
    curl_close($ch);
}

// Conectar ao banco de dados
try {
    $conexao = new mysqli(DB_SERVIDOR, DB_USUARIO, DB_SENHA, DB_NOME);
    
    // Verificar conexão
    if ($conexao->connect_error) {
        registrarEvento("Falha na conexão com o banco de dados: " . $conexao->connect_error, "ERRO");
        respostaJson(['erro' => 'Erro ao conectar ao banco de dados'], 500);
    }
    
    // Definir caracteres como UTF-8
    $conexao->set_charset("utf8mb4");
    
    // Preparar consulta SQL segura
    $sql = "INSERT INTO visitantes_website (
                uuid, novo_visitante, ip, provedor,
                cidade, estado, pais,
                web_browser, sistema_operacional, marca_dispositivo, movel,
                dimensao_tela, referrer,
                utm_source, utm_medium, utm_campaign, utm_content, utm_term,
                total_cliques, cliques_elementos_clicaveis, duracao_sessao
            ) VALUES (
                ?, ?, ?, ?,
                ?, ?, ?,
                ?, ?, ?, ?,
                ?, ?,
                ?, ?, ?, ?, ?,
                ?, ?, ?
            )";
    
    $parametros = [
        $uuid, $novoVisitante, $ipCliente, $infoGeo['provedor'],
        $infoGeo['cidade'], $infoGeo['estado'], $infoGeo['pais'],
        $navegador, $sistemaOperacional, $marcaDispositivo, $ehMovel,
        $dimensaoTela, $referrer,
        $utmSource, $utmMedium, $utmCampaign, $utmContent, $utmTerm,
        $totalCliques, $cliquesElementosClicaveis, $duracaoSessao
    ];
    
    $tipos = 'sississsssiisssssiiii'; // Tipos de parâmetros para bind_param
    
    $stmt = prepararDeclaracao($conexao, $sql, $tipos, $parametros);
    
    // Executar a consulta
    if (!$stmt || !$stmt->execute()) {
        registrarEvento("Erro ao inserir dados de visitante: " . ($stmt ? $stmt->error : $conexao->error), "ERRO");
        respostaJson(['erro' => 'Erro ao salvar os dados do visitante'], 500);
    }
    
    // Obter o ID gerado
    $idVisitante = $stmt->insert_id;
    
    // Fechar conexões
    $stmt->close();
    $conexao->close();
    
    // Chama função para enviar ao Discord
    if ($idVisitante) {
        $dadosParaDiscord = [
            'uuid' => $uuid,
            'ip' => $ipCliente,
            'provedor' => $infoGeo['provedor'],
            'cidade' => $infoGeo['cidade'],
            'estado' => $infoGeo['estado'],
            'pais' => $infoGeo['pais'],
            'web_browser' => $navegador,
            'sistema_operacional' => $sistemaOperacional,
            'marca_dispositivo' => $marcaDispositivo,
            'duracao_sessao' => $duracaoSessao,
            'referrer' => $referrer,
            'utm_source' => $utmSource,
            'utm_medium' => $utmMedium,
            'utm_campaign' => $utmCampaign,
            'utm_content' => $utmContent,
            'utm_term' => $utmTerm
        ];
        
        try {
            enviarNotificacaoDiscordVisitante($dadosParaDiscord);
        } catch (Exception $e) {
            registrarEvento("Erro ao enviar para Discord: " . $e->getMessage(), "ERRO");
        }
    }

    // Retornar resposta de sucesso
    respostaJson([
        'sucesso' => true, 
        'mensagem' => 'Dados do visitante registrados com sucesso',
        'visitante_id' => $idVisitante
    ]);
    
} catch (Exception $e) {
    registrarEvento("Exceção ao processar dados de visitante: " . $e->getMessage(), "ERRO");
    respostaJson(['erro' => 'Ocorreu um erro ao processar a requisição'], 500);
}