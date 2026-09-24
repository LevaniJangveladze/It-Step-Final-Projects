using C_Sharp_Final_Project___Levani_Jangveladze.Common.Entities;
using C_Sharp_Final_Project___Levani_Jangveladze.Common.Validation;
using C_Sharp_Final_Project___Levani_Jangveladze.Enums;
using System.Text.Json.Serialization;

namespace C_Sharp_Final_Project___Levani_Jangveladze.Models;

public sealed class Game : Entity
{
    public string Name { get; private set; }
    public string Studio { get; private set; }
    public string Description { get; private set; }
    public Genre Genre { get; private set; }
    public int MinPlayers { get; private set; }
    public int MaxPlayers { get; private set; }
    [JsonInclude]
    public int Stock { get; private set; }
    public DateTime ReleasedAt { get; private set; }

    [JsonConstructor]
    private Game(string name, string studio, Genre genre, string description, int minPlayers, int maxPlayers, DateTime releasedAt)
    {
        Name = name;
        Studio = studio;
        Genre = genre;
        Description = description;
        MinPlayers = minPlayers;
        MaxPlayers = maxPlayers;
        Stock = 0;
        ReleasedAt = releasedAt;
    }

    public static Game Create(string name, string studio, Genre genre, string description, int minPlayers, int maxPlayers, DateTime releasedAt)
    {
        Validate.Length(3, 60, name);
        Validate.Length(2, 60, studio);
        Validate.Length(10,600, description);
        Validate.Range(1, 64, minPlayers);
        Validate.Range(1, 64, maxPlayers);
        Validate.Year(1970,DateTime.UtcNow.Year, releasedAt);
        Validate.PlayerRange(minPlayers, maxPlayers);
        return new Game(name, studio, genre, description, minPlayers, maxPlayers, releasedAt);
    }
    
    public void SetName(string name)
    {
        Validate.Length(3, 60, name);
        Name = name;
    }

    public void SetStudio(string studio)
    {
        Validate.Length(2, 60, studio);
        Studio = studio;
    }

    public void SetDescription(string description)
    {
        Validate.Length(10, 600, description);
        Description = description;
    }

    public void SetGenre(Genre genre)
    {
        Genre = genre;
    }

    public void SetReleasedAt(DateTime releasedAt)
    {
        Validate.Year(1970, DateTime.UtcNow.Year, releasedAt);
        ReleasedAt = releasedAt;
    }

    public void SetPlayerRange(int min, int max)
    {
        Validate.Range(1, 64, min);
        Validate.Range(1, 64, max);
        Validate.PlayerRange(min, max);
        MinPlayers = min;
        MaxPlayers = max;
    }

    public void AddStock(int amount)
    {
        Validate.Range(1, 500, amount);
        Stock += amount;
    }

    public void RemoveStock(int amount)
    {
        Validate.Range(1, 500, amount);
        Stock = Math.Max(0, Stock - amount);
    }
   
}