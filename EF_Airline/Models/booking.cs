namespace EF_Airline.Models;

public class Booking
{
    public int Id { get; set; }

    public int FlightId { get; set; }
    public Flight? Flight { get; set; }

    public int PassengerId { get; set; }
    public Passenger? Passenger { get; set; }

    public string SeatNumber { get; set; } = string.Empty;
    public DateTime BookedAt { get; set; } = DateTime.Now;
    public string Status { get; set; } = "Confirmed";
}