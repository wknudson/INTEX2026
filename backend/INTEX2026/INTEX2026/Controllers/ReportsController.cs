using INTEX2026.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text;

namespace INTEX2026.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "ExecutiveAdmin,RegionalManager")]
public class ReportsController : ControllerBase
{
    private readonly BookstoreDbContext _context;

    public ReportsController(BookstoreDbContext context)
    {
        _context = context;
    }

    [HttpGet("overview")]
    public async Task<IActionResult> Overview([FromQuery] bool includeClosedCases = false)
    {
        var residents = _context.Residents.AsQueryable();
        if (!includeClosedCases)
        {
            residents = residents.Where(r => r.CaseStatus != "Closed");
        }

        var totalResidents = await residents.CountAsync();
        var highRisk = await residents.CountAsync(r => r.CurrentRiskLevel == "High" || r.CurrentRiskLevel == "Critical");
        var totalDonations = await _context.Donations.SumAsync(d => d.Amount ?? d.EstimatedValue ?? 0m);
        var activePartners = await _context.Partners.CountAsync(p => p.Status == "Active");

        return Ok(new { totalResidents, highRisk, totalDonations, activePartners });
    }

    [HttpGet("safehouse-comparison")]
    public async Task<IActionResult> SafehouseComparison()
    {
        var data = await _context.SafehouseMonthlyMetrics
            .OrderByDescending(m => m.MonthEnd)
            .Take(100)
            .ToListAsync();
        return Ok(data);
    }

    [HttpGet("donation-trends")]
    public async Task<IActionResult> DonationTrends()
    {
        var data = await _context.Donations
            .GroupBy(d => new { d.DonationDate.Year, d.DonationDate.Month })
            .Select(g => new
            {
                Year = g.Key.Year,
                Month = g.Key.Month,
                Total = g.Sum(x => x.Amount ?? x.EstimatedValue ?? 0m),
                Count = g.Count()
            })
            .OrderBy(x => x.Year)
            .ThenBy(x => x.Month)
            .ToListAsync();
        return Ok(data);
    }

    [HttpGet("export/donations.csv")]
    public async Task<IActionResult> ExportDonationsCsv()
    {
        var rows = await _context.Donations.OrderByDescending(d => d.DonationDate).ToListAsync();
        var csv = new StringBuilder();
        csv.AppendLine("donation_id,supporter_id,donation_type,donation_date,amount,estimated_value,campaign_name");
        foreach (var row in rows)
        {
            csv.AppendLine($"{row.DonationId},{row.SupporterId},{row.DonationType},{row.DonationDate},{row.Amount},{row.EstimatedValue},{Escape(row.CampaignName)}");
        }
        return File(Encoding.UTF8.GetBytes(csv.ToString()), "text/csv", "donations_export.csv");
    }

    private static string Escape(string? text) =>
        string.IsNullOrWhiteSpace(text) ? "" : $"\"{text.Replace("\"", "\"\"")}\"";
}
