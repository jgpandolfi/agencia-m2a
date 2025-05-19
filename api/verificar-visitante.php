<?php
/**
 * API para verificar se um visitante já existe no banco de dados
 * 
 * @author Jota / José Guilherme Pandolfi - Agência m2a
 * @version 1.0
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
    header("Access-Control-Allow-Origin: $origin");
    header("Vary: Origin");
} else {
    header("Access-Control-Allow-Origin: https://agenciam2a.com.br");
    header("Vary: Origin");
}

// Configurar cabeçalhos CORS
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Tratar pré-requisição OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Verificar se a requisição é GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    respostaJson(['erro' => 'Método não permitido'], 405);
}

// Validar o UUID do visitante
if (empty($_GET['uuid'])) {
    respostaJson(['erro' => 'UUID é obrigatório'], 400);
}

// Sanitizar o UUID
$uuid = sanitizarEntrada($_GET['uuid']);

try {
    // Conectar ao banco de dados
    $conexao = new mysqli(DB_SERVIDOR, DB_USUARIO, DB_SENHA, DB_NOME);
    
    if ($conexao->connect_error) {
        throw new Exception("Erro na conexão: " . $conexao->connect_error);
    }
    
    $conexao->set_charset("utf8mb4");
    
    // Verificar se o UUID existe
    $sql = "SELECT COUNT(*) as total FROM visitantes_website WHERE uuid = ?";
    $stmt = $conexao->prepare($sql);
    
    if (!$stmt) {
        throw new Exception("Erro na preparação da query: " . $conexao->error);
    }
    
    $stmt->bind_param('s', $uuid);
    
    if (!$stmt->execute()) {
        throw new Exception("Erro na execução: " . $stmt->error);
    }
    
    $resultado = $stmt->get_result();
    $dados = $resultado->fetch_assoc();
    
    $existe = $dados['total'] > 0;
    
    $stmt->close();
    $conexao->close();
    
    // Retornar resultado
    respostaJson([
        'sucesso' => true,
        'existe' => $existe
    ]);
    
} catch (Exception $e) {
    registrarEvento("Erro na verificação de visitante: " . $e->getMessage(), "ERRO");
    respostaJson(['erro' => 'Erro ao verificar visitante', 'detalhes' => $e->getMessage()], 500);
}