using EF_Airline.Services;

namespace EF_Airline.Menus;

public class BookingMenu
{
    public static void Start(BookingService bookingService, FlightService flightService,
        PassengerService passengerService)
    {
        bool isOpen = true;

        while (isOpen)
        {
            Console.WriteLine("\n--- BOOKINGS ---");
            Console.WriteLine("1. Create booking");
            Console.WriteLine("2. Show all bookings");
            Console.WriteLine("3. Show bookings by flight");
            Console.WriteLine("4. Show bookings by passenger");
            Console.WriteLine("5. Cancel booking");
            Console.WriteLine("x. Back");

            Console.Write("Enter key: ");
            string key = Console.ReadLine()!;

            try
            {
                switch (key)
                {
                    case "1":
                        foreach (var f in flightService.GetAll())
                            Console.WriteLine(
                                $"{f.Id}. {f.FlightNumber} {f.DepartureCity}->{f.ArrivalCity} {f.DepartureTime:g}");

                        Console.Write("Enter flight id: ");
                        int flightId = int.Parse(Console.ReadLine()!);

                        foreach (var p in passengerService.GetPassengers())
                            Console.WriteLine($"{p.Id}. {p.FirstName} {p.LastName}");

                        Console.Write("Enter passenger id: ");
                        int passengerId = int.Parse(Console.ReadLine()!);

                        Console.Write("Enter seat number (e.g. 12A): ");
                        string seatNumber = Console.ReadLine()!;

                        bookingService.CreateBooking(flightId, passengerId, seatNumber);
                        Console.WriteLine("Booking created.");
                        break;

                    case "2":
                        foreach (var b in bookingService.GetAllBookings())
                            Console.WriteLine(
                                $"{b.Id}. {b.Passenger.FirstName} {b.Passenger.LastName} — {b.Flight.FlightNumber} {b.Flight.DepartureCity}->{b.Flight.ArrivalCity} — seat {b.SeatNumber} — {b.Status}");
                        break;
                    case "3":
                        foreach (var f in flightService.GetAll())
                            Console.WriteLine($"{f.Id}. {f.FlightNumber} {f.DepartureCity}->{f.ArrivalCity}");

                        Console.Write("Enter flight id: ");
                        int searchByFlightId = int.Parse(Console.ReadLine()!);

                        foreach (var b in bookingService.GetByFlight(searchByFlightId))
                            Console.WriteLine(
                                $"{b.Passenger.FirstName} {b.Passenger.LastName} — seat {b.SeatNumber} — {b.Status}");
                        break;
                    case "4":
                        foreach (var p in passengerService.GetPassengers())
                            Console.WriteLine($"{p.Id}. {p.FirstName} {p.LastName} {p.Email}");

                        Console.Write("Enter passenger id: ");
                        int searchByPassengerId = int.Parse(Console.ReadLine()!);

                        foreach (var b in bookingService.GetByPassenger(searchByPassengerId))
                            Console.WriteLine(
                                $"{b.Flight.FlightNumber} {b.Flight.DepartureCity}->{b.Flight.ArrivalCity} {b.Flight.DepartureTime:g} — seat {b.SeatNumber} — {b.Status}");
                        break;

                    case "5":
                        foreach (var b in bookingService.GetAllBookings())
                            Console.WriteLine(
                                $"{b.Id}. {b.Passenger.FirstName} {b.Passenger.LastName} — {b.Flight.FlightNumber} — seat {b.SeatNumber} — {b.Status}");

                        Console.Write("Enter booking id to cancel: ");
                        int cancelId = int.Parse(Console.ReadLine()!);

                        bookingService.CancelBooking(cancelId);
                        Console.WriteLine("Booking cancelled.");
                        break;

                    case "x":
                        isOpen = false;
                        break;
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e.Message);

            }
        }
    }
}