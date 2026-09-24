namespace C_Sharp_Final_Project___Levani_Jangveladze.Common.Email;

public sealed class ConsoleEmailSender : IEmailSender
{
    public void Send(string to, string subject, string body)
    {
        Console.ForegroundColor = ConsoleColor.Cyan;
        Console.WriteLine(new string('=', 55));
        Console.WriteLine("  EMAIL SENT");
        Console.WriteLine(new string('-', 55));
        Console.WriteLine($"  To:      {to}");
        Console.WriteLine($"  Subject: {subject}");
        Console.WriteLine(new string('-', 55));
        Console.WriteLine($"  {body}");
        Console.WriteLine(new string('=', 55));
        Console.ResetColor();
    }
}