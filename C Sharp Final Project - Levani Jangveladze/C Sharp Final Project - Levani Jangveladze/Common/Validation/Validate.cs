using System.Reflection.Emit;
using System.Runtime.CompilerServices;

namespace C_Sharp_Final_Project___Levani_Jangveladze.Common.Validation;

public static class Validate
{
    public static void Length(int min, int max, string? value,
        [CallerArgumentExpression(nameof(value))]
        string field = "")
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new ValidationException($"{Label(field)} is required).");
        if (value.Length < min || value.Length > max)
            throw new ValidationException($"{Label(field)} must be between {min} and {max} characters.");
    }

    public static void Range(int min, int max, int value,
        [CallerArgumentExpression(nameof(value))]
        string field = "")
    {
        if (value < min || value > max)
            throw new ValidationException($"{Label(field)} must be between {min} and {max}.");
    }

    public static void Year(int min, int max, DateTime value,
        [CallerArgumentExpression(nameof(value))]
        string field = "")
    {
        if (value.Year < min || value.Year > max)
            throw new ValidationException($"{Label(field)} must be a year between {min} and {max}. ");
    }

    public static void PlayerRange(int min, int max)
    {
        if (min > max)
            throw new ValidationException(
                $"Minimum players ({min}) cannot be greater than maximum players ({max}).");
    }

    private static string Label(string field)
    {
        if (string.IsNullOrWhiteSpace(field)) return "Value";

        return char.ToUpper(field[0]) + field[1..];
    }

    public static void Email(string? value,
        [CallerArgumentExpression(nameof(value))] string field = "")
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new ValidationException($"{Label(field)} is required.");

        if (!value.Contains("@") || !value.Contains("."))
            throw new ValidationException($"{Label(field)} is not a valid email address.");
    }
}