using System.ComponentModel.DataAnnotations;

namespace INTEX2026.Contracts;

public class RegisterRequest
{
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required, MinLength(12)]
    public string Password { get; set; } = string.Empty;

    [Required]
    public string DisplayName { get; set; } = string.Empty;

    public bool AcceptPrivacyPolicy { get; set; }
}

public class LoginRequest
{
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
}

public class ConsentRequest
{
    public bool Accepted { get; set; }
}

public class CreateAccountRequest
{
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required, MinLength(12)]
    public string Password { get; set; } = string.Empty;

    [Required]
    public string DisplayName { get; set; } = string.Empty;

    [Required]
    public string Role { get; set; } = string.Empty;

    public int? SafehouseId { get; set; }

    // Optional: Link to existing SocialWorker by WorkerCode (e.g., "SW_01")
    public string? WorkerCode { get; set; }
}

public class LinkWorkerRequest
{
    [Required]
    public string WorkerCode { get; set; } = string.Empty;
}

public class MfaCodeRequest
{
    [Required]
    public string Code { get; set; } = string.Empty;
}
