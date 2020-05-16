
using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Rendering;

using System.Collections;
using uToolkit;

namespace CoreBase.Models
{
	public static class HtmlHelperExtensions
	{
		//====================================================================================================
		public static string Datepicker_Language(this IHtmlHelper _helper)
		{
			string sessionLanguage = GetViewLanguage(_helper);

			if (sessionLanguage == "Hebrew") return "he";
			else if (sessionLanguage == "Arabic") return "ar";
			else if (sessionLanguage == "Russian") return "ru";
			else  return "en";
		}


		//====================================================================================================
		public static IHtmlContent DataBind(this IHtmlHelper _helper, string _keyword)
		{
			IHtmlContent localeValue = Localize(_helper, _keyword);

			string returnValue = ($"\"{_keyword}\" placeholder=\"{ localeValue}\"");

			return _helper.Raw(returnValue);
		}


		//====================================================================================================
		public static IHtmlContent Localize(this IHtmlHelper _helper, string _keyword)
		{
			string sessionLanguage = GetViewLanguage(_helper);

			return _helper.Raw(uTextFile.LocalizeValue(_keyword, sessionLanguage));
		}


		//====================================================================================================
		public static IHtmlContent Localize(this IHtmlHelper _helper, string _keyword, string _arg)
		{
			string sessionLanguage = GetViewLanguage(_helper);

			string localizedValue = uTextFile.LocalizeValue(_keyword, sessionLanguage);

			return _helper.Raw(string.Format (localizedValue, _arg));
		}


		//====================================================================================================
		public static string GetViewName(this IHtmlHelper _helper)
		{
			string viewPath = GetCurrentUrl(_helper);

			string viewName = System.IO.Path.GetFileNameWithoutExtension(viewPath);

			if (viewName.ToLower() == "index")
			{
				viewPath = System.IO.Path.GetDirectoryName(viewPath);
				viewName = System.IO.Path.GetFileNameWithoutExtension(viewPath);
			}

			return viewName;
		}


		//====================================================================================================
		public static IHtmlContent ViewTitle(this IHtmlHelper _helper)
		{
			string viewName = GetViewName(_helper);

			if (viewName == "Manage") viewName = "Profile";
			return Localize(_helper, viewName);
		}


		//====================================================================================================
		public static string GetCurrentUrl(this IHtmlHelper _helper)
		{
			return _helper.ViewContext.HttpContext.Request.Path;
		}


		//====================================================================================================
		public static IHtmlContent Primary_Brand_Name(this IHtmlHelper _helper)
		{
			IHtmlContent pbm = Localize(_helper, "Primary_Brand_Name");
			return pbm;
		}


		//====================================================================================================
		public static IHtmlContent Brand_Name_1(this IHtmlHelper _helper)
		{
			return Localize(_helper, "Brand_Name_1");
		}


		//====================================================================================================
		public static IHtmlContent Brand_Name_2(this IHtmlHelper _helper)
		{
			return Localize(_helper, "Brand_Name_2");
		}


		//====================================================================================================
		public static IHtmlContent Brand_Address(this IHtmlHelper _helper)
		{
			return Localize(_helper, "Brand_Address");
		}


		//====================================================================================================
		public static IHtmlContent Brand_Phone(this IHtmlHelper _helper)
		{
			return Localize(_helper, "Brand_Phone");
		}


		//====================================================================================================
		public static IHtmlContent Web_Site_Developer(this IHtmlHelper _helper)
		{
			return Localize(_helper, "Web_Site_Developer");
		}


		//====================================================================================================
		public static string GetViewLanguage(this IHtmlHelper _helper)
		{
			ViewContext context = _helper.ViewContext;

			if ((context.HttpContext.Session == null) ||
				!context.HttpContext.Session.IsAvailable ||
				(context.HttpContext.Session.GetString("Language") == null) ||
				(context.HttpContext.Session.GetString("Language") == ""))
			{
				SetSessionLanguage(context, AppParams.m_instance.DefaultLanguage);
				return AppParams.m_instance.DefaultLanguage;
			}

			string language = context.HttpContext.Session.GetString("Language");
			return language;
		}


		//====================================================================================================
		public static void SetSessionLanguage(ViewContext context, string language)
		{
			if ((context.HttpContext.Session == null) ||
				!context.HttpContext.Session.IsAvailable)
			{
				return;
			}

			if ((language == null) || (language == "")) language = AppParams.m_instance.DefaultLanguage;
			context.HttpContext.Session.SetString("Language", language);
		}


		//====================================================================================================
		public static string GetViewDirection(this IHtmlHelper _helper)
		{
			string language = GetViewLanguage(_helper);

            string strDirection = ((language == "Hebrew") || (language == "Arabic")) ? "RTL" : "LTR";
			return strDirection;
		}


		//====================================================================================================
		public static IEnumerable GetSupportedLanguages(this IHtmlHelper _helper)
		{
			ArrayList listSupportedLanguages = uTextFile.GetKnownLanguages();

			return (IEnumerable) listSupportedLanguages;
		}


		//====================================================================================================
		public static string GetGoogleLanguageCode(this IHtmlHelper _helper)
		{
			string language = GetViewLanguage(_helper);
			return uLanguageCodes.GetCodeByName(language);
		}


		//====================================================================================================
		public static bool isUserRole(this IHtmlHelper _helper, string userRole)
		{
			ViewContext context = _helper.ViewContext;

			if (context.HttpContext.User.Identity == null) return false;

			if (!context.HttpContext.User.Identity.IsAuthenticated) return false;

			return (context.HttpContext.User.IsInRole(userRole));
		}


		//====================================================================================================
		public static bool isRegistraionPolicyAdmin(this IHtmlHelper _helper)
        {
            return (AppParams.m_instance.RegistrationPolicy == "Admin");
        }
    }
}
