CREATE TABLE TmpCompanyShareholders (
    TempId INT IDENTITY(1,1) PRIMARY KEY,
    CompanyId INT NOT NULL,
    ShareholderName NVARCHAR(255) NOT NULL,
    Nationality NVARCHAR(100) NULL,
    Percentage DECIMAL(5,2) NULL,
    IsUBO BIT NULL,
    UBOId NVARCHAR(100) NULL,
    Type NVARCHAR(50) NULL,
    CreatedAt DATETIME DEFAULT GETUTCDATE()
);

CREATE  PROCEDURE dbo.sp_InsertTempShareholder
    @CompanyId INT,
    @ShareholderName NVARCHAR(255),
    @Nationality NVARCHAR(100) = NULL,
    @Percentage DECIMAL(5,2) = NULL,
    @IsUBO BIT = NULL,
    @UBOId NVARCHAR(100) = NULL,
    @Type NVARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO TmpCompanyShareholders
        (CompanyId, ShareholderName, Nationality, Percentage, IsUBO, UBOId, Type)
    VALUES
        (@CompanyId, @ShareholderName, @Nationality, @Percentage, @IsUBO, @UBOId, @Type);
END


CREATE  PROCEDURE dbo.sp_CommitCompanyShareholders
    @CompanyId INT
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Optional: validation check (ownership % must not exceed 100)
    IF EXISTS (
        SELECT 1
        FROM (
            SELECT SUM(ISNULL(Percentage, 0)) AS TotalPct
            FROM TmpCompanyShareholders
            WHERE CompanyId = @CompanyId
        ) t
        WHERE t.TotalPct > 100
    )
    BEGIN
        RAISERROR('Total ownership percentage exceeds 100%%', 16, 1);
        RETURN;
    END

    -- 2. Delete old shareholders
    DELETE FROM FactCompanyShareholders WHERE CompanyId = @CompanyId;

    -- 3. Insert new ones from temp
    INSERT INTO FactCompanyShareholders
        (CompanyId, ShareholderName, Nationality, Percentage, IsUBO, UBOId, Type)
    SELECT 
        CompanyId,
        ShareholderName,
        Nationality,
        Percentage,
        IsUBO,
        UBOId,
        Type
    FROM TmpCompanyShareholders
    WHERE CompanyId = @CompanyId;

    -- 4. Clean temp
    DELETE FROM TmpCompanyShareholders WHERE CompanyId = @CompanyId;
END


CREATE OR ALTER PROCEDURE dbo.sp_DeleteTempShareholderById
    @TempId INT,
    @CompanyId INT
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM TmpCompanyShareholders
    WHERE TempId = @TempId
      AND CompanyId = @CompanyId;
END



