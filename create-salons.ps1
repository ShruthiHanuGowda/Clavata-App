$tableName = "Salons"
$usersTableName = "Users"
$region = "ap-south-2"

$batchSize = 25

Write-Host ""
Write-Host "========================================"
Write-Host "Clavata Test Salon Import"
Write-Host "========================================"
Write-Host "Users table:  $usersTableName"
Write-Host "Salons table: $tableName"
Write-Host "Region:       $region"
Write-Host "========================================"
Write-Host ""

# ---------------------------------------------------------
# Get provider users
# ---------------------------------------------------------

Write-Host "Reading providers from Users table..."

$scanOutput = & aws dynamodb scan `
    --table-name $usersTableName `
    --region $region `
    --output json 2>&1

$scanExitCode = $LASTEXITCODE

if ($scanExitCode -ne 0) {
    Write-Host ""
    Write-Host "ERROR: Could not read Users table." -ForegroundColor Red
    Write-Host $scanOutput
    exit 1
}

try {
    $scanResult = $scanOutput | ConvertFrom-Json
}
catch {
    Write-Host ""
    Write-Host "ERROR: Could not parse Users response." -ForegroundColor Red
    Write-Host $scanOutput
    exit 1
}

$providerUsers = @(
    $scanResult.Items |
    Where-Object {
        $_.providerStatus.S -eq "APPROVED" -and
        $_.activeRole.S -eq "PROVIDER" -and
        $null -ne $_.salonId.S
    }
)

if ($providerUsers.Count -eq 0) {
    Write-Host ""
    Write-Host "ERROR: No approved providers with salonId found." -ForegroundColor Red
    exit 1
}

Write-Host "Found $($providerUsers.Count) providers."
Write-Host ""

# ---------------------------------------------------------
# Create salon records
# ---------------------------------------------------------

$salons = @()

$index = 0

foreach ($user in $providerUsers) {

    $index++

    $userId = $user.userId.S
    $salonId = $user.salonId.S
    $ownerName = $user.fullName.S
    $phone = $user.phoneNumber.S

    $indexFormatted = "{0:D3}" -f $index

    # Salon name
    $salonName = "$ownerName Beauty Studio"

    # Slightly spread locations around the existing
    # Clavata test location:
    # 12.963694, 77.4014239

    $latitude = 12.963694 + (
        (($index % 10) - 5) * 0.0015
    )

    $longitude = 77.4014239 + (
        (([math]::Floor(($index - 1) / 10)) - 2) * 0.0015
    )

    # Fake test-only KYC values
    $aadhaarNumber = "99990000$("{0:D4}" -f $index)"

    $panNumber = "TESTP$("{0:D5}" -f $index)"

    $gstNumber = "29TEST$("{0:D8}" -f $index)1Z5"

    $email = (
        $ownerName.ToLower() -replace '[^a-z0-9]', ''
    ) + $indexFormatted + "@test.clavata.com"

    $timestamp = "2026-09-15T10:00:00.000Z"

    $salon = @{
        PutRequest = @{
            Item = @{

                salonId = @{
                    S = $salonId
                }

                aadhaarNumber = @{
                    S = $aadhaarNumber
                }

                accountHolderName = @{
                    S = $ownerName
                }

                address = @{
                    M = @{

                        addressLine = @{
                            S = "$($index + 10)"
                        }

                        city = @{
                            S = "Tavarekere"
                        }

                        pincode = @{
                            S = "562130"
                        }

                        state = @{
                            S = "Karnataka"
                        }
                    }
                }

                adminApprovalStatus = @{
                    S = "APPROVED"
                }

                alternatePhone = @{
                    S = ""
                }

                approvedAt = @{
                    S = $timestamp
                }

                approvedBy = @{
                    S = "ADMIN"
                }

                averageRating = @{
                    N = "0"
                }

                bankAccount = @{
                    S = ""
                }

                businessHours = @{
                    M = @{

                        FRIDAY = @{
                            M = @{
                                close = @{
                                    S = "19:00"
                                }
                                isOpen = @{
                                    BOOL = $true
                                }
                                open = @{
                                    S = "09:00"
                                }
                            }
                        }

                        MONDAY = @{
                            M = @{
                                close = @{
                                    S = "19:00"
                                }
                                isOpen = @{
                                    BOOL = $true
                                }
                                open = @{
                                    S = "09:00"
                                }
                            }
                        }

                        SATURDAY = @{
                            M = @{
                                close = @{
                                    S = "18:00"
                                }
                                isOpen = @{
                                    BOOL = $true
                                }
                                open = @{
                                    S = "10:00"
                                }
                            }
                        }

                        SUNDAY = @{
                            M = @{
                                close = @{
                                    S = "18:00"
                                }
                                isOpen = @{
                                    BOOL = $false
                                }
                                open = @{
                                    S = "10:00"
                                }
                            }
                        }

                        THURSDAY = @{
                            M = @{
                                close = @{
                                    S = "19:00"
                                }
                                isOpen = @{
                                    BOOL = $true
                                }
                                open = @{
                                    S = "09:00"
                                }
                            }
                        }

                        TUESDAY = @{
                            M = @{
                                close = @{
                                    S = "19:00"
                                }
                                isOpen = @{
                                    BOOL = $true
                                }
                                open = @{
                                    S = "09:00"
                                }
                            }
                        }

                        WEDNESDAY = @{
                            M = @{
                                close = @{
                                    S = "19:00"
                                }
                                isOpen = @{
                                    BOOL = $true
                                }
                                open = @{
                                    S = "09:00"
                                }
                            }
                        }
                    }
                }

                businessType = @{
                    S = "SALON"
                }

                coverImageUrl = @{
                    S = ""
                }

                createdAt = @{
                    S = $timestamp
                }

                documents = @{
                    M = @{

                        aadhaarBack = @{
                            S = ""
                        }

                        aadhaarFront = @{
                            S = ""
                        }

                        gstCertificate = @{
                            S = ""
                        }

                        panCard = @{
                            S = ""
                        }
                    }
                }

                email = @{
                    S = $email
                }

                galleryImages = @{
                    L = @()
                }

                gstNumber = @{
                    S = $gstNumber
                }

                ifsc = @{
                    S = ""
                }

                isActive = @{
                    BOOL = $true
                }

                isDeleted = @{
                    BOOL = $false
                }

                isVisible = @{
                    BOOL = $true
                }

                kycStatus = @{
                    S = "APPROVED"
                }

                lastUpdatedBy = @{
                    S = "ADMIN"
                }

                latitude = @{
                    N = $latitude.ToString(
                        [System.Globalization.CultureInfo]::InvariantCulture
                    )
                }

                logoUrl = @{
                    S = ""
                }

                longitude = @{
                    N = $longitude.ToString(
                        [System.Globalization.CultureInfo]::InvariantCulture
                    )
                }

                ownerName = @{
                    S = $ownerName
                }

                ownerPhoneNumber = @{
                    S = $phone
                }

                ownerUserId = @{
                    S = $userId
                }

                panNumber = @{
                    S = $panNumber
                }

                salonName = @{
                    S = $salonName
                }

                salonStatus = @{
                    S = "CLOSED"
                }

                totalAppointments = @{
                    N = "0"
                }

                totalCancelledAppointments = @{
                    N = "0"
                }

                totalCompletedAppointments = @{
                    N = "0"
                }

                totalRevenue = @{
                    N = "0"
                }

                totalReviews = @{
                    N = "0"
                }

                updatedAt = @{
                    S = $timestamp
                }
            }
        }
    }

    $salons += $salon
}

Write-Host ""
Write-Host "Created $($salons.Count) salon records."
Write-Host ""

# ---------------------------------------------------------
# Batch write Salons
# ---------------------------------------------------------

$totalBatches = [math]::Ceiling(
    $salons.Count / $batchSize
)

$successful = 0

for ($batch = 0; $batch -lt $totalBatches; $batch++) {

    $start = $batch * $batchSize

    $end = [Math]::Min(
        $start + $batchSize - 1,
        $salons.Count - 1
    )

    $items = @(
        $salons[$start..$end]
    )

    $batchNumber = $batch + 1

    $payload = @{
        $tableName = $items
    }

    $tempFile = Join-Path (
        Get-Location
    ) "current_salons_batch.json"

    $json = $payload | ConvertTo-Json -Depth 30

    # IMPORTANT:
    # Write UTF-8 WITHOUT BOM
    [System.IO.File]::WriteAllText(
        $tempFile,
        $json,
        [System.Text.UTF8Encoding]::new($false)
    )

    Write-Host ""
    Write-Host "----------------------------------------"
    Write-Host "Batch $batchNumber / $totalBatches"
    Write-Host "Salons: $($start + 1) - $($end + 1)"
    Write-Host "----------------------------------------"

    $currentPayload = $payload
    $attempt = 1

    while ($true) {

        Write-Host "Attempt $attempt..."

        $json = $currentPayload | ConvertTo-Json -Depth 30

        [System.IO.File]::WriteAllText(
            $tempFile,
            $json,
            [System.Text.UTF8Encoding]::new($false)
        )

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
            Write-Host "SUCCESS: All $($items.Count) salons processed." -ForegroundColor Green

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
Write-Host "SALON IMPORT COMPLETE"
Write-Host "========================================"
Write-Host "Successfully processed: $successful / $($salons.Count)"
Write-Host "========================================"