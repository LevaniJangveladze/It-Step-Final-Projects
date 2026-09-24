using C_Sharp_Final_Project___Levani_Jangveladze.Common.Auth;
using C_Sharp_Final_Project___Levani_Jangveladze.Common.Validation;
using C_Sharp_Final_Project___Levani_Jangveladze.Database;
using C_Sharp_Final_Project___Levani_Jangveladze.Enums;
using C_Sharp_Final_Project___Levani_Jangveladze.Models;

namespace C_Sharp_Final_Project___Levani_Jangveladze.Services;

public sealed class GameService
{
    private readonly DataContext _db;

    public GameService(DataContext db)
    {
        _db = db;
    }

    public Game Create(string name, string studio, Genre genre, string description, int minPlayers, int maxPlayers,
        DateTime releasedAt)
    {
        Session.RequireStaff();
        Game game = Game.Create(name, studio, genre, description, minPlayers, maxPlayers, releasedAt);
        _db.Add(_db.Games, game);
        _db.Save();
        return game;
    }

    public Game GetById(int id)
    {
        Game? game = _db.Games.FirstOrDefault(g => g.Id == id);
        if (game == null)
            throw new ValidationException("Game not found");
        return game;
    }

    public void Delete(int id)
    {
        Session.RequireStaff();
        Game game = GetById(id);
        _db.Games.Remove(game);
        _db.Characters.RemoveAll(c => c.GameId == id);
        _db.Save();
    }

    public void Update(int id, string name, string studio, Genre genre, string description, int minPlayers,
        int maxPlayers, DateTime releasedAt)
    {
        Session.RequireStaff();
        Game game = GetById(id);
        game.SetName(name);
        game.SetStudio(studio);
        game.SetGenre(genre);
        game.SetDescription(description);
        game.SetPlayerRange(minPlayers, maxPlayers);
        game.SetReleasedAt(releasedAt);
        _db.Save();
    }


    public List<Game> GetAll()
    {
        return _db.Games.ToList();
    }

    public List<Game> Search(string term)
    {
        return _db.Games.Where(g => g.Name.Contains(term, StringComparison.OrdinalIgnoreCase)).ToList();
    }
    
    public List<Game> FilterByGenre(Genre genre)
    {
        return _db.Games.Where(g => g.Genre == genre).ToList();
    }
    
    public void AddStock(int id, int amount)
    {
        Session.RequireStaff();
        Game game = GetById(id);
        game.AddStock(amount);
        _db.Save();
    }
}