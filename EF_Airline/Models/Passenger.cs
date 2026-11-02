namespace EF_Airline.Models;

public class Passenger
{
    public int Id { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Email { get; set; }
    public string PhoneNumber { get; set; }
    
    public Passport? Passport { get; set; }
    public List<Booking> Bookings { get; set; } = new List<Booking>();
}