using System.Text.Json.Serialization;
using C_Sharp_Final_Project___Levani_Jangveladze.Common.Entities;
using C_Sharp_Final_Project___Levani_Jangveladze.Common.Validation;
using C_Sharp_Final_Project___Levani_Jangveladze.Enums;

namespace C_Sharp_Final_Project___Levani_Jangveladze.Models;

public sealed class User : Entity
{
    public string Fullname { get; private set; }
    public string Email { get; private set; }
    public string PasswordHash { get; private set; }
    public UserRole Role { get; private set; } = UserRole.User;
    public string? Code { get; private set; }
    public bool IsVerified { get; private set; }


    [JsonConstructor]
    private User(string fullname, string email, string passwordHash, UserRole role, string? code, bool isVerified)
    {
        Fullname = fullname;
        Email = email;
        PasswordHash = passwordHash;
        Role = role;
        Code = code;
        IsVerified = isVerified;
    }

    public static User Create(string fullname, string email, string passwordHash)
    {
        Validate.Length(3, 50, fullname);
        Validate.Length(5, 100, email);
        Validate.Email(email);

        return new User(fullname, email, passwordHash, UserRole.User, null, false);
    }

    public void GenerateCode()
    {
        Code = new Random().Next(100000, 999999).ToString();
    }

    public void Verify()
    {
        IsVerified = true;
        Code = null;
    }

    public void SetRole(UserRole role)
    {
        Role = role;
    }
    
    public void SetPasswordHash(string passwordHash)
    {
        PasswordHash = passwordHash;
    }

    public void RemoveCode()
    {
        Code = null;
    }
}