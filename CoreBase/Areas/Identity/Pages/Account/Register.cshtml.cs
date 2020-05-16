using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Text.Encodings.Web;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Logging;
using CoreBase.Models;
using uToolkit;

namespace CoreBase.Areas.Identity.Pages.Account
{
    [AllowAnonymous]
    public class RegisterModel : PageModel
    {
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ILogger<RegisterModel> _logger;
        private readonly IEmailSender _emailSender;

        public RegisterModel(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            ILogger<RegisterModel> logger,
            IEmailSender emailSender)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _logger = logger;
            _emailSender = emailSender;
        }

        [BindProperty]
        public InputModel Input { get; set; }

        public string ReturnUrl { get; set; }

        public IList<AuthenticationScheme> ExternalLogins { get; set; }

        public class InputModel
        {
            [Required(ErrorMessageResourceType = typeof(Locale_Resource),
                        ErrorMessageResourceName = "Required_Field")]
            [StringLength(32, ErrorMessageResourceType = typeof(Locale_Resource),
                        ErrorMessageResourceName = "String_Length_Error")]
            [Display(Name = "Username", ResourceType = typeof(Locale_Resource))]
            public string Username { get; set; }

            [Required(ErrorMessageResourceType = typeof(Locale_Resource),
                ErrorMessageResourceName = "Required_Field")]
            [EmailAddress(ErrorMessageResourceType = typeof(Locale_Resource),
                ErrorMessageResourceName = "Email_Field_Error")]
            [Display(Name = "Email", ResourceType = typeof(Locale_Resource))]
            public string Email { get; set; }

            [Required(ErrorMessageResourceType = typeof(Locale_Resource),
                ErrorMessageResourceName = "Required_Field")]
            [StringLength(100, ErrorMessageResourceType = typeof(Locale_Resource),
                ErrorMessageResourceName = "Password_Length_Error", MinimumLength = 6)]
            [DataType(DataType.Password)]
            [Display(Name = "Password", ResourceType = typeof(Locale_Resource))]
            public string Password { get; set; }

            [DataType(DataType.Password)]
            [Compare("Password",
                ErrorMessageResourceType = typeof(Locale_Resource), ErrorMessageResourceName = "Password_Not_Mach")]
            [Display(Name = "ConfirmPassword", ResourceType = typeof(Locale_Resource))]
            public string ConfirmPassword { get; set; }

            [Required(ErrorMessageResourceType = typeof(Locale_Resource),
                ErrorMessageResourceName = "Required_Field")]
            [Display(Name = "User_Role", ResourceType = typeof(Locale_Resource))]
            public string UserRoles { get; set; }
        }

        public async Task OnGetAsync(string returnUrl = null)
        {
            string strStmt = "SELECT Name AS id, Name AS text FROM AspNetRoles";
            ViewData["Roles"] = uToolkit.uDB.GetJsonRecordSet(strStmt);

            ReturnUrl = returnUrl;
            ExternalLogins = (await _signInManager.GetExternalAuthenticationSchemesAsync()).ToList();
        }

        public async Task<IActionResult> OnPostAsync(string returnUrl = null)
        {
            returnUrl = returnUrl ?? Url.Content("~/");
            ExternalLogins = (await _signInManager.GetExternalAuthenticationSchemesAsync()).ToList();
            if (ModelState.IsValid)
            {
                var user = new ApplicationUser { UserName = Input.Username, Email = Input.Email };
                var result = await _userManager.CreateAsync(user, Input.Password);
                if (result.Succeeded)
                {
                    await this._userManager.AddToRoleAsync(user, Input.UserRoles);
                    uApp.Loger($"User name: {Input.Username} created a new account.");
                    //_logger.LogInformation("User created a new account with password.");

                    var code = await _userManager.GenerateEmailConfirmationTokenAsync(user);
                    code = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(code));
                    var callbackUrl = Url.Page(
                        "/Account/ConfirmEmail",
                        pageHandler: null,
                        values: new { area = "Identity", userId = user.Id, code = code },
                        protocol: Request.Scheme);

                    await _emailSender.SendEmailAsync(Input.Email, "Confirm your email",
                        $"Please confirm your account by <a href='{HtmlEncoder.Default.Encode(callbackUrl)}'>clicking here</a>.");

                    if (_userManager.Options.SignIn.RequireConfirmedAccount)
                    {
                        return RedirectToPage("RegisterConfirmation", new { email = Input.Email });
                    }
                    else
                    {
                        await _signInManager.SignInAsync(user, isPersistent: false);
                        return LocalRedirect(returnUrl);
                    }
                }
                foreach (var error in result.Errors)
                {
                    ModelState.AddModelError(string.Empty, error.Description);
                }
            }

            // If we got this far, something failed, redisplay form
            return Page();
        }
    }
}
