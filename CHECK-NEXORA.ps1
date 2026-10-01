$ErrorActionPreference = "Continue"
$score = 10
Write-Host "`n=== NEXORA QUALITY CHECK ===" -ForegroundColor Cyan
Write-Host "`n[1/4] ESLint" -ForegroundColor Yellow
npx eslint .
if ($LASTEXITCODE -ne 0) { $score -= 2; Write-Host "FAIL ESLint" -ForegroundColor Red } else { Write-Host "PASS ESLint" -ForegroundColor Green }
Write-Host "`n[2/4] TypeScript" -ForegroundColor Yellow
npx tsc --noEmit
if ($LASTEXITCODE -ne 0) { $score -= 2; Write-Host "FAIL TypeScript" -ForegroundColor Red } else { Write-Host "PASS TypeScript" -ForegroundColor Green }
Write-Host "`n[3/4] Build" -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) { $score -= 3; Write-Host "FAIL Build" -ForegroundColor Red } else { Write-Host "PASS Build" -ForegroundColor Green }
Write-Host "`n[4/4] Critical files" -ForegroundColor Yellow
$files = @(".env.example","supabase\schema.sql","src\proxy.ts","src\app\api\ai\search\route.ts","src\app\api\integrations\whatsapp\webhook\route.ts")
foreach($f in $files){if(Test-Path $f){Write-Host "PASS $f" -ForegroundColor Green}else{$score-=0.25;Write-Host "FAIL $f" -ForegroundColor Red}}
if($score -lt 0){$score=0}
Write-Host "`nNEXORA SCORE: $score / 10" -ForegroundColor Cyan
