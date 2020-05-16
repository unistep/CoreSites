using System;

namespace uToolkit
{
	public class uProgram
	{
		public static bool uMain(string[] args)
		{
			try
			{
				uApp.Initialize(false);

				return true;
			}
			catch (Exception e)
			{
				HandleUnhandledException(e);
				return false;
			}
		}

		public static void HandleUnhandledException(Object o)
		{
			Exception e = o as Exception;

			if (e != null)
			{
				uApp.Loger(string.Format("*** unhandled exception: {0}", e.Message));
			}

			System.Diagnostics.StackTrace t = new System.Diagnostics.StackTrace();
			uApp.Loger(t.ToString());
			Environment.Exit(0);
		}

		private static void OnUnhandledException(Object sender, UnhandledExceptionEventArgs e)
		{
			HandleUnhandledException(e.ExceptionObject);
		}

		private static void OnGuiUnhandedException(object sender, System.Threading.ThreadExceptionEventArgs e)
		{
			HandleUnhandledException(e.Exception);
		}
	}
}

