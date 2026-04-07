using INTEX2026.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace INTEX2026.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DonorsController : ControllerBase
{
    private readonly BookstoreDbContext _context;

    public DonorsController(BookstoreDbContext context)
    {
        _context = context;
    }

    [HttpGet("supporters")]
    [Authorize(Roles = "ExecutiveAdmin,RegionalManager")]
    public async Task<IActionResult> GetSupporters([FromQuery] int page = 1, [FromQuery] int pageSize = 25)
    {
        var query = _context.Supporters.AsQueryable();
        var total = await query.CountAsync();
        var data = await query.OrderBy(s => s.DisplayName).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
        return Ok(new { total, page, pageSize, data });
    }

    [HttpPost("supporters")]
    [Authorize(Roles = "ExecutiveAdmin,RegionalManager")]
    public async Task<IActionResult> CreateSupporter([FromBody] Supporter supporter)
    {
        _context.Supporters.Add(supporter);
        await _context.SaveChangesAsync();
        return Ok(supporter);
    }

    [HttpPut("supporters/{supporterId:int}")]
    [Authorize(Roles = "ExecutiveAdmin,RegionalManager")]
    public async Task<IActionResult> UpdateSupporter(int supporterId, [FromBody] Supporter request)
    {
        var supporter = await _context.Supporters.FirstOrDefaultAsync(s => s.SupporterId == supporterId);
        if (supporter is null)
        {
            return NotFound();
        }

        supporter.DisplayName = request.DisplayName;
        supporter.SupporterType = request.SupporterType;
        supporter.RelationshipType = request.RelationshipType;
        supporter.Region = request.Region;
        supporter.Country = request.Country;
        supporter.Email = request.Email;
        supporter.Phone = request.Phone;
        supporter.Status = request.Status;
        supporter.AcquisitionChannel = request.AcquisitionChannel;
        await _context.SaveChangesAsync();
        return Ok(supporter);
    }

    [HttpGet("donations")]
    [Authorize(Roles = "ExecutiveAdmin,RegionalManager")]
    public async Task<IActionResult> GetDonations([FromQuery] int page = 1, [FromQuery] int pageSize = 25)
    {
        var query = _context.Donations.AsQueryable();
        var total = await query.CountAsync();
        var data = await query.OrderByDescending(d => d.DonationDate).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
        return Ok(new { total, page, pageSize, data });
    }

    [HttpPost("donations")]
    [Authorize(Roles = "ExecutiveAdmin,RegionalManager,Donor")]
    public async Task<IActionResult> CreateDonation([FromBody] Donation donation)
    {
        _context.Donations.Add(donation);
        await _context.SaveChangesAsync();
        return Ok(donation);
    }

    [HttpPost("donations/{donationId:int}/allocations")]
    [Authorize(Roles = "ExecutiveAdmin,RegionalManager")]
    public async Task<IActionResult> AddAllocation(int donationId, [FromBody] DonationAllocation allocation)
    {
        allocation.DonationId = donationId;
        _context.DonationAllocations.Add(allocation);
        await _context.SaveChangesAsync();
        return Ok(allocation);
    }

    [HttpPost("donations/{donationId:int}/items")]
    [Authorize(Roles = "ExecutiveAdmin,RegionalManager")]
    public async Task<IActionResult> AddInKindItem(int donationId, [FromBody] InKindDonationItem item)
    {
        item.DonationId = donationId;
        _context.InKindDonationItems.Add(item);
        await _context.SaveChangesAsync();
        return Ok(item);
    }

    [HttpGet("impact")]
    [AllowAnonymous]
    public async Task<IActionResult> PublicImpact()
    {
        var snapshots = await _context.PublicImpactSnapshots
            .Where(s => s.IsPublished)
            .OrderByDescending(s => s.SnapshotDate)
            .Take(12)
            .ToListAsync();
        return Ok(snapshots);
    }
}
