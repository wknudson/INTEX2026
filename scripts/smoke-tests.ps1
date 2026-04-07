param(
    [Parameter(Mandatory = $false)]
    [string]$BaseUrl = "https://localhost:4000"
)

Write-Host "Running Havyn smoke tests against $BaseUrl"

function Check-Endpoint {
    param([string]$Path)
    try {
        $response = Invoke-WebRequest -Uri "$BaseUrl$Path" -Method GET -UseBasicParsing
        Write-Host "[PASS] $Path -> $($response.StatusCode)"
    }
    catch {
        Write-Host "[FAIL] $Path -> $($_.Exception.Message)"
        throw
    }
}

Check-Endpoint "/api/donors/impact"

Write-Host "Smoke test complete. Authenticated routes require login cookie and role context."
