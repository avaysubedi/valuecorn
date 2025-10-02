USE [valuecorn]
GO

IF OBJECT_ID('dbo.sp_UpsertCompanyFinancials', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_UpsertCompanyFinancials;
GO

CREATE PROCEDURE dbo.sp_UpsertCompanyFinancials
    @FinancialId INT = NULL OUTPUT,
    @CompanyId INT,
    @FiscalYearEnd TINYINT = NULL,
    @AccountingStandards NVARCHAR(50) = NULL,
    @ExternalAuditor NVARCHAR(255) = NULL,
    @UserId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM dbo.DimCompanyFinancials WHERE CompanyId = @CompanyId)
    BEGIN
        UPDATE dbo.DimCompanyFinancials
        SET FiscalYearEnd = @FiscalYearEnd,
            AccountingStandards = @AccountingStandards,
            ExternalAuditor = @ExternalAuditor
        WHERE CompanyId = @CompanyId;

        SELECT @FinancialId = FinancialId
        FROM dbo.DimCompanyFinancials
        WHERE CompanyId = @CompanyId;
    END
    ELSE
    BEGIN
        INSERT INTO dbo.DimCompanyFinancials
            (CompanyId, FiscalYearEnd, AccountingStandards, ExternalAuditor)
        VALUES
            (@CompanyId, @FiscalYearEnd, @AccountingStandards, @ExternalAuditor);

        SET @FinancialId = SCOPE_IDENTITY();
    END

    SELECT @FinancialId AS FinancialId;
END
GO

USE [valuecorn]
GO

IF OBJECT_ID('dbo.sp_UpsertCompanyTax', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_UpsertCompanyTax;
GO

CREATE PROCEDURE dbo.sp_UpsertCompanyTax
    @TaxId INT = NULL OUTPUT,
    @CompanyId INT,
    @VATRegNo NVARCHAR(50) = NULL,
    @VATDate DATE = NULL,
    @CorporateTaxRegNo NVARCHAR(50) = NULL,
    @CorporateTaxDate DATE = NULL,
    @FreeZoneBenefit NVARCHAR(255) = NULL,
    @Exemptions NVARCHAR(MAX) = NULL,
    @UserId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM dbo.DimCompanyTax WHERE CompanyId = @CompanyId)
    BEGIN
        UPDATE dbo.DimCompanyTax
        SET VATRegNo = @VATRegNo,
            VATDate = @VATDate,
            CorporateTaxRegNo = @CorporateTaxRegNo,
            CorporateTaxDate = @CorporateTaxDate,
            FreeZoneBenefit = @FreeZoneBenefit,
            Exemptions = @Exemptions
        WHERE CompanyId = @CompanyId;

        SELECT @TaxId = TaxId
        FROM dbo.DimCompanyTax
        WHERE CompanyId = @CompanyId;
    END
    ELSE
    BEGIN
        INSERT INTO dbo.DimCompanyTax
            (CompanyId, VATRegNo, VATDate, CorporateTaxRegNo, CorporateTaxDate, FreeZoneBenefit, Exemptions)
        VALUES
            (@CompanyId, @VATRegNo, @VATDate, @CorporateTaxRegNo, @CorporateTaxDate, @FreeZoneBenefit, @Exemptions);

        SET @TaxId = SCOPE_IDENTITY();
    END

    SELECT @TaxId AS TaxId;
END
GO
