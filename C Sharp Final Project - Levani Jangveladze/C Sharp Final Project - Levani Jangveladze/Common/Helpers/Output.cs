namespace C_Sharp_Final_Project___Levani_Jangveladze.Common.Helpers;

public static class Output
{
    private const int Width = 60;

    public static void Clear() => Console.Clear();

    public static void Title(string text)
    {
        Console.ForegroundColor = ConsoleColor.Cyan;
        Console.WriteLine();
        Console.WriteLine("  " + new string('=', Width));
        Console.WriteLine($"  {text.ToUpper()}");
        Console.WriteLine("  " + new string('=', Width));
        Console.ResetColor();
        Console.WriteLine();
    }

    public static void Divider()
    {
        Console.ForegroundColor = ConsoleColor.DarkGray;
        Console.WriteLine("  " + new string('-', Width));
        Console.ResetColor();
    }

    public static void Success(string message) => Write(message, ConsoleColor.Green, "OK");
    public static void Error(string message) => Write(message, ConsoleColor.Red, "!!");
    public static void Info(string message) => Write(message, ConsoleColor.Yellow, "--");

    private static void Write(string message, ConsoleColor color, string tag)
    {
        Console.ForegroundColor = color;
        Console.WriteLine($"  [{tag}] {message}");
        Console.ResetColor();
    }

    public static void Line(string text = "") => Console.WriteLine($"  {text}");

    public static void Pause()
    {
        Console.WriteLine();
        Console.ForegroundColor = ConsoleColor.DarkGray;
        Console.Write("  Press any key to continue...");
        Console.ResetColor();
        Console.ReadKey(intercept: true);
        Console.WriteLine();
    }
}