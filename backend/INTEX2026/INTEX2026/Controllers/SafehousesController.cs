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
}
