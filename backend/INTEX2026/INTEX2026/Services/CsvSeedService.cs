using CsvHelper;
using CsvHelper.Configuration;
using INTEX2026.Data;
using System.Globalization;

namespace INTEX2026.Services;

public class CsvSeedService
{
    public static async Task SeedAsync(BookstoreDbContext db, IConfiguration config)
    {
        var csvPath = config["CsvData:RootPath"];
        if (string.IsNullOrWhiteSpace(csvPath) || !Directory.Exists(csvPath))
        {
            return;
        }

        if (!db.Safehouses.Any())
        {
            await SeedSafehousesAsync(db, csvPath);
        }

        if (!db.Supporters.Any())
        {
            await SeedSupportersAsync(db, csvPath);
        }

        if (!db.Residents.Any())
        {
            await SeedResidentsAsync(db, csvPath);
        }

        if (!db.Partners.Any())
        {
            await SeedPartnersAsync(db, csvPath);
        }

        if (!db.Donations.Any())
        {
            await SeedDonationsAsync(db, csvPath);
        }

        if (!db.ProcessRecordings.Any())
        {
            await SeedCaseTablesAsync(db, csvPath);
        }

        if (!db.PublicImpactSnapshots.Any())
        {
            await SeedPublicSnapshotsAsync(db, csvPath);
        }
    }

    private static CsvReader CreateReader(string path)
    {
        var streamReader = new StreamReader(path);
        return new CsvReader(streamReader, new CsvConfiguration(CultureInfo.InvariantCulture)
        {
            BadDataFound = null,
            MissingFieldFound = null,
            HeaderValidated = null
        });
    }

    private static async Task SeedSafehousesAsync(BookstoreDbContext db, string root)
    {
        var path = Path.Combine(root, "safehouses.csv");
        if (!File.Exists(path))
        {
            return;
        }

        using var csv = CreateReader(path);
        var rows = csv.GetRecords<dynamic>().ToList();
        foreach (var row in rows)
        {
            IDictionary<string, object> data = row;
            db.Safehouses.Add(new Safehouse
            {
                SafehouseId = ToInt(data, "safehouse_id"),
                SafehouseCode = ToString(data, "safehouse_code"),
                Name = ToString(data, "name"),
                Region = ToString(data, "region"),
                City = ToString(data, "city"),
                Province = ToString(data, "province"),
                Country = ToString(data, "country"),
                OpenDate = ToDateOnly(data, "open_date"),
                Status = ToString(data, "status"),
                CapacityGirls = ToInt(data, "capacity_girls"),
                CapacityStaff = ToInt(data, "capacity_staff"),
                CurrentOccupancy = ToInt(data, "current_occupancy"),
                Notes = ToNullableString(data, "notes")
            });
        }

        await db.SaveChangesAsync();
    }

    private static async Task SeedSupportersAsync(BookstoreDbContext db, string root)
    {
        var path = Path.Combine(root, "supporters.csv");
        if (!File.Exists(path))
        {
            return;
        }

        using var csv = CreateReader(path);
        var rows = csv.GetRecords<dynamic>().ToList();
        foreach (var row in rows)
        {
            IDictionary<string, object> data = row;
            db.Supporters.Add(new Supporter
            {
                SupporterId = ToInt(data, "supporter_id"),
                SupporterType = ToString(data, "supporter_type"),
                DisplayName = ToString(data, "display_name"),
                OrganizationName = ToNullableString(data, "organization_name"),
                FirstName = ToNullableString(data, "first_name"),
                LastName = ToNullableString(data, "last_name"),
                RelationshipType = ToString(data, "relationship_type"),
                Region = ToNullableString(data, "region"),
                Country = ToString(data, "country"),
                Email = ToString(data, "email"),
                Phone = ToNullableString(data, "phone"),
                Status = ToString(data, "status"),
                CreatedAt = ToDateTime(data, "created_at") ?? DateTime.UtcNow,
                FirstDonationDate = ToDateOnly(data, "first_donation_date"),
                AcquisitionChannel = ToString(data, "acquisition_channel")
            });
        }

        await db.SaveChangesAsync();
    }

