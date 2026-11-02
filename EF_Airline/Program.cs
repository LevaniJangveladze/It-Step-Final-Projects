using EF_Airline.Data;
using EF_Airline.Menus;
using EF_Airline.Services;

using var db = new DataContext();

var airlineService = new AirlineService(db);
var flightService = new FlightService(db);
var passengerService = new PassengerService(db);
var bookingService = new BookingService(db);
var reportService = new ReportService(db);

bool isOpen = true;

while (isOpen)
{
    Console.WriteLine("\n=== AIRLINE BOOKING SYSTEM ===");
    Console.WriteLine("1. Airlines");
    Console.WriteLine("2. Flights");
    Console.WriteLine("3. Passengers");
    Console.WriteLine("4. Bookings");
    Console.WriteLine("5. Reports");
    Console.WriteLine("x. Exit");
    
    Console.Write("Enter key: ");
    string key = Console.ReadLine();

    try
    {
        switch (key)
        {
            case "1":
                AirlineMenu.Start(airlineService);
                break;
            case "2":
                FlightMenu.Start(flightService, airlineService);
                break;
            case "3":
                PassengerMenu.Start(passengerService);
                break;
            case "4":
                BookingMenu.Start(bookingService, flightService, passengerService);
                break;
            case "5":
                ReportMenu.Start(reportService, flightService);
                break;
            case "x":
                isOpen = false;
                break;
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine(ex.Message);
    }
}