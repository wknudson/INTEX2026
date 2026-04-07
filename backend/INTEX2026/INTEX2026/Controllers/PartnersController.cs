using INTEX2026.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace INTEX2026.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PartnersController : ControllerBase
{
    private readonly BookstoreDbContext _context;

    public PartnersController(BookstoreDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    [Authorize(Roles = "ExecutiveAdmin,RegionalManager")]
    public async Task<IActionResult> GetPartners([FromQuery] int page = 1, [FromQuery] int pageSize = 25)
    {
        var total = await _context.Partners.CountAsync();
        var data = await _context.Partners.OrderBy(p => p.PartnerName).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
        return Ok(new { total, page, pageSize, data });
    }

    [HttpPost]
    [Authorize(Roles = "ExecutiveAdmin")]
    public async Task<IActionResult> CreatePartner([FromBody] Partner partner)
    {
        _context.Partners.Add(partner);
        await _context.SaveChangesAsync();
        return Ok(partner);
    }

    [HttpPut("{partnerId:int}")]
    [Authorize(Roles = "ExecutiveAdmin")]
    public async Task<IActionResult> UpdatePartner(int partnerId, [FromBody] Partner request)
    {
        var partner = await _context.Partners.FirstOrDefaultAsync(p => p.PartnerId == partnerId);
        if (partner is null)
        {
            return NotFound();
        }

        partner.PartnerName = request.PartnerName;
        partner.PartnerType = request.PartnerType;
        partner.RoleType = request.RoleType;
        partner.ContactName = request.ContactName;
        partner.Email = request.Email;
        partner.Phone = request.Phone;
        partner.Region = request.Region;
        partner.Status = request.Status;
        partner.StartDate = request.StartDate;
        partner.EndDate = request.EndDate;
        partner.Notes = request.Notes;
        await _context.SaveChangesAsync();
        return Ok(partner);
    }

    [HttpGet("{partnerId:int}/assignments")]
    [Authorize(Roles = "ExecutiveAdmin,RegionalManager")]
    public async Task<IActionResult> GetAssignments(int partnerId)
    {
        var assignments = await _context.PartnerAssignments.Where(a => a.PartnerId == partnerId).ToListAsync();
        return Ok(assignments);
    }

    [HttpPost("{partnerId:int}/assignments")]
    [Authorize(Roles = "ExecutiveAdmin")]
    public async Task<IActionResult> AddAssignment(int partnerId, [FromBody] PartnerAssignment assignment)
    {
        assignment.PartnerId = partnerId;
        _context.PartnerAssignments.Add(assignment);
        await _context.SaveChangesAsync();
        return Ok(assignment);
    }
}