    private static async Task SeedResidentsAsync(BookstoreDbContext db, string root)
    {
        var path = Path.Combine(root, "residents.csv");
        if (!File.Exists(path))
        {
            return;
        }

        using var csv = CreateReader(path);
        var rows = csv.GetRecords<dynamic>().ToList();
        foreach (var row in rows)
        {
            IDictionary<string, object> data = row;
            db.Residents.Add(new Resident
            {
                ResidentId = ToInt(data, "resident_id"),
                CaseControlNo = ToString(data, "case_control_no"),
                InternalCode = ToString(data, "internal_code"),
                SafehouseId = ToInt(data, "safehouse_id"),
                CaseStatus = ToString(data, "case_status"),
                DateOfBirth = ToDateOnly(data, "date_of_birth"),
                CaseCategory = ToString(data, "case_category"),
                AssignedSocialWorker = ToString(data, "assigned_social_worker"),
                ReintegrationType = ToString(data, "reintegration_type"),
                ReintegrationStatus = ToString(data, "reintegration_status"),
                InitialRiskLevel = ToString(data, "initial_risk_level"),
                CurrentRiskLevel = ToString(data, "current_risk_level"),
                DateEnrolled = ToDateOnly(data, "date_enrolled"),
                DateClosed = ToDateOnly(data, "date_closed"),
                CreatedAt = ToDateTime(data, "created_at") ?? DateTime.UtcNow,
                NotesRestricted = ToNullableString(data, "notes_restricted")
            });
        }

        await db.SaveChangesAsync();
    }

    private static async Task SeedDonationsAsync(BookstoreDbContext db, string root)
    {
        var path = Path.Combine(root, "donations.csv");
        if (!File.Exists(path))
        {
            return;
        }

        using var csv = CreateReader(path);
        var rows = csv.GetRecords<dynamic>().ToList();
        foreach (var row in rows)
        {
            IDictionary<string, object> data = row;
            db.Donations.Add(new Donation
            {
                DonationId = ToInt(data, "donation_id"),
                SupporterId = ToInt(data, "supporter_id"),
                DonationType = ToString(data, "donation_type"),
                DonationDate = ToDateOnly(data, "donation_date") ?? DateOnly.FromDateTime(DateTime.UtcNow),
                IsRecurring = ToBool(data, "is_recurring"),
                CampaignName = ToNullableString(data, "campaign_name"),
                ChannelSource = ToString(data, "channel_source"),
                CurrencyCode = ToString(data, "currency_code"),
                Amount = ToDecimalNullable(data, "amount"),
                EstimatedValue = ToDecimalNullable(data, "estimated_value"),
                ImpactUnit = ToNullableString(data, "impact_unit"),
                Notes = ToNullableString(data, "notes"),
                ReferralPostId = ToIntNullable(data, "referral_post_id")
            });
        }

        var allocPath = Path.Combine(root, "donation_allocations.csv");
        if (File.Exists(allocPath))
        {
            using var allocCsv = CreateReader(allocPath);
            var allocRows = allocCsv.GetRecords<dynamic>().ToList();
            foreach (var row in allocRows)
            {
                IDictionary<string, object> data = row;
                db.DonationAllocations.Add(new DonationAllocation
                {
                    AllocationId = ToInt(data, "allocation_id"),
                    DonationId = ToInt(data, "donation_id"),
                    SafehouseId = ToInt(data, "safehouse_id"),
                    ProgramArea = ToString(data, "program_area"),
                    AmountAllocated = ToDecimal(data, "amount_allocated"),
                    AllocationDate = ToDateOnly(data, "allocation_date") ?? DateOnly.FromDateTime(DateTime.UtcNow),
                    AllocationNotes = ToNullableString(data, "allocation_notes")
                });
            }
        }

        var itemPath = Path.Combine(root, "in_kind_donation_items.csv");
        if (File.Exists(itemPath))
        {
            using var itemCsv = CreateReader(itemPath);
            var itemRows = itemCsv.GetRecords<dynamic>().ToList();
            foreach (var row in itemRows)
            {
                IDictionary<string, object> data = row;
                db.InKindDonationItems.Add(new InKindDonationItem
                {
                    ItemId = ToInt(data, "item_id"),
                    DonationId = ToInt(data, "donation_id"),
                    ItemName = ToString(data, "item_name"),
                    ItemCategory = ToString(data, "item_category"),
                    Quantity = ToDecimal(data, "quantity"),
                    UnitOfMeasure = ToString(data, "unit_of_measure"),
                    EstimatedUnitValue = ToDecimal(data, "estimated_unit_value"),
                    IntendedUse = ToString(data, "intended_use"),
                    ReceivedCondition = ToString(data, "received_condition")
                });
            }
        }

        await db.SaveChangesAsync();
    }

