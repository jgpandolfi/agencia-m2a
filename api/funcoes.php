<?php
// Prevenir acesso direto
if (!defined('ACESSO_SEGURO')) {
    header('HTTP/1.1 403 Forbidden');
    exit('Acesso direto negado');
}

/**
 * Registra erros e eventos importantes
 * 
 * @param string $mensagem Mensagem a ser registrada
 * @param string $nivel Nível do evento (ERRO, ALERTA, INFO)
 * @return bool Verdadeiro se o registro foi bem-sucedido
 */
function registrarEvento($mensagem, $nivel = 'INFO') {
    $dirLogs = DIR_LOGS;
    
    // Garantir que o diretório de logs exista
    if (!file_exists($dirLogs)) {
        mkdir($dirLogs, 0755, true);
    }
    
    $arquivoLog = $dirLogs . '/app_' . date('Y-m-d') . '.log';
    $marcaTempo = date('Y-m-d H:i:s');
    $entradaLog = "[$marcaTempo] [$nivel] $mensagem" . PHP_EOL;
    
    return file_put_contents($arquivoLog, $entradaLog, FILE_APPEND);
}

/**
 * Limpa e valida os dados de entrada
 * 
 * @param string $dados Dados a serem sanitizados
 * @return string Dados sanitizados
 */
function sanitizarEntrada($dados) {
    $dados = trim($dados);
    $dados = stripslashes($dados);
    $dados = htmlspecialchars($dados, ENT_QUOTES, 'UTF-8');
    return $dados;
}

/**
 * Valida um endereço de e-mail
 * 
 * @param string $email Endereço de e-mail
 * @return bool Verdadeiro se for válido
 */
