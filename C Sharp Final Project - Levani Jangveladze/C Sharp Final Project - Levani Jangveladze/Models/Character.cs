using C_Sharp_Final_Project___Levani_Jangveladze.Common.Validation;
using C_Sharp_Final_Project___Levani_Jangveladze.Common.Entities;
using System.Text.Json.Serialization;
namespace C_Sharp_Final_Project___Levani_Jangveladze.Models;

public sealed class Character : Entity
{
    public string Name { get; private set; }
    public string Role { get; private set; }
    public string Ultimate { get; private set; }
    public int GameId { get; private set; }

    [JsonConstructor]
    private Character(string name, string role, string ultimate, int gameId)
    {
        Name = name;
        Role = role;
        Ultimate = ultimate;
        GameId = gameId;
    }

    public static Character Create(string name, string role, string ultimate, int gameId)
    {
        Validate.Range(1, int.MaxValue, gameId);
        Validate.Length(2, 40, name);
        Validate.Length(2, 30, role);
        Validate.Length(2, 60, ultimate);

        return new Character(name, role, ultimate, gameId);
    }

    public void SetName(string name)
    {
        Validate.Length(2, 40, name);
        Name = name;
    }

    public void SetRole(string role)
    {
        Validate.Length(2, 30, role);
        Role = role;
    }

    public void SetUltimate(string ultimate)
    {
        Validate.Length(2, 60, ultimate);
        Ultimate = ultimate;
    }
}