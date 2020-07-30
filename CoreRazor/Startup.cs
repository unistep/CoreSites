using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.EntityFrameworkCore;
using CoreRazor.Data;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.AspNetCore.Http;
using CoreBase.Models;

namespace CoreRazor
{
	public class Startup
	{
		public Startup(IConfiguration configuration)
		{
			Configuration = configuration;
		}

		public IConfiguration Configuration { get; }

		// This method gets called by the runtime. Use this method to add services to the container.
		public void ConfigureServices(IServiceCollection services)
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

			services.AddDefaultIdentity<ApplicationUser>(options => options.SignIn.RequireConfirmedAccount = false)
			.AddRoles<IdentityRole>()
			.AddRoleManager<RoleManager<IdentityRole>>()
			.AddEntityFrameworkStores<ApplicationDbContext>();

			services.AddIdentityServer()
				.AddApiAuthorization<ApplicationUser, ApplicationDbContext>();

			//services.AddControllersWithViews();
			services.AddRazorPages();
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
				app.UseExceptionHandler("/Home/Error");
				// The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
				app.UseHsts();
			}
			app.UseHttpsRedirection();
			app.UseStaticFiles();

			app.UseRouting();

			app.UseAuthentication();
			app.UseAuthorization();
			app.UseSession();

			app.UseEndpoints(endpoints =>
			{
				endpoints.MapControllerRoute(
					name: "default",
					pattern: "{controller=Home}/{action=Index}/{id?}");
				endpoints.MapRazorPages();
			});
		}
	}
}
