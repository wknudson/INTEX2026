using INTEX2026.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace INTEX2026.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly BookstoreDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;

    public DashboardController(BookstoreDbContext context, UserManager<ApplicationUser> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    [HttpGet("admin")]
    [Authorize(Roles = "ExecutiveAdmin")]
    public async Task<IActionResult> Admin()
    {
        var residents = await _context.Residents.CountAsync(r => r.CaseStatus != "Closed");
        var donors = await _context.Supporters.CountAsync(s => s.Status == "Active");
        var donations = await _context.Donations.SumAsync(d => d.Amount ?? d.EstimatedValue ?? 0m);
        var safehouses = await _context.Safehouses.CountAsync(s => s.Status == "Active");
        return Ok(new { residents, donors, donations, safehouses });
    }

    [HttpGet("manager")]
    [Authorize(Roles = "RegionalManager")]
    public async Task<IActionResult> Manager()
    {
        var appUser = await _userManager.GetUserAsync(User);
        var rq = _context.Residents.Where(r => r.CaseStatus != "Closed");
        var iq = _context.IncidentReports.Where(i => !i.Resolved);
        var pq = _context.InterventionPlans.Where(p => p.Status == "Open" || p.Status == "In Progress");

        if (appUser?.SafehouseId != null)
        {
            var shId = appUser.SafehouseId.Value;
            rq = rq.Where(r => r.SafehouseId == shId);
            iq = iq.Where(i => i.SafehouseId == shId);
        }

        var residents = await rq.CountAsync();
        var incidents = await iq.CountAsync();
        var plans = await pq.CountAsync();
        return Ok(new { residents, incidents, plans });
    }

    [HttpGet("staff")]
    [Authorize(Roles = "SocialWorker")]
    public async Task<IActionResult> Staff()
    {
        var appUser = await _userManager.GetUserAsync(User);
        var casesQuery = _context.Residents.Where(r => r.CaseStatus != "Closed");
        var appointQuery = _context.Appointments.Where(a => a.Status == "Scheduled");

        if (appUser != null)
        {
            var workerLink = await _context.SocialWorkerUsers
                .FirstOrDefaultAsync(x => x.UserId == appUser.Id);
            if (workerLink != null)
            {
                var sw = await _context.SocialWorkers
                    .FirstOrDefaultAsync(x => x.SocialWorkerId == workerLink.SocialWorkerId);
                if (sw != null)
                    casesQuery = casesQuery.Where(r => r.AssignedSocialWorker == sw.WorkerCode
                                                    || r.AssignedSocialWorker == sw.DisplayName);
            }
            appointQuery = appointQuery.Where(a => a.StaffUserId == appUser.Id);
        }

        var activeCases = await casesQuery.CountAsync();
        var dueAppointments = await appointQuery.CountAsync();
        var flagged = await _context.ProcessRecordings.CountAsync(p => p.ConcernsFlagged);
        return Ok(new { activeCases, dueAppointments, flagged });
    }

    [HttpGet("donor")]
    [Authorize(Roles = "Donor")]
    public async Task<IActionResult> Donor()
    {
        var appUser = await _userManager.GetUserAsync(User);
        decimal myTotal = 0;
        int myCount = 0;

        if (appUser != null && !string.IsNullOrWhiteSpace(appUser.Email))
        {
            var supporterIds = await _context.Supporters
                .Where(s => s.Email == appUser.Email)
                .Select(s => s.SupporterId)
                .ToListAsync();

            if (supporterIds.Count > 0)
            {
                var myDonations = _context.Donations.Where(d => supporterIds.Contains(d.SupporterId));
                myTotal = await myDonations.SumAsync(d => d.Amount ?? d.EstimatedValue ?? 0m);
                myCount = await myDonations.CountAsync();
            }
        }

        var lastSnapshots = await _context.PublicImpactSnapshots
            .Where(s => s.IsPublished)
            .OrderByDescending(s => s.SnapshotDate)
            .Take(3)
            .ToListAsync();
        return Ok(new { myTotal, myCount, lastSnapshots });
    }
}
