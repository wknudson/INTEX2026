using INTEX2026.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace INTEX2026.Data;

public class HavynDbContext : IdentityDbContext<ApplicationUser>
{
    public HavynDbContext(DbContextOptions<HavynDbContext> options) : base(options)
    {
    }

    // Domain model tables
    public DbSet<Safehouse> Safehouses { get; set; }
    public DbSet<Resident> Residents { get; set; }
    public DbSet<Supporter> Supporters { get; set; }
    public DbSet<Partner> Partners { get; set; }
    public DbSet<SocialWorker> SocialWorkers { get; set; }
    public DbSet<SocialWorkerUser> SocialWorkerUsers { get; set; }

    // Donation-related tables
    public DbSet<Donation> Donations { get; set; }
    public DbSet<InKindDonationItem> InKindDonationItems { get; set; }
    public DbSet<DonationAllocation> DonationAllocations { get; set; }

    // Resident services tables
    public DbSet<Appointment> Appointments { get; set; }
    public DbSet<ProcessRecording> ProcessRecordings { get; set; }
    public DbSet<HomeVisitation> HomeVisitations { get; set; }
    public DbSet<IncidentReport> IncidentReports { get; set; }
    public DbSet<InterventionPlan> InterventionPlans { get; set; }
    public DbSet<EducationRecord> EducationRecords { get; set; }
    public DbSet<HealthWellbeingRecord> HealthWellbeingRecords { get; set; }

    // Partner and Assignment tables
    public DbSet<PartnerAssignment> PartnerAssignments { get; set; }

    // Metrics and Analytics tables
    public DbSet<SafehouseMonthlyMetric> SafehouseMonthlyMetrics { get; set; }
    public DbSet<PublicImpactSnapshot> PublicImpactSnapshots { get; set; }
    public DbSet<SocialMediaPost> SocialMediaPosts { get; set; }

    // User activity tables
    public DbSet<TodoItem> TodoItems { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure ApplicationUser
        modelBuilder.Entity<ApplicationUser>(entity =>
        {
            entity.Property(e => e.DisplayName)
                .HasMaxLength(100)
                .IsRequired();
            entity.Property(e => e.PrivacyPolicyAccepted).HasDefaultValue(false);
            entity.Property(e => e.CookieConsentAccepted).HasDefaultValue(false);
        });

        // Configure Identity tables schema
        modelBuilder.Entity<IdentityRole>(entity =>
        {
            entity.ToTable("AspNetRoles");
        });

        modelBuilder.Entity<IdentityUserRole<string>>(entity =>
        {
            entity.ToTable("AspNetUserRoles");
        });

        modelBuilder.Entity<IdentityUserClaim<string>>(entity =>
        {
            entity.ToTable("AspNetUserClaims");
        });

        modelBuilder.Entity<IdentityUserLogin<string>>(entity =>
        {
            entity.ToTable("AspNetUserLogins");
        });

        modelBuilder.Entity<IdentityRoleClaim<string>>(entity =>
        {
            entity.ToTable("AspNetRoleClaims");
        });

        modelBuilder.Entity<IdentityUserToken<string>>(entity =>
        {
            entity.ToTable("AspNetUserTokens");
        });

        // Configure Safehouse
        modelBuilder.Entity<Safehouse>(entity =>
        {
            entity.HasKey(e => e.SafehouseId);
            entity.Property(e => e.SafehouseCode).HasMaxLength(64).IsRequired();
            entity.Property(e => e.Name).HasMaxLength(150).IsRequired();
            entity.Property(e => e.Region).HasMaxLength(100).IsRequired();
            entity.Property(e => e.City).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Province).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Country).HasMaxLength(100).IsRequired().HasDefaultValue("Philippines");
            entity.Property(e => e.Status).HasMaxLength(32).HasDefaultValue("Active");
        });

        // Configure Resident
        modelBuilder.Entity<Resident>(entity =>
        {
            entity.HasKey(e => e.ResidentId);
            entity.Property(e => e.CaseControlNo).HasMaxLength(64).IsRequired();
            entity.Property(e => e.InternalCode).HasMaxLength(64).IsRequired();
            entity.Property(e => e.CaseStatus).HasMaxLength(32).HasDefaultValue("Active");
            entity.Property(e => e.Sex).HasMaxLength(10).HasDefaultValue("F");
            entity.Property(e => e.BirthStatus).HasMaxLength(32);
            entity.Property(e => e.PlaceOfBirth).HasMaxLength(150);
            entity.Property(e => e.Religion).HasMaxLength(100);
            entity.Property(e => e.CaseCategory).HasMaxLength(64).IsRequired();
            entity.Property(e => e.SubCategories).HasMaxLength(500);
            entity.Property(e => e.PwdType).HasMaxLength(150);
            entity.Property(e => e.SpecialNeedsDiagnosis).HasMaxLength(200);
            entity.Property(e => e.AssignedSocialWorker).HasMaxLength(64).IsRequired();
            entity.Property(e => e.ReferralSource).HasMaxLength(64);
            entity.Property(e => e.ReferringAgency).HasMaxLength(150);
            entity.Property(e => e.InitialCaseAssessment).HasMaxLength(200);
            entity.Property(e => e.ReintegrationType).HasMaxLength(64).HasDefaultValue("None");
            entity.Property(e => e.ReintegrationStatus).HasMaxLength(32).HasDefaultValue("Not Started");
            entity.Property(e => e.InitialRiskLevel).HasMaxLength(32).HasDefaultValue("Medium");
            entity.Property(e => e.CurrentRiskLevel).HasMaxLength(32).HasDefaultValue("Medium");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        // Configure Supporter
        modelBuilder.Entity<Supporter>(entity =>
        {
            entity.HasKey(e => e.SupporterId);
            entity.Property(e => e.SupporterType).HasMaxLength(50).IsRequired();
            entity.Property(e => e.DisplayName).HasMaxLength(150).IsRequired();
            entity.Property(e => e.OrganizationName).HasMaxLength(150);
            entity.Property(e => e.FirstName).HasMaxLength(80);
            entity.Property(e => e.LastName).HasMaxLength(80);
            entity.Property(e => e.RelationshipType).HasMaxLength(50).IsRequired();
            entity.Property(e => e.Region).HasMaxLength(100);
            entity.Property(e => e.Country).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Email).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Phone).HasMaxLength(50);
            entity.Property(e => e.Status).HasMaxLength(20).HasDefaultValue("Active");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.Property(e => e.AcquisitionChannel).HasMaxLength(50).IsRequired();
        });

        // Configure Partner
        modelBuilder.Entity<Partner>(entity =>
        {
            entity.HasKey(e => e.PartnerId);
            entity.Property(e => e.PartnerName).HasMaxLength(150).IsRequired();
            entity.Property(e => e.PartnerType).HasMaxLength(60).IsRequired();
            entity.Property(e => e.RoleType).HasMaxLength(60).IsRequired();
            entity.Property(e => e.ContactName).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Email).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Phone).HasMaxLength(50).IsRequired();
            entity.Property(e => e.Region).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Status).HasMaxLength(20).HasDefaultValue("Active");
        });

        // Configure SocialWorker
        modelBuilder.Entity<SocialWorker>(entity =>
        {
            entity.HasKey(e => e.SocialWorkerId);
            entity.Property(e => e.WorkerCode).HasMaxLength(20).IsRequired();
            entity.Property(e => e.DisplayName).HasMaxLength(100).IsRequired();
        });

        // Configure SocialWorkerUser
        modelBuilder.Entity<SocialWorkerUser>(entity =>
        {
            entity.HasKey(e => e.UserId);
            entity.Property(e => e.UserId).HasMaxLength(450);
        });

        // Configure Donation
        modelBuilder.Entity<Donation>(entity =>
        {
            entity.HasKey(e => e.DonationId);
            entity.Property(e => e.DonationType).HasMaxLength(50).IsRequired();
            entity.Property(e => e.CampaignName).HasMaxLength(150);
            entity.Property(e => e.ChannelSource).HasMaxLength(50).IsRequired();
            entity.Property(e => e.CurrencyCode).HasMaxLength(10).HasDefaultValue("PHP");
            entity.Property(e => e.Amount).HasPrecision(18, 2);
            entity.Property(e => e.EstimatedValue).HasPrecision(18, 2);
            entity.Property(e => e.ImpactUnit).HasMaxLength(50);
        });

        // Configure InKindDonationItem
        modelBuilder.Entity<InKindDonationItem>(entity =>
        {
            entity.HasKey(e => e.ItemId);
            entity.Property(e => e.ItemName).HasMaxLength(120).IsRequired();
            entity.Property(e => e.ItemCategory).HasMaxLength(50).IsRequired();
            entity.Property(e => e.Quantity).HasPrecision(18, 2);
            entity.Property(e => e.UnitOfMeasure).HasMaxLength(30).IsRequired();
            entity.Property(e => e.EstimatedUnitValue).HasPrecision(18, 2);
            entity.Property(e => e.IntendedUse).HasMaxLength(50).IsRequired();
            entity.Property(e => e.ReceivedCondition).HasMaxLength(20).IsRequired();
        });

        // Configure DonationAllocation
        modelBuilder.Entity<DonationAllocation>(entity =>
        {
            entity.HasKey(e => e.AllocationId);
            entity.Property(e => e.ProgramArea).HasMaxLength(50).IsRequired();
            entity.Property(e => e.AmountAllocated).HasPrecision(18, 2);
        });

        // Configure Appointment
        modelBuilder.Entity<Appointment>(entity =>
        {
            entity.HasKey(e => e.AppointmentId);
            entity.Property(e => e.StaffUserId).HasMaxLength(450).IsRequired();
            entity.Property(e => e.EventName).HasMaxLength(150);
            entity.Property(e => e.AppointmentType).HasMaxLength(30).IsRequired();
            entity.Property(e => e.SessionFormat).HasMaxLength(30).IsRequired();
            entity.Property(e => e.Location).HasMaxLength(200);
            entity.Property(e => e.Notes).HasMaxLength(500);
            entity.Property(e => e.Status).HasMaxLength(20).HasDefaultValue("Scheduled");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        // Configure ProcessRecording
        modelBuilder.Entity<ProcessRecording>(entity =>
        {
            entity.HasKey(e => e.RecordingId);
            entity.Property(e => e.SocialWorker).HasMaxLength(120).IsRequired();
            entity.Property(e => e.SessionType).HasMaxLength(32).IsRequired();
            entity.Property(e => e.EmotionalStateObserved).HasMaxLength(32).IsRequired();
            entity.Property(e => e.EmotionalStateEnd).HasMaxLength(32).IsRequired();
        });

        // Configure HomeVisitation
        modelBuilder.Entity<HomeVisitation>(entity =>
        {
            entity.HasKey(e => e.VisitationId);
            entity.Property(e => e.SocialWorker).HasMaxLength(120).IsRequired();
            entity.Property(e => e.VisitType).HasMaxLength(50).IsRequired();
            entity.Property(e => e.LocationVisited).HasMaxLength(200).IsRequired();
            entity.Property(e => e.FamilyCooperationLevel).HasMaxLength(32).IsRequired();
            entity.Property(e => e.VisitOutcome).HasMaxLength(32).IsRequired();
        });

        // Configure IncidentReport
        modelBuilder.Entity<IncidentReport>(entity =>
        {
            entity.HasKey(e => e.IncidentId);
            entity.Property(e => e.IncidentType).HasMaxLength(60).IsRequired();
            entity.Property(e => e.Severity).HasMaxLength(20).HasDefaultValue("Low");
            entity.Property(e => e.ReportedBy).HasMaxLength(120).IsRequired();
        });

        // Configure InterventionPlan
        modelBuilder.Entity<InterventionPlan>(entity =>
        {
            entity.HasKey(e => e.PlanId);
            entity.Property(e => e.PlanCategory).HasMaxLength(50).IsRequired();
            entity.Property(e => e.ServicesProvided).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Status).HasMaxLength(30).HasDefaultValue("Open");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.Property(d => d.TargetValue).HasPrecision(18, 2);
        });

        // Configure EducationRecord
        modelBuilder.Entity<EducationRecord>(entity =>
        {
            entity.HasKey(e => e.EducationRecordId);
            entity.Property(e => e.ProgramName).HasMaxLength(100).IsRequired();
            entity.Property(e => e.CourseName).HasMaxLength(100);
            entity.Property(e => e.EducationLevel).HasMaxLength(50).IsRequired();
            entity.Property(e => e.SchoolName).HasMaxLength(200).IsRequired();
            entity.Property(e => e.EnrollmentStatus).HasMaxLength(50).IsRequired();
            entity.Property(e => e.AttendanceRate).HasPrecision(5, 2);
            entity.Property(e => e.ProgressPercent).HasPrecision(5, 2);
            entity.Property(e => e.CompletionStatus).HasMaxLength(50).IsRequired();
            entity.Property(e => e.GpaLikeScore).HasPrecision(3, 2);
        });

        // Configure HealthWellbeingRecord
        modelBuilder.Entity<HealthWellbeingRecord>(entity =>
        {
            entity.HasKey(e => e.HealthRecordId);
            entity.Property(e => e.GeneralHealthScore).HasPrecision(5, 2);
            entity.Property(e => e.NutritionScore).HasPrecision(5, 2);
            entity.Property(e => e.SleepQualityScore).HasPrecision(5, 2);
            entity.Property(e => e.EnergyLevelScore).HasPrecision(5, 2);
            entity.Property(e => e.HeightCm).HasPrecision(6, 2);
            entity.Property(e => e.WeightKg).HasPrecision(6, 2);
            entity.Property(e => e.Bmi).HasPrecision(5, 2);
        });

        // Configure PartnerAssignment
        modelBuilder.Entity<PartnerAssignment>(entity =>
        {
            entity.HasKey(e => e.AssignmentId);
            entity.Property(e => e.ProgramArea).HasMaxLength(50).IsRequired();
            entity.Property(e => e.Status).HasMaxLength(20).HasDefaultValue("Active");
        });

        // Configure SocialMediaPost
        modelBuilder.Entity<SocialMediaPost>(entity =>
        {
            entity.HasKey(e => e.PostId);
            entity.Property(e => e.Platform).HasMaxLength(50).IsRequired();
            entity.Property(e => e.PlatformPostId).HasMaxLength(100).IsRequired();
            entity.Property(e => e.PostUrl).HasMaxLength(400).IsRequired();
            entity.Property(e => e.CampaignName).HasMaxLength(100).IsRequired();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.Property(e => e.EstimatedDonationValuePhp).HasPrecision(18, 2);
        });

        // Configure SafehouseMonthlyMetric
        modelBuilder.Entity<SafehouseMonthlyMetric>(entity =>
        {
            entity.HasKey(e => e.MetricId);
            entity.Property(e => e.AvgEducationProgress).HasPrecision(5, 2);
            entity.Property(e => e.AvgHealthScore).HasPrecision(5, 2);
        });

        // Configure PublicImpactSnapshot
        modelBuilder.Entity<PublicImpactSnapshot>(entity =>
        {
            entity.HasKey(e => e.SnapshotId);
            entity.Property(e => e.Headline).HasMaxLength(200).IsRequired();
            entity.Property(e => e.MetricPayloadJson).HasDefaultValue("{}");
        });

        // Configure TodoItem
        modelBuilder.Entity<TodoItem>(entity =>
        {
            entity.HasKey(e => e.TodoId);
            entity.Property(e => e.UserId).HasMaxLength(450).IsRequired();
            entity.Property(e => e.TaskText).HasMaxLength(500).IsRequired();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });
    }
}
