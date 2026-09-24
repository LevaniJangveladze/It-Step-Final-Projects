using System.Net;
using System.Net.Mail;

namespace C_Sharp_Final_Project___Levani_Jangveladze.Common.Email;

public sealed class SmtpEmailSender : IEmailSender
{
    private readonly string _from;
    private readonly string _appPassword;

    public SmtpEmailSender(string from, string appPassword)
    {
        _from = from;
        _appPassword = appPassword;
    }

    public void Send(string to, string subject, string body)
    {
        using MailMessage mail = new();
        mail.From = new MailAddress(_from, "GameVault");
        mail.To.Add(to);
        mail.Subject = subject;
        mail.Body = body;
        mail.IsBodyHtml = true;

        using SmtpClient client = new("smtp.gmail.com")
        {
            Port = 587,
            EnableSsl = true,
            Credentials = new NetworkCredential(_from, _appPassword)
        };

        client.Send(mail);
    }
}