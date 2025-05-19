<?php
/**
 * API para processamento de dados de tracking de visitantes
 * 
 * Este script processa dados de visitantes enviados pelo frontend,
 * valida, sanitiza e armazena no banco de dados MySQL.
 * 
 * @author Jota / José Guilherme Pandolfi - Agência m2a
 * @version 1.1
 */

// Definir token de acesso seguro
define('ACESSO_SEGURO', true);

// Incluir arquivos necessários
require_once 'config.php';
require_once 'funcoes.php';

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

// Log para monitoramento
registrarEvento("Requisição recebida de: " . obterIPCliente(), "INFO");

// Obter e decodificar dados JSON do corpo da requisição
$corpoRequisicao = file_get_contents('php://input');
$dadosVisitante = json_decode($corpoRequisicao, true);

// Log para debug
registrarEvento("Dados recebidos: " . $corpoRequisicao, "DEBUG");

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

// Obter dados de navegador
$navegador = sanitizarEntrada($dadosVisitante['navegador'] ?? '');
$sistemaOperacional = sanitizarEntrada($dadosVisitante['sistema_operacional'] ?? '');
$marcaDispositivo = sanitizarEntrada($dadosVisitante['marca_dispositivo'] ?? '');
$movel = isset($dadosVisitante['movel']) ? (int)$dadosVisitante['movel'] : 0;

// Obter dados de rastreamento automáticos
$ipCliente = obterIPCliente();
$infoGeo = obterGeoInfoIP($ipCliente);

/**
 * Função para enviar notificação ao Discord quando um novo visitante é registrado
 * @param array $dadosVisitante Dados do visitante
 * @return bool Sucesso ou falha no envio
 */
function enviarNotificacaoDiscordVisitante($dadosVisitante) {
    registrarEvento("Tentando enviar notificação para Discord", "INFO");
    
    // Verificar se todos os dados necessários existem para evitar erros
    if (empty($dadosVisitante['uuid'])) {
        registrarEvento("Dados insuficientes para notificação Discord", "ERRO");
        return false;
    }
    
    $corMagenta = 14032980; // #D62454 em decimal
    $dataHora = date('d/m/Y H:i:s');
    
    // Construção corrigida do embed
    $embed = [
        'title' => '🌐 Novo Visitante Registrado',
        'color' => $corMagenta,
        'description' => 'Novo visitante detectado no site da Agência m2a',
        'fields' => []
    ];
    
    // Adicionar campos apenas se existirem (evitar null)
    $embed['fields'][] = [
        'name' => '🆔 UUID',
        'value' => "`{$dadosVisitante['uuid']}`",
        'inline' => false
    ];
    
    if (!empty($dadosVisitante['cidade']) && !empty($dadosVisitante['estado']) && !empty($dadosVisitante['pais'])) {
        $embed['fields'][] = [
            'name' => '📍 Localização',
            'value' => "{$dadosVisitante['cidade']}, {$dadosVisitante['estado']}, {$dadosVisitante['pais']}",
            'inline' => true
        ];
    }
    
    if (!empty($dadosVisitante['ip']) && !empty($dadosVisitante['provedor'])) {
        $embed['fields'][] = [
            'name' => '📡 IP e Provedor',
            'value' => "`{$dadosVisitante['ip']}`\n{$dadosVisitante['provedor']}",
            'inline' => true
        ];
    }
    
    if (!empty($dadosVisitante['marca_dispositivo']) && !empty($dadosVisitante['sistema_operacional'])) {
        $embed['fields'][] = [
            'name' => '💻 Dispositivo',
            'value' => "{$dadosVisitante['marca_dispositivo']} ({$dadosVisitante['sistema_operacional']})",
            'inline' => true
        ];
    }
    
    if (!empty($dadosVisitante['web_browser'])) {
        $embed['fields'][] = [
            'name' => '🌐 Navegador',
            'value' => $dadosVisitante['web_browser'],
            'inline' => true
        ];
    }
    
    if (isset($dadosVisitante['duracao_sessao'])) {
        $embed['fields'][] = [
            'name' => '⏱️ Duração Sessão',
            'value' => "{$dadosVisitante['duracao_sessao']} segundos",
            'inline' => true
        ];
    }
    
    if (isset($dadosVisitante['referrer'])) {
        $embed['fields'][] = [
            'name' => '🔗 Origem',
            'value' => !empty($dadosVisitante['referrer']) ? "[Link]({$dadosVisitante['referrer']})" : 'Direto',
            'inline' => true
        ];
    }
    
    $embed['footer'] = [
        'text' => "Registrado em: $dataHora"
    ];
    
    // Adicionar UTMs se existirem
    foreach (['source', 'medium', 'campaign', 'content', 'term'] as $utm) {
        if (!empty($dadosVisitante["utm_$utm"])) {
            $embed['fields'][] = [
                'name' => "UTM $utm",
                'value' => $dadosVisitante["utm_$utm"],
                'inline' => true
            ];
        }
    }
    
    // Verificação do payload
    registrarEvento("Campos do embed: " . count($embed['fields']), "INFO");
    
    // Montagem correta do payload
    $mensagem = [
        'username' => 'Site Agência m2a',
        'avatar_url' => 'https://agenciam2a.com.br/assets/img/logo-icon.png',
        'embeds' => [$embed]
    ];
    
    // Log do payload para debug
    registrarEvento("Payload JSON: " . substr(json_encode($mensagem), 0, 200) . "...", "DEBUG");
    
    try {
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => DISCORD_WEBHOOK_VISITANTES,
            CURLOPT_POST => true,
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
                'Accept: application/json'
            ],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_SSL_VERIFYHOST => 2,
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_SSL_OPTIONS => CURLSSLOPT_NO_REVOKE,
            CURLOPT_POSTFIELDS => json_encode($mensagem, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            CURLOPT_USERAGENT => 'AgenciaM2A/1.0',
            CURLOPT_TIMEOUT => 10
        ]);
        
        $resposta = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        
        registrarEvento("Resposta Discord: HTTP $httpCode - Corpo: " . substr($resposta, 0, 100), $httpCode === 204 ? "INFO" : "ERRO");
        
        curl_close($ch);
        return $httpCode === 204;
        
    } catch (Exception $e) {
        registrarEvento("Exceção ao enviar para Discord: " . $e->getMessage(), "ERRO");
        return false;
    }
}

