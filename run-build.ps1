Set-Location "C:\Users\sherk\.openclaw\workspace\gg-farms-website"
$result = npm run build 2>&1
$result | Out-File -FilePath "C:\Users\sherk\.openclaw\workspace\build-result.txt" -Encoding utf8
$gitResult = git status 2>&1
$gitResult | Out-File -FilePath "C:\Users\sherk\.openclaw\workspace\git-status.txt" -Encoding utf8
"DONE" | Out-File -FilePath "C:\Users\sherk\.openclaw\workspace\script-done.txt" -Encoding utf8
