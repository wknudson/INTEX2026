using INTEX2026.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace INTEX2026.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "ExecutiveAdmin,RegionalManager")]
public class SafehousesController : ControllerBase
{
    private readonly BookstoreDbContext _context;

    public SafehousesController(BookstoreDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetSafehouses(
        [FromQuery] bool includeInactive = false,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 25)
    {
        var query = _context.Safehouses.AsQueryable();
        if (!includeInactive)
        {
            query = query.Where(s => s.Status == "Active");
        }

        var total = await query.CountAsync();
        var data = await query
            .OrderBy(s => s.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return Ok(new { total, page, pageSize, data });
    }

    [HttpGet("{safehouseId:int}")]
    public async Task<IActionResult> GetSafehouse(int safehouseId)
    {
        var safehouse = await _context.Safehouses.FirstOrDefaultAsync(s => s.SafehouseId == safehouseId);
        if (safehouse is null) return NotFound();

        var residentCount = await _context.Residents.CountAsync(r => r.SafehouseId == safehouseId && r.CaseStatus != "Closed");
        var metrics = await _context.SafehouseMonthlyMetrics
            .Where(m => m.SafehouseId == safehouseId)
            .OrderByDescending(m => m.MonthEnd)
            .Take(12)
            .ToListAsync();
        var incidents = await _context.IncidentReports
            .Where(i => i.SafehouseId == safehouseId && !i.Resolved)
            .CountAsync();

        return Ok(new { safehouse, residentCount, unresolvedIncidents = incidents, metrics });
    }
}
