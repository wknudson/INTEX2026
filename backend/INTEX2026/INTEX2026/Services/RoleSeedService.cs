using INTEX2026.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

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
        var db = services.GetRequiredService<BookstoreDbContext>();

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
        await EnsureUserAsync(userManager, "workser@havyn.org", "SocialWorker");
        await EnsureUserAsync(userManager, "donor@havyn.org", "Donor");

        var managerUser = await userManager.FindByEmailAsync("manager@havyn.org");
        if (managerUser != null && managerUser.SafehouseId == null)
        {
            var firstSafehouse = await db.Safehouses.OrderBy(s => s.SafehouseId).FirstOrDefaultAsync();
            if (firstSafehouse != null)
            {
                managerUser.SafehouseId = firstSafehouse.SafehouseId;
                await userManager.UpdateAsync(managerUser);
            }
        }

        await SeedSocialWorkerDirectoryAsync(userManager, db);
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

    private static async Task SeedSocialWorkerDirectoryAsync(
        UserManager<ApplicationUser> userManager,
        BookstoreDbContext db)
    {
        var socialWorkers = (await userManager.GetUsersInRoleAsync("SocialWorker"))
            .OrderBy(u => u.Email)
            .ToList();

        for (var i = 0; i < socialWorkers.Count; i++)
        {
            var user = socialWorkers[i];
            var existingLink = await db.SocialWorkerUsers.FirstOrDefaultAsync(x => x.UserId == user.Id);
            if (existingLink is not null)
            {
                continue;
            }

            var workerCode = $"SW_{(i + 1):00}";
            var worker = await db.SocialWorkers.FirstOrDefaultAsync(x => x.WorkerCode == workerCode);
            if (worker is null)
            {
                worker = new SocialWorker
                {
                    WorkerCode = workerCode,
                    DisplayName = string.IsNullOrWhiteSpace(user.DisplayName)
                        ? user.Email ?? workerCode
                        : user.DisplayName
                };
                db.SocialWorkers.Add(worker);
                await db.SaveChangesAsync();
            }

            db.SocialWorkerUsers.Add(new SocialWorkerUser
            {
                UserId = user.Id,
                SocialWorkerId = worker.SocialWorkerId
            });
        }

        await db.SaveChangesAsync();
    }
}
