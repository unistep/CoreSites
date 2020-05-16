
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using System;
using uToolkit;
//using CoreBase;

namespace CoreReact
{
	public class Program : uProgram
	{
		public static void Main(string[] args)
		{
			if (!uMain(args)) return;
			try
			{
				CreateWebHostBuilder(args).Build().Run();
			}
			catch (Exception e)
			{
				HandleUnhandledException(e);
			}
		}

		public static IWebHostBuilder CreateWebHostBuilder(string[] args) =>
			WebHost.CreateDefaultBuilder(args)
				.UseStartup<Startup>();
	}
}

