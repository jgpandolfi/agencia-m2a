<?php
/**
 * API para processamento do formulário de contato da Agência m2a
 * 
 * Este script processa dados do formulário e informações de rastreamento,
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
define('DISCORD_WEBHOOK_URL', !empty($_ENV['DISCORD_WEBHOOK_LEADS']) 
    ? $_ENV['DISCORD_WEBHOOK_LEADS'] 
    : DISCORD_WEBHOOK_LEADS);

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
$dadosFormulario = json_decode($corpoRequisicao, true);

// Verificar se os dados foram recebidos corretamente
if (json_last_error() !== JSON_ERROR_NONE) {
    respostaJson(['erro' => 'Formato de dados inválido'], 400);
}

// Validar campos obrigatórios
$camposObrigatorios = ['nome', 'email', 'telefone', 'mensagem'];
foreach ($camposObrigatorios as $campo) {
    if (empty($dadosFormulario[$campo])) {
        respostaJson(['erro' => "Campo obrigatório: $campo"], 400);
    }
}

// Sanitizar e validar campos
$nome = sanitizarEntrada($dadosFormulario['nome']);
$email = sanitizarEntrada($dadosFormulario['email']);
$telefone = sanitizarEntrada($dadosFormulario['telefone']);
$empresa = !empty($dadosFormulario['empresa']) ? sanitizarEntrada($dadosFormulario['empresa']) : '';
$mensagem = sanitizarEntrada($dadosFormulario['mensagem']);
$servicos = [];

// Extrair e sanitizar parâmetros UTM
$utmSource = !empty($dadosFormulario['utm_source']) ? sanitizarEntrada($dadosFormulario['utm_source']) : '';
$utmMedium = !empty($dadosFormulario['utm_medium']) ? sanitizarEntrada($dadosFormulario['utm_medium']) : '';
$utmCampaign = !empty($dadosFormulario['utm_campaign']) ? sanitizarEntrada($dadosFormulario['utm_campaign']) : '';
$utmContent = !empty($dadosFormulario['utm_content']) ? sanitizarEntrada($dadosFormulario['utm_content']) : '';
$utmTerm = !empty($dadosFormulario['utm_term']) ? sanitizarEntrada($dadosFormulario['utm_term']) : '';

// Validar e-mail
if (!emailValido($email)) {
    respostaJson(['erro' => 'E-mail inválido'], 400);
}

// Validar telefone
if (!telefoneValido($telefone)) {
    respostaJson(['erro' => 'Telefone inválido'], 400);
}

// Processar serviços selecionados
if (!empty($dadosFormulario['servicos']) && is_array($dadosFormulario['servicos'])) {
    $servicos = array_map('sanitizarEntrada', $dadosFormulario['servicos']);
}
$servicosTexto = implode(', ', $servicos);

// Obter dados de rastreamento
$ipCliente = obterIPCliente();
$ehMovel = eDispositivoMovel();
$navegador = obterNavegador();
$sistemaOperacional = obterSistemaOperacional();
$marcaDispositivo = obterMarcaDispositivo();

// Obter geolocalização baseada no IP
$infoGeo = obterGeoInfoIP($ipCliente);

// Log adicional para os parâmetros UTM
if (!empty($utmSource) || !empty($utmMedium) || !empty($utmCampaign)) {
    registrarEvento("Dados UTM recebidos - Source: $utmSource, Medium: $utmMedium, Campaign: $utmCampaign", "INFO");
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
    $sql = "INSERT INTO leads_formulario_contato (
                nome, email, telefone, empresa, mensagem, servicos, 
                ip, cidade, estado, pais, provedor, 
                web_browser, sistema_operacional, marca_dispositivo, movel,
                utm_source, utm_medium, utm_campaign, utm_content, utm_term
            ) VALUES (
                ?, ?, ?, ?, ?, ?, 
                ?, ?, ?, ?, ?, 
                ?, ?, ?, ?,
                ?, ?, ?, ?, ?
            )";
    
    $parametros = [
        $nome, $email, $telefone, $empresa, $mensagem, $servicosTexto,
        $ipCliente, $infoGeo['cidade'], $infoGeo['estado'], $infoGeo['pais'], $infoGeo['provedor'],
        $navegador, $sistemaOperacional, $marcaDispositivo, $ehMovel,
        $utmSource, $utmMedium, $utmCampaign, $utmContent, $utmTerm
    ];
    
    $stmt = prepararDeclaracao($conexao, $sql, 'ssssssssssssssisssss', $parametros);
    
    // Executar a consulta
    if (!$stmt || !$stmt->execute()) {
        registrarEvento("Erro ao inserir dados: " . ($stmt ? $stmt->error : $conexao->error), "ERRO");
        respostaJson(['erro' => 'Erro ao salvar os dados'], 500);
    }
    
    // Fechar conexões
    $stmt->close();
    $conexao->close();
    
    // Webhook Discord
    $dadosParaDiscord = [
        'nome' => $nome,
        'email' => $email,
        'telefone' => $telefone,
        'empresa' => $empresa,
        'mensagem' => $mensagem,
        'servicos' => $servicosTexto,
        'ip' => $ipCliente,
        'cidade' => $infoGeo['cidade'],
        'estado' => $infoGeo['estado'],
        'pais' => $infoGeo['pais'],
        'provedor' => $infoGeo['provedor'],
        'web_browser' => $navegador,
        'sistema_operacional' => $sistemaOperacional,
        'marca_dispositivo' => $marcaDispositivo,
        'utm_source' => $utmSource,
        'utm_medium' => $utmMedium,
        'utm_campaign' => $utmCampaign,
        'utm_content' => $utmContent,
        'utm_term' => $utmTerm
    ];
    
    // Enviar notificação para o Discord (não interrompe o fluxo se falhar)
    try {
        enviarNotificacaoDiscord($dadosParaDiscord);
    } catch (Exception $e) {
        registrarEvento("Exceção ao enviar notificação para o Discord: " . $e->getMessage(), "ERRO");
        // Continuamos mesmo se houver erro no Discord
    }

    // Log de sucesso
    registrarEvento("Formulário enviado com sucesso: $email", "INFO");
    
    // Retornar resposta de sucesso
    respostaJson(['sucesso' => true, 'mensagem' => 'Dados salvos com sucesso']);
    
} catch (Exception $e) {
    registrarEvento("Exceção ao processar formulário: " . $e->getMessage(), "ERRO");
    respostaJson(['erro' => 'Ocorreu um erro ao processar a requisição'], 500);
}