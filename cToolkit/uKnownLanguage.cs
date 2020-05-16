using System.Collections;

namespace uToolkit
{
	// ===========================================================================
	public class uPrompt
	{
		public	string	m_keyword	= "";
		public	string	m_prompt	= "";

		public uPrompt()
		{
		}


		public uPrompt(string _keyword, string _prompt)
		{
			m_keyword	= _keyword;
			m_prompt	= _prompt.Replace("'", "\\'");   // .Replace("\"", "\\\""); depend what kind of quates u use on your js
		}
	}


	// ===========================================================================
	public class uKnownLanguage
	{
		public	string				m_languageName	= "";
		public	ArrayList			m_promptList	= null;


		public uKnownLanguage()
		{
		}


		public uKnownLanguage(ArrayList _knownLanguages, string _languageName)
		{
			m_languageName	= _languageName; // Use GOOGLE language names!!!
			m_promptList	= new ArrayList();

			_knownLanguages.Add(this);
		}

		public uPrompt GetPrompt(string _keyword)
		{
			foreach (uPrompt uPrompt in m_promptList)
			{
				if (uPrompt.m_keyword.ToLower() == _keyword.ToLower()) return uPrompt;
			}

			return null;
		}
	}
}
