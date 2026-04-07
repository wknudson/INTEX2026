using INTEX2026.Data;
using Microsoft.AspNetCore.Identity;

namespace INTEX2026.Services;

public class RoleSeedService
{
    private static readonly string[] Roles =
    [
        "ExecutiveAdmin",
        "RegionalManager",
        "SocialWorker",
        "Donor"
    ];

    public static async Task SeedAsync(IServiceProvider services)
    {
        var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();
        var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();

        foreach (var role in Roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new IdentityRole(role));
            }
        }

        await EnsureUserAsync(userManager, "admin@havyn.org", "ExecutiveAdmin");
        await EnsureUserAsync(userManager, "manager@havyn.org", "RegionalManager");
        await EnsureUserAsync(userManager, "worker@havyn.org", "SocialWorker");
        await EnsureUserAsync(userManager, "donor@havyn.org", "Donor");
    }

    private static async Task EnsureUserAsync(UserManager<ApplicationUser> userManager, string email, string role)
    {
        var user = await userManager.FindByEmailAsync(email);
        if (user is null)
        {
            user = new ApplicationUser
            {
                UserName = email,
                Email = email,
                DisplayName = email.Split('@')[0],
                EmailConfirmed = true,
                PrivacyPolicyAccepted = true,
                CookieConsentAccepted = true
            };
            await userManager.CreateAsync(user, "TempPass!12345");
        }

        if (!await userManager.IsInRoleAsync(user, role))
        {
            await userManager.AddToRoleAsync(user, role);
        }
    }
}
