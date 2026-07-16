<?php
$host = 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com';
$port = 4000;
$db   = 'test';
$user = '2dhutPBUJjjT3PC.root';
$pass = 'tvX2dR8dqXjjXFI3';
$ca   = 'D:/KKLP/Project KKLP Jhon/bankdata/cacert.pem';

$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
    PDO::MYSQL_ATTR_SSL_CA       => $ca,
];

$dsn = "mysql:host=$host;port=$port;dbname=$db;charset=utf8mb4";

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
    $stmt = $pdo->query('SELECT id, name, email FROM users');
    $users = $stmt->fetchAll();
    
    echo "USERS IN DB:\n";
    print_r($users);
} catch (\PDOException $e) {
    throw new \PDOException($e->getMessage(), (int)$e->getCode());
}
