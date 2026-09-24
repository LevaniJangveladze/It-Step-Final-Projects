using System.Text.Json.Serialization;
using C_Sharp_Final_Project___Levani_Jangveladze.Common.Entities;
using C_Sharp_Final_Project___Levani_Jangveladze.Common.Validation;

namespace C_Sharp_Final_Project___Levani_Jangveladze.Models;

public sealed class Rental : Entity
{
    public int UserId { get; private set; }
    public int GameId { get; private set; }
    public DateTime RentedAt { get; private set; }
    public DateTime? ReturnedAt { get; private set; }

    [JsonConstructor]
    private Rental(int userId, int gameId, DateTime rentedAt, DateTime? returnedAt)
    {
        UserId = userId;
        GameId = gameId;
        RentedAt = rentedAt;
        ReturnedAt = returnedAt;
    }

    public static Rental Create(int userId, int gameId)
    {
        Validate.Range(1, int.MaxValue, userId);
        Validate.Range(1, int.MaxValue, gameId);

        return new Rental(userId, gameId, rentedAt: DateTime.UtcNow, null);
    }

    public void Return()
    {
        if (ReturnedAt != null)
            throw new ValidationException("This Rental has already been returned.");
        ReturnedAt = DateTime.UtcNow;
    }
}