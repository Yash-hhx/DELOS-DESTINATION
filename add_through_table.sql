-- Add the Through table to existing transport database
-- Run this if the Through table doesn't exist

USE transport;

CREATE TABLE IF NOT EXISTS Through (
    RouteID INT NOT NULL CHECK (RouteID > 0),
    DriverID INT NOT NULL CHECK (DriverID > 0),
    StartTime DECIMAL(4,2) CHECK (StartTime >= 0 AND StartTime < 2400),
    BusRegnNo VARCHAR(15) NOT NULL,
    TicketPNR INT NOT NULL CHECK (TicketPNR > 0),
    PRIMARY KEY (RouteID, DriverID, StartTime, TicketPNR),
    FOREIGN KEY (BusRegnNo) REFERENCES BusInfo(BusRegnNo),
    FOREIGN KEY (TicketPNR) REFERENCES Ticket(TicketPNR)
);

SHOW TABLES;
