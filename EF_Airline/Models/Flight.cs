namespace EF_Airline.Models;

public class Flight
{
    public int Id { get; set; }
    public string FlightNumber { get; set; }
    public string DepartureCity { get; set; } = string.Empty;
    public string ArrivalCity { get; set; } = string.Empty;
    public DateTime DepartureTime { get; set; }
    public decimal Price { get; set; }
    public int Capacity { get; set; }
    
    public int AirlineId { get; set; }
    public Airline? Airline { get; set; }

    public List<Booking> Bookings { get; set; } = new List<Booking>();
}