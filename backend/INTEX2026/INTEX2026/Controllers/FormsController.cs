using INTEX2026.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace INTEX2026.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "RequireStaff")]
public class FormsController : ControllerBase
{
    private readonly BookstoreDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;

    public FormsController(BookstoreDbContext context, UserManager<ApplicationUser> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    [HttpGet("staff-submissions")]
    public async Task<IActionResult> GetStaffSubmissions(
        [FromQuery] string? formType = null,
        [FromQuery] int? residentId = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 25)
    {
        var appUser = await _userManager.GetUserAsync(User);
        if (appUser == null)
            return Unauthorized();

        var workerLink = await _context.SocialWorkerUsers
            .FirstOrDefaultAsync(x => x.UserId == appUser.Id);
        if (workerLink == null)
            return Unauthorized();

        var sw = await _context.SocialWorkers
            .FirstOrDefaultAsync(x => x.SocialWorkerId == workerLink.SocialWorkerId);
        if (sw == null)
            return Unauthorized();

        var workerIdentifier = sw.DisplayName;

        var submissions = new List<dynamic>();

        // Get Process Recordings
        if (string.IsNullOrEmpty(formType) || formType == "ProcessRecording")
        {
            var recordings = await _context.ProcessRecordings
                .Where(x => x.SocialWorker == workerIdentifier && (residentId == null || x.ResidentId == residentId))
                .OrderByDescending(x => x.SessionDate)
                .ToListAsync();

            submissions.AddRange(recordings.Select(x => new
            {
                formId = $"pr-{x.RecordingId}",
                formType = "Process Recording",
                residentId = x.ResidentId,
                dateSubmitted = x.SessionDate.ToString("yyyy-MM-dd"),
                submittedBy = x.SocialWorker,
                data = x
            }));
        }

        // Get Home Visitations
        if (string.IsNullOrEmpty(formType) || formType == "HomeVisitation")
        {
            var visitations = await _context.HomeVisitations
                .Where(x => x.SocialWorker == workerIdentifier && (residentId == null || x.ResidentId == residentId))
                .OrderByDescending(x => x.VisitDate)
                .ToListAsync();

            submissions.AddRange(visitations.Select(x => new
            {
                formId = $"hv-{x.VisitationId}",
                formType = "Home Visitation",
                residentId = x.ResidentId,
                dateSubmitted = x.VisitDate.ToString("yyyy-MM-dd"),
                submittedBy = x.SocialWorker,
                data = x
            }));
        }

        // Get Education Records
        if (string.IsNullOrEmpty(formType) || formType == "EducationRecord")
        {
            var educationRecords = await _context.EducationRecords
                .Where(x => (residentId == null || x.ResidentId == residentId))
                .OrderByDescending(x => x.RecordDate)
                .ToListAsync();

            submissions.AddRange(educationRecords.Select(x => new
            {
                formId = $"er-{x.EducationRecordId}",
                formType = "Education Record",
                residentId = x.ResidentId,
                dateSubmitted = x.RecordDate.ToString("yyyy-MM-dd"),
                submittedBy = "System",
                data = x
            }));
        }

        // Get Health Records
        if (string.IsNullOrEmpty(formType) || formType == "HealthWellbeingRecord")
        {
            var healthRecords = await _context.HealthWellbeingRecords
                .Where(x => (residentId == null || x.ResidentId == residentId))
                .OrderByDescending(x => x.RecordDate)
                .ToListAsync();

            submissions.AddRange(healthRecords.Select(x => new
            {
                formId = $"hr-{x.HealthRecordId}",
                formType = "Health & Wellbeing",
                residentId = x.ResidentId,
                dateSubmitted = x.RecordDate.ToString("yyyy-MM-dd"),
                submittedBy = "System",
                data = x
            }));
        }

        // Sort by date descending
        submissions = submissions.OrderByDescending(x => x.dateSubmitted).ToList();

        // Get resident info for each submission
        var residentIds = submissions.Select(x => (int)x.residentId).Distinct().ToList();
        var residents = await _context.Residents
            .Where(r => residentIds.Contains(r.ResidentId))
            .ToListAsync();

        var result = submissions.Select((submission, index) => new
        {
            submission.formId,
            submission.formType,
            submission.residentId,
            submission.dateSubmitted,
            submission.submittedBy,
            internalCode = residents.FirstOrDefault(r => r.ResidentId == (int)submission.residentId)?.InternalCode ?? "Unknown",
            submission.data
        }).Skip((page - 1) * pageSize).Take(pageSize).ToList();

        return Ok(new
        {
            total = submissions.Count,
            page,
            pageSize,
            data = result
        });
    }

    [HttpPost("intake")]
    public async Task<IActionResult> Intake([FromBody] Resident request)
    {
        request.CaseStatus = "Active";
        request.CreatedAt = DateTime.UtcNow;
        _context.Residents.Add(request);
        await _context.SaveChangesAsync();
        return Ok(request);
    }

    [HttpPost("process-recording")]
    public async Task<IActionResult> ProcessRecording([FromBody] ProcessRecording request)
    {
        var appUser = await _userManager.GetUserAsync(User);
        if (appUser == null)
            return Unauthorized();

        var workerLink = await _context.SocialWorkerUsers
            .FirstOrDefaultAsync(x => x.UserId == appUser.Id);
        if (workerLink != null)
        {
            var sw = await _context.SocialWorkers
                .FirstOrDefaultAsync(x => x.SocialWorkerId == workerLink.SocialWorkerId);
            if (sw != null)
                request.SocialWorker = sw.DisplayName;
        }

        _context.ProcessRecordings.Add(request);
        await _context.SaveChangesAsync();
        return Ok(request);
    }

    [HttpPost("home-visitation")]
    public async Task<IActionResult> HomeVisitation([FromBody] HomeVisitation request)
    {
        var appUser = await _userManager.GetUserAsync(User);
        if (appUser == null)
            return Unauthorized();

        var workerLink = await _context.SocialWorkerUsers
            .FirstOrDefaultAsync(x => x.UserId == appUser.Id);
        if (workerLink != null)
        {
            var sw = await _context.SocialWorkers
                .FirstOrDefaultAsync(x => x.SocialWorkerId == workerLink.SocialWorkerId);
            if (sw != null)
                request.SocialWorker = sw.DisplayName;
        }

        _context.HomeVisitations.Add(request);
        await _context.SaveChangesAsync();
        return Ok(request);
    }

    [HttpPost("education-record")]
    public async Task<IActionResult> EducationRecord([FromBody] EducationRecord request)
    {
        _context.EducationRecords.Add(request);
        await _context.SaveChangesAsync();
        return Ok(request);
    }

    [HttpPost("health-record")]
    public async Task<IActionResult> HealthRecord([FromBody] HealthWellbeingRecord request)
    {
        if (request.HeightCm > 0)
            request.Bmi = Math.Round(request.WeightKg / ((request.HeightCm / 100m) * (request.HeightCm / 100m)), 1);

        _context.HealthWellbeingRecords.Add(request);
        await _context.SaveChangesAsync();
        return Ok(request);
    }

    [HttpPost("intervention-plan")]
    public async Task<IActionResult> InterventionPlan([FromBody] InterventionPlan request)
    {
        if ((request.Status == "Achieved" || request.Status == "Closed") && request.CaseConferenceDate == null)
            return BadRequest(new { error = "A case conference date is required when status is Achieved or Closed." });

        request.UpdatedAt = DateTime.UtcNow;
        _context.InterventionPlans.Add(request);
        await _context.SaveChangesAsync();
        return Ok(request);
    }

    [HttpPost("incident-report")]
    public async Task<IActionResult> IncidentReport([FromBody] IncidentReport request)
    {
        if (request.ResidentId > 0 && request.SafehouseId <= 0)
        {
            var resident = await _context.Residents.FirstOrDefaultAsync(r => r.ResidentId == request.ResidentId);
            if (resident != null)
                request.SafehouseId = resident.SafehouseId;
        }

        _context.IncidentReports.Add(request);
        await _context.SaveChangesAsync();
        return Ok(request);
    }
}