function emailValido($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/**
 * Valida um número de telefone (Brasil)
 * 
 * @param string $telefone Número de telefone
 * @return bool Verdadeiro se for válido
 */
function telefoneValido($telefone) {
    // Remove caracteres não numéricos
    $apenasDigitos = preg_replace('/\D/', '', $telefone);
    // Verifica se tem entre 10 e 11 dígitos (com DDD)
    return (strlen($apenasDigitos) >= 10 && strlen($apenasDigitos) <= 11);
}

/**
 * Obtém o endereço IP real do visitante
 * 
 * @return string Endereço IP
 */
function obterIPCliente() {
    // Possíveis cabeçalhos que contêm o IP real
    $cabecalhosIP = [
        'HTTP_CLIENT_IP', 
        'HTTP_X_FORWARDED_FOR', 
        'HTTP_X_FORWARDED', 
        'HTTP_X_CLUSTER_CLIENT_IP', 
        'HTTP_FORWARDED_FOR', 
        'HTTP_FORWARDED', 
        'REMOTE_ADDR'
    ];
    
    foreach ($cabecalhosIP as $cabecalho) {
        if (!empty($_SERVER[$cabecalho])) {
            $ip = trim($_SERVER[$cabecalho]);
            // Se for uma lista de IPs, pegar o primeiro
            if (strpos($ip, ',') !== false) {
                $ips = explode(',', $ip);
                $ip = trim($ips[0]);
            }
            // Validar formato de IP
            if (filter_var($ip, FILTER_VALIDATE_IP)) {
                return $ip;
            }
        }
    }
    
    // Fallback
    return '0.0.0.0';
}

/**
 * Detecta se o usuário está usando um dispositivo móvel
 * 
 * @return bool Verdadeiro se for um dispositivo móvel
 */
function eDispositivoMovel() {
    $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
    
    $palavrasChaveMovel = [
        'mobile', 'android', 'iphone', 'ipod', 'ipad', 'blackberry', 
        'windows phone', 'opera mini', 'iemobile', 'tablet', 'kindle'
    ];
    
    foreach ($palavrasChaveMovel as $palavraChave) {
        if (stripos($userAgent, $palavraChave) !== false) {
            return true;
        }
    }
    
    return false;
}

/**
 * Obtém informações do navegador do usuário
 * 
 * @return string Nome e versão do navegador
 */
function obterNavegador() {
    $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
    
    $navegadores = [
        'Chrome' => '/chrome/i',
        'Edge' => '/edge/i',
        'Safari' => '/safari/i',
        'Firefox' => '/firefox/i',
        'Opera' => '/opera|OPR/i',
        'IE' => '/msie|trident/i'
    ];
    
    foreach ($navegadores as $navegador => $padrao) {
        if (preg_match($padrao, $userAgent)) {
            return $navegador;
        }
    }
    
    return 'Navegador desconhecido';
}

/**
 * Obtém o sistema operacional do usuário
 * 
 * @return string Nome do sistema operacional
 */
function obterSistemaOperacional() {
    $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
    
    $sistemasOperacionais = [
        'Windows' => '/windows|win32|win64/i',
        'macOS' => '/macintosh|mac os x/i',
        'iOS' => '/iphone|ipad|ipod/i',
        'Android' => '/android/i',
        'Linux' => '/linux/i',
        'Unix' => '/unix/i'
    ];
    
    foreach ($sistemasOperacionais as $so => $padrao) {
        if (preg_match($padrao, $userAgent)) {
            return $so;
        }
    }
    
    return 'Sistema operacional desconhecido';
}

/**
 * Tenta identificar a marca do dispositivo
 * 
 * @return string Marca do dispositivo
 */
function obterMarcaDispositivo() {
    $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
    
    $marcas = [
        'Apple' => '/iphone|ipad|ipod|macintosh/i',
        'Samsung' => '/samsung/i',
        'Huawei' => '/huawei/i',
        'Xiaomi' => '/xiaomi|redmi/i',
        'Motorola' => '/motorola|moto/i',
        'LG' => '/lg/i',
        'Sony' => '/sony/i',
        'Asus' => '/asus/i',
        'OnePlus' => '/oneplus/i',
        'Nokia' => '/nokia/i',
        'HP' => '/hp/i',
        'Dell' => '/dell/i',
        'Lenovo' => '/lenovo/i',
        'Acer' => '/acer/i'
    ];
    
    foreach ($marcas as $marca => $padrao) {
        if (preg_match($padrao, $userAgent)) {
            return $marca;
        }
    }
    
    return 'Marca desconhecida';
}

/**
 * Obtém informações de geolocalização baseada no IP
 * 
 * @param string $ip Endereço IP
 * @return array Informações de geolocalização
 */
function obterGeoInfoIP($ip) {
    $geoInfo = [
        'cidade' => 'Desconhecida',
        'estado' => 'Desconhecido',
        'pais' => 'Desconhecido',
        'provedor' => 'Desconhecido'
    ];
    
    // Primeira API: ip-api.com (gratuita, sem necessidade de autenticação)
    try {
        $urlApi = "http://ip-api.com/json/{$ip}";
        
        $opcoes = [
            'http' => [
                'method' => 'GET',
                'header' => 'User-Agent: AgenciaM2A/1.0',
                'timeout' => 5
            ]
        ];
        
        $contexto = stream_context_create($opcoes);
        $resposta = @file_get_contents($urlApi, false, $contexto);
        
        if ($resposta !== false) {
            $dados = json_decode($resposta, true);
            
            if (json_last_error() === JSON_ERROR_NONE && isset($dados['status']) && $dados['status'] === 'success') {
                $geoInfo['cidade'] = $dados['city'] ?? $geoInfo['cidade'];
                $geoInfo['estado'] = $dados['regionName'] ?? $geoInfo['estado'];
                $geoInfo['pais'] = $dados['country'] ?? $geoInfo['pais'];
                $geoInfo['provedor'] = $dados['isp'] ?? $geoInfo['provedor'];
                
                return $geoInfo;
            }
        }
    } catch (Exception $e) {
        registrarEvento("Erro na primeira API de geolocalização: " . $e->getMessage(), "ERRO");
    }
    
    // API de fallback: HackerTarget GeoIP API (gratuita, sem autenticação)
    try {
        $urlApi = "https://api.hackertarget.com/geoip/?q={$ip}";
        
        $opcoes = [
            'http' => [
                'method' => 'GET',
                'header' => 'User-Agent: AgenciaM2A/1.0',
                'timeout' => 5
            ]
        ];
        
        $contexto = stream_context_create($opcoes);
        $resposta = @file_get_contents($urlApi, false, $contexto);
        
        if ($resposta !== false) {
            // A resposta é em formato de texto plano
            $linhas = explode("\n", $resposta);
            $dados = [];
            
            foreach ($linhas as $linha) {
                if (empty($linha)) continue;
                
                $partes = explode(":", $linha, 2);
                if (count($partes) === 2) {
                    $chave = trim($partes[0]);
                    $valor = trim($partes[1]);
                    $dados[$chave] = $valor;
                }
            }
            
            if (!empty($dados)) {
                $geoInfo['cidade'] = $dados['City'] ?? $geoInfo['cidade'];
                $geoInfo['estado'] = $dados['State'] ?? $geoInfo['estado'];
                $geoInfo['pais'] = $dados['Country'] ?? $geoInfo['pais'];
                $geoInfo['provedor'] = $dados['IP'] ?? $geoInfo['provedor']; // Esta API não fornece ISP, usamos IP como placeholder
            }
        }
    } catch (Exception $e) {
        registrarEvento("Erro na API de fallback de geolocalização: " . $e->getMessage(), "ERRO");
    }
    
    return $geoInfo;
}

/**
 * Prepara uma declaração SQL segura
 * 
 * @param mysqli $conexao Conexão com o banco de dados
 * @param string $sql Consulta SQL com marcadores
 * @param string $tipos Tipos de parâmetros ('s' para string, 'i' para inteiro, etc.)
 * @param array $parametros Parâmetros para a consulta
 * @return mysqli_stmt Declaração preparada
 */
function prepararDeclaracao($conexao, $sql, $tipos, $parametros) {
    $stmt = $conexao->prepare($sql);
    
    if (!$stmt) {
        registrarEvento("Erro ao preparar consulta: " . $conexao->error, "ERRO");
        return false;
    }
    
    if (!empty($parametros)) {
        $stmt->bind_param($tipos, ...$parametros);
    }
    
    return $stmt;
}

/**
 * Gera resposta JSON com código de status HTTP
 * 
 * @param array $dados Dados da resposta
 * @param int $codigoStatus Código de status HTTP
 */
function respostaJson($dados, $codigoStatus = 200) {
    http_response_code($codigoStatus);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($dados);
    exit;
}

/**
 * Envia notificação para o Discord via webhook quando um novo lead é recebido
 * 
 * @param array $dadosLead Dados do lead a serem enviados
 * @return bool Verdadeiro se o envio for bem-sucedido
 */
function enviarNotificacaoDiscord($dadosLead) {
    // URL do webhook do Discord (substitua pela URL real obtida no Discord)
    $webhookUrl = 'https://discord.com/api/webhooks/1365896880302723102/WjHA41aq7p83FSMR66442aaGTQTfRXWXXM_JXTDXQJdnpgGV-fmKCRR2lpUAbfVjvDHE';
    
    // Cores em hexadecimal para o Discord (convertida para decimal)
    $corMagenta = 14032980; // Equivalente a #d62454 em decimal
    
    // Formatação da data/hora atual
    $dataHora = date('d/m/Y H:i:s');
    
    // Criação do embed para o Discord
    $embed = [
        'title' => '📋 Novo Lead Recebido!',
        'description' => "Um novo lead acabou de preencher o formulário de contato no site da Agência m2a.",
        'color' => $corMagenta,
        'fields' => [
            [
                'name' => '👤 Nome',
                'value' => $dadosLead['nome'],
                'inline' => true
            ],
            [
                'name' => '📧 E-mail',
                'value' => $dadosLead['email'],
                'inline' => true
            ],
            [
                'name' => '📱 Telefone',
                'value' => $dadosLead['telefone'],
                'inline' => true
            ],
            [
                'name' => '🏢 Empresa',
                'value' => !empty($dadosLead['empresa']) ? $dadosLead['empresa'] : 'Não informada',
                'inline' => true
            ]
        ]
    ];
    
    // Adicionar serviços de interesse se existirem
    if (!empty($dadosLead['servicos'])) {
        $embed['fields'][] = [
            'name' => '🔍 Serviços de Interesse',
            'value' => $dadosLead['servicos'],
            'inline' => false
        ];
    }
    
    // Adicionar mensagem
    $embed['fields'][] = [
        'name' => '💬 Mensagem',
        'value' => $dadosLead['mensagem'],
        'inline' => false
    ];
    
    // Adicionar dados de rastreamento
    $rastreamento = "IP: {$dadosLead['ip']}\n";
    $rastreamento .= "Localização: {$dadosLead['cidade']}, {$dadosLead['estado']}, {$dadosLead['pais']}\n";
    $rastreamento .= "Navegador: {$dadosLead['web_browser']}\n";
    $rastreamento .= "Sistema: {$dadosLead['sistema_operacional']}\n";
    $rastreamento .= "Dispositivo: {$dadosLead['marca_dispositivo']}";
    
    $embed['fields'][] = [
        'name' => '📍 Dados de Rastreamento',
        'value' => $rastreamento,
        'inline' => false
    ];
    
    // Adicionar dados UTM se existirem
    if (!empty($dadosLead['utm_source']) || !empty($dadosLead['utm_medium']) || !empty($dadosLead['utm_campaign'])) {
        $utmInfo = "";
        if (!empty($dadosLead['utm_source'])) $utmInfo .= "Source: {$dadosLead['utm_source']}\n";
        if (!empty($dadosLead['utm_medium'])) $utmInfo .= "Medium: {$dadosLead['utm_medium']}\n";
        if (!empty($dadosLead['utm_campaign'])) $utmInfo .= "Campaign: {$dadosLead['utm_campaign']}\n";
        if (!empty($dadosLead['utm_content'])) $utmInfo .= "Content: {$dadosLead['utm_content']}\n";
        if (!empty($dadosLead['utm_term'])) $utmInfo .= "Term: {$dadosLead['utm_term']}";
        
        $embed['fields'][] = [
            'name' => '🔗 Dados UTM',
            'value' => $utmInfo,
            'inline' => false
        ];
    }
    
    // Adicionar data e hora no rodapé
    $embed['footer'] = [
        'text' => "Recebido em: $dataHora"
    ];
    
    // Configurar a mensagem completa
    $mensagem = [
        'username' => 'Site Agência m2a',
        'avatar_url' => 'https://agenciam2a.com.br/assets/img/logo-icon.png',
        'content' => '🔔 **NOVO LEAD RECEBIDO!**',
        'embeds' => [$embed]
    ];
    
    // Inicializar cURL
    $ch = curl_init();
    
    // Configurar opções cURL
    curl_setopt($ch, CURLOPT_URL, $webhookUrl);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($mensagem));
    
    // Executar cURL
    $resposta = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    
    // Verificar erros
    if (curl_errno($ch)) {
        registrarEvento('Erro ao enviar notificação para o Discord: ' . curl_error($ch), 'ERRO');
        curl_close($ch);
        return false;
    }
    
    curl_close($ch);
    
    // Sucesso = código 204 (No Content)
    $sucesso = $httpCode === 204;
    
    if ($sucesso) {
        registrarEvento('Notificação de lead enviada com sucesso para o Discord', 'INFO');
    } else {
        registrarEvento("Erro ao enviar para Discord. Código: $httpCode, Resposta: $resposta", 'ERRO');
    }
    
    return $sucesso;
}