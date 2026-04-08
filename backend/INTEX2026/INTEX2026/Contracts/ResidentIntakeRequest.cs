namespace INTEX2026.Contracts;

/// <summary>
/// Manager intake payload; subcategory flags are combined into Resident.SubCategories (CSV/seed parity).
/// </summary>
public class ResidentIntakeRequest
{
    public string CaseControlNo { get; set; } = string.Empty;
    public string InternalCode { get; set; } = string.Empty;
    /// <summary>Executive admin only; regional managers have this set from the user record.</summary>
    public int? SafehouseId { get; set; }

    public string Sex { get; set; } = "F";
    public DateOnly? DateOfBirth { get; set; }
    public string? BirthStatus { get; set; }
    public string? PlaceOfBirth { get; set; }
    public string? Religion { get; set; }
    public string CaseCategory { get; set; } = string.Empty;

    public bool SubCatOrphaned { get; set; }
    public bool SubCatTrafficked { get; set; }
    public bool SubCatChildLabor { get; set; }
    public bool SubCatPhysicalAbuse { get; set; }
    public bool SubCatSexualAbuse { get; set; }
    public bool SubCatOsaec { get; set; }
    public bool SubCatCicl { get; set; }
    public bool SubCatAtRisk { get; set; }
    public bool SubCatStreetChild { get; set; }
    public bool SubCatChildWithHiv { get; set; }

    public bool PersonWithDisability { get; set; }
    public string? PwdType { get; set; }
    public bool HasSpecialNeeds { get; set; }
    public string? SpecialNeedsDiagnosis { get; set; }

    public bool Is4PsBeneficiary { get; set; }
    public bool SoloParentHousehold { get; set; }
    public bool IndigenousFamily { get; set; }
    public bool ParentIsPwd { get; set; }
    public bool InformalSettler { get; set; }

    public string AssignedSocialWorker { get; set; } = string.Empty;
    public string? ReferralSource { get; set; }
    public string? ReferringAgency { get; set; }

    public DateOnly? DateColbRegistered { get; set; }
    public DateOnly? DateColbObtained { get; set; }
    public string? InitialCaseAssessment { get; set; }
    public DateOnly? DateCaseStudyPrepared { get; set; }

    public string ReintegrationType { get; set; } = "None";
    public string ReintegrationStatus { get; set; } = "Not Started";
    public string InitialRiskLevel { get; set; } = "Medium";
    public string CurrentRiskLevel { get; set; } = "Medium";

    public DateOnly? DateOfAdmission { get; set; }
    public DateOnly? DateEnrolled { get; set; }

    public string? InitialNotes { get; set; }
    public string? NotesRestricted { get; set; }
}
