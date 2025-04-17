-- =============================================
-- Table: Valuations
-- =============================================
CREATE TABLE Valuations (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT,                          -- FK to Users
    CompanyCode NVARCHAR(50),           -- for linking company later
    Country NVARCHAR(100),
    DiscountRate DECIMAL(5,4),          -- e.g. 0.085
    TaxRate DECIMAL(5,4),
    TerminalGrowthRate DECIMAL(5,4),
    TerminalValue DECIMAL(18,2),
    DiscountedTerminalValue DECIMAL(18,2),
    DCFValuation DECIMAL(18,2),
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- =============================================
-- Table: ValuationYears
-- =============================================
CREATE TABLE ValuationYears (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ValuationId INT NOT NULL,              -- FK to Valuations table
    Year INT NOT NULL,                     -- e.g., 2022, 2023, 2024
    IsProjected BIT NOT NULL,              -- 0 = Actual, 1 = Projected
    Revenues DECIMAL(18, 2),
    COGS DECIMAL(18, 2),
    EmployeeExpense DECIMAL(18, 2),
    SGAExpense DECIMAL(18, 2),
    Depreciation DECIMAL(18, 2),
    InterestExpense DECIMAL(18, 2),
    OtherIncome DECIMAL(18, 2),
    EBITDA DECIMAL(18, 2),
    EBIT DECIMAL(18, 2),
    NOPAT DECIMAL(18, 2),
    FCFF DECIMAL(18, 2),
    DiscountedFCFF DECIMAL(18, 2),
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- =============================================
-- SP: InsertValuationData
-- =============================================
CREATE PROCEDURE InsertValuationData
    @UserId INT,
    @CompanyCode NVARCHAR(50),
    @Country NVARCHAR(100),
    @DiscountRate DECIMAL(5,4),
    @TaxRate DECIMAL(5,4),
    @TerminalGrowthRate DECIMAL(5,4),
    @TerminalValue DECIMAL(18,2),
    @DiscountedTerminalValue DECIMAL(18,2),
    @DCFValuation DECIMAL(18,2),
    @InsertedValuationId INT OUTPUT
AS
BEGIN
    INSERT INTO Valuations (UserId, CompanyCode, Country, DiscountRate, TaxRate, TerminalGrowthRate, TerminalValue, DiscountedTerminalValue, DCFValuation)
    VALUES (@UserId, @CompanyCode, @Country, @DiscountRate, @TaxRate, @TerminalGrowthRate, @TerminalValue, @DiscountedTerminalValue, @DCFValuation);

    SET @InsertedValuationId = SCOPE_IDENTITY();
END;

-- =============================================
-- SP: InsertValuationYear
-- =============================================
CREATE PROCEDURE InsertValuationYear
    @ValuationId INT,
    @Year INT,
    @IsProjected BIT,
    @Revenues DECIMAL(18,2),
    @COGS DECIMAL(18,2),
    @EmployeeExpense DECIMAL(18,2),
    @SGAExpense DECIMAL(18,2),
    @Depreciation DECIMAL(18,2),
    @InterestExpense DECIMAL(18,2),
    @OtherIncome DECIMAL(18,2),
    @EBITDA DECIMAL(18,2),
    @EBIT DECIMAL(18,2),
    @NOPAT DECIMAL(18,2),
    @FCFF DECIMAL(18,2),
    @DiscountedFCFF DECIMAL(18,2)
AS
BEGIN
    INSERT INTO ValuationYears (
        ValuationId, Year, IsProjected, Revenues, COGS, EmployeeExpense,
        SGAExpense, Depreciation, InterestExpense, OtherIncome, EBITDA,
        EBIT, NOPAT, FCFF, DiscountedFCFF
    )
    VALUES (
        @ValuationId, @Year, @IsProjected, @Revenues, @COGS, @EmployeeExpense,
        @SGAExpense, @Depreciation, @InterestExpense, @OtherIncome, @EBITDA,
        @EBIT, @NOPAT, @FCFF, @DiscountedFCFF
    );
END;
