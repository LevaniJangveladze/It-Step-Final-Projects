using C_Sharp_Final_Project___Levani_Jangveladze.Common.Auth;
using C_Sharp_Final_Project___Levani_Jangveladze.Common.Validation;
using C_Sharp_Final_Project___Levani_Jangveladze.Database;
using C_Sharp_Final_Project___Levani_Jangveladze.Models;

namespace C_Sharp_Final_Project___Levani_Jangveladze.Services;

public sealed class RentalService
{
    private readonly DataContext _db;

    public RentalService(DataContext db)
    {
        _db = db;
    }

    public Rental Rent(int gameId)
    {
        User user = Session.Current();
        Game? game = _db.Games.FirstOrDefault(g => g.Id == gameId);
        if (game == null)
            throw new ValidationException("Game not found.");
        if (game.Stock <= 0)
            throw new ValidationException("This game is out of stock");
        bool alreadyRented = _db.Rentals.Any(r => r.UserId == user.Id && r.GameId == gameId && r.ReturnedAt == null);
        if (alreadyRented)
            throw new ValidationException("You already have this game rented.");
        Rental rental = Rental.Create(user.Id, gameId);
        game.RemoveStock(1);
        _db.Add(_db.Rentals, rental);
        _db.Save();
        return rental;
    }

    public void Return(int rentalId)
    {
        User user = Session.Current();
        Rental? rental = _db.Rentals.FirstOrDefault(r => r.Id == rentalId);
        if (rental == null)
            throw new ValidationException("Rental not found.");
        if (rental.UserId != user.Id)
            throw new ValidationException("This rental doesn't belong to you.");
        rental.Return();
        Game? game = _db.Games.FirstOrDefault(g => g.Id == rental.GameId);
        if (game == null)
            throw new ValidationException("Game not found.");
        game.AddStock(1);
        _db.Save();
    }

    public List<Rental> GetMyRentals()
    {
        User user = Session.Current();
        return _db.Rentals.Where(r => r.UserId == user.Id).ToList();
    }

    public List<Rental> GetAll()
    {
        Session.RequireStaff();
        return _db.Rentals.ToList();
    }

    public List<Rental> GetActive()
    {
        Session.RequireStaff();
        return _db.Rentals.Where(r => r.ReturnedAt == null).ToList();
    }
}