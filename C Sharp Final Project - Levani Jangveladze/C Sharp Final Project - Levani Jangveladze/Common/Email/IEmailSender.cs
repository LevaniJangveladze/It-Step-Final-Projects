namespace C_Sharp_Final_Project___Levani_Jangveladze.Common.Email;

public interface IEmailSender
{
    void Send(string to, string subject, string body);
}