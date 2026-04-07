using INTEX2026.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace INTEX2026.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly BookstoreDbContext _context;

    public DashboardController(BookstoreDbContext context)
    {
        _context = context;
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
        var residents = await _context.Residents.CountAsync(r => r.CaseStatus != "Closed");
        var incidents = await _context.IncidentReports.CountAsync(i => !i.Resolved);
        var plans = await _context.InterventionPlans.CountAsync(p => p.Status == "Open" || p.Status == "In Progress");
        return Ok(new { residents, incidents, plans });
    }

    [HttpGet("staff")]
    [Authorize(Roles = "SocialWorker")]
    public async Task<IActionResult> Staff()
    {
        var activeCases = await _context.Residents.CountAsync(r => r.CaseStatus != "Closed");
        var dueAppointments = await _context.Appointments.CountAsync(a => a.Status == "Scheduled");
        var flagged = await _context.ProcessRecordings.CountAsync(p => p.ConcernsFlagged);
        return Ok(new { activeCases, dueAppointments, flagged });
    }

    [HttpGet("donor")]
    [Authorize(Roles = "Donor")]
    public async Task<IActionResult> Donor()
    {
        var totalRaised = await _context.Donations.SumAsync(d => d.Amount ?? d.EstimatedValue ?? 0m);
        var lastSnapshots = await _context.PublicImpactSnapshots
            .Where(s => s.IsPublished)
            .OrderByDescending(s => s.SnapshotDate)
            .Take(3)
            .ToListAsync();
        return Ok(new { totalRaised, lastSnapshots });
    }
}
