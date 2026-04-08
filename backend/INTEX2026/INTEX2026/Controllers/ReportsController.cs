using INTEX2026.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text;

namespace INTEX2026.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "ExecutiveAdmin,RegionalManager,SocialWorker")]
public class ReportsController : ControllerBase
{
    private readonly HavynDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;

    public ReportsController(HavynDbContext context, UserManager<ApplicationUser> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    private async Task<HashSet<int>?> GetScopedResidentIds()
    {
        var appUser = await _userManager.GetUserAsync(User);
        if (appUser == null) return new HashSet<int>();

        var roles = await _userManager.GetRolesAsync(appUser);

        if (roles.Contains("ExecutiveAdmin"))
            return null; // null means no filter — see everything

        if (roles.Contains("RegionalManager"))
        {
            if (appUser.SafehouseId == null)
                return new HashSet<int>();
            var ids = await _context.Residents
                .Where(r => r.SafehouseId == appUser.SafehouseId.Value)
                .Select(r => r.ResidentId)
                .ToListAsync();
            return ids.ToHashSet();
        }

        if (roles.Contains("SocialWorker"))
        {
            var link = await _context.SocialWorkerUsers
                .FirstOrDefaultAsync(x => x.UserId == appUser.Id);
            if (link == null)
                return new HashSet<int>();
            var sw = await _context.SocialWorkers
                .FirstOrDefaultAsync(x => x.SocialWorkerId == link.SocialWorkerId);
            if (sw == null)
                return new HashSet<int>();
            var ids = await _context.Residents
                .Where(r => r.AssignedSocialWorker == sw.WorkerCode
                          || r.AssignedSocialWorker == sw.DisplayName)
                .Select(r => r.ResidentId)
                .ToListAsync();
            return ids.ToHashSet();
        }

        return new HashSet<int>();
    }

    private async Task<int?> GetScopedSafehouseId()
    {
        var appUser = await _userManager.GetUserAsync(User);
        if (appUser == null) return -1;
        var roles = await _userManager.GetRolesAsync(appUser);
        if (roles.Contains("ExecutiveAdmin")) return null; // null = all safehouses
        if (roles.Contains("RegionalManager")) return appUser.SafehouseId ?? -1;
        return -1; // workers don't get safehouse-level reports
    }

    private async Task<HashSet<int>?> GetScopedDonationIds()
    {
        var scopedSafehouseId = await GetScopedSafehouseId();
        if (scopedSafehouseId == null) return null; // admin sees all
        if (scopedSafehouseId == -1) return new HashSet<int>(); // no safehouse assigned
        var donationIds = await _context.DonationAllocations
            .Where(a => a.SafehouseId == scopedSafehouseId.Value)
            .Select(a => a.DonationId)
            .Distinct()
            .ToListAsync();
        return donationIds.ToHashSet();
    }

    [HttpGet("overview")]
    public async Task<IActionResult> Overview([FromQuery] bool includeClosedCases = false)
    {
        var scopedIds = await GetScopedResidentIds();

        var residentsQ = _context.Residents.AsQueryable();
        if (scopedIds != null)
            residentsQ = residentsQ.Where(r => scopedIds.Contains(r.ResidentId));
        if (!includeClosedCases)
            residentsQ = residentsQ.Where(r => r.CaseStatus != "Closed");

        var totalResidents = await residentsQ.CountAsync();
        var highRisk = await residentsQ.CountAsync(r => r.CurrentRiskLevel == "High" || r.CurrentRiskLevel == "Critical");

        var scopedDonationIds = await GetScopedDonationIds();
        var donationsQ = _context.Donations.AsQueryable();
        if (scopedDonationIds != null)
            donationsQ = donationsQ.Where(d => scopedDonationIds.Contains(d.DonationId));
        var totalDonations = await donationsQ.SumAsync(d => d.Amount ?? d.EstimatedValue ?? 0m);
        var activePartners = await _context.Partners.CountAsync(p => p.Status == "Active");

        return Ok(new { totalResidents, highRisk, totalDonations, activePartners });
    }

    [HttpGet("resident-outcomes")]
    public async Task<IActionResult> ResidentOutcomes([FromQuery] bool includeClosedCases = false)
    {
        var scopedIds = await GetScopedResidentIds();

        var allResidents = await _context.Residents.ToListAsync();
        if (scopedIds != null)
            allResidents = allResidents.Where(r => scopedIds.Contains(r.ResidentId)).ToList();

        var active = includeClosedCases ? allResidents : allResidents.Where(r => r.CaseStatus != "Closed").ToList();

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

        var reintegration = allResidents
            .Where(r => r.ReintegrationStatus == "Completed")
            .GroupBy(r => r.ReintegrationType)
            .Select(g => new { type = g.Key, count = g.Count() })
            .ToList();
        var totalForReintegration = allResidents.Count(r => r.ReintegrationStatus != "Not Started" && !string.IsNullOrEmpty(r.ReintegrationStatus));
        var reintegrationCompletedTotal = allResidents.Count(r => r.ReintegrationStatus == "Completed");

        var closedByMonth = allResidents
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
        var scopedIds = await GetScopedResidentIds();

        var homeVisitations = await _context.HomeVisitations.ToListAsync();
        if (scopedIds != null)
            homeVisitations = homeVisitations.Where(h => scopedIds.Contains(h.ResidentId)).ToList();

        var caring = homeVisitations
            .GroupBy(h => h.VisitType)
            .Select(g => new { visitType = g.Key, count = g.Count() })
            .ToList();
        var caringByOutcome = homeVisitations
            .GroupBy(h => h.VisitOutcome)
            .Select(g => new { outcome = g.Key, count = g.Count() })
            .ToList();

        var recordings = await _context.ProcessRecordings.ToListAsync();
        if (scopedIds != null)
            recordings = recordings.Where(p => scopedIds.Contains(p.ResidentId)).ToList();

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
        if (scopedIds != null)
            eduRecords = eduRecords.Where(e => scopedIds.Contains(e.ResidentId)).ToList();

        var teachingByProgram = eduRecords
            .GroupBy(e => e.ProgramName)
            .Select(g => new { program = string.IsNullOrEmpty(g.Key) ? g.First().SchoolName : g.Key, count = g.Count() })
            .ToList();
        var teachingByCompletion = eduRecords
            .GroupBy(e => e.CompletionStatus)
            .Select(g => new { status = g.Key, count = g.Count() })
            .ToList();

        var referralsMade = recordings.Count(p => p.ReferralMade);

        var interventionPlans = await _context.InterventionPlans.ToListAsync();
        if (scopedIds != null)
            interventionPlans = interventionPlans.Where(p => scopedIds.Contains(p.ResidentId)).ToList();
        var legalPlans = interventionPlans.Count(p => p.PlanCategory == "Legal");

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
        var scopedSafehouseId = await GetScopedSafehouseId();

        var safehousesQ = _context.Safehouses.AsQueryable();
        var metricsQ = _context.SafehouseMonthlyMetrics.AsQueryable();
        var incidentsQ = _context.IncidentReports.AsQueryable();

        if (scopedSafehouseId.HasValue)
        {
            var shId = scopedSafehouseId.Value;
            safehousesQ = safehousesQ.Where(s => s.SafehouseId == shId);
            metricsQ = metricsQ.Where(m => m.SafehouseId == shId);
            incidentsQ = incidentsQ.Where(i => i.SafehouseId == shId);
        }

        var safehouses = await safehousesQ.ToListAsync();
        var metrics = await metricsQ.OrderByDescending(m => m.MonthEnd).ToListAsync();

        var latestByHouse = metrics
            .GroupBy(m => m.SafehouseId)
            .Select(g => g.First())
            .ToList();

        var incidents = await incidentsQ.ToListAsync();
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
        var scopedSafehouseId = await GetScopedSafehouseId();
        var scopedDonationIds = await GetScopedDonationIds();

        var donations = await _context.Donations.ToListAsync();
        if (scopedDonationIds != null)
            donations = donations.Where(d => scopedDonationIds.Contains(d.DonationId)).ToList();

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

        var allocationsQ = _context.DonationAllocations.AsQueryable();
        if (scopedSafehouseId.HasValue)
            allocationsQ = allocationsQ.Where(a => a.SafehouseId == scopedSafehouseId.Value);
        var allocations = await allocationsQ.ToListAsync();
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
        var scopedIds = await GetScopedResidentIds();

        var query = _context.InterventionPlans
            .Where(p => p.CaseConferenceDate != null)
            .OrderByDescending(p => p.CaseConferenceDate);

        var data = await query.Take(200).ToListAsync();
        if (scopedIds != null)
            data = data.Where(p => scopedIds.Contains(p.ResidentId)).ToList();

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