try {
    // Conectar ao banco de dados
    $conexao = new mysqli(DB_SERVIDOR, DB_USUARIO, DB_SENHA, DB_NOME);
    if ($conexao->connect_error) {
        throw new Exception("Erro na conexão: " . $conexao->connect_error);
    }

    $conexao->set_charset("utf8mb4");
    registrarEvento("Conexão com banco estabelecida", "INFO");
    
    // ON DUPLICATE KEY UPDATE - atualiza se o UUID já existir
    $sql = "INSERT INTO visitantes_website (
                uuid, novo_visitante, ip, provedor, cidade, estado, pais,
                web_browser, sistema_operacional, marca_dispositivo, movel,
                dimensao_tela, referrer, utm_source, utm_medium, utm_campaign,
                utm_content, utm_term, total_cliques, cliques_elementos_clicaveis, duracao_sessao
            ) VALUES (
                ?, ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?,
                ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?
            )
            ON DUPLICATE KEY UPDATE
                ip = VALUES(ip),
                provedor = VALUES(provedor),
                cidade = VALUES(cidade),
                estado = VALUES(estado),
                pais = VALUES(pais),
                web_browser = VALUES(web_browser),
                sistema_operacional = VALUES(sistema_operacional),
                marca_dispositivo = VALUES(marca_dispositivo),
                movel = VALUES(movel),
                dimensao_tela = VALUES(dimensao_tela),
                referrer = VALUES(referrer),
                utm_source = VALUES(utm_source),
                utm_medium = VALUES(utm_medium),
                utm_campaign = VALUES(utm_campaign),
                utm_content = VALUES(utm_content),
                utm_term = VALUES(utm_term),
                total_cliques = total_cliques + VALUES(total_cliques),
                cliques_elementos_clicaveis = cliques_elementos_clicaveis + VALUES(cliques_elementos_clicaveis),
                duracao_sessao = duracao_sessao + VALUES(duracao_sessao)";

    $stmt = $conexao->prepare($sql);
    if (!$stmt) {
        throw new Exception("Erro na preparação da query: " . $conexao->error);
    }

    $stmt->bind_param(
        'sisssssssiissssssiiii', 
        $uuid, $novoVisitante, $ipCliente, $infoGeo['provedor'],
        $infoGeo['cidade'], $infoGeo['estado'], $infoGeo['pais'],
        $navegador, $sistemaOperacional, $marcaDispositivo, $movel,
        $dimensaoTela, $referrer, 
        $utmSource, $utmMedium, $utmCampaign, $utmContent, $utmTerm,
        $totalCliques, $cliquesElementosClicaveis, $duracaoSessao
    );

    if (!$stmt->execute()) {
        throw new Exception("Erro na execução: " . $stmt->error);
    }

    $idVisitante = $stmt->insert_id;
    $stmt->close();
    $conexao->close();

    // IMPORTANTE: Enviar notificação Discord ANTES da resposta JSON
    if ($idVisitante && $novoVisitante) {
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
        
        $envioDiscord = enviarNotificacaoDiscordVisitante($dadosParaDiscord);
        registrarEvento("Envio Discord: " . ($envioDiscord ? "Sucesso" : "Falha"), "INFO");
    }

    // Resposta de sucesso
    respostaJson([
        'sucesso' => true,
        'mensagem' => 'Visitante registrado com sucesso',
        'visitante_id' => $idVisitante,
        'novo_visitante' => $novoVisitante
    ]);

} catch (Exception $e) {
    registrarEvento("Erro no registro de visitante: " . $e->getMessage(), "ERRO");
    respostaJson(['erro' => 'Erro ao registrar visitante', 'detalhes' => $e->getMessage()], 500);
}