    private static async Task SeedPartnersAsync(BookstoreDbContext db, string root)
    {
        var partnerPath = Path.Combine(root, "partners.csv");
        if (File.Exists(partnerPath))
        {
            using var csv = CreateReader(partnerPath);
            var rows = csv.GetRecords<dynamic>().ToList();
            foreach (var row in rows)
            {
                IDictionary<string, object> data = row;
                db.Partners.Add(new Partner
                {
                    PartnerId = ToInt(data, "partner_id"),
                    PartnerName = ToString(data, "partner_name"),
                    PartnerType = ToString(data, "partner_type"),
                    RoleType = ToString(data, "role_type"),
                    ContactName = ToString(data, "contact_name"),
                    Email = ToString(data, "email"),
                    Phone = ToString(data, "phone"),
                    Region = ToString(data, "region"),
                    Status = ToString(data, "status"),
                    StartDate = ToDateOnly(data, "start_date"),
                    EndDate = ToDateOnly(data, "end_date"),
                    Notes = ToNullableString(data, "notes")
                });
            }
        }

        var assignmentPath = Path.Combine(root, "partner_assignments.csv");
        if (File.Exists(assignmentPath))
        {
            using var csv = CreateReader(assignmentPath);
            var rows = csv.GetRecords<dynamic>().ToList();
            foreach (var row in rows)
            {
                IDictionary<string, object> data = row;
                db.PartnerAssignments.Add(new PartnerAssignment
                {
                    AssignmentId = ToInt(data, "assignment_id"),
                    PartnerId = ToInt(data, "partner_id"),
                    SafehouseId = ToInt(data, "safehouse_id"),
                    ProgramArea = ToString(data, "program_area"),
                    AssignmentStart = ToDateOnly(data, "assignment_start"),
                    AssignmentEnd = ToDateOnly(data, "assignment_end"),
                    ResponsibilityNotes = ToNullableString(data, "responsibility_notes"),
                    IsPrimary = ToBool(data, "is_primary"),
                    Status = ToString(data, "status")
                });
            }
        }

        await db.SaveChangesAsync();
    }

    private static async Task SeedCaseTablesAsync(BookstoreDbContext db, string root)
    {
        await SeedProcessRecordingsAsync(db, root);
        await SeedHomeVisitationsAsync(db, root);
        await SeedEducationRecordsAsync(db, root);
        await SeedHealthRecordsAsync(db, root);
        await SeedInterventionPlansAsync(db, root);
        await SeedIncidentReportsAsync(db, root);
        await SeedSocialPostsAsync(db, root);
    }

    private static async Task SeedProcessRecordingsAsync(BookstoreDbContext db, string root)
    {
        var path = Path.Combine(root, "process_recordings.csv");
        if (!File.Exists(path)) return;
        using var csv = CreateReader(path);
        var rows = csv.GetRecords<dynamic>().ToList();
        foreach (var row in rows)
        {
            IDictionary<string, object> data = row;
            db.ProcessRecordings.Add(new ProcessRecording
            {
                RecordingId = ToInt(data, "recording_id"),
                ResidentId = ToInt(data, "resident_id"),
                SessionDate = ToDateOnly(data, "session_date") ?? DateOnly.FromDateTime(DateTime.UtcNow),
                SocialWorker = ToString(data, "social_worker"),
                SessionType = ToString(data, "session_type"),
                SessionDurationMinutes = ToInt(data, "session_duration_minutes"),
                EmotionalStateObserved = ToString(data, "emotional_state_observed"),
                EmotionalStateEnd = ToString(data, "emotional_state_end"),
                SessionNarrative = ToString(data, "session_narrative"),
                InterventionsApplied = ToString(data, "interventions_applied"),
                FollowUpActions = ToString(data, "follow_up_actions"),
                ProgressNoted = ToBool(data, "progress_noted"),
                ConcernsFlagged = ToBool(data, "concerns_flagged"),
                ReferralMade = ToBool(data, "referral_made"),
                NotesRestricted = ToNullableString(data, "notes_restricted")
            });
        }
        await db.SaveChangesAsync();
    }

    private static async Task SeedHomeVisitationsAsync(BookstoreDbContext db, string root)
    {
        var path = Path.Combine(root, "home_visitations.csv");
        if (!File.Exists(path)) return;
        using var csv = CreateReader(path);
        var rows = csv.GetRecords<dynamic>().ToList();
        foreach (var row in rows)
        {
            IDictionary<string, object> data = row;
            db.HomeVisitations.Add(new HomeVisitation
            {
                VisitationId = ToInt(data, "visitation_id"),
                ResidentId = ToInt(data, "resident_id"),
                VisitDate = ToDateOnly(data, "visit_date") ?? DateOnly.FromDateTime(DateTime.UtcNow),
                SocialWorker = ToString(data, "social_worker"),
                VisitType = ToString(data, "visit_type"),
                LocationVisited = ToString(data, "location_visited"),
                FamilyMembersPresent = ToString(data, "family_members_present"),
                Purpose = ToString(data, "purpose"),
                Observations = ToString(data, "observations"),
                FamilyCooperationLevel = ToString(data, "family_cooperation_level"),
                SafetyConcernsNoted = ToBool(data, "safety_concerns_noted"),
                FollowUpNeeded = ToBool(data, "follow_up_needed"),
                FollowUpNotes = ToNullableString(data, "follow_up_notes"),
                VisitOutcome = ToString(data, "visit_outcome")
            });
        }
        await db.SaveChangesAsync();
    }

    private static async Task SeedEducationRecordsAsync(BookstoreDbContext db, string root)
    {
        var path = Path.Combine(root, "education_records.csv");
        if (!File.Exists(path)) return;
        using var csv = CreateReader(path);
        var rows = csv.GetRecords<dynamic>().ToList();
        foreach (var row in rows)
        {
            IDictionary<string, object> data = row;
            db.EducationRecords.Add(new EducationRecord
            {
                EducationRecordId = ToInt(data, "education_record_id"),
                ResidentId = ToInt(data, "resident_id"),
                RecordDate = ToDateOnly(data, "record_date") ?? DateOnly.FromDateTime(DateTime.UtcNow),
                EducationLevel = ToString(data, "education_level"),
                SchoolName = ToString(data, "school_name"),
                EnrollmentStatus = ToString(data, "enrollment_status"),
                AttendanceRate = ToDecimal(data, "attendance_rate"),
                ProgressPercent = ToDecimal(data, "progress_percent"),
                CompletionStatus = ToString(data, "completion_status"),
                Notes = ToNullableString(data, "notes")
            });
        }
        await db.SaveChangesAsync();
    }

    private static async Task SeedHealthRecordsAsync(BookstoreDbContext db, string root)
    {
        var path = Path.Combine(root, "health_wellbeing_records.csv");
        if (!File.Exists(path)) return;
        using var csv = CreateReader(path);
        var rows = csv.GetRecords<dynamic>().ToList();
        foreach (var row in rows)
        {
            IDictionary<string, object> data = row;
            db.HealthWellbeingRecords.Add(new HealthWellbeingRecord
            {
                HealthRecordId = ToInt(data, "health_record_id"),
                ResidentId = ToInt(data, "resident_id"),
                RecordDate = ToDateOnly(data, "record_date") ?? DateOnly.FromDateTime(DateTime.UtcNow),
                GeneralHealthScore = ToDecimal(data, "general_health_score"),
                NutritionScore = ToDecimal(data, "nutrition_score"),
                SleepQualityScore = ToDecimal(data, "sleep_quality_score"),
                EnergyLevelScore = ToDecimal(data, "energy_level_score"),
                HeightCm = ToDecimal(data, "height_cm"),
                WeightKg = ToDecimal(data, "weight_kg"),
                Bmi = ToDecimal(data, "bmi"),
                MedicalCheckupDone = ToBool(data, "medical_checkup_done"),
                DentalCheckupDone = ToBool(data, "dental_checkup_done"),
                PsychologicalCheckupDone = ToBool(data, "psychological_checkup_done"),
                Notes = ToNullableString(data, "notes")
            });
        }
        await db.SaveChangesAsync();
    }

    private static async Task SeedInterventionPlansAsync(BookstoreDbContext db, string root)
    {
        var path = Path.Combine(root, "intervention_plans.csv");
        if (!File.Exists(path)) return;
        using var csv = CreateReader(path);
        var rows = csv.GetRecords<dynamic>().ToList();
        foreach (var row in rows)
        {
            IDictionary<string, object> data = row;
            db.InterventionPlans.Add(new InterventionPlan
            {
                PlanId = ToInt(data, "plan_id"),
                ResidentId = ToInt(data, "resident_id"),
                PlanCategory = ToString(data, "plan_category"),
                PlanDescription = ToString(data, "plan_description"),
                ServicesProvided = ToString(data, "services_provided"),
                TargetValue = ToDecimalNullable(data, "target_value"),
                TargetDate = ToDateOnly(data, "target_date"),
                Status = ToString(data, "status"),
                CaseConferenceDate = ToDateOnly(data, "case_conference_date"),
                CreatedAt = ToDateTime(data, "created_at") ?? DateTime.UtcNow,
                UpdatedAt = ToDateTime(data, "updated_at") ?? DateTime.UtcNow
            });
        }
        await db.SaveChangesAsync();
    }

    private static async Task SeedIncidentReportsAsync(BookstoreDbContext db, string root)
    {
        var path = Path.Combine(root, "incident_reports.csv");
        if (!File.Exists(path)) return;
        using var csv = CreateReader(path);
        var rows = csv.GetRecords<dynamic>().ToList();
        foreach (var row in rows)
        {
            IDictionary<string, object> data = row;
            db.IncidentReports.Add(new IncidentReport
            {
                IncidentId = ToInt(data, "incident_id"),
                ResidentId = ToInt(data, "resident_id"),
                SafehouseId = ToInt(data, "safehouse_id"),
                IncidentDate = ToDateOnly(data, "incident_date") ?? DateOnly.FromDateTime(DateTime.UtcNow),
                IncidentType = ToString(data, "incident_type"),
                Severity = ToString(data, "severity"),
                Description = ToString(data, "description"),
                ResponseTaken = ToString(data, "response_taken"),
                Resolved = ToBool(data, "resolved"),
                ResolutionDate = ToDateOnly(data, "resolution_date"),
                ReportedBy = ToString(data, "reported_by"),
                FollowUpRequired = ToBool(data, "follow_up_required")
            });
        }
        await db.SaveChangesAsync();
    }

    private static async Task SeedSocialPostsAsync(BookstoreDbContext db, string root)
    {
        var path = Path.Combine(root, "social_media_posts.csv");
        if (!File.Exists(path)) return;
        using var csv = CreateReader(path);
        var rows = csv.GetRecords<dynamic>().Take(1000).ToList();
        foreach (var row in rows)
        {
            IDictionary<string, object> data = row;
            db.SocialMediaPosts.Add(new SocialMediaPost
            {
                PostId = ToInt(data, "post_id"),
                Platform = ToString(data, "platform"),
                PlatformPostId = ToString(data, "platform_post_id"),
                PostUrl = ToString(data, "post_url"),
                CreatedAt = ToDateTime(data, "created_at") ?? DateTime.UtcNow,
                CampaignName = ToString(data, "campaign_name"),
                Impressions = ToInt(data, "impressions"),
                Reach = ToInt(data, "reach"),
                Likes = ToInt(data, "likes"),
                Comments = ToInt(data, "comments"),
                Shares = ToInt(data, "shares"),
                ClickThroughs = ToInt(data, "click_throughs"),
                DonationReferrals = ToInt(data, "donation_referrals"),
                EstimatedDonationValuePhp = ToDecimal(data, "estimated_donation_value_php")
            });
        }
        await db.SaveChangesAsync();
    }

