using EF_Airline.Data;
using EF_Airline.Models;

namespace EF_Airline.Services;

public class AirlineService
{
    private readonly DataContext _context;
    public AirlineService(DataContext context)
    {
        _context = context;
    }

    public void Create(Airline airline)
    {
        _context.Airlines.Add(airline);
        _context.SaveChanges();
    }

    public  List<Airline> GetAll()
    {
        return _context.Airlines.ToList();
    }

    public Airline? GetById(int id)
    {
        return _context.Airlines.Find(id);
    }

    public void Update(int id, string name, string country)
    {
        var airline = _context.Airlines.Find(id);
        if (airline == null) return;

        airline.Name = name;
        airline.Country = country;

        _context.SaveChanges();
    }

    public void Delete(int id)
    {
        var airline = _context.Airlines.Find(id);
        if (airline == null) return;
        _context.Airlines.Remove(airline);
        _context.SaveChanges();
    }

}