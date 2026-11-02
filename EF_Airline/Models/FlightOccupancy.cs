namespace EF_Airline.Models;

public class FlightOccupancy
{
    public string FlightNumber { get; set; } = string.Empty;
    public string Route { get; set; } = string.Empty;
    public int BookedSeats { get; set; }
    public int Capacity { get; set; }
}