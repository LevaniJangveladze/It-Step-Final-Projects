using C_Sharp_Final_Project___Levani_Jangveladze.Models;
using C_Sharp_Final_Project___Levani_Jangveladze.Enums;
using C_Sharp_Final_Project___Levani_Jangveladze.Common.Validation;

namespace C_Sharp_Final_Project___Levani_Jangveladze.Common.Auth;

public static class Session
{
    public static User? CurrentUser { get; private set; }

    public static void Login(User user)
    {
        CurrentUser = user;
    }

    public static void Logout()
    {
        CurrentUser = null;
    }

    public static bool IsLoggedIn() => CurrentUser != null;


    public static User Current()
    {
        if (CurrentUser == null)
            throw new ValidationException("You must be logged in.");
        return CurrentUser;
    }

    public static void RequireAdmin()
    {
        User user = Current();

        if (user.Role != UserRole.Admin)
            throw new ValidationException("Admins only.");
    }

    public static void RequireStaff()
    {
        User user = Current();
        if (user.Role != UserRole.Admin && user.Role != UserRole.Manager)
            throw new ValidationException("Staff only.");
    }
}