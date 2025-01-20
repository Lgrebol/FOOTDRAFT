CREATE DATABASE FOOTDRAFT;
GO

CREATE TABLE Users (
    UserID INT PRIMARY KEY IDENTITY(1,1),
    Name VARCHAR(50) NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    RegistrationDate DATETIME DEFAULT GETDATE()
);


CREATE TABLE Teams (
    TeamID INT PRIMARY KEY IDENTITY(1,1),
    TeamName VARCHAR(50) NOT NULL UNIQUE,
    TeamLogo VARBINARY(MAX) NULL,
    ShirtColor VARCHAR(20) NOT NULL,
    UserID INT NOT NULL,
    IsActive BIT DEFAULT 1,
    CONSTRAINT FK_Teams_Users FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
);


CREATE TABLE Players (
    PlayerID INT PRIMARY KEY IDENTITY(1,1),
    PlayerName VARCHAR(50) NOT NULL,
    Position VARCHAR(20) CHECK (Position IN ('Goalkeeper', 'Defender', 'Midfielder', 'Forward')),
    Points INT DEFAULT 0,
    TeamID INT NOT NULL,
    IsActive BIT DEFAULT 1,
    CONSTRAINT FK_Players_Teams FOREIGN KEY (TeamID) REFERENCES Teams(TeamID) ON DELETE CASCADE
);


CREATE TABLE Tournaments (
    TournamentID INT PRIMARY KEY IDENTITY(1,1),
    TournamentName VARCHAR(100) NOT NULL,
    TournamentType VARCHAR(20) CHECK (TournamentType IN ('Knockout', 'League', 'Mixed')),
    StartDate DATE NOT NULL,
    EndDate DATE NULL
);
