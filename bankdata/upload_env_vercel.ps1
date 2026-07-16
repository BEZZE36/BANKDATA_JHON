# Script untuk upload semua env vars ke Vercel production
$env_vars = @{
    "APP_NAME" = "BankData"
    "APP_ENV" = "production"
    "APP_KEY" = "base64:WGU157eGk3xSuh80Ex342wDIHuIZ0WcmLikyXrsqkBw="
    "APP_DEBUG" = "false"
    "APP_TIMEZONE" = "Asia/Makassar"
    "APP_URL" = "https://bankdata-jhon.vercel.app"
    "APP_LOCALE" = "id"
    "APP_FALLBACK_LOCALE" = "id"
    "LOG_CHANNEL" = "stderr"
    "LOG_LEVEL" = "error"
    "DB_CONNECTION" = "pgsql"
    "DB_HOST" = "aws-0-ap-southeast-1.pooler.supabase.com"
    "DB_PORT" = "6543"
    "DB_DATABASE" = "postgres"
    "DB_USERNAME" = "postgres.mgmfcxpjweljmyfvjupg"
    "DB_PASSWORD" = "Ideal for agent-first workflows: update your schema in code, push it to GitHub, and Supa"
    "SESSION_DRIVER" = "cookie"
    "SESSION_LIFETIME" = "120"
    "SESSION_ENCRYPT" = "false"
    "SESSION_PATH" = "/"
    "SESSION_DOMAIN" = "null"
    "BROADCAST_CONNECTION" = "log"
    "FILESYSTEM_DISK" = "s3"
    "QUEUE_CONNECTION" = "sync"
    "CACHE_STORE" = "array"
    "MAIL_MAILER" = "log"
    "MAIL_FROM_ADDRESS" = "hello@example.com"
    "MAIL_FROM_NAME" = "BankData"
    "VIEW_COMPILED_PATH" = "/tmp/storage/framework/views"
    "AWS_ACCESS_KEY_ID" = "2e710685e6bc12654f86deb1096b30f1"
    "AWS_SECRET_ACCESS_KEY" = "733f38fc3c816229dc1b5f7bea0e9054a11ea43847deaa61c694905a36532ef7"
    "AWS_DEFAULT_REGION" = "ap-southeast-1"
    "AWS_BUCKET" = "bankdata-storage"
    "AWS_ENDPOINT" = "https://mgmfcxpjweljmyfvjupg.supabase.co/storage/v1/s3"
    "AWS_URL" = "https://mgmfcxpjweljmyfvjupg.supabase.co/storage/v1/object/public/bankdata-storage"
    "AWS_USE_PATH_STYLE_ENDPOINT" = "true"
}

Write-Host "Uploading environment variables to Vercel..." -ForegroundColor Cyan
$success = 0
$failed = 0

foreach ($key in $env_vars.Keys) {
    $value = $env_vars[$key]
    $value | vercel env add $key production --force 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ $key" -ForegroundColor Green
        $success++
    } else {
        Write-Host "  ❌ $key (gagal)" -ForegroundColor Red
        $failed++
    }
}

Write-Host ""
Write-Host "Selesai! $success berhasil, $failed gagal." -ForegroundColor Yellow
