using EF_Airline.Data;
using EF_Airline.Models;
using Microsoft.EntityFrameworkCore;

namespace EF_Airline.Services;

public class ReportService
{
    private readonly DataContext _context;

    public ReportService(DataContext context)
    {
        _context = context;
    }

    public List<Passport> ExpiredPassports()
    {
       return _context.Passports
            .Include(p => p.Passenger)
            .Where(p => p.ExpiryDate < DateTime.Now)
            .ToList();
    }

    public List<Booking> PassengersOnFlight(int flightId)
    {
        return _context.Bookings
            .Include(b => b.Passenger)
            .ThenInclude(p => p.Passport)
            .Where(b => b.FlightId == flightId && b.Status != "Cancelled")
            .ToList();
    }

    public List<AirlineRevenue> RevenuePerAirline()
    {
        return _context.Bookings
            .Include(b => b.Flight)
            .ThenInclude(f => f.Airline)
            .Where(b => b.Status != "Cancelled")
            .GroupBy(b => b.Flight.Airline.Name)
            .Select(g => new AirlineRevenue
            {
                AirlineName = g.Key,
                Revenue = g.Sum(b => b.Flight.Price)
            })
            .ToList();
    }

    public List<FlightOccupancy> FlightOccupancy()
    {
        return _context.Flights.Select(f => new FlightOccupancy
        {
            FlightNumber = f.FlightNumber,
            Route = f.DepartureCity + "->" + f.ArrivalCity,
            BookedSeats = f.Bookings.Count(b => b.Status != "Cancelled"),
            Capacity = f.Capacity

        })
        .ToList();
    }

    public List<RouteStat> BusiestRoutes()
    {
        return _context.Bookings
            .Include(b => b.Flight)
            .Where(b => b.Status != "Cancelled")
            .GroupBy(b => b.Flight.DepartureCity + "->" + b.Flight.ArrivalCity)
            .Select(g => new RouteStat
            {
                Route = g.Key,
                TotalBookings = g.Count()
            })
            .OrderByDescending(r => r.TotalBookings)
            .ToList();
    }
}