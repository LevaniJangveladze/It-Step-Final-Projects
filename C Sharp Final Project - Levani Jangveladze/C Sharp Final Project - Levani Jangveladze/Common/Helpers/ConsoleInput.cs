using C_Sharp_Final_Project___Levani_Jangveladze.Common.Validation;

namespace C_Sharp_Final_Project___Levani_Jangveladze.Common.Helpers;

public static class ConsoleInput
{
    public static string ReadString(string label)
    {
        Console.Write($"  {label}: ");
        string? value = Console.ReadLine();

        if (string.IsNullOrWhiteSpace(value))
            throw new ValidationException($"{label} is required.");

        return value.Trim();
    }

    public static int ReadInt(string label)
    {
        string value = ReadString(label);

        if (!int.TryParse(value, out int number))
            throw new ValidationException($"{label} must be a whole number.");

        return number;
    }

    public static DateTime ReadDate(string label)
    {
        string value = ReadString($"{label} (yyyy-mm-dd)");

        if (!DateTime.TryParse(value, out DateTime date))
            throw new ValidationException($"{label} must be a valid date, e.g. 2020-03-20.");

        return date;
    }

    public static T ReadEnum<T>(string label) where T : struct, Enum
    {
        Output.Line($"{label} options:");
        foreach (T option in Enum.GetValues<T>())
            Output.Line($"   - {option}");

        string value = ReadString(label);

        if (!Enum.TryParse(value, true, out T result) || !Enum.IsDefined(result))
            throw new ValidationException($"{label} is not a valid option.");

        return result;
    }

    public static string ReadPassword(string label)
    {
        Console.Write($"  {label}: ");
        string password = "";

        while (true)
        {
            ConsoleKeyInfo key = Console.ReadKey(intercept: true);

            if (key.Key == ConsoleKey.Enter) break;

            if (key.Key == ConsoleKey.Backspace)
            {
                if (password.Length > 0)
                {
                    password = password[..^1];
                    Console.Write("\b \b");
                }
                continue;
            }

            if (!char.IsControl(key.KeyChar))
            {
                password += key.KeyChar;
                Console.Write("*");
            }
        }

        Console.WriteLine();

        if (string.IsNullOrWhiteSpace(password))
            throw new ValidationException($"{label} is required.");

        return password;
    }

    public static bool Confirm(string question)
    {
        Console.Write($"  {question} (y/n): ");
        string? answer = Console.ReadLine();
        return answer?.Trim().ToLower() is "y" or "yes";
    }
}