using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.Extensions.Options;
using SendGrid;
using SendGrid.Helpers.Mail;
using System;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;
using uToolkit;

namespace CoreBase.Services
{
    public class EmailSender : IEmailSender
    {
		private EmailServices m_emailServices;
        public EmailSender(IOptions<object> optionsAccessor)
        {
			m_emailServices = AppParams.m_instance.EmailServices;
		}

        public Task SendEmailAsync(string email, string subject, string message)
        {
			if (AppParams.m_instance.EmailVendor == "SendGrid")
			{
				return SendGrid(subject, message, email);
			}
			else if (AppParams.m_instance.EmailVendor == "Gmail")
			{
				return SendGmail(subject, message, email);
			}

			return null;
		}

        private Task SendGrid(string subject, string message, string email)
        {
			SendGridService _emailSettings = m_emailServices.SendGrid;

			var client = new SendGridClient(_emailSettings.SendGridKey);
            var msg = new SendGridMessage()
			{
				From = new EmailAddress(_emailSettings.SendGridSender, _emailSettings.SendGridUser),
                Subject = subject,
                PlainTextContent = message,
                HtmlContent = message
            };
            msg.AddTo(new EmailAddress(email));

            // Disable click tracking.
            // See https://sendgrid.com/docs/User_Guide/Settings/tracking.html
            msg.SetClickTracking(false, false);

            return client.SendEmailAsync(msg);
        }

		private async Task SendGmail(string subject, string message, string email)
		{
			GmailService _emailSettings = m_emailServices.Gmail;
			try
			{
				MailMessage mail = new MailMessage()
				{
					From = new MailAddress(_emailSettings.UsernameEmail, _emailSettings.FromEmail)
				};

				mail.To.Add(new MailAddress(email));

				mail.Subject = subject;
				mail.Body = message;
				mail.IsBodyHtml = true;
				mail.Priority = MailPriority.High;

				using (SmtpClient smtp = new SmtpClient(_emailSettings.PrimaryDomain, _emailSettings.PrimaryPort))
				{
					smtp.EnableSsl = true;
					smtp.UseDefaultCredentials = false;
					smtp.Credentials = new NetworkCredential(_emailSettings.UsernameEmail, _emailSettings.UsernamePassword);

					await smtp.SendMailAsync(mail);
				}
			}
			catch (Exception ex)
			{
				uApp.Loger($"*** SendEmail Error: {ex.Message}");
			}
		}
	}
}