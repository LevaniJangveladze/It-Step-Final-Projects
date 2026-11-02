namespace EF_Airline.Models;

public class Passport
{
    public int Id { get; set; }
    public string PassportNumber { get; set; } = string.Empty;
    public DateTime ExpiryDate { get; set; }
    public int PassengerId { get; set; }
    public Passenger? Passenger { get; set; }
}