using C_Sharp_Final_Project___Levani_Jangveladze.Common.Email;
using C_Sharp_Final_Project___Levani_Jangveladze.Common.Helpers;
using C_Sharp_Final_Project___Levani_Jangveladze.Common.Validation;
using C_Sharp_Final_Project___Levani_Jangveladze.Database;
using C_Sharp_Final_Project___Levani_Jangveladze.Enums;
using C_Sharp_Final_Project___Levani_Jangveladze.Models;

namespace C_Sharp_Final_Project___Levani_Jangveladze.Services;

public sealed class AuthService
{
    private readonly DataContext _db;
    private readonly IEmailSender _email;

    public AuthService(DataContext db, IEmailSender email)
    {
        _db = db;
        _email = email;
    }

    public User Register(string fullname, string email, string password)
    {
        bool isFirstUser = _db.Users.Count == 0;
        Validate.Length(8, 100, password);

        bool taken = _db.Users.Any(u => u.Email == email);
        if (taken)
            throw new ValidationException("An account with this email already exists.");

        string hash = PasswordHasher.Hash(password);

        User user = User.Create(fullname, email, hash);
        if (isFirstUser) user.SetRole(UserRole.Admin);
        user.GenerateCode();

        _db.Add(_db.Users, user);
        _db.Save();

        _email.Send(user.Email, "Verify your account",
            $"Your verification code is: {user.Code}");
        return user;
    }

    public void VerifyEmail(string email, string code)
    {
        User? find = _db.Users.FirstOrDefault(u => u.Email == email);
        if (find == null)
            throw new ValidationException("Email not found.");
        if (find.IsVerified)
            throw new ValidationException("Your account has been verified.");
        if (find.Code != code)
            throw new ValidationException("Your account doesn't have the correct code.");

        find.Verify();
        _db.Save();
    }

    public User Login(string email, string password)
    {
        User? find = _db.Users.FirstOrDefault(u => u.Email == email);
        if (find == null)
            throw new ValidationException("Invalid email or password.");
        if (!PasswordHasher.Verify(password, find.PasswordHash))
            throw new ValidationException("Invalid email or password");
        if (!find.IsVerified)
            throw new ValidationException("Please verify your email before logging in");
        return find;
    }

    public void ForgotPassword(string email)
    {
        User? find = _db.Users.FirstOrDefault(u => u.Email == email);
        if (find == null)
            throw new ValidationException("Invalid email");
        find.GenerateCode();
        _db.Save();
        _email.Send(
            find.Email, "Password reset", $"Your reset code is : {find.Code}"
        );
    }

    public void ResetPassword(string email, string code, string newPassword)
    {
        Validate.Length(8, 100, newPassword);
        User? find = _db.Users.FirstOrDefault(u => u.Email == email);
        if (find == null)
            throw new ValidationException("Invalid email or password.");
        if (code != find.Code)
            throw new ValidationException("Invalid reset code.");
        string hash = PasswordHasher.Hash(newPassword);
        find.SetPasswordHash(hash);
        find.RemoveCode();
        _db.Save();
    }
}