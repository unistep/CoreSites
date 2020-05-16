
using System;

namespace uToolkit
{
	public class uActivationTimeSchedule
	{
		public TimeSpan		m_startTime = TimeSpan.MinValue;       // start on... default=00:00:00
		public TimeSpan		m_doEvery	= TimeSpan.MinValue;       // do every... default=no recurring
		public TimeSpan		m_endTime	= TimeSpan.MinValue;       // end time... default=23:59:59


		// ======================================================================================================
		public static uActivationTimeSchedule Get_ConfigurationParams(string sectionName, string moduleKeyword)
		{
			string activationTimeSchedule = ""; // uApp.GetApp_PredefineValue(sectionName, moduleKeyword);
			uApp.Loger($"{moduleKeyword}, {activationTimeSchedule}");

			uActivationTimeSchedule ats = new uActivationTimeSchedule();

			ats.m_startTime	= Get_TimeSpanValue (uStr.GetArgString(activationTimeSchedule, 1, ";"));
			ats.m_doEvery	= Get_TimeSpanValue (uStr.GetArgString(activationTimeSchedule, 2, ";"));
			ats.m_endTime	= Get_TimeSpanValue (uStr.GetArgString(activationTimeSchedule, 3, ";"));

			return ats;
		}


		// ======================================================================================================
		public static TimeSpan Get_TimeSpanValue(string timeSpanValue)
		{
			int hour	= uStr.String2Integer(uStr.GetArgString(timeSpanValue, 1, ":"));
			int minute	= uStr.String2Integer(uStr.GetArgString(timeSpanValue, 2, ":"));
			int second	= uStr.String2Integer(uStr.GetArgString(timeSpanValue, 3, ":"));

			TimeSpan returnValue = new TimeSpan(hour, minute, second);
			return returnValue;
		}


		// ======================================================================================================
		public bool TimeToActivate(DateTime timePrev, DateTime timeNow)
		{
			if ((m_startTime.TotalSeconds == 0) && (m_doEvery.TotalSeconds == 0) && (m_endTime.TotalSeconds == 0))
			{
				return true;
			}

			DateTime startTime = new DateTime(DateTime.Now.Year, DateTime.Now.Month, DateTime.Now.Day,
				m_startTime.Hours, m_startTime.Minutes, m_startTime.Seconds);

			TimeSpan ts = (((m_endTime.TotalSeconds == 0) && (m_doEvery.TotalSeconds != 0))
								? new TimeSpan(23, 59, 59) : m_endTime);

			DateTime endTime = new DateTime(DateTime.Now.Year, DateTime.Now.Month, DateTime.Now.Day,
					ts.Hours, ts.Minutes, ts.Seconds);

			if (m_doEvery.TotalSeconds != 0)
			{
				for (DateTime scheduledTime = startTime;
					(scheduledTime <= timeNow) && (scheduledTime <= endTime);
					scheduledTime += m_doEvery)
				{
					if ((scheduledTime > timePrev) && (scheduledTime <= timeNow)) return true;
				}

				return false;
			}

			if (m_startTime.TotalSeconds != 0)
			{
				if ((startTime > timePrev) && (startTime <= timeNow)) return true;
			}

			if (m_endTime.TotalSeconds != 0)
			{
				if ((endTime > timePrev) && (endTime <= timeNow)) return true;
			}

			return false;
		}
	}
}
