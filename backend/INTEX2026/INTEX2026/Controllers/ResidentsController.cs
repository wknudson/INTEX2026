using INTEX2026.Contracts;
using INTEX2026.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace INTEX2026.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "RequireStaff")]
public class ResidentsController : ControllerBase
{
    private readonly BookstoreDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;

    public ResidentsController(BookstoreDbContext context, UserManager<ApplicationUser> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    [HttpGet]
    public async Task<IActionResult> GetResidents(
        [FromQuery] bool includeClosed = false,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 25)
    {
        var query = _context.Residents.AsQueryable();
        if (!includeClosed)
        {
            query = query.Where(r => r.CaseStatus != "Closed");
        }

        var appUser = await _userManager.GetUserAsync(User);
        
        // For Social Workers, filter by assignment
        if (User.IsInRole("SocialWorker") && appUser != null)
        {
            var workerLink = await _context.SocialWorkerUsers
                .FirstOrDefaultAsync(x => x.UserId == appUser.Id);
            if (workerLink != null)
            {
                var sw = await _context.SocialWorkers
                    .FirstOrDefaultAsync(x => x.SocialWorkerId == workerLink.SocialWorkerId);
                if (sw != null)
                {
                    // Filter to residents assigned to this social worker (by DisplayName or WorkerCode)
                    query = query.Where(r => r.AssignedSocialWorker == sw.DisplayName || r.AssignedSocialWorker == sw.WorkerCode);
                }
            }
        }
        // For Regional Managers, filter to their safehouse
        else if (User.IsInRole("RegionalManager") && appUser?.SafehouseId != null)
        {
            query = query.Where(r => r.SafehouseId == appUser.SafehouseId.Value);
        }

        var total = await query.CountAsync();
        var rows = await query
            .OrderBy(r => r.InternalCode)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var data = rows.Select(r => new
        {
            r.ResidentId, r.CaseControlNo, r.InternalCode, r.SafehouseId, r.CaseStatus,
            r.Sex, r.DateOfBirth, r.BirthStatus, r.PlaceOfBirth, r.Religion,
            r.CaseCategory, r.SubCategories, r.PersonWithDisability, r.PwdType,
            r.HasSpecialNeeds, r.SpecialNeedsDiagnosis,
            r.Is4PsBeneficiary, r.SoloParentHousehold, r.IndigenousFamily, r.ParentIsPwd, r.InformalSettler,
            r.AssignedSocialWorker, r.ReferralSource, r.ReferringAgency,
            r.DateColbRegistered, r.DateColbObtained, r.InitialCaseAssessment, r.DateCaseStudyPrepared,
            r.ReintegrationType, r.ReintegrationStatus, r.InitialRiskLevel, r.CurrentRiskLevel,
            r.DateOfAdmission, r.DateEnrolled, r.DateClosed, r.CreatedAt, r.InitialNotes,
            AgeUponAdmission = ComputeAge(r.DateOfBirth, r.DateOfAdmission ?? r.DateEnrolled),
            PresentAge = ComputeAge(r.DateOfBirth, DateOnly.FromDateTime(DateTime.UtcNow)),
            LengthOfStay = ComputeStay(r.DateOfAdmission ?? r.DateEnrolled, r.DateClosed)
        });

        return Ok(new { total, page, pageSize, data });
    }

    [HttpGet("debug/my-assignment")]
    public async Task<IActionResult> GetMyAssignment()
    {
        var appUser = await _userManager.GetUserAsync(User);
        if (appUser == null)
            return Unauthorized(new { error = "User not found" });

        var userRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value ?? "Unknown";
        object? socialWorkerAssignment = null;

        if (User.IsInRole("SocialWorker"))
        {
            var workerLink = await _context.SocialWorkerUsers
                .FirstOrDefaultAsync(x => x.UserId == appUser.Id);
            
            if (workerLink != null)
            {
                var sw = await _context.SocialWorkers
                    .FirstOrDefaultAsync(x => x.SocialWorkerId == workerLink.SocialWorkerId);
                
                if (sw != null)
                {
                    var assignedResidents = await _context.Residents
                        .Where(r => r.CaseStatus != "Closed" && 
                                    (r.AssignedSocialWorker == sw.DisplayName || r.AssignedSocialWorker == sw.WorkerCode))
                        .Select(r => new { r.ResidentId, r.InternalCode, r.AssignedSocialWorker })
                        .ToListAsync();

                    socialWorkerAssignment = new
                    {
                        socialWorkerId = sw.SocialWorkerId,
                        displayName = sw.DisplayName,
                        workerCode = sw.WorkerCode,
                        assignedResidentsCount = assignedResidents.Count,
                        assignedResidents = assignedResidents
                    };
                }
            }
        }

        return Ok(new
        {
            userId = appUser.Id,
            email = appUser.Email,
            userRole = userRole,
            safehouseId = appUser.SafehouseId,
            socialWorkerAssignment = socialWorkerAssignment
        });
    }

    [HttpPost]
    [Authorize(Roles = "ExecutiveAdmin,RegionalManager")]
    public async Task<IActionResult> CreateResident([FromBody] ResidentIntakeRequest request)
    {
        var appUser = await _userManager.GetUserAsync(User);
        if (appUser is null)
            return Unauthorized();

        var caseControl = request.CaseControlNo.Trim();
        var internalCode = request.InternalCode.Trim();
        if (string.IsNullOrEmpty(caseControl) || string.IsNullOrEmpty(internalCode))
            return BadRequest(new { error = "Case control number and internal code are required." });

        int safehouseId;
        if (User.IsInRole("RegionalManager"))
        {
            if (appUser.SafehouseId is not int sh)
                return BadRequest(new { error = "Regional manager account has no safehouse assigned." });
            safehouseId = sh;
        }
        else
        {
            if (request.SafehouseId is null or <= 0)
                return BadRequest(new { error = "SafehouseId is required for this account." });
            var exists = await _context.Safehouses.AnyAsync(s => s.SafehouseId == request.SafehouseId.Value);
            if (!exists)
                return BadRequest(new { error = "Invalid safehouse." });
            safehouseId = request.SafehouseId.Value;
        }

        var sex = string.IsNullOrWhiteSpace(request.Sex) ? "F" : request.Sex.Trim();
        if (sex.Length > 10)
            sex = sex[..10];

        var subCategories = BuildSubCategoriesFromIntake(request);

        var resident = new Resident
        {
            CaseControlNo = caseControl.Length > 64 ? caseControl[..64] : caseControl,
            InternalCode = internalCode.Length > 64 ? internalCode[..64] : internalCode,
            SafehouseId = safehouseId,
            CaseStatus = "Active",
            Sex = sex,
            DateOfBirth = request.DateOfBirth,
            BirthStatus = TruncateNullable(request.BirthStatus, 32),
            PlaceOfBirth = TruncateNullable(request.PlaceOfBirth, 150),
            Religion = TruncateNullable(request.Religion, 100),
            CaseCategory = string.IsNullOrWhiteSpace(request.CaseCategory) ? string.Empty : (request.CaseCategory.Trim().Length > 64 ? request.CaseCategory.Trim()[..64] : request.CaseCategory.Trim()),
            SubCategories = string.IsNullOrEmpty(subCategories) ? null : (subCategories.Length > 500 ? subCategories[..500] : subCategories),
            PersonWithDisability = request.PersonWithDisability,
            PwdType = TruncateNullable(request.PwdType, 150),
            HasSpecialNeeds = request.HasSpecialNeeds,
            SpecialNeedsDiagnosis = TruncateNullable(request.SpecialNeedsDiagnosis, 200),
            Is4PsBeneficiary = request.Is4PsBeneficiary,
            SoloParentHousehold = request.SoloParentHousehold,
            IndigenousFamily = request.IndigenousFamily,
            ParentIsPwd = request.ParentIsPwd,
            InformalSettler = request.InformalSettler,
            AssignedSocialWorker = Truncate(request.AssignedSocialWorker, 64),
            ReferralSource = TruncateNullable(request.ReferralSource, 64),
            ReferringAgency = TruncateNullable(request.ReferringAgency, 150),
            DateColbRegistered = request.DateColbRegistered,
            DateColbObtained = request.DateColbObtained,
            InitialCaseAssessment = TruncateNullable(request.InitialCaseAssessment, 200),
            DateCaseStudyPrepared = request.DateCaseStudyPrepared,
            ReintegrationType = Truncate(request.ReintegrationType, 64),
            ReintegrationStatus = Truncate(request.ReintegrationStatus, 32),
            InitialRiskLevel = Truncate(request.InitialRiskLevel, 32),
            CurrentRiskLevel = Truncate(request.CurrentRiskLevel, 32),
            DateOfAdmission = request.DateOfAdmission,
            DateEnrolled = request.DateEnrolled,
            DateClosed = null,
            CreatedAt = DateTime.UtcNow,
            InitialNotes = request.InitialNotes,
            NotesRestricted = request.NotesRestricted
        };

        _context.Residents.Add(resident);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            resident.ResidentId,
            resident.CaseControlNo,
            resident.InternalCode,
            resident.SafehouseId,
            resident.CaseStatus,
            resident.Sex,
            resident.DateOfBirth,
            resident.BirthStatus,
            resident.PlaceOfBirth,
            resident.Religion,
            resident.CaseCategory,
            resident.SubCategories,
            resident.PersonWithDisability,
            resident.PwdType,
            resident.HasSpecialNeeds,
            resident.SpecialNeedsDiagnosis,
            resident.Is4PsBeneficiary,
            resident.SoloParentHousehold,
            resident.IndigenousFamily,
            resident.ParentIsPwd,
            resident.InformalSettler,
            resident.AssignedSocialWorker,
            resident.ReferralSource,
            resident.ReferringAgency,
            resident.DateColbRegistered,
            resident.DateColbObtained,
            resident.InitialCaseAssessment,
            resident.DateCaseStudyPrepared,
            resident.ReintegrationType,
            resident.ReintegrationStatus,
            resident.InitialRiskLevel,
            resident.CurrentRiskLevel,
            resident.DateOfAdmission,
            resident.DateEnrolled,
            resident.DateClosed,
            resident.CreatedAt,
            resident.InitialNotes,
            resident.NotesRestricted
        });
    }

    private static string BuildSubCategoriesFromIntake(ResidentIntakeRequest r)
    {
        var cats = new List<string>();
        if (r.SubCatOrphaned) cats.Add("Orphaned");
        if (r.SubCatTrafficked) cats.Add("Trafficked");
        if (r.SubCatChildLabor) cats.Add("Child Labor");
        if (r.SubCatPhysicalAbuse) cats.Add("Physical Abuse");
        if (r.SubCatSexualAbuse) cats.Add("Sexual Abuse");
        if (r.SubCatOsaec) cats.Add("OSAEC/CSAEM");
        if (r.SubCatCicl) cats.Add("CICL");
        if (r.SubCatAtRisk) cats.Add("At Risk (CAR)");
        if (r.SubCatStreetChild) cats.Add("Street Child");
        if (r.SubCatChildWithHiv) cats.Add("Child with HIV");
        return string.Join(", ", cats);
    }

    private static string Truncate(string? s, int max)
    {
        if (string.IsNullOrWhiteSpace(s)) return string.Empty;
        var t = s.Trim();
        return t.Length > max ? t[..max] : t;
    }

    private static string? TruncateNullable(string? s, int max)
    {
        if (string.IsNullOrWhiteSpace(s)) return null;
        var t = s.Trim();
        return t.Length > max ? t[..max] : t;
    }

    [HttpGet("{residentId:int}")]
    public async Task<IActionResult> GetResident(int residentId)
    {
        var r = await _context.Residents.FirstOrDefaultAsync(r => r.ResidentId == residentId);
        if (r is null)
            return NotFound();

        var resident = new
        {
            r.ResidentId, r.CaseControlNo, r.InternalCode, r.SafehouseId, r.CaseStatus,
            r.Sex, r.DateOfBirth, r.BirthStatus, r.PlaceOfBirth, r.Religion,
            r.CaseCategory, r.SubCategories, r.PersonWithDisability, r.PwdType,
            r.HasSpecialNeeds, r.SpecialNeedsDiagnosis,
            r.Is4PsBeneficiary, r.SoloParentHousehold, r.IndigenousFamily, r.ParentIsPwd, r.InformalSettler,
            r.AssignedSocialWorker, r.ReferralSource, r.ReferringAgency,
            r.DateColbRegistered, r.DateColbObtained, r.InitialCaseAssessment, r.DateCaseStudyPrepared,
            r.ReintegrationType, r.ReintegrationStatus, r.InitialRiskLevel, r.CurrentRiskLevel,
            r.DateOfAdmission, r.DateEnrolled, r.DateClosed, r.CreatedAt, r.InitialNotes,
            AgeUponAdmission = ComputeAge(r.DateOfBirth, r.DateOfAdmission ?? r.DateEnrolled),
            PresentAge = ComputeAge(r.DateOfBirth, DateOnly.FromDateTime(DateTime.UtcNow)),
            LengthOfStay = ComputeStay(r.DateOfAdmission ?? r.DateEnrolled, r.DateClosed)
        };

        var timeline = new
        {
            ProcessRecordings = await _context.ProcessRecordings.Where(x => x.ResidentId == residentId).OrderByDescending(x => x.SessionDate).Take(25).ToListAsync(),
            HomeVisitations = await _context.HomeVisitations.Where(x => x.ResidentId == residentId).OrderByDescending(x => x.VisitDate).Take(25).ToListAsync(),
            EducationRecords = await _context.EducationRecords.Where(x => x.ResidentId == residentId).OrderByDescending(x => x.RecordDate).Take(25).ToListAsync(),
            HealthRecords = await _context.HealthWellbeingRecords.Where(x => x.ResidentId == residentId).OrderByDescending(x => x.RecordDate).Take(25).ToListAsync(),
            InterventionPlans = await _context.InterventionPlans.Where(x => x.ResidentId == residentId).OrderByDescending(x => x.UpdatedAt).Take(25).ToListAsync(),
            Incidents = await _context.IncidentReports.Where(x => x.ResidentId == residentId).OrderByDescending(x => x.IncidentDate).Take(25).ToListAsync()
        };

        return Ok(new { resident, timeline });
    }

    private static string ComputeAge(DateOnly? dob, DateOnly? referenceDate)
    {
        if (dob == null || referenceDate == null) return "";
        var years = referenceDate.Value.Year - dob.Value.Year;
        var months = referenceDate.Value.Month - dob.Value.Month;
        if (referenceDate.Value.Day < dob.Value.Day) months--;
        if (months < 0) { years--; months += 12; }
        return $"{years} Years {months} months";
    }

    private static string ComputeStay(DateOnly? startDate, DateOnly? endDate)
    {
        if (startDate == null) return "";
        var end = endDate ?? DateOnly.FromDateTime(DateTime.UtcNow);
        var years = end.Year - startDate.Value.Year;
        var months = end.Month - startDate.Value.Month;
        if (end.Day < startDate.Value.Day) months--;
        if (months < 0) { years--; months += 12; }
        return $"{years} Years {months} months";
    }

    [HttpPost("{residentId:int}/close")]
    [Authorize(Roles = "ExecutiveAdmin,RegionalManager")]
    public async Task<IActionResult> CloseCase(int residentId)
    {
        var resident = await _context.Residents.FirstOrDefaultAsync(r => r.ResidentId == residentId);
        if (resident is null)
        {
            return NotFound();
        }

        resident.CaseStatus = "Closed";
        resident.DateClosed = DateOnly.FromDateTime(DateTime.UtcNow);
        await _context.SaveChangesAsync();
        return Ok(resident);
    }

    [HttpPost("{residentId:int}/reopen")]
    [Authorize(Roles = "ExecutiveAdmin,RegionalManager")]
    public async Task<IActionResult> ReopenCase(int residentId)
    {
        var resident = await _context.Residents.FirstOrDefaultAsync(r => r.ResidentId == residentId);
        if (resident is null)
        {
            return NotFound();
        }

        resident.CaseStatus = "Active";
        resident.DateClosed = null;
        await _context.SaveChangesAsync();
        return Ok(resident);
    }

    [HttpPut("{residentId:int}/reintegration")]
    [Authorize(Roles = "ExecutiveAdmin,RegionalManager")]
    public async Task<IActionResult> UpdateReintegration(int residentId, [FromBody] ReintegrationUpdateRequest request)
    {
        var resident = await _context.Residents.FirstOrDefaultAsync(r => r.ResidentId == residentId);
        if (resident is null)
        {
            return NotFound();
        }

        resident.ReintegrationType = request.ReintegrationType;
        resident.ReintegrationStatus = request.ReintegrationStatus;
        await _context.SaveChangesAsync();
        return Ok(resident);
    }
}
