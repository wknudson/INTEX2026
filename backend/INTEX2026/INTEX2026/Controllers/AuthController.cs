using INTEX2026.Contracts;
using INTEX2026.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace INTEX2026.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;

    public AuthController(UserManager<ApplicationUser> userManager, SignInManager<ApplicationUser> signInManager)
    {
        _userManager = userManager;
        _signInManager = signInManager;
    }

    [HttpPost("register-donor")]
    public async Task<IActionResult> RegisterDonor([FromBody] RegisterRequest request)
    {
        if (!request.AcceptPrivacyPolicy)
        {
            return BadRequest("Privacy policy must be accepted.");
        }

        var existing = await _userManager.FindByEmailAsync(request.Email);
        if (existing is not null)
        {
            return Conflict("Account already exists.");
        }

        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            DisplayName = request.DisplayName,
            PrivacyPolicyAccepted = true,
            PrivacyPolicyAcceptedAtUtc = DateTime.UtcNow
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            return BadRequest(result.Errors);
        }

        await _userManager.AddToRoleAsync(user, "Donor");
        return Ok(new { message = "Donor account created." });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user is null)
        {
            return Unauthorized();
        }

        var signIn = await _signInManager.PasswordSignInAsync(user, request.Password, true, false);
        if (!signIn.Succeeded)
        {
            return Unauthorized();
        }

        var roles = await _userManager.GetRolesAsync(user);
        return Ok(new
        {
            user.Id,
            user.Email,
            user.DisplayName,
            Roles = roles,
            user.PrivacyPolicyAccepted,
            user.CookieConsentAccepted
        });
    }

    [Authorize]
    [HttpPost("accept-privacy")]
    public async Task<IActionResult> AcceptPrivacy([FromBody] ConsentRequest request)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user is null)
        {
            return Unauthorized();
        }

        user.PrivacyPolicyAccepted = request.Accepted;
        user.PrivacyPolicyAcceptedAtUtc = request.Accepted ? DateTime.UtcNow : null;
        await _userManager.UpdateAsync(user);
        return Ok();
    }

    [Authorize]
    [HttpPost("accept-cookies")]
    public async Task<IActionResult> AcceptCookies([FromBody] ConsentRequest request)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user is null)
        {
            return Unauthorized();
        }

        user.CookieConsentAccepted = request.Accepted;
        user.CookieConsentAcceptedAtUtc = request.Accepted ? DateTime.UtcNow : null;
        await _userManager.UpdateAsync(user);
        return Ok();
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        var user = await _userManager.GetUserAsync(User);
        if (user is null)
        {
            return Unauthorized();
        }

        var roles = await _userManager.GetRolesAsync(user);
        return Ok(new
        {
            user.Id,
            user.DisplayName,
            user.Email,
            Roles = roles,
            user.PrivacyPolicyAccepted,
            user.CookieConsentAccepted
        });
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await _signInManager.SignOutAsync();
        return Ok();
    }
}
