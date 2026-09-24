namespace C_Sharp_Final_Project___Levani_Jangveladze.Common.Validation;

public class ValidationException : Exception
{
    public ValidationException(string message) : base(message) { }
}