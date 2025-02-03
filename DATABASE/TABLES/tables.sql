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

CREATE TABLE Teams_Tournaments (
    TeamID INT NOT NULL,
    TournamentID INT NOT NULL,
    CONSTRAINT PK_Teams_Tournaments PRIMARY KEY (TeamID, TournamentID),
    CONSTRAINT FK_Teams_Tournaments_Teams FOREIGN KEY (TeamID) REFERENCES Teams(TeamID) ON DELETE CASCADE,
    CONSTRAINT FK_Teams_Tournaments_Tournaments FOREIGN KEY (TournamentID) REFERENCES Tournaments(TournamentID) ON DELETE CASCADE
);

CREATE TABLE Matches (
    MatchID INT PRIMARY KEY IDENTITY(1,1),
    TournamentID INT NOT NULL,
    HomeTeamID INT NOT NULL,
    AwayTeamID INT NOT NULL,
    HomeGoals INT DEFAULT 0,
    AwayGoals INT DEFAULT 0,
    MatchDate DATETIME NOT NULL,
    CONSTRAINT FK_Matches_Tournaments FOREIGN KEY (TournamentID) REFERENCES Tournaments(TournamentID) ON DELETE NO ACTION,
    CONSTRAINT FK_Matches_HomeTeam FOREIGN KEY (HomeTeamID) REFERENCES Teams(TeamID) ON DELETE NO ACTION,
    CONSTRAINT FK_Matches_AwayTeam FOREIGN KEY (AwayTeamID) REFERENCES Teams(TeamID) ON DELETE NO ACTION
);

CREATE TABLE Player_Statistics (
    StatisticID INT PRIMARY KEY IDENTITY(1,1),
    PlayerID INT NOT NULL,
    Goals INT DEFAULT 0,
    Assists INT DEFAULT 0,
    YellowCards INT DEFAULT 0,
    RedCards INT DEFAULT 0,
    CONSTRAINT FK_Player_Statistics FOREIGN KEY (PlayerID) REFERENCES Players(PlayerID) ON DELETE CASCADE
);

CREATE TABLE MatchEvents (
  EventID INT PRIMARY KEY IDENTITY(1,1),
  MatchID INT NOT NULL,
  EventTime INT NOT NULL, -- minut de la partida
  Description VARCHAR(255) NOT NULL,
  CONSTRAINT FK_MatchEvents_Matches FOREIGN KEY (MatchID) REFERENCES Matches(MatchID) ON DELETE CASCADE
);
