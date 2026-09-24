using C_Sharp_Final_Project___Levani_Jangveladze.Common.Auth;
using C_Sharp_Final_Project___Levani_Jangveladze.Common.Validation;
using C_Sharp_Final_Project___Levani_Jangveladze.Database;
using C_Sharp_Final_Project___Levani_Jangveladze.Models;

namespace C_Sharp_Final_Project___Levani_Jangveladze.Services;

public sealed class CharacterService
{
    private readonly DataContext _db;

    public CharacterService(DataContext db)
    {
        _db = db;
    }

    public Character Create(string name, string role, string ultimate, int gameId)
    {
        Session.RequireStaff();
        if (!_db.Games.Any(g => g.Id == gameId))
            throw new ValidationException("Game not found");
        Character character = Character.Create(name, role, ultimate, gameId);
        _db.Add(_db.Characters, character);
        _db.Save();
        return character;
    }

    public Character GetById(int id)
    {
        Character? character = _db.Characters.FirstOrDefault(c => c.Id == id);
        if (character == null)
            throw new ValidationException("Character not found");
        return character;
    }

    public List<Character> GetByGame(int gameId)
    {
        return _db.Characters.Where(c => c.GameId == gameId).ToList();
    }

    public void Update(int id, string name, string role, string ultimate)
    {
        Session.RequireStaff();
        Character character = GetById(id);
        character.SetName(name);
        character.SetRole(role);
        character.SetUltimate(ultimate);
        _db.Save();
    }

    public void Delete(int id)
    {
        Session.RequireStaff();
        Character character = GetById(id);
        _db.Characters.Remove(character);
        _db.Save();
    }
}