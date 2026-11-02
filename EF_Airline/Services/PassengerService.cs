using EF_Airline.Data;
using EF_Airline.Models;
using Microsoft.EntityFrameworkCore;

namespace EF_Airline.Services;

public class PassengerService
{
    private readonly DataContext _context;
    public PassengerService(DataContext context)
    {
        _context = context;
    }

    public void Create(Passenger passenger)
    {
        _context.Passengers.Add(passenger);
        _context.SaveChanges();
    }
    
    public List<Passenger> GetPassengers()
    {
        return _context.Passengers.Include(p => p.Passport).ToList();
            
    }

    public Passenger? GetPassenger(int id)
    {
        return _context.Passengers
            .Include(p => p.Passport)
            .FirstOrDefault(p => p.Id == id);
    }

    public List<Passenger> SearchByName(string text)
    {
        return _context.Passengers.Where(p => p.FirstName.Contains(text) || p.LastName.Contains(text)).ToList();
    }

    public void Update(int id, string firstName, string lastName, string email, string phoneNumber)
    {
        var passenger = _context.Passengers.Find(id);
        if (passenger == null) return;

        if (_context.Passengers.Any(p => p.Email == email && p.Id != id))
            throw new Exception("Email already used by another passenger");

        passenger.FirstName = firstName;
        passenger.LastName = lastName;
        passenger.Email = email;
        passenger.PhoneNumber = phoneNumber;

        _context.SaveChanges();
    }

    public void Delete(int id)
    {
        var passenger = _context.Passengers.Find(id);
        if (passenger == null) return;
        _context.Passengers.Remove(passenger);
        _context.SaveChanges();
    }

    public void AddPassport(int passengerId, string number, DateTime expiry)
    {
        var passenger = _context.Passengers.Find(passengerId);
        if (passenger == null) throw new Exception("Passenger not found");
        
        if(_context.Passports.Any(p => p.PassengerId == passengerId))
            throw new Exception("Passenger already has a passport");

        _context.Passports.Add(new Passport
        {
            PassengerId = passengerId,
            PassportNumber = number,
            ExpiryDate = expiry
        });
        _context.SaveChanges();
    }
}