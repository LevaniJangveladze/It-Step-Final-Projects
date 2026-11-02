using EF_Airline.Models;
using EF_Airline.Services;

namespace EF_Airline.Menus;

public class FlightMenu
{
    public static void Start(FlightService flightService, AirlineService airlineService)
    {
        bool isOpen = true;

        while (isOpen)
        {
            Console.WriteLine("\n--- FLIGHT SERVICE ---");
            Console.WriteLine("1. Create flight");
            Console.WriteLine("2. Show all flights");
            Console.WriteLine("3. Update flight");
            Console.WriteLine("4. Delete flight");
            Console.WriteLine("5. Search by route");
            Console.WriteLine("6. Filter by price");
            Console.WriteLine("7. Upcoming flights");
            Console.WriteLine("x. Back");

            Console.Write("Enter key: ");
            string key = Console.ReadLine()!;

            try
            {
                switch (key)
                {
                    case "1":
                        foreach (var a in airlineService.GetAll())
                        {
                            Console.WriteLine($"{a.Id}, {a.Name}");
                        }

                        Console.Write("Enter airline id: ");
                        int airlineId = int.Parse(Console.ReadLine()!);

                        Console.Write("Enter flight number: ");
                        string flightNumber = Console.ReadLine()!;

                        Console.Write("Enter departure city: ");
                        string from = Console.ReadLine()!;

                        Console.Write("Enter arrival city: ");
                        string to = Console.ReadLine()!;

                        Console.Write("Enter departure time (yyyy-MM-dd HH:mm): ");
                        DateTime departureTime = DateTime.Parse(Console.ReadLine()!);

                        Console.Write("Enter price: ");
                        decimal price = decimal.Parse(Console.ReadLine()!);

                        Console.Write("Enter capacity: ");
                        int capacity = int.Parse(Console.ReadLine()!);

                        flightService.Create(new Flight
                        {
                            AirlineId = airlineId,
                            FlightNumber = flightNumber,
                            DepartureCity = from,
                            ArrivalCity = to,
                            DepartureTime = departureTime,
                            Price = price,
                            Capacity = capacity
                        });
                        Console.WriteLine($"Flight has been created.");
                        break;

                    case "2":
                        foreach (var f in flightService.GetAll())
                        {
                            Console.WriteLine(
                                $"{f.Id}. {f.FlightNumber} {f.DepartureCity}->{f.ArrivalCity} {f.DepartureTime:g} {f.Price} ({f.Airline.Name})");
                        }

                        break;

                    case "3":
                        foreach (var f in flightService.GetAll())
                        {
                            Console.WriteLine($"{f.Id}. {f.FlightNumber} {f.DepartureCity}->{f.ArrivalCity}");
                        }

                        Console.Write("Enter flight id to update: ");
                        int flightIdToUpdate = int.Parse(Console.ReadLine()!);

                        Console.Write("Enter flight number: ");
                        string updatedFlightNumber = Console.ReadLine()!;

                        Console.Write("Enter departure city: ");
                        string updatedFrom = Console.ReadLine()!;

                        Console.Write("Enter arrival city: ");
                        string updatedTo = Console.ReadLine()!;

                        Console.Write("Enter departure time (yyyy-MM-dd HH:mm): ");
                        DateTime updatedDepartureTime = DateTime.Parse(Console.ReadLine()!);

                        Console.Write("Enter price: ");
                        decimal updatedPrice = decimal.Parse(Console.ReadLine()!);

                        Console.Write("Enter capacity: ");
                        int updatedCapacity = int.Parse(Console.ReadLine()!);

                        flightService.Update(flightIdToUpdate, updatedFlightNumber, updatedFrom, updatedTo,
                            updatedDepartureTime, updatedPrice, updatedCapacity);
                        Console.WriteLine("Flight updated.");
                        break;

                    case "4":
                        foreach (var f in flightService.GetAll())
                        {
                            Console.WriteLine($"{f.Id}. {f.FlightNumber} {f.DepartureCity}->{f.ArrivalCity}");
                        }

                        Console.Write("Enter flight id to delete: ");
                        int deleteId = int.Parse(Console.ReadLine()!);

                        flightService.Delete(deleteId);
                        Console.WriteLine("Flight deleted.");
                        break;

                    case "5":
                        Console.Write("Enter departure city: ");
                        string searchFrom = Console.ReadLine()!;

                        Console.Write("Enter arrival city: ");
                        string searchTo = Console.ReadLine()!;

                        foreach (var f in flightService.SearchByRoute(searchFrom, searchTo))
                            Console.WriteLine(
                                $"{f.Id}. {f.FlightNumber} {f.DepartureCity}->{f.ArrivalCity} {f.DepartureTime:g} {f.Price} ({f.Airline.Name})");
                        break;

                    case "6":
                        Console.Write("Enter min price: ");
                        decimal minPrice = decimal.Parse(Console.ReadLine()!);

                        Console.Write("Enter max price: ");
                        decimal maxPrice = decimal.Parse(Console.ReadLine()!);

                        foreach (var f in flightService.FilterByPrice(minPrice, maxPrice))
                            Console.WriteLine(
                                $"{f.Id}. {f.FlightNumber} {f.DepartureCity}->{f.ArrivalCity} {f.DepartureTime:g} {f.Price} ({f.Airline.Name})");
                        break;

                    case "7":
                        foreach (var f in flightService.GetUpcomingFlights())
                            Console.WriteLine(
                                $"{f.Id}. {f.FlightNumber} {f.DepartureCity}->{f.ArrivalCity} {f.DepartureTime:g} {f.Price} ({f.Airline.Name})");
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