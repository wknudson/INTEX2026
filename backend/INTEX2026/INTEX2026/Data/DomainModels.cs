using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace INTEX2026.Data;

public class ApplicationUser : IdentityUser
{
    [MaxLength(100)]
    public string DisplayName { get; set; } = string.Empty;
    public bool PrivacyPolicyAccepted { get; set; }
    public bool CookieConsentAccepted { get; set; }
    public DateTime? PrivacyPolicyAcceptedAtUtc { get; set; }
    public DateTime? CookieConsentAcceptedAtUtc { get; set; }
}

public class Safehouse
{
    [Key]
    public int SafehouseId { get; set; }
    [MaxLength(64)] public string SafehouseCode { get; set; } = string.Empty;
    [MaxLength(150)] public string Name { get; set; } = string.Empty;
    [MaxLength(100)] public string Region { get; set; } = string.Empty;
    [MaxLength(100)] public string City { get; set; } = string.Empty;
    [MaxLength(100)] public string Province { get; set; } = string.Empty;
    [MaxLength(100)] public string Country { get; set; } = "Philippines";
    public DateOnly? OpenDate { get; set; }
    [MaxLength(32)] public string Status { get; set; } = "Active";
    public int CapacityGirls { get; set; }
    public int CapacityStaff { get; set; }
    public int CurrentOccupancy { get; set; }
    public string? Notes { get; set; }
}

public class Resident
{
    [Key]
    public int ResidentId { get; set; }
    [MaxLength(64)] public string CaseControlNo { get; set; } = string.Empty;
    [MaxLength(64)] public string InternalCode { get; set; } = string.Empty;
    public int SafehouseId { get; set; }
    [MaxLength(32)] public string CaseStatus { get; set; } = "Active";
    public DateOnly? DateOfBirth { get; set; }
    [MaxLength(64)] public string CaseCategory { get; set; } = string.Empty;
    [MaxLength(64)] public string AssignedSocialWorker { get; set; } = string.Empty;
    [MaxLength(64)] public string ReintegrationType { get; set; } = "None";
    [MaxLength(32)] public string ReintegrationStatus { get; set; } = "Not Started";
    [MaxLength(32)] public string InitialRiskLevel { get; set; } = "Medium";
    [MaxLength(32)] public string CurrentRiskLevel { get; set; } = "Medium";
    public DateOnly? DateEnrolled { get; set; }
    public DateOnly? DateClosed { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? NotesRestricted { get; set; }
}

public class ProcessRecording
{
    [Key] public int RecordingId { get; set; }
    public int ResidentId { get; set; }
    public DateOnly SessionDate { get; set; }
    [MaxLength(120)] public string SocialWorker { get; set; } = string.Empty;
    [MaxLength(32)] public string SessionType { get; set; } = string.Empty;
    public int SessionDurationMinutes { get; set; }
    [MaxLength(32)] public string EmotionalStateObserved { get; set; } = string.Empty;
    [MaxLength(32)] public string EmotionalStateEnd { get; set; } = string.Empty;
    public string SessionNarrative { get; set; } = string.Empty;
    public string InterventionsApplied { get; set; } = string.Empty;
    public string FollowUpActions { get; set; } = string.Empty;
    public bool ProgressNoted { get; set; }
    public bool ConcernsFlagged { get; set; }
    public bool ReferralMade { get; set; }
    public string? NotesRestricted { get; set; }
}

public class HomeVisitation
{
    [Key] public int VisitationId { get; set; }
    public int ResidentId { get; set; }
    public DateOnly VisitDate { get; set; }
    [MaxLength(120)] public string SocialWorker { get; set; } = string.Empty;
    [MaxLength(50)] public string VisitType { get; set; } = string.Empty;
    [MaxLength(200)] public string LocationVisited { get; set; } = string.Empty;
    public string FamilyMembersPresent { get; set; } = string.Empty;
    public string Purpose { get; set; } = string.Empty;
    public string Observations { get; set; } = string.Empty;
    [MaxLength(32)] public string FamilyCooperationLevel { get; set; } = string.Empty;
    public bool SafetyConcernsNoted { get; set; }
    public bool FollowUpNeeded { get; set; }
    public string? FollowUpNotes { get; set; }
    [MaxLength(32)] public string VisitOutcome { get; set; } = string.Empty;
}

public class EducationRecord
{
    [Key] public int EducationRecordId { get; set; }
    public int ResidentId { get; set; }
    public DateOnly RecordDate { get; set; }
    [MaxLength(50)] public string EducationLevel { get; set; } = string.Empty;
    [MaxLength(200)] public string SchoolName { get; set; } = string.Empty;
    [MaxLength(50)] public string EnrollmentStatus { get; set; } = string.Empty;
    public decimal AttendanceRate { get; set; }
    public decimal ProgressPercent { get; set; }
    [MaxLength(50)] public string CompletionStatus { get; set; } = string.Empty;
    public string? Notes { get; set; }
}

public class HealthWellbeingRecord
{
    [Key] public int HealthRecordId { get; set; }
    public int ResidentId { get; set; }
    public DateOnly RecordDate { get; set; }
    public decimal GeneralHealthScore { get; set; }
    public decimal NutritionScore { get; set; }
    public decimal SleepQualityScore { get; set; }
    public decimal EnergyLevelScore { get; set; }
    public decimal HeightCm { get; set; }
    public decimal WeightKg { get; set; }
    public decimal Bmi { get; set; }
    public bool MedicalCheckupDone { get; set; }
    public bool DentalCheckupDone { get; set; }
    public bool PsychologicalCheckupDone { get; set; }
    public string? Notes { get; set; }
}

public class InterventionPlan
{
    [Key] public int PlanId { get; set; }
    public int ResidentId { get; set; }
    [MaxLength(50)] public string PlanCategory { get; set; } = string.Empty;
    public string PlanDescription { get; set; } = string.Empty;
    [MaxLength(100)] public string ServicesProvided { get; set; } = string.Empty;
    public decimal? TargetValue { get; set; }
    public DateOnly? TargetDate { get; set; }
    [MaxLength(30)] public string Status { get; set; } = "Open";
    public DateOnly? CaseConferenceDate { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class IncidentReport
{
    [Key] public int IncidentId { get; set; }
    public int ResidentId { get; set; }
    public int SafehouseId { get; set; }
    public DateOnly IncidentDate { get; set; }
    [MaxLength(60)] public string IncidentType { get; set; } = string.Empty;
    [MaxLength(20)] public string Severity { get; set; } = "Low";
    public string Description { get; set; } = string.Empty;
    public string ResponseTaken { get; set; } = string.Empty;
    public bool Resolved { get; set; }
    public DateOnly? ResolutionDate { get; set; }
    [MaxLength(120)] public string ReportedBy { get; set; } = string.Empty;
    public bool FollowUpRequired { get; set; }
}

public class Supporter
{
    [Key] public int SupporterId { get; set; }
    [MaxLength(50)] public string SupporterType { get; set; } = string.Empty;
    [MaxLength(150)] public string DisplayName { get; set; } = string.Empty;
    [MaxLength(150)] public string? OrganizationName { get; set; }
    [MaxLength(80)] public string? FirstName { get; set; }
    [MaxLength(80)] public string? LastName { get; set; }
    [MaxLength(50)] public string RelationshipType { get; set; } = string.Empty;
    [MaxLength(100)] public string? Region { get; set; }
    [MaxLength(100)] public string Country { get; set; } = string.Empty;
    [MaxLength(200)] public string Email { get; set; } = string.Empty;
    [MaxLength(50)] public string? Phone { get; set; }
    [MaxLength(20)] public string Status { get; set; } = "Active";
    public DateTime CreatedAt { get; set; }
    public DateOnly? FirstDonationDate { get; set; }
    [MaxLength(50)] public string AcquisitionChannel { get; set; } = string.Empty;
}

public class Donation
{
    [Key] public int DonationId { get; set; }
    public int SupporterId { get; set; }
    [MaxLength(50)] public string DonationType { get; set; } = string.Empty;
    public DateOnly DonationDate { get; set; }
    public bool IsRecurring { get; set; }
    [MaxLength(150)] public string? CampaignName { get; set; }
    [MaxLength(50)] public string ChannelSource { get; set; } = string.Empty;
    [MaxLength(10)] public string CurrencyCode { get; set; } = "PHP";
    public decimal? Amount { get; set; }
    public decimal? EstimatedValue { get; set; }
    [MaxLength(50)] public string? ImpactUnit { get; set; }
    public string? Notes { get; set; }
    public int? ReferralPostId { get; set; }
}

public class InKindDonationItem
{
    [Key] public int ItemId { get; set; }
    public int DonationId { get; set; }
    [MaxLength(120)] public string ItemName { get; set; } = string.Empty;
    [MaxLength(50)] public string ItemCategory { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    [MaxLength(30)] public string UnitOfMeasure { get; set; } = string.Empty;
    public decimal EstimatedUnitValue { get; set; }
    [MaxLength(50)] public string IntendedUse { get; set; } = string.Empty;
    [MaxLength(20)] public string ReceivedCondition { get; set; } = string.Empty;
}

public class DonationAllocation
{
    [Key] public int AllocationId { get; set; }
    public int DonationId { get; set; }
    public int SafehouseId { get; set; }
    [MaxLength(50)] public string ProgramArea { get; set; } = string.Empty;
    public decimal AmountAllocated { get; set; }
    public DateOnly AllocationDate { get; set; }
    public string? AllocationNotes { get; set; }
}

public class Partner
{
    [Key] public int PartnerId { get; set; }
    [MaxLength(150)] public string PartnerName { get; set; } = string.Empty;
    [MaxLength(60)] public string PartnerType { get; set; } = string.Empty;
    [MaxLength(60)] public string RoleType { get; set; } = string.Empty;
    [MaxLength(100)] public string ContactName { get; set; } = string.Empty;
    [MaxLength(200)] public string Email { get; set; } = string.Empty;
    [MaxLength(50)] public string Phone { get; set; } = string.Empty;
    [MaxLength(100)] public string Region { get; set; } = string.Empty;
    [MaxLength(20)] public string Status { get; set; } = "Active";
    public DateOnly? StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public string? Notes { get; set; }
}

public class PartnerAssignment
{
    [Key] public int AssignmentId { get; set; }
    public int PartnerId { get; set; }
    public int SafehouseId { get; set; }
    [MaxLength(50)] public string ProgramArea { get; set; } = string.Empty;
    public DateOnly? AssignmentStart { get; set; }
    public DateOnly? AssignmentEnd { get; set; }
    public string? ResponsibilityNotes { get; set; }
    public bool IsPrimary { get; set; }
    [MaxLength(20)] public string Status { get; set; } = "Active";
}

public class SocialMediaPost
{
    [Key] public int PostId { get; set; }
    [MaxLength(50)] public string Platform { get; set; } = string.Empty;
    [MaxLength(100)] public string PlatformPostId { get; set; } = string.Empty;
    [MaxLength(400)] public string PostUrl { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    [MaxLength(100)] public string CampaignName { get; set; } = string.Empty;
    public int Impressions { get; set; }
    public int Reach { get; set; }
    public int Likes { get; set; }
    public int Comments { get; set; }
    public int Shares { get; set; }
    public int ClickThroughs { get; set; }
    public int DonationReferrals { get; set; }
    public decimal EstimatedDonationValuePhp { get; set; }
}

public class SafehouseMonthlyMetric
{
    [Key] public int MetricId { get; set; }
    public int SafehouseId { get; set; }
    public DateOnly MonthStart { get; set; }
    public DateOnly MonthEnd { get; set; }
    public int ActiveResidents { get; set; }
    public decimal AvgEducationProgress { get; set; }
    public decimal AvgHealthScore { get; set; }
    public int ProcessRecordingCount { get; set; }
    public int HomeVisitationCount { get; set; }
    public int IncidentCount { get; set; }
    public string? Notes { get; set; }
}

public class PublicImpactSnapshot
{
    [Key] public int SnapshotId { get; set; }
    public DateOnly SnapshotDate { get; set; }
    [MaxLength(200)] public string Headline { get; set; } = string.Empty;
    public string SummaryText { get; set; } = string.Empty;
    public string MetricPayloadJson { get; set; } = "{}";
    public bool IsPublished { get; set; }
    public DateTime? PublishedAt { get; set; }
}

public class Appointment
{
    [Key] public int AppointmentId { get; set; }
    public string StaffUserId { get; set; } = string.Empty;
    public int ResidentId { get; set; }
    public DateOnly AppointmentDate { get; set; }
    public TimeOnly AppointmentTime { get; set; }
    [MaxLength(30)] public string AppointmentType { get; set; } = string.Empty;
    [MaxLength(30)] public string SessionFormat { get; set; } = string.Empty;
    [MaxLength(200)] public string? Location { get; set; }
    [MaxLength(500)] public string? Notes { get; set; }
    [MaxLength(20)] public string Status { get; set; } = "Scheduled";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class TodoItem
{
    [Key] public int TodoId { get; set; }
    public string UserId { get; set; } = string.Empty;
    [MaxLength(500)] public string TaskText { get; set; } = string.Empty;
    public bool IsCompleted { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
    public int DisplayOrder { get; set; }
}
