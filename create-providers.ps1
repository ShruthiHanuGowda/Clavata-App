$tableName = "Users"
$region = "ap-south-2"

$totalProviders = 50
$batchSize = 25

$names = @(
    "Aarav", "Vihaan", "Aditya", "Arjun", "Reyansh",
    "Kabir", "Rohan", "Rahul", "Karan", "Vikram",
    "Siddharth", "Nikhil", "Akash", "Varun", "Manish",
    "Suresh", "Pranav", "Ravi", "Amit", "Ankit",
    "Deepak", "Harish", "Kishore", "Naveen", "Abhishek",
    "Ritesh", "Sachin", "Rakesh", "Vivek", "Mohit",
    "Yash", "Dhruv", "Ishaan", "Kunal", "Tushar",
    "Raj", "Dev", "Shreyas", "Tarun", "Gaurav",
    "Piyush", "Sameer", "Sanjay", "Ajay", "Mahesh",
    "Manoj", "Sunil", "Ashwin", "Tejas", "Nandan"
)

$providers = @()

for ($i = 1; $i -le $totalProviders; $i++) {

    $index = "{0:D3}" -f $i
    $userId = [guid]::NewGuid().ToString()
    $salonId = [guid]::NewGuid().ToString()

    $phone = "91990000$("{0:D4}" -f (1000 + $i))"

    $paymentMethods = @(
        "UPI",
        "CARD",
        "NETBANKING"
    )

    $paymentMethod =
        $paymentMethods[($i - 1) % $paymentMethods.Count]

    $provider = @{
        PutRequest = @{
            Item = @{
                phoneNumber = @{
                    S = $phone
                }

                activeRole = @{
                    S = "PROVIDER"
                }

                createdAt = @{
                    S = "2026-09-15T10:00:00.000Z"
                }

                fcmPlatform = @{
                    S = "ANDROID"
                }

                fcmTokens = @{
                    L = @(
                        @{
                            S = "TEST_FCM_TOKEN_PROVIDER_$index"
                        }
                    )
                }

                fcmTokenUpdatedAt = @{
                    S = "2026-09-15T10:00:00.000Z"
                }

                fullName = @{
                    S = $names[$i - 1]
                }

                preferredPaymentMethod = @{
                    S = $paymentMethod
                }

                providerStatus = @{
                    S = "APPROVED"
                }

                roles = @{
                    M = @{
                        businessPartner = @{
                            BOOL = $true
                        }

                        customer = @{
                            BOOL = $false
                        }
                    }
                }

                salonId = @{
                    S = $salonId
                }

                updatedAt = @{
                    S = "2026-09-15T10:00:00.000Z"
                }

                userId = @{
                    S = $userId
                }
            }
        }
    }

    $providers += $provider
}

$totalBatches = [math]::Ceiling(
    $providers.Count / $batchSize
)

Write-Host ""
Write-Host "========================================"
Write-Host "Clavata Provider Import"
Write-Host "========================================"
Write-Host "Table: $tableName"
Write-Host "Region: $region"
Write-Host "Providers: $totalProviders"
Write-Host "Batch size: $batchSize"
Write-Host "Batches: $totalBatches"
Write-Host "========================================"
Write-Host ""

$successful = 0

for ($batch = 0; $batch -lt $totalBatches; $batch++) {

    $start = $batch * $batchSize

    $end = [Math]::Min(
        $start + $batchSize - 1,
        $providers.Count - 1
    )

    $items = @(
        $providers[$start..$end]
    )

    $batchNumber = $batch + 1

    $payload = @{
        $tableName = $items
    }

    $file = Join-Path (
        Get-Location
    ) "providers_batch_$batchNumber.json"

 $json = $payload | ConvertTo-Json -Depth 20

[System.IO.File]::WriteAllText(
    $file,
    $json,
    [System.Text.UTF8Encoding]::new($false)
)

    Write-Host ""
    Write-Host "----------------------------------------"
    Write-Host "Batch $batchNumber / $totalBatches"
    Write-Host "Providers: $($start + 1) - $($end + 1)"
    Write-Host "----------------------------------------"

    $currentPayload = $payload
    $attempt = 1

    while ($true) {

        Write-Host "Attempt $attempt..."

        $tempFile = Join-Path (
            Get-Location
        ) "current_batch.json"

       $json = $currentPayload | ConvertTo-Json -Depth 20

[System.IO.File]::WriteAllText(
    $tempFile,
    $json,
    [System.Text.UTF8Encoding]::new($false)
)

        # Capture AWS output and errors separately
        $awsOutput = & aws dynamodb batch-write-item `
            --request-items "file://$tempFile" `
            --region $region `
            --output json 2>&1

        $exitCode = $LASTEXITCODE

        if ($exitCode -ne 0) {

            Write-Host ""
            Write-Host "ERROR: DynamoDB request failed." -ForegroundColor Red
            Write-Host ""
            Write-Host $awsOutput
            Write-Host ""
            Write-Host "AWS exit code: $exitCode"

            exit 1
        }

        try {
            $result = $awsOutput | ConvertFrom-Json
        }
        catch {
            Write-Host ""
            Write-Host "ERROR: Could not parse AWS response." -ForegroundColor Red
            Write-Host $awsOutput
            exit 1
        }

        $unprocessed = $result.UnprocessedItems.$tableName

        if (
            $null -eq $unprocessed -or
            $unprocessed.Count -eq 0
        ) {

            Write-Host ""
            Write-Host "SUCCESS: All $($items.Count) providers processed." -ForegroundColor Green

            $successful += $items.Count

            break
        }

        Write-Host ""
        Write-Host "WARNING: $($unprocessed.Count) items were not processed." -ForegroundColor Yellow
        Write-Host "Retrying..."

        $currentPayload = @{
            $tableName = @($unprocessed)
        }

        $attempt++

        Start-Sleep -Seconds 1
    }
}

Write-Host ""
Write-Host "========================================"
Write-Host "IMPORT COMPLETE"
Write-Host "========================================"
Write-Host "Successfully processed: $successful / $totalProviders"
Write-Host "========================================"