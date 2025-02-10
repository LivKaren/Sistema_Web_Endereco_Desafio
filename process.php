<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');

$servername = "localhost";
$username = "root"; 
$password = "";      
$dbname = "enderecos_db";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die(json_encode(['error' => 'Falha na conexão com o banco de dados.']));
}

if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['cep'])) {
    $cep = $_GET['cep'];
    $url = "https://viacep.com.br/ws/$cep/json/";

    $response = file_get_contents($url);
    $data = json_decode($response, true);

    if (isset($data['erro'])) {
        echo json_encode(['erro' => true]);
    } else {
        echo json_encode($data);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $json = file_get_contents('php://input');
    $endereco = json_decode($json, true);

    if (!$endereco) {
        echo json_encode(['error' => 'Dados inválidos.']);
        exit;
    }

    $cep = $conn->real_escape_string($endereco['cep']);
    $logradouro = $conn->real_escape_string($endereco['logradouro']);
    $bairro = $conn->real_escape_string($endereco['bairro']);
    $cidade = $conn->real_escape_string($endereco['localidade']);
    $estado = $conn->real_escape_string($endereco['uf']);

    $sql = "INSERT INTO enderecos (cep, logradouro, bairro, cidade, estado) 
            VALUES ('$cep', '$logradouro', '$bairro', '$cidade', '$estado')";

    if ($conn->query($sql) === TRUE) {
        echo json_encode(['message' => 'Endereço salvo com sucesso!']);
    } else {
        echo json_encode(['error' => 'Erro ao salvar endereço.']);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'listar') {
    $result = $conn->query("SELECT * FROM enderecos");
    $enderecos = [];

    while ($row = $result->fetch_assoc()) {
        $enderecos[] = $row;
    }

    echo json_encode($enderecos);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'ordenar') {
    $campo = $_GET['campo'];
    $campos_permitidos = ['cidade', 'bairro', 'estado'];

    if (!in_array($campo, $campos_permitidos)) {
        echo json_encode(['error' => 'Campo de ordenação inválido.']);
        exit;
    }

    $result = $conn->query("SELECT * FROM enderecos ORDER BY $campo ASC");
    $enderecos = [];

    while ($row = $result->fetch_assoc()) {
        $enderecos[] = $row;
    }

    echo json_encode($enderecos);
    exit;
}

$conn->close();
