-- MySQL version of the database setup

CREATE DATABASE IF NOT EXISTS transport;
USE transport;

CREATE TABLE UserTable (
    ID INT AUTO_INCREMENT,
    Email VARCHAR(40) NOT NULL UNIQUE,
    Name VARCHAR(30),
    Password VARCHAR(15) NOT NULL,
    Usertype VARCHAR(10) NOT NULL,
    PRIMARY KEY (ID)
);

CREATE TABLE NonAdmin (
    ID INT,
    Gender VARCHAR(7),
    Phone BIGINT NOT NULL UNIQUE CHECK (Phone > 999999999),
    Address VARCHAR(100),
    PRIMARY KEY (ID),
    FOREIGN KEY (ID) REFERENCES UserTable(ID) ON DELETE CASCADE
);

CREATE TABLE Admin (
    ID INT,
    AgencyName VARCHAR(35) NOT NULL,
    AgencyPhone VARCHAR(10) NOT NULL UNIQUE CHECK (AgencyPhone > 999999999),
    AgencyOffice VARCHAR(50),
    PRIMARY KEY (AgencyName),
    FOREIGN KEY (ID) REFERENCES UserTable(ID) ON DELETE CASCADE
);

CREATE TABLE BusInfo (
    BusRegnNo VARCHAR(15) NOT NULL,
    AgencyName VARCHAR(35) NOT NULL,
    TotalSeats INT DEFAULT 40,
    AC TINYINT DEFAULT 0,
    LocationName VARCHAR(20),
    Latitude DECIMAL(17,10),
    Longitude DECIMAL(17,10),
    PRIMARY KEY (BusRegnNo),
    FOREIGN KEY (AgencyName) REFERENCES Admin(AgencyName) ON DELETE CASCADE
);

CREATE TABLE BusSchedule (
    BusRegnNo VARCHAR(15) NOT NULL,
    RouteID INT NOT NULL CHECK (RouteID > 0),
    DriverID INT UNIQUE CHECK (DriverID > 0),
    StartTime DECIMAL(4,2) CHECK (StartTime >= 0 AND StartTime < 2400),
    Fare INT CHECK (Fare > 0),
    ReservedSeats INT DEFAULT 0,
    TravelTime DECIMAL(10,2) CHECK (TravelTime > 0),
    PRIMARY KEY (RouteID, DriverID, StartTime),
    FOREIGN KEY (BusRegnNo) REFERENCES BusInfo(BusRegnNo) ON DELETE CASCADE
);

CREATE TABLE RouteDetails (
    RouteID INT CHECK (RouteID > 0),
    RouteName VARCHAR(30) NOT NULL,
    Source VARCHAR(30) NOT NULL,
    Destination VARCHAR(30) NOT NULL,
    PRIMARY KEY (RouteID)
);

CREATE TABLE BusStops (
    RouteID INT NOT NULL CHECK (RouteID > 0),
    IntermediateStops VARCHAR(20) NOT NULL,
    StopNumber INT NOT NULL CHECK (StopNumber > 0),
    PRIMARY KEY (RouteID, IntermediateStops)
);

CREATE TABLE DriverDetails (
    DriverID INT AUTO_INCREMENT,
    DriverName VARCHAR(20) NOT NULL,
    DriverPhone BIGINT CHECK (DriverPhone > 999999999),
    Age INT CHECK (Age > 0),
    Date_Of_Join DATE,
    PRIMARY KEY (DriverID)
);

CREATE TABLE Ticket (
    BusRegnNo VARCHAR(15) NOT NULL,
    TicketPNR INT AUTO_INCREMENT,
    BookingDate DATE,
    TravelDate DATE,
    PRIMARY KEY (TicketPNR),
    CHECK (TravelDate > DATE_ADD(BookingDate, INTERVAL 2 DAY)),
    FOREIGN KEY (BusRegnNo) REFERENCES BusInfo(BusRegnNo)
);

CREATE TABLE SeatsBooked (
    TicketPNR INT,
    SeatNo INT,
    PRIMARY KEY (TicketPNR, SeatNo),
    FOREIGN KEY (TicketPNR) REFERENCES Ticket(TicketPNR)
);

CREATE TABLE Through (
    RouteID INT NOT NULL CHECK (RouteID > 0),
    DriverID INT NOT NULL CHECK (DriverID > 0),
    StartTime DECIMAL(4,2) CHECK (StartTime >= 0 AND StartTime < 2400),
    BusRegnNo VARCHAR(15) NOT NULL,
    TicketPNR INT NOT NULL CHECK (TicketPNR > 0),
    PRIMARY KEY (RouteID, DriverID, StartTime, TicketPNR),
    FOREIGN KEY (BusRegnNo) REFERENCES BusInfo(BusRegnNo),
    FOREIGN KEY (TicketPNR) REFERENCES Ticket(TicketPNR)
);

-- Insert sample data

INSERT INTO UserTable (Email, Name, Password, Usertype) VALUES
('admin@example.com', 'Admin User', 'password', 'admin');

INSERT INTO Admin (ID, AgencyName, AgencyPhone, AgencyOffice) VALUES
(1, 'Sample Agency', '1234567890', 'Office Address');

INSERT INTO BusInfo (BusRegnNo, AgencyName, TotalSeats, AC) VALUES
('BUS001', 'Sample Agency', 40, 1),
('BUS002', 'Sample Agency', 40, 0);


INSERT INTO RouteDetails (RouteID, RouteName, Source, Destination) VALUES
(1, 'Route 1', 'Neyveli', 'Coimbatore'),
(2, 'Route 2', 'Coimbatore', 'Bangalore'),
(3, 'Route 3', 'Bangalore', 'Chennai'),
(4, 'Route 4', 'Chennai', 'Bangalore');


INSERT INTO BusStops (RouteID, IntermediateStops, StopNumber) VALUES
(1, 'Neyveli', 1),
(1, 'Coimbatore', 2),
(2, 'Coimbatore', 1),
(2, 'Bangalore', 2),
(3, 'Bangalore', 1),
(3, 'Chennai', 2),
(4, 'Chennai', 1),
(4, 'Bangalore', 2);


INSERT INTO DriverDetails (DriverName, DriverPhone, Age, Date_Of_Join) VALUES
('Driver 1', 1234567890, 30, '2020-01-01'),
('Driver 2', 1234567891, 35, '2020-01-01'),
('Driver 3', 1234567892, 40, '2020-01-01'),
('Driver 4', 1234567893, 45, '2020-01-01');


INSERT INTO BusSchedule (BusRegnNo, RouteID, DriverID, StartTime, Fare, TravelTime) VALUES
('BUS001', 1, 1, 9.00, 500, 5.0),
('BUS002', 2, 2, 10.00, 600, 6.0),
('BUS001', 3, 3, 8.00, 700, 7.0),
('BUS002', 4, 4, 14.00, 700, 7.0);