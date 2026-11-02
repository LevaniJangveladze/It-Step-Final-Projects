using EF_Airline.Data;
using EF_Airline.Models;
using Microsoft.EntityFrameworkCore;

namespace EF_Airline.Services;

public class BookingService
{
    private readonly DataContext _context;

    public BookingService(DataContext context)
    {
        _context = context;
    }

    public List<Booking> GetAllBookings()
    {
        return _context.Bookings
            .Include(b => b.Flight)
            .Include(b => b.Passenger)
            .ToList();
    }

    public List<Booking> GetByPassenger(int passengerId)
    {
        return _context.Bookings
            .Include(b => b.Flight)
            .Where(b => b.PassengerId == passengerId)
            .ToList();
    }
    
    public List<Booking> GetByFlight(int flightId)
    {
        return _context.Bookings
            .Include(b => b.Passenger)
            .Where(b => b.FlightId == flightId)
            .ToList();
    }

    public void CreateBooking(int flightId, int passengerId, string seatNumber)
    {
        var flight = _context.Flights.FirstOrDefault(f => f.Id == flightId);
        var passenger = _context.Passengers.FirstOrDefault(p => p.Id == passengerId);
        if (flight == null || passenger == null) throw new Exception("Flight or Passenger not found");
        if (flight.DepartureTime < DateTime.Now) throw new Exception("Flight has already been departed");
        bool seatTaken = _context.Bookings.Any(b => b.FlightId == flightId 
                                                    && b.SeatNumber == seatNumber 
                                                    && b.Status != "Cancelled");
        if (seatTaken) throw new Exception("Seat has already been taken");

        bool passengerAlready = _context.Bookings.Any(b => b.FlightId == flightId 
                                                           && b.PassengerId == passengerId 
                                                           && b.Status != "Cancelled");
        if (passengerAlready) throw new Exception("Passenger is already booked on this flight");

        int bookedSeats = _context.Bookings.Count(b => b.FlightId == flightId 
                                                       && b.Status != "Cancelled");
        if (bookedSeats >= flight.Capacity) throw new Exception("Flight is full");
        var booking = new Booking
        {
            FlightId = flightId,
            PassengerId = passengerId,
            SeatNumber = seatNumber,
            BookedAt = DateTime.Now,
            Status = "Confirmed"
        };

        _context.Bookings.Add(booking);
        _context.SaveChanges();
    }
        
    public void CancelBooking(int bookingId)
    {
        var booking = _context.Bookings.Find(bookingId);
        if (booking == null) throw new Exception("Booking not found");

        booking.Status = "Cancelled";
        _context.SaveChanges();
    }
}