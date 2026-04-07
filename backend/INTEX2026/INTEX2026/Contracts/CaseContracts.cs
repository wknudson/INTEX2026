namespace INTEX2026.Contracts;

public record ResidentStatusUpdateRequest(string CaseStatus);
public record ReintegrationUpdateRequest(string ReintegrationType, string ReintegrationStatus);
public record TodoCreateRequest(string TaskText);