    private static async Task SeedPublicSnapshotsAsync(BookstoreDbContext db, string root)
    {
        var snapshotsPath = Path.Combine(root, "public_impact_snapshots.csv");
        if (File.Exists(snapshotsPath))
        {
            using var csv = CreateReader(snapshotsPath);
            var rows = csv.GetRecords<dynamic>().ToList();
            foreach (var row in rows)
            {
                IDictionary<string, object> data = row;
                db.PublicImpactSnapshots.Add(new PublicImpactSnapshot
                {
                    SnapshotId = ToInt(data, "snapshot_id"),
                    SnapshotDate = ToDateOnly(data, "snapshot_date") ?? DateOnly.FromDateTime(DateTime.UtcNow),
                    Headline = ToString(data, "headline"),
                    SummaryText = ToString(data, "summary_text"),
                    MetricPayloadJson = ToString(data, "metric_payload_json"),
                    IsPublished = ToBool(data, "is_published"),
                    PublishedAt = ToDateTime(data, "published_at")
                });
            }
        }

        var metricsPath = Path.Combine(root, "safehouse_monthly_metrics.csv");
        if (File.Exists(metricsPath))
        {
            using var csv = CreateReader(metricsPath);
            var rows = csv.GetRecords<dynamic>().ToList();
            foreach (var row in rows)
            {
                IDictionary<string, object> data = row;
                db.SafehouseMonthlyMetrics.Add(new SafehouseMonthlyMetric
                {
                    MetricId = ToInt(data, "metric_id"),
                    SafehouseId = ToInt(data, "safehouse_id"),
                    MonthStart = ToDateOnly(data, "month_start") ?? DateOnly.FromDateTime(DateTime.UtcNow),
                    MonthEnd = ToDateOnly(data, "month_end") ?? DateOnly.FromDateTime(DateTime.UtcNow),
                    ActiveResidents = ToInt(data, "active_residents"),
                    AvgEducationProgress = ToDecimal(data, "avg_education_progress"),
                    AvgHealthScore = ToDecimal(data, "avg_health_score"),
                    ProcessRecordingCount = ToInt(data, "process_recording_count"),
                    HomeVisitationCount = ToInt(data, "home_visitation_count"),
                    IncidentCount = ToInt(data, "incident_count"),
                    Notes = ToNullableString(data, "notes")
                });
            }
        }

        await db.SaveChangesAsync();
    }

    private static string ToString(IDictionary<string, object> row, string key) =>
        row.TryGetValue(key, out var value) ? Convert.ToString(value)?.Trim() ?? string.Empty : string.Empty;

    private static string? ToNullableString(IDictionary<string, object> row, string key)
    {
        var value = ToString(row, key);
        return string.IsNullOrWhiteSpace(value) ? null : value;
    }

    private static int ToInt(IDictionary<string, object> row, string key) =>
        int.TryParse(ToString(row, key), out var result) ? result : 0;

    private static int? ToIntNullable(IDictionary<string, object> row, string key) =>
        int.TryParse(ToString(row, key), out var result) ? result : null;

    private static decimal ToDecimal(IDictionary<string, object> row, string key) =>
        decimal.TryParse(ToString(row, key), NumberStyles.Any, CultureInfo.InvariantCulture, out var result) ? result : 0m;

    private static decimal? ToDecimalNullable(IDictionary<string, object> row, string key) =>
        decimal.TryParse(ToString(row, key), NumberStyles.Any, CultureInfo.InvariantCulture, out var result) ? result : null;

    private static bool ToBool(IDictionary<string, object> row, string key)
    {
        var raw = ToString(row, key);
        return raw.Equals("true", StringComparison.OrdinalIgnoreCase) ||
               raw.Equals("1", StringComparison.OrdinalIgnoreCase) ||
               raw.Equals("yes", StringComparison.OrdinalIgnoreCase);
    }

    private static DateOnly? ToDateOnly(IDictionary<string, object> row, string key)
    {
        var raw = ToString(row, key);
        if (DateOnly.TryParse(raw, out var d1))
        {
            return d1;
        }
        if (DateTime.TryParse(raw, out var dt))
        {
            return DateOnly.FromDateTime(dt);
        }
        return null;
    }

    private static DateTime? ToDateTime(IDictionary<string, object> row, string key)
    {
        var raw = ToString(row, key);
        return DateTime.TryParse(raw, out var result) ? result : null;
    }
}
