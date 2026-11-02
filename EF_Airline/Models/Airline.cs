namespace EF_Airline.Models;

public class Airline
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;

    
    public List<Flight> Flights { get; set; } = new List<Flight>();
}