using INTEX2026.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace INTEX2026.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "ExecutiveAdmin,RegionalManager,SocialWorker")]
public class MlController : ControllerBase
{
    private readonly HavynDbContext _context;

    public MlController(HavynDbContext context)
    {
        _context = context;
    }

    [HttpGet("resident-risk")]
    public async Task<IActionResult> ResidentRisk([FromQuery] int limit = 20)
    {
        var residents = await _context.Residents
            .Where(r => r.CaseStatus != "Closed")
            .Take(limit)
            .ToListAsync();

        var predictions = residents.Select(r =>
        {
            var score = r.CurrentRiskLevel switch
            {
                "Critical" => 0.95m,
                "High" => 0.78m,
                "Medium" => 0.45m,
                _ => 0.2m
            };
            return new
            {
                r.ResidentId,
                r.InternalCode,
                RiskProbability = score,
                Recommendation = score > 0.75m ? "Increase counseling cadence and conference follow-up." : "Maintain current intervention plan."
            };
        });

        return Ok(predictions);
    }

    [HttpGet("recommended-sessions")]
    public async Task<IActionResult> RecommendedSessions()
    {
        var unresolvedIncidents = await _context.IncidentReports
            .Where(i => !i.Resolved && i.Severity == "High")
            .GroupBy(i => i.ResidentId)
            .Select(g => new
            {
                ResidentId = g.Key,
                SessionType = "Healing",
                WeeklySessions = 2,
                Reason = "Unresolved high-severity incident(s)"
            })
            .ToListAsync();

        return Ok(unresolvedIncidents);
    }
}
