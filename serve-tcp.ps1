param(
  [int]$Port = 4174,
  [string]$Root = (Get-Location).Path
)

$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $Port)
$listener.Start()

function Get-ContentType([string]$Path) {
  switch ([System.IO.Path]::GetExtension($Path).ToLowerInvariant()) {
    ".html" { "text/html; charset=utf-8" }
    ".css" { "text/css; charset=utf-8" }
    ".js" { "application/javascript; charset=utf-8" }
    ".png" { "image/png" }
    ".jpg" { "image/jpeg" }
    ".jpeg" { "image/jpeg" }
    ".webp" { "image/webp" }
    default { "application/octet-stream" }
  }
}

try {
  while ($true) {
    $client = $listener.AcceptTcpClient()
    $stream = $client.GetStream()
    $reader = [System.IO.StreamReader]::new($stream)
    $requestLine = $reader.ReadLine()

    while ($reader.Peek() -gt -1) {
      $line = $reader.ReadLine()
      if ([string]::IsNullOrEmpty($line)) { break }
    }

    $path = "index.html"
    if ($requestLine -match "^[A-Z]+\s+([^\s]+)") {
      $path = [Uri]::UnescapeDataString($matches[1].Split("?")[0].TrimStart("/"))
      if ([string]::IsNullOrWhiteSpace($path)) { $path = "index.html" }
    }

    $fullPath = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($Root, $path))
    $rootPath = [System.IO.Path]::GetFullPath($Root)
    $status = "200 OK"
    $contentType = Get-ContentType $fullPath

    if (-not $fullPath.StartsWith($rootPath, [System.StringComparison]::OrdinalIgnoreCase) -or -not [System.IO.File]::Exists($fullPath)) {
      $status = "404 Not Found"
      $contentType = "text/plain; charset=utf-8"
      $body = [System.Text.Encoding]::UTF8.GetBytes("Not found")
    } else {
      $body = [System.IO.File]::ReadAllBytes($fullPath)
    }

    $header = "HTTP/1.1 $status`r`nContent-Type: $contentType`r`nContent-Length: $($body.Length)`r`nConnection: close`r`n`r`n"
    $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
    $stream.Write($headerBytes, 0, $headerBytes.Length)
    $stream.Write($body, 0, $body.Length)
    $stream.Close()
    $client.Close()
  }
} finally {
  $listener.Stop()
}
