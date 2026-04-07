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
            residents = residents.Where(r => r.CaseStatus != "Closed");

        var totalResidents = await residents.CountAsync();
        var highRisk = await residents.CountAsync(r => r.CurrentRiskLevel == "High" || r.CurrentRiskLevel == "Critical");
        var totalDonations = await _context.Donations.SumAsync(d => d.Amount ?? d.EstimatedValue ?? 0m);
        var activePartners = await _context.Partners.CountAsync(p => p.Status == "Active");

        return Ok(new { totalResidents, highRisk, totalDonations, activePartners });
    }

    [HttpGet("resident-outcomes")]
    public async Task<IActionResult> ResidentOutcomes([FromQuery] bool includeClosedCases = false)
    {
        var residents = await _context.Residents.ToListAsync();
        var active = includeClosedCases ? residents : residents.Where(r => r.CaseStatus != "Closed").ToList();

        var bySafehouse = active
            .GroupBy(r => r.SafehouseId)
            .Select(g => new { safehouseId = g.Key, count = g.Count() })
            .ToList();

        var byCategory = active
            .GroupBy(r => r.CaseCategory)
            .Select(g => new { category = g.Key, count = g.Count() })
            .ToList();

        var byRiskLevel = active
            .GroupBy(r => r.CurrentRiskLevel)
            .Select(g => new { riskLevel = g.Key, count = g.Count() })
            .ToList();

        var activeIds = active.Select(r => r.ResidentId).ToHashSet();

        var eduRecords = await _context.EducationRecords
            .Where(e => activeIds.Contains(e.ResidentId))
            .ToListAsync();
        var eduBySafehouse = eduRecords
            .Join(active, e => e.ResidentId, r => r.ResidentId, (e, r) => new { r.SafehouseId, e.ProgressPercent })
            .GroupBy(x => x.SafehouseId)
            .Select(g => new { safehouseId = g.Key, avgProgress = Math.Round(g.Average(x => (double)x.ProgressPercent), 1) })
            .ToList();

        var healthRecords = await _context.HealthWellbeingRecords
            .Where(h => activeIds.Contains(h.ResidentId))
            .ToListAsync();
        var healthBySafehouse = healthRecords
            .Join(active, h => h.ResidentId, r => r.ResidentId, (h, r) => new { r.SafehouseId, h.GeneralHealthScore })
            .GroupBy(x => x.SafehouseId)
            .Select(g => new { safehouseId = g.Key, avgHealth = Math.Round(g.Average(x => (double)x.GeneralHealthScore), 2) })
            .ToList();

        var reintegration = residents
            .Where(r => r.ReintegrationStatus == "Completed")
            .GroupBy(r => r.ReintegrationType)
            .Select(g => new { type = g.Key, count = g.Count() })
            .ToList();
        var totalForReintegration = residents.Count(r => r.ReintegrationStatus != "Not Started" && !string.IsNullOrEmpty(r.ReintegrationStatus));
        var reintegrationCompletedTotal = residents.Count(r => r.ReintegrationStatus == "Completed");

        var closedByMonth = residents
            .Where(r => r.CaseStatus == "Closed" && r.DateClosed.HasValue)
            .GroupBy(r => new { r.DateClosed!.Value.Year, r.DateClosed!.Value.Month })
            .Select(g => new { year = g.Key.Year, month = g.Key.Month, count = g.Count() })
            .OrderBy(x => x.year).ThenBy(x => x.month)
            .ToList();

        return Ok(new
        {
            totalActive = active.Count,
            bySafehouse,
            byCategory,
            byRiskLevel,
            eduBySafehouse,
            healthBySafehouse,
            reintegration,
            reintegrationCompletedTotal,
            totalForReintegration,
            closedByMonth
        });
    }

    [HttpGet("services-provided")]
    public async Task<IActionResult> ServicesProvided()
    {
        var homeVisitations = await _context.HomeVisitations.ToListAsync();
        var caring = homeVisitations
            .GroupBy(h => h.VisitType)
            .Select(g => new { visitType = g.Key, count = g.Count() })
            .ToList();
        var caringByOutcome = homeVisitations
            .GroupBy(h => h.VisitOutcome)
            .Select(g => new { outcome = g.Key, count = g.Count() })
            .ToList();

        var recordings = await _context.ProcessRecordings.ToListAsync();
        var healingByType = recordings
            .GroupBy(p => p.SessionType)
            .Select(g => new { sessionType = g.Key, count = g.Count() })
            .ToList();

        var positiveStates = new HashSet<string> { "Calm", "Happy", "Hopeful" };
        var negativeStates = new HashSet<string> { "Anxious", "Sad", "Angry", "Withdrawn", "Distressed" };
        var improved = recordings.Count(p =>
            negativeStates.Contains(p.EmotionalStateObserved) && positiveStates.Contains(p.EmotionalStateEnd));
        var totalSessions = recordings.Count;

        var eduRecords = await _context.EducationRecords.ToListAsync();
        var teachingByProgram = eduRecords
            .GroupBy(e => e.ProgramName)
            .Select(g => new { program = string.IsNullOrEmpty(g.Key) ? g.First().SchoolName : g.Key, count = g.Count() })
            .ToList();
        var teachingByCompletion = eduRecords
            .GroupBy(e => e.CompletionStatus)
            .Select(g => new { status = g.Key, count = g.Count() })
            .ToList();

        var referralsMade = recordings.Count(p => p.ReferralMade);
        var legalPlans = await _context.InterventionPlans.CountAsync(p => p.PlanCategory == "Legal");

        return Ok(new
        {
            caring,
            caringByOutcome,
            healingByType,
            emotionalImproved = improved,
            totalSessions,
            emotionalImprovementRate = totalSessions > 0 ? Math.Round((double)improved / totalSessions * 100, 1) : 0,
            teachingByProgram,
            teachingByCompletion,
            referralsMade,
            legalPlans
        });
    }

    [HttpGet("safehouse-comparison")]
    public async Task<IActionResult> SafehouseComparison()
    {
        var safehouses = await _context.Safehouses.ToListAsync();
        var metrics = await _context.SafehouseMonthlyMetrics
            .OrderByDescending(m => m.MonthEnd)
            .ToListAsync();

        var latestByHouse = metrics
            .GroupBy(m => m.SafehouseId)
            .Select(g => g.First())
            .ToList();

        var incidents = await _context.IncidentReports.ToListAsync();
        var incidentBreakdown = incidents
            .GroupBy(i => new { i.SafehouseId, i.IncidentType, i.Severity })
            .Select(g => new { g.Key.SafehouseId, g.Key.IncidentType, g.Key.Severity, count = g.Count() })
            .ToList();

        var occupancy = safehouses.Select(s => new
        {
            s.SafehouseId,
            s.Name,
            s.CurrentOccupancy,
            s.CapacityGirls,
            occupancyRate = s.CapacityGirls > 0
                ? Math.Round((double)s.CurrentOccupancy / s.CapacityGirls * 100, 1)
                : 0
        }).ToList();

        return Ok(new
        {
            latestMetrics = latestByHouse,
            incidentBreakdown,
            occupancy
        });
    }

    [HttpGet("donation-trends")]
    public async Task<IActionResult> DonationTrends()
    {
        var donations = await _context.Donations.ToListAsync();

        var monthlyTotals = donations
            .GroupBy(d => new { d.DonationDate.Year, d.DonationDate.Month })
            .Select(g => new
            {
                year = g.Key.Year,
                month = g.Key.Month,
                total = g.Sum(x => x.Amount ?? x.EstimatedValue ?? 0m),
                count = g.Count()
            })
            .OrderBy(x => x.year).ThenBy(x => x.month)
            .ToList();

        var byType = donations
            .GroupBy(d => d.DonationType)
            .Select(g => new { donationType = g.Key, total = g.Sum(x => x.Amount ?? x.EstimatedValue ?? 0m), count = g.Count() })
            .ToList();

        var byCampaign = donations
            .Where(d => !string.IsNullOrWhiteSpace(d.CampaignName))
            .GroupBy(d => d.CampaignName!)
            .Select(g => new { campaign = g.Key, total = g.Sum(x => x.Amount ?? x.EstimatedValue ?? 0m), count = g.Count() })
            .OrderByDescending(x => x.total)
            .ToList();

        var allocations = await _context.DonationAllocations.ToListAsync();
        var allocationsBySafehouse = allocations
            .GroupBy(a => new { a.SafehouseId, a.ProgramArea })
            .Select(g => new { g.Key.SafehouseId, g.Key.ProgramArea, total = g.Sum(x => x.AmountAllocated) })
            .ToList();

        var recurringCount = donations.Count(d => d.IsRecurring);
        var oneTimeCount = donations.Count(d => !d.IsRecurring);

        var supporters = await _context.Supporters.ToListAsync();
        var newDonorsByMonth = supporters
            .Where(s => s.FirstDonationDate.HasValue)
            .GroupBy(s => new { s.FirstDonationDate!.Value.Year, s.FirstDonationDate!.Value.Month })
            .Select(g => new { year = g.Key.Year, month = g.Key.Month, count = g.Count() })
            .OrderBy(x => x.year).ThenBy(x => x.month)
            .ToList();

        var byChannel = supporters
            .GroupBy(s => s.AcquisitionChannel)
            .Select(g => new { channel = g.Key, count = g.Count() })
            .ToList();

        return Ok(new
        {
            monthlyTotals,
            byType,
            byCampaign,
            allocationsBySafehouse,
            recurringCount,
            oneTimeCount,
            newDonorsByMonth,
            byChannel
        });
    }

    [HttpGet("case-conferences")]
    public async Task<IActionResult> CaseConferences()
    {
        var data = await _context.InterventionPlans
            .Where(p => p.CaseConferenceDate != null)
            .OrderByDescending(p => p.CaseConferenceDate)
            .Take(200)
            .ToListAsync();

        var grouped = data
            .GroupBy(p => new { p.ResidentId, p.CaseConferenceDate })
            .Select(g =>
            {
                var resident = _context.Residents.FirstOrDefault(r => r.ResidentId == g.Key.ResidentId);
                return new
                {
                    g.Key.ResidentId,
                    InternalCode = resident?.InternalCode ?? "",
                    ConferenceDate = g.Key.CaseConferenceDate,
                    PlanCategories = string.Join(", ", g.Select(p => p.PlanCategory).Distinct()),
                    PlanCount = g.Count()
                };
            })
            .OrderByDescending(x => x.ConferenceDate)
            .ToList();

        return Ok(grouped);
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
