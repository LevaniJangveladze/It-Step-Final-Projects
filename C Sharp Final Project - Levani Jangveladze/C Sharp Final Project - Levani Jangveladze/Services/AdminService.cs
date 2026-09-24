using C_Sharp_Final_Project___Levani_Jangveladze.Common.Auth;
using C_Sharp_Final_Project___Levani_Jangveladze.Common.Validation;
using C_Sharp_Final_Project___Levani_Jangveladze.Database;
using C_Sharp_Final_Project___Levani_Jangveladze.Enums;
using C_Sharp_Final_Project___Levani_Jangveladze.Models;

namespace C_Sharp_Final_Project___Levani_Jangveladze.Services;

public sealed class AdminService
{
    private readonly DataContext _db;

    public AdminService(DataContext db)
    {
        _db = db;
    }

    public List<User> GetAllUsers()
    {
        Session.RequireAdmin();
        return _db.Users.ToList();
    }

    public void ChangeRole(int userId, UserRole role)
    {
        Session.RequireAdmin();

        User? user = _db.Users.FirstOrDefault(u => u.Id == userId);
        if (user == null)
            throw new ValidationException("User not found.");

        if (user.Id == Session.Current().Id)
            throw new ValidationException("You cannot change your own role.");

        user.SetRole(role);
        _db.Save();
    }
}