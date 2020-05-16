using Microsoft.AspNetCore.ApiAuthorization.IdentityServer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using uToolkit;

namespace CoreBase.Controllers
{
	public class OidcConfigurationController : Controller
	{
		private readonly ILogger<OidcConfigurationController> logger;

		public OidcConfigurationController(IClientRequestParametersProvider clientRequestParametersProvider, ILogger<OidcConfigurationController> _logger)
		{
			ClientRequestParametersProvider = clientRequestParametersProvider;
			logger = _logger;
		}

		public IClientRequestParametersProvider ClientRequestParametersProvider { get; }

		[HttpGet("_configuration/{clientId}")]
		public IActionResult GetClientRequestParameters([FromRoute] string clientId)
		{
			var parameters = ClientRequestParametersProvider.GetClientParameters(HttpContext, clientId);
			return Ok(parameters);
		}

		[HttpGet("ChangeLanguage")] //ChangeLanguage
		//====================================================================================================
		public IActionResult ChangeLanguage(string language)
		{
			//if ((language != null) && (language != ""))
			//{
			//	AppParams.m_instance.DefaultLanguage = language;
			//}

			var caller = (Request.Headers["Referer"] != "") ?
						Request.Headers["Referer"].ToString() : "DefaultRedirect";

			return Redirect(caller);
		}

		[HttpGet("SetNewLanguage")]
		//====================================================================================================
		public IActionResult SetNewLanguage()
		{
			var caller = (Request.Headers["Referer"] != "") ?
						Request.Headers["Referer"].ToString() : "DefaultRedirect";

			return Redirect(caller);
		}
	}
}
