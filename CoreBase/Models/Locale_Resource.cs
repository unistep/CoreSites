using Microsoft.AspNetCore.Http;
using uToolkit;

namespace CoreBase.Models
{
	public class Locale_Resource
	{
		public static IHttpContextAccessor m_httpContextAccessor = null; // Set by startup


		// ======================================================================================================
		public static HttpContext CurrentContext
		{
			get
			{
				return m_httpContextAccessor.HttpContext;
			}
		}

		public static string Password_Not_Mach
        {
			get
			{
				return Localize("Password_Not_Mach");
			}
		}

        public static string Password
        {
            get
            {
                return Localize("Password");
            }
        }

		public static string OldPassword
		{
			get
			{
				return Localize("OldPassword");
			}
		}

		public static string NewPassword
		{
			get
			{
				return Localize("NewPassword");
			}
		}

		public static string ConfirmPassword
		{
            get
            {
                return Localize("ConfirmPassword");
            }
        }

        public static string Password_Length_Error
        {
            get
            {
                return Localize("Password_Length_Error");
            }
        }

		public static string Required_Field
		{
			get
			{
				return Localize("Required_Field");
			}
		}

		public static string Username
		{
			get
			{
				return Localize("Username");
			}
		}

		public static string RememberMe
		{
			get
			{
				return Localize("RememberMe");
			}
		}

		public static string String_Length_Error
		{
			get
			{
				return Localize("String_Length_Error");
			}
		}

		public static string Email
		{
			get
			{
				return Localize("Email");
			}
		}

		public static string Email_Field_Error
		{
			get
			{
				return Localize("Email_Field_Error");
			}
		}

		public static string User_Role
		{
			get
			{
				return Localize("User_Role");
			}
		}

		public static string Phone_Number
		{
			get
			{
				return Localize("Phone_Number");
			}
		}

		public static string TwoFactorCode
		{
			get
			{
				return Localize("TwoFactorCode");
			}
		}

		public static string RememberMachine
		{
			get
			{
				return Localize("RememberMachine");
			}
		}

		public static string RecoveryCode
		{
			get
			{
				return Localize("RecoveryCode");
			}
		}

		public static string VerificationCode
		{
			get
			{
				return Localize("VerificationCode");
			}
		}

		public static string Code_Received
		{
			get
			{
				return Localize("Code_Received");
			}
		}

		public static string Localize(string _keyword)
        {
            string strSessionLanguage = GetCurrentSessionLanguage();

            return uTextFile.LocalizeValue(_keyword, strSessionLanguage);
        }


        public static string GetCurrentSessionLanguage()
        {
			if (CurrentContext != null)
			{
				if (CurrentContext.Session != null)
				{
					if (CurrentContext.Session.GetString("Language") != null)
					{
						return CurrentContext.Session.GetString("Language");
					}
				}
			}

			return AppParams.m_instance.DefaultLanguage;
        }
    }
}
