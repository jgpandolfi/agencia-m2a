<?php
// Prevenir acesso direto
if (!defined('ACESSO_SEGURO')) {
    header('HTTP/1.1 403 Forbidden');
    exit('Acesso direto negado');
}

/**
 * Carrega variáveis de ambiente do arquivo .env
 */
function carregarEnv() {
    $envFile = __DIR__ . '/.env';
    
    if (!file_exists($envFile)) {
        registrarEvento("Arquivo .env não encontrado em: $envFile", "ERRO");
        return false;
    }
    
    if (!is_readable($envFile)) {
        registrarEvento("Arquivo .env não pode ser lido. Verifique permissões: $envFile", "ERRO");
        return false;
    }
    
    try {
        $linhas = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        
        foreach ($linhas as $linha) {
            // Ignora comentários
            if (strpos(trim($linha), '#') === 0) continue;
            
            // Ignora linhas inválidas
            if (strpos($linha, '=') === false) continue;
            
            list($nome, $valor) = explode('=', $linha, 2);
            $nome = trim($nome);
            $valor = trim($valor);
            
            // Remove aspas
            if (preg_match('/^["\'](.*)["\']\s*$/', $valor, $matches)) {
                $valor = $matches[1];
            }
            
            $_ENV[$nome] = $valor;
            putenv("{$nome}={$valor}");
        }
        return true;
    } catch (Exception $e) {
        registrarEvento("Erro ao carregar .env: " . $e->getMessage(), "ERRO");
        return false;
    }
}


// Carrega variáveis de ambiente
carregarEnv();

// Configuração do banco de dados (valores padrão fictícios)
define('DB_SERVIDOR', $_ENV['DB_HOST'] ?? 'localhost');
define('DB_NOME', $_ENV['DB_NAME'] ?? 'nome_banco_ficticio');
define('DB_USUARIO', $_ENV['DB_USER'] ?? 'usuario_banco_ficticio');
define('DB_SENHA', $_ENV['DB_PASS'] ?? 'senha_segura_ficticia');

// Webhooks do Discord (valores padrão fictícios)
define('DISCORD_WEBHOOK_LEADS', $_ENV['DISCORD_WEBHOOK_LEADS'] ?? 'https://discord.com/api/webhooks/0000000000000000000/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
define('DISCORD_WEBHOOK_VISITANTES', $_ENV['DISCORD_WEBHOOK_VISITANTES'] ?? 'https://discord.com/api/webhooks/0000000000000000000/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');

// Chave CSRF (valor padrão fictício)
define('SEGREDO_TOKEN_CSRF', $_ENV['CSRF_SECRET'] ?? 'chave_secreta_ficticia_1234567890abcdefghijklmnopqrstuvwxyz');

// Configurações de API
define('URL_API_IP', $_ENV['URL_API_IP'] ?? 'https://ipinfo.io/');
define('TOKEN_API_IP', $_ENV['TOKEN_API_IP'] ?? '');
define('URL_API_IP_RESERVA', $_ENV['URL_API_IP_RESERVA'] ?? 'http://ip-api.com/json/');

// Configurações gerais
set_time_limit(30);
date_default_timezone_set('America/Sao_Paulo');

// Configurações de exibição de erros
ini_set('display_errors', 0);
error_reporting(E_ALL);

// Diretório de logs
define('DIR_LOGS', dirname(__FILE__) . '/logs');
