ALTER TABLE dbo.DimAddress 
    ADD AddressType VARCHAR(20) NOT NULL, -- 'Registered' or 'Operational'
    Street NVARCHAR(255) NULL,
	State NVARCHAR(100) NULL,
    CountryCode VARCHAR(10) NULL,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NULL,
	UserId INT
;
ALTER TABLE dbo.DimAddress
ADD CompanyId INT NOT NULL DEFAULT 0
CONSTRAINT FK_DimAddress_Company FOREIGN KEY (CompanyId) REFERENCES dbo.DimCompany(CompanyId);
USE [valuecorn]
GO
/****** Object:  StoredProcedure [dbo].[sp_UpsertCompanyAddress]    Script Date: 01/10/2025 4:03:34 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER   PROCEDURE [dbo].[sp_UpsertCompanyAddress]
    @AddressId INT = NULL,
    @CompanyId INT,
    @AddressType VARCHAR(20),
    @AddressLine NVARCHAR(500) = NULL,
    @Street NVARCHAR(255) = NULL,
    @City NVARCHAR(100) = NULL,
    @State NVARCHAR(100) = NULL,
    @PostalCode NVARCHAR(20) = NULL,
    @POBox NVARCHAR(50) = NULL,
    @CountryCode VARCHAR(10) = NULL,
    @UserId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM dbo.DimAddress WHERE CompanyId = @CompanyId)
    BEGIN
        UPDATE dbo.DimAddress
        SET AddressLine = @AddressLine,
            Street = @Street,
            City = @City,
            State = @State,
            PostalCode = @PostalCode,
            POBox = @POBox,
            CountryCode = @CountryCode,
            UpdatedAt = GETUTCDATE(),
            UserId = @UserId
        WHERE AddressId = @AddressId;
    END
    ELSE
    BEGIN
        INSERT INTO dbo.DimAddress
            (CompanyId, AddressType, AddressLine, Street, City, State, PostalCode, POBox, CountryCode, CreatedAt, UpdatedAt, UserId)
        VALUES
            (@CompanyId, @AddressType, @AddressLine, @Street, @City, @State, @PostalCode, @POBox, @CountryCode, GETUTCDATE(), GETUTCDATE(), @UserId);

        SET @AddressId = SCOPE_IDENTITY();
    END

    SELECT @AddressId AS AddressId;
END;

