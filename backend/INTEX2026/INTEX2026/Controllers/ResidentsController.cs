using INTEX2026.Contracts;
using INTEX2026.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace INTEX2026.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "RequireStaff")]
public class ResidentsController : ControllerBase
{
    private readonly BookstoreDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;

    public ResidentsController(BookstoreDbContext context, UserManager<ApplicationUser> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    [HttpGet]
    public async Task<IActionResult> GetResidents(
        [FromQuery] bool includeClosed = false,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 25)
    {
        var query = _context.Residents.AsQueryable();
        if (!includeClosed)
        {
            query = query.Where(r => r.CaseStatus != "Closed");
        }

        var appUser = await _userManager.GetUserAsync(User);
        if (User.IsInRole("SocialWorker") && appUser != null)
        {
            var workerLink = await _context.SocialWorkerUsers
                .FirstOrDefaultAsync(x => x.UserId == appUser.Id);
            if (workerLink != null)
            {
                var sw = await _context.SocialWorkers
                    .FirstOrDefaultAsync(x => x.SocialWorkerId == workerLink.SocialWorkerId);
                if (sw != null)
                    query = query.Where(r => r.AssignedSocialWorker == sw.WorkerCode
                                          || r.AssignedSocialWorker == sw.DisplayName);
            }
        }
        else if (User.IsInRole("RegionalManager") && appUser?.SafehouseId != null)
        {
            query = query.Where(r => r.SafehouseId == appUser.SafehouseId.Value);
        }

        var total = await query.CountAsync();
        var data = await query
            .OrderBy(r => r.InternalCode)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return Ok(new { total, page, pageSize, data });
    }

    [HttpGet("{residentId:int}")]
    public async Task<IActionResult> GetResident(int residentId)
    {
        var resident = await _context.Residents.FirstOrDefaultAsync(r => r.ResidentId == residentId);
        if (resident is null)
        {
            return NotFound();
        }

        var timeline = new
        {
            ProcessRecordings = await _context.ProcessRecordings.Where(x => x.ResidentId == residentId).OrderByDescending(x => x.SessionDate).Take(25).ToListAsync(),
            HomeVisitations = await _context.HomeVisitations.Where(x => x.ResidentId == residentId).OrderByDescending(x => x.VisitDate).Take(25).ToListAsync(),
            EducationRecords = await _context.EducationRecords.Where(x => x.ResidentId == residentId).OrderByDescending(x => x.RecordDate).Take(25).ToListAsync(),
            HealthRecords = await _context.HealthWellbeingRecords.Where(x => x.ResidentId == residentId).OrderByDescending(x => x.RecordDate).Take(25).ToListAsync(),
            InterventionPlans = await _context.InterventionPlans.Where(x => x.ResidentId == residentId).OrderByDescending(x => x.UpdatedAt).Take(25).ToListAsync(),
            Incidents = await _context.IncidentReports.Where(x => x.ResidentId == residentId).OrderByDescending(x => x.IncidentDate).Take(25).ToListAsync()
        };

        return Ok(new { resident, timeline });
    }

    [HttpPost("{residentId:int}/close")]
    [Authorize(Roles = "ExecutiveAdmin,RegionalManager")]
    public async Task<IActionResult> CloseCase(int residentId)
    {
        var resident = await _context.Residents.FirstOrDefaultAsync(r => r.ResidentId == residentId);
        if (resident is null)
        {
            return NotFound();
        }

        resident.CaseStatus = "Closed";
        resident.DateClosed = DateOnly.FromDateTime(DateTime.UtcNow);
        await _context.SaveChangesAsync();
        return Ok(resident);
    }

    [HttpPost("{residentId:int}/reopen")]
    [Authorize(Roles = "ExecutiveAdmin,RegionalManager")]
    public async Task<IActionResult> ReopenCase(int residentId)
    {
        var resident = await _context.Residents.FirstOrDefaultAsync(r => r.ResidentId == residentId);
        if (resident is null)
        {
            return NotFound();
        }

        resident.CaseStatus = "Active";
        resident.DateClosed = null;
        await _context.SaveChangesAsync();
        return Ok(resident);
    }

    [HttpPut("{residentId:int}/reintegration")]
    [Authorize(Roles = "ExecutiveAdmin,RegionalManager")]
    public async Task<IActionResult> UpdateReintegration(int residentId, [FromBody] ReintegrationUpdateRequest request)
    {
        var resident = await _context.Residents.FirstOrDefaultAsync(r => r.ResidentId == residentId);
        if (resident is null)
        {
            return NotFound();
        }

        resident.ReintegrationType = request.ReintegrationType;
        resident.ReintegrationStatus = request.ReintegrationStatus;
        await _context.SaveChangesAsync();
        return Ok(resident);
    }
}
