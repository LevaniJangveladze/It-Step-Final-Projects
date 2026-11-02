using EF_Airline.Services;

namespace EF_Airline.Menus;

public class ReportMenu
{
    public static void Start(ReportService reportService, FlightService flightService)
    {
        bool isOpen = true;

        while (isOpen)
        {
            Console.WriteLine("\n--- REPORTS ---");
            Console.WriteLine("1. Revenue per airline");
            Console.WriteLine("2. Flight occupancy");
            Console.WriteLine("3. Busiest routes");
            Console.WriteLine("4. Passengers on flight");
            Console.WriteLine("5. Expired passports");
            Console.WriteLine("x. Back");

            Console.Write("Enter key: ");
            string key = Console.ReadLine()!;

            try
            {
                switch (key)
                {
                    case "1":
                        foreach (var r in reportService.RevenuePerAirline())
                            Console.WriteLine($"{r.AirlineName}: {r.Revenue}");
                        break;
                    case "2":
                        foreach (var r in reportService.FlightOccupancy())
                            Console.WriteLine($"{r.FlightNumber} {r.Route} — {r.BookedSeats}/{r.Capacity}");
                        break;
                    case "3":
                        foreach (var r in reportService.BusiestRoutes())
                            Console.WriteLine($"{r.Route} - {r.TotalBookings}");
                        break;
                    case "4":
                        foreach (var f in flightService.GetAll())
                            Console.WriteLine($"{f.Id}. {f.FlightNumber} {f.DepartureCity}->{f.ArrivalCity}");
                        Console.Write("Enter flight id: ");
                        int reportFlightId = int.Parse(Console.ReadLine()!);

                        foreach (var b in reportService.PassengersOnFlight(reportFlightId))
                            Console.WriteLine(
                                $"{b.Passenger.FirstName} {b.Passenger.LastName} — seat {b.SeatNumber} — passport: {b.Passenger.Passport?.PassportNumber ?? "none"}");
                        break;
                    case "5":
                        foreach (var p in reportService.ExpiredPassports())
                            Console.WriteLine(
                                $"{p.Passenger.FirstName} {p.Passenger.LastName} — {p.PassportNumber} — expired {p.ExpiryDate:d}");
                        break;
                    case "x":
                        isOpen = false;
                        break;
                }
            }
            catch (Exception e)
            {
                Console.WriteLine($"Error: {e.Message}");
            }
        }
    }
}