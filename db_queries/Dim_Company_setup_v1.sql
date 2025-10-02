-- Core Company Table
CREATE TABLE dbo.DimCompany (
    CompanyId INT IDENTITY(1,1) PRIMARY KEY,
    CompanyCode VARCHAR(50) UNIQUE NOT NULL,
    CompanyName NVARCHAR(255) NOT NULL,
    TradeName NVARCHAR(255) NULL,
    DateOfIncorporation DATE NULL,
    CountryCode VARCHAR(10) NULL,
    LegalStructure NVARCHAR(100) NULL,
    RegisteredAddressId INT NULL,
    OperationalAddressId INT NULL,
    BusinessLicenseNumber NVARCHAR(50) NULL,
    LicenseExpiryDate DATE NULL,
    OfficialPhone NVARCHAR(50) NULL,
    OfficialEmail NVARCHAR(255) NULL,
    Website NVARCHAR(255) NULL,
    CreatedAt DATETIME DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME DEFAULT GETUTCDATE()
);

-- Address Table
CREATE TABLE dbo.DimAddress (
    AddressId INT IDENTITY(1,1) PRIMARY KEY,
    AddressLine NVARCHAR(500),
    City NVARCHAR(100),
    Country NVARCHAR(100),
    POBox NVARCHAR(50),
    PostalCode NVARCHAR(20)
);

-- Shareholders
CREATE TABLE dbo.FactCompanyShareholders (
    ShareholderId INT IDENTITY(1,1) PRIMARY KEY,
    CompanyId INT NOT NULL FOREIGN KEY REFERENCES dbo.DimCompany(CompanyId),
    ShareholderName NVARCHAR(255),
    Nationality NVARCHAR(100),
    Percentage DECIMAL(5,2),
    IsUBO BIT DEFAULT 0,
    UBOId NVARCHAR(100) NULL
);

-- Management
CREATE TABLE dbo.FactCompanyManagement (
    ManagementId INT IDENTITY(1,1) PRIMARY KEY,
    CompanyId INT NOT NULL FOREIGN KEY REFERENCES dbo.DimCompany(CompanyId),
    PersonName NVARCHAR(255),
    Role NVARCHAR(100),
    IsAuthorizedSignatory BIT DEFAULT 0
);

-- Business Activities
CREATE TABLE dbo.FactCompanyActivities (
    ActivityId INT IDENTITY(1,1) PRIMARY KEY,
    CompanyId INT NOT NULL FOREIGN KEY REFERENCES dbo.DimCompany(CompanyId),
    ActivityName NVARCHAR(255),
    ActivityCode NVARCHAR(50),
    IsFreeZoneQualifying BIT DEFAULT 0
);

-- Financials (1-to-1)
CREATE TABLE dbo.DimCompanyFinancials (
    FinancialId INT IDENTITY(1,1) PRIMARY KEY,
    CompanyId INT UNIQUE NOT NULL FOREIGN KEY REFERENCES dbo.DimCompany(CompanyId),
    FiscalYearEnd TINYINT,
    AccountingStandards NVARCHAR(50),
    ExternalAuditor NVARCHAR(255)
);

-- Banking
CREATE TABLE dbo.FactCompanyBanking (
    BankId INT IDENTITY(1,1) PRIMARY KEY,
    CompanyId INT NOT NULL FOREIGN KEY REFERENCES dbo.DimCompany(CompanyId),
    BankName NVARCHAR(255),
    AccountNumber NVARCHAR(100),
    Currency NVARCHAR(10),
    LoanDetails NVARCHAR(MAX),
    OverdraftLimit DECIMAL(18,2)
);

-- Tax & Compliance (1-to-1)
CREATE TABLE dbo.DimCompanyTax (
    TaxId INT IDENTITY(1,1) PRIMARY KEY,
    CompanyId INT UNIQUE NOT NULL FOREIGN KEY REFERENCES dbo.DimCompany(CompanyId),
    VATRegNo NVARCHAR(50),
    VATDate DATE,
    CorporateTaxRegNo NVARCHAR(50),
    CorporateTaxDate DATE,
    FreeZoneBenefit NVARCHAR(255),
    Exemptions NVARCHAR(MAX)
);

-- Group Structure / Related Parties
CREATE TABLE dbo.FactCompanyGroup (
    GroupId INT IDENTITY(1,1) PRIMARY KEY,
    CompanyId INT NOT NULL FOREIGN KEY REFERENCES dbo.DimCompany(CompanyId),
    RelatedEntityName NVARCHAR(255),
    RelationType NVARCHAR(50),
    Country NVARCHAR(100),
    OwnershipPercentage DECIMAL(5,2)
);

-- Contracts
CREATE TABLE dbo.FactCompanyContracts (
    ContractId INT IDENTITY(1,1) PRIMARY KEY,
    CompanyId INT NOT NULL FOREIGN KEY REFERENCES dbo.DimCompany(CompanyId),
    ContractType NVARCHAR(100),
    PartyName NVARCHAR(255),
    ContractValue DECIMAL(18,2),
    ExpiryDate DATE,
    Notes NVARCHAR(MAX)
);

-- HR
CREATE TABLE dbo.DimCompanyHR (
    HRId INT IDENTITY(1,1) PRIMARY KEY,
    CompanyId INT UNIQUE NOT NULL FOREIGN KEY REFERENCES dbo.DimCompany(CompanyId),
    TotalEmployees INT,
    WPSNumber NVARCHAR(50),
    Policies NVARCHAR(MAX)
);

-- Insurance
CREATE TABLE dbo.FactCompanyInsurance (
    InsuranceId INT IDENTITY(1,1) PRIMARY KEY,
    CompanyId INT NOT NULL FOREIGN KEY REFERENCES dbo.DimCompany(CompanyId),
    InsuranceType NVARCHAR(100),
    Provider NVARCHAR(255),
    CoverageAmount DECIMAL(18,2),
    ExpiryDate DATE
);

-- IT
CREATE TABLE dbo.DimCompanyIT (
    ITId INT IDENTITY(1,1) PRIMARY KEY,
    CompanyId INT UNIQUE NOT NULL FOREIGN KEY REFERENCES dbo.DimCompany(CompanyId),
    ERPSystem NVARCHAR(100),
    CybersecurityPolicy NVARCHAR(MAX),
    BackupRecoveryPlan NVARCHAR(MAX)
);

CREATE TABLE dbo.AuditLog (
    AuditId BIGINT IDENTITY(1,1) PRIMARY KEY,
    CompanyId INT NULL,
    TableName NVARCHAR(100),
    ActionType NVARCHAR(20),      -- INSERT / UPDATE / DELETE
    RecordId INT NULL,            -- the PK of the row
    ChangedBy NVARCHAR(100),      -- username or system
    ChangedAt DATETIME DEFAULT GETUTCDATE(),
    OldValues NVARCHAR(MAX) NULL,
    NewValues NVARCHAR(MAX) NULL
);

