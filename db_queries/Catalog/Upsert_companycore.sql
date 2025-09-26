ALTER TABLE dbo.DimCompany
ADD 
    Currency NVARCHAR(10) NULL;


CREATE OR ALTER PROCEDURE dbo.sp_UpsertCompanyCore
    @CompanyId INT = NULL OUTPUT,      -- if NULL = Insert, else Update
    @UserId INT,                       -- from API (logged in user)

    @CompanyCode VARCHAR(50),
    @CompanyName NVARCHAR(255),
    @TradeName NVARCHAR(255) = NULL,
    @DateOfIncorporation DATE = NULL,
    @CountryCode VARCHAR(10) = NULL,
    @LegalStructure NVARCHAR(100) = NULL,
    @BusinessLicenseNumber NVARCHAR(50) = NULL,
    @LicenseExpiryDate DATE = NULL,
    @OfficialPhone NVARCHAR(50) = NULL,
    @OfficialEmail NVARCHAR(255) = NULL,
    @Website NVARCHAR(255) = NULL,
	@IndustryCode VARCHAR(20) = NULL,
	@Currency   NVARCHAR(10)=NULL
 
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @ActionType NVARCHAR(20), @OldValues NVARCHAR(MAX), @NewValues NVARCHAR(MAX);

    -- Insert new
    IF @CompanyId IS NULL
    BEGIN
        INSERT INTO dbo.DimCompany
        (
            CompanyCode, CompanyName, TradeName,
            DateOfIncorporation, CountryCode,IndustryCode, LegalStructure,
            BusinessLicenseNumber, LicenseExpiryDate,Currency,
            OfficialPhone, OfficialEmail, Website,
            CreatedAt, UpdatedAt
        )
        VALUES
        (
            @CompanyCode, @CompanyName, @TradeName,
            @DateOfIncorporation, @CountryCode, @IndustryCode,@LegalStructure,
            @BusinessLicenseNumber, @LicenseExpiryDate,@Currency,
            @OfficialPhone, @OfficialEmail, @Website,
            GETDATE(), GETDATE()
        );

        SET @CompanyId = SCOPE_IDENTITY();
        SET @ActionType = 'INSERT';

        SET @NewValues = (SELECT * FROM dbo.DimCompany WHERE CompanyId = @CompanyId FOR JSON AUTO);

        INSERT INTO dbo.AuditLog (CompanyId, TableName, ActionType, RecordId, UserId, OldValues, NewValues)
        VALUES (@CompanyId, 'DimCompany', @ActionType, @CompanyId, @UserId, NULL, @NewValues);
    END
    ELSE
    BEGIN
        SET @OldValues = (SELECT * FROM dbo.DimCompany WHERE CompanyId = @CompanyId FOR JSON AUTO);

        UPDATE dbo.DimCompany
        SET CompanyCode = @CompanyCode,
            CompanyName = @CompanyName,
            TradeName = @TradeName,
            DateOfIncorporation = @DateOfIncorporation,
            CountryCode = @CountryCode,
            LegalStructure = @LegalStructure,
            BusinessLicenseNumber = @BusinessLicenseNumber,
            LicenseExpiryDate = @LicenseExpiryDate,
            OfficialPhone = @OfficialPhone,
            OfficialEmail = @OfficialEmail,
			IndustryCode = @IndustryCode,
			Currency=@Currency,
            Website = @Website,
            UpdatedAt = GetDate()
        WHERE CompanyId = @CompanyId;

        SET @ActionType = 'UPDATE';
        SET @NewValues = (SELECT * FROM dbo.DimCompany WHERE CompanyId = @CompanyId FOR JSON AUTO);

        INSERT INTO dbo.AuditLog (CompanyId, TableName, ActionType, RecordId, UserId, OldValues, NewValues)
        VALUES (@CompanyId, 'DimCompany', @ActionType, @CompanyId, @UserId, @OldValues, @NewValues);
    END

    -- Return ID
    SELECT @CompanyId AS CompanyId;
END;
