using INTEX2026.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace INTEX2026.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "RequireStaff")]
public class FormsController : ControllerBase
{
    private readonly BookstoreDbContext _context;

    public FormsController(BookstoreDbContext context)
    {
        _context = context;
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
        _context.ProcessRecordings.Add(request);
        await _context.SaveChangesAsync();
        return Ok(request);
    }

    [HttpPost("home-visitation")]
    public async Task<IActionResult> HomeVisitation([FromBody] HomeVisitation request)
    {
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
