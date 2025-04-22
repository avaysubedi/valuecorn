CREATE TABLE Projections (
    Id INT PRIMARY KEY IDENTITY(1,1),
    UserId INT NOT NULL,
    CompanyCode VARCHAR(100) NOT NULL,
    Country VARCHAR(100),
    DiscountRate DECIMAL(5,4),
    TaxRate DECIMAL(5,4),
    TerminalGrowthRate DECIMAL(5,4),
    TerminalValue DECIMAL(18,2),
    DiscountedTerminalValue DECIMAL(18,2),
    DCFValuation DECIMAL(18,2),
    ActualYears INT,
    ProjectionYears INT,
    CreatedAt DATETIME DEFAULT GETDATE()
);

CREATE TABLE ProjectionYears (
    Id INT PRIMARY KEY IDENTITY(1,1),
    ProjectionId INT FOREIGN KEY REFERENCES Projections(Id),
    YearIndex INT,
    Revenues DECIMAL(18,2),
    COGS DECIMAL(18,2),
    EmployeeExpense DECIMAL(18,2),
    SGAExpense DECIMAL(18,2),
    Depreciation DECIMAL(18,2),
    InterestExpense DECIMAL(18,2),
    OtherIncome DECIMAL(18,2),
    EBITDA DECIMAL(18,2),
    EBIT DECIMAL(18,2),
    NOPAT DECIMAL(18,2),
    FCFF DECIMAL(18,2),
    DiscountedFCFF DECIMAL(18,2)
);

CREATE PROCEDURE InsertProjectionData
    @UserId INT,
    @CompanyCode VARCHAR(100),
    @Country VARCHAR(100),
    @DiscountRate DECIMAL(5,4),
    @TaxRate DECIMAL(5,4),
    @TerminalGrowthRate DECIMAL(5,4),
    @TerminalValue DECIMAL(18,2),
    @DiscountedTerminalValue DECIMAL(18,2),
    @DCFValuation DECIMAL(18,2),
    @ActualYears INT,
    @ProjectionYears INT,
    @NewId INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO Projections (
        UserId, CompanyCode, Country, DiscountRate, TaxRate, TerminalGrowthRate,
        TerminalValue, DiscountedTerminalValue, DCFValuation,
        ActualYears, ProjectionYears
    )
    VALUES (
        @UserId, @CompanyCode, @Country, @DiscountRate, @TaxRate, @TerminalGrowthRate,
        @TerminalValue, @DiscountedTerminalValue, @DCFValuation,
        @ActualYears, @ProjectionYears
    );

    SET @NewId = SCOPE_IDENTITY();
END;
CREATE PROCEDURE InsertProjectionYear
    @ProjectionId INT,
    @YearIndex INT,
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
    SET NOCOUNT ON;

    INSERT INTO ProjectionYears (
        ProjectionId, YearIndex, Revenues, COGS, EmployeeExpense, SGAExpense,
        Depreciation, InterestExpense, OtherIncome, EBITDA, EBIT, NOPAT, FCFF, DiscountedFCFF
    )
    VALUES (
        @ProjectionId, @YearIndex, @Revenues, @COGS, @EmployeeExpense, @SGAExpense,
        @Depreciation, @InterestExpense, @OtherIncome, @EBITDA, @EBIT, @NOPAT, @FCFF, @DiscountedFCFF
    );
END;
