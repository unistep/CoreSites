using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.SpaServices.AngularCli;
using Microsoft.EntityFrameworkCore;
using CoreBase.Data;
using CoreBase.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System;
using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;
using uToolkit;
using System.IO;
using Microsoft.AspNetCore.SpaServices.ReactDevelopmentServer;

namespace CoreReact
{
	public class Startup
	{
		public Startup(IConfiguration configuration)
		{
			Configuration = configuration;
		}

		public IConfiguration Configuration { get; }

		// This method gets called by the runtime. Use this method to add services to the container.
		public virtual void ConfigureServices(IServiceCollection services)
		{
			services.AddSession(options =>
			{
				options.IdleTimeout = TimeSpan.FromSeconds(10);
				options.Cookie.HttpOnly = true;
				options.Cookie.IsEssential = true;
			});

			services.AddDbContext<ApplicationDbContext>(options =>
				options.UseSqlServer(
					Configuration.GetConnectionString("DefaultConnection")));

			services.AddDefaultIdentity<ApplicationUser>(options => options.SignIn.RequireConfirmedAccount = true)
						.AddRoles<IdentityRole>()
						.AddRoleManager<RoleManager<IdentityRole>>()
						.AddEntityFrameworkStores<ApplicationDbContext>();
			
			services.AddIdentityServer()
				.AddApiAuthorization<ApplicationUser, ApplicationDbContext>();

			services.AddTransient<Microsoft.AspNetCore.Identity.UI.Services.IEmailSender, EmailSender>();

			services.AddAuthentication()
				.AddIdentityServerJwt();

			services.AddControllersWithViews();
			services.AddRazorPages();

			string rootPath = uApp.m_homeDirectory + "\\ClientApp\\public";  // true for React
			if (Directory.Exists(rootPath))
			{
				rootPath = "ClientApp/build";
			}
			else
			{
				rootPath = "ClientApp/dist";
			}

			// In production, the React/angular files will be served from this directory
			services.AddSpaStaticFiles(configuration =>
			{
				configuration.RootPath = rootPath;
			});
		}

		// This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
		public virtual void Configure(IApplicationBuilder app,
			IWebHostEnvironment env,
			IServiceProvider serviceProvider,
			IHttpContextAccessor httpContextAccessor)
		{
			Locale_Resource.m_httpContextAccessor = httpContextAccessor;

			if (env.IsDevelopment())
			{
				app.UseDeveloperExceptionPage();
				app.UseDatabaseErrorPage();
			}
			else
			{
				app.UseExceptionHandler("/Error");
				// The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
				app.UseHsts();
			}

			app.UseHttpsRedirection();
			app.UseStaticFiles();
			if (!env.IsDevelopment())
			{
				app.UseSpaStaticFiles();
			}

			app.UseRouting();

			app.UseAuthentication();
			app.UseIdentityServer();
			app.UseAuthorization();
			app.UseSession();
			app.UseEndpoints(endpoints =>
			{
				endpoints.MapControllerRoute(
					name: "default",
					pattern: "{controller}/{action=Index}/{id?}");
				endpoints.MapRazorPages();
			});

			app.UseSpa(spa =>
			{
				// To learn more about options for serving an Angular SPA from ASP.NET Core,
				// see https://go.microsoft.com/fwlink/?linkid=864501

				spa.Options.SourcePath = "ClientApp";

				if (env.IsDevelopment())
				{
					string rootPath = uApp.m_homeDirectory + "\\ClientApp\\public";  // true for React
					if (Directory.Exists(rootPath))
					{
						spa.UseReactDevelopmentServer(npmScript: "start");
					}
					else
					{
						spa.UseAngularCliServer(npmScript: "start");
					}
				}
			});

			CreateRoles(serviceProvider).Wait();
		}


		//===============================================================================================
		public async Task CreateRoles(IServiceProvider serviceProvider)
		{
			string[] m_defaultRoles = { "Admin", "Manager", "Member" };

			string m_adminUser = "admin";
			string m_adminEmail = "shlomo.aviv.unistep@gmail.com";
			string m_adminPassword = "Iec_110077";

			var RoleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();
			var UserManager = serviceProvider.GetRequiredService<UserManager<ApplicationUser>>();

			IdentityResult roleResult;

			if (m_defaultRoles.Length == 0)
			{
				m_defaultRoles[0] = "Admin";
			}

			foreach (var roleName in m_defaultRoles)
			{
				var roleExist = await RoleManager.RoleExistsAsync(roleName);
				if (!roleExist)
				{
					roleResult = await RoleManager.CreateAsync(new IdentityRole(roleName));
				}
			}

			if (m_adminUser == "") return;

			if (m_adminEmail == "") return;

			if (m_adminPassword == "") return;

			var user = await UserManager.FindByNameAsync(m_adminUser);
			if (user == null)
			{
				var ust = new ApplicationUser();
				ust.UserName = m_adminUser;
				ust.Email = m_adminEmail;

				IdentityResult chkUser = await UserManager.CreateAsync(ust, m_adminPassword);

				if (!chkUser.Succeeded) return;
			}

			user = await UserManager.FindByNameAsync(m_adminUser);
			if (user == null) return;

			if (!await UserManager.IsInRoleAsync(user, "Admin"))
			{
				await UserManager.AddToRoleAsync(user, "Admin");
			}
		}
	}
}
