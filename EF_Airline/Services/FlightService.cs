using EF_Airline.Data;
using EF_Airline.Models;
using Microsoft.EntityFrameworkCore;

namespace EF_Airline.Services;

public class FlightService
{
    private readonly DataContext _context;

    public FlightService (DataContext context)
    {
        _context = context;
    }

    public void Create(Flight flight)
    {
        _context.Flights.Add(flight);
        _context.SaveChanges();
    }

    public List<Flight> GetAll()
    {
        return _context.Flights.Include(f => f.Airline).ToList();
    }

    public Flight? GetById(int id)
    {
        return _context.Flights.Include( f => f.Airline).FirstOrDefault(f => f.Id == id);
    }

    public void Update(int id, string flightNumber, string departureCity, string arrivalCity, DateTime departureTime, decimal price, int capacity)
    {
        var flight = _context.Flights.Find(id);
        if (flight == null) return;
        
        flight.FlightNumber = flightNumber;
        flight.DepartureCity = departureCity;
        flight.ArrivalCity = arrivalCity;
        flight.DepartureTime = departureTime;
        flight.Price = price;
        flight.Capacity = capacity;

        _context.SaveChanges();
        
    }
    
    public void Delete(int id)
    {
        var flight = _context.Flights.Find(id);
        if (flight == null) return;
        _context.Flights.Remove(flight);
        _context.SaveChanges();
    }

    public List<Flight> SearchByRoute(string from, string to)
    {
        return _context.Flights.Include(f => f.Airline).Where(f => f.DepartureCity == from && f.ArrivalCity == to).ToList();
    }

    public List<Flight> FilterByPrice(decimal minPrice, decimal maxPrice)
    {
        return _context.Flights
            .Include(f => f.Airline)
            .Where(f => f.Price >= minPrice && f.Price <= maxPrice)
            .ToList();
    }

    public List<Flight> GetUpcomingFlights()
    {
        return _context.Flights
            .Include(f => f.Airline)
            .Where(f => f.DepartureTime > DateTime.Now)
            .OrderBy( f  => f.DepartureTime)
            .ToList();
    }
}