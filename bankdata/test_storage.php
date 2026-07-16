<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\Storage;

echo "Testing Supabase Storage connection...\n";
try {
    $result = Storage::disk('s3')->put('test-connection.txt', 'Hello from Bank Data!');
    if ($result) {
        echo "✅ SUKSES! File berhasil diupload ke Supabase Storage.\n";
        echo "URL: " . Storage::disk('s3')->url('test-connection.txt') . "\n";
        // Cleanup
        Storage::disk('s3')->delete('test-connection.txt');
    } else {
        echo "❌ GAGAL: Tidak bisa upload file.\n";
    }
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}
