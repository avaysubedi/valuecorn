-- Drop tables if needed (for dev resets)
-- DROP TABLE IF EXISTS ValuationYears;
-- DROP TABLE IF EXISTS Valuations;

-- Create Valuations Table
CREATE TABLE Valuations (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,                          -- FK to Users
    CompanyCode NVARCHAR(50),                     -- optional, to be linked with Company table later
    Country NVARCHAR(100),
    DiscountRate DECIMAL(5,4),                    -- e.g., 0.085 = 8.5%
    TaxRate DECIMAL(5,4),
    TerminalGrowthRate DECIMAL(5,4),
    TerminalValue DECIMAL(18,2),
    DiscountedTerminalValue DECIMAL(18,2),
    DCFValuation DECIMAL(18,2),
    CreatedAt DATETIME DEFAULT GETDATE(),

    CONSTRAINT FK_Valuations_User FOREIGN KEY (UserId) REFERENCES Users(Id)
);

-- Create ValuationYears Table (linked to Valuations)
CREATE TABLE ValuationYears (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ValuationId INT NOT NULL,                      -- FK to Valuations
    Year INT NOT NULL,                             -- e.g., 2022, 2023, 2024
    IsProjected BIT NOT NULL,                      -- 0 = Actual, 1 = Projected

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

    CreatedAt DATETIME DEFAULT GETDATE(),

    CONSTRAINT FK_ValuationYears_Valuation FOREIGN KEY (ValuationId) REFERENCES Valuations(Id)
);
