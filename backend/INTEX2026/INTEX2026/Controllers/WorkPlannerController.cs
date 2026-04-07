using INTEX2026.Contracts;
using INTEX2026.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace INTEX2026.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class WorkPlannerController : ControllerBase
{
    private readonly BookstoreDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;

    public WorkPlannerController(BookstoreDbContext context, UserManager<ApplicationUser> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    [HttpGet("appointments")]
    [Authorize(Roles = "ExecutiveAdmin,RegionalManager,SocialWorker")]
    public async Task<IActionResult> GetAppointments([FromQuery] int page = 1, [FromQuery] int pageSize = 25)
    {
        var query = _context.Appointments.AsQueryable();

        if (User.IsInRole("SocialWorker"))
        {
            var user = await _userManager.GetUserAsync(User);
            if (user is null)
            {
                return Unauthorized();
            }

            await EnsureDemoAppointmentsForUserAsync(user);
            query = query.Where(a => a.StaffUserId == user.Id);
        }

        await EnsureSocialWorkerMappingsForAppointmentsAsync(query);

        var validAppointmentsQuery =
            from a in query
            join r in _context.Residents on a.ResidentId equals r.ResidentId
            select a;

        var total = await validAppointmentsQuery.CountAsync();
        var appointments = await validAppointmentsQuery
            .OrderBy(a => a.AppointmentDate)
            .ThenBy(a => a.AppointmentTime)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var residentCodeLookup = await _context.Residents
            .Where(r => appointments.Select(a => a.ResidentId).Contains(r.ResidentId))
            .ToDictionaryAsync(r => r.ResidentId, r => r.InternalCode);

        var socialWorkerLookup = await (
            from link in _context.SocialWorkerUsers
            join worker in _context.SocialWorkers on link.SocialWorkerId equals worker.SocialWorkerId
            where appointments.Select(a => a.StaffUserId).Contains(link.UserId)
            select new { link.UserId, worker.WorkerCode }
        ).ToDictionaryAsync(x => x.UserId, x => x.WorkerCode);

        var data = appointments.Select(a => new
        {
            a.AppointmentId,
            a.ResidentId,
            ResidentInternalCode = residentCodeLookup.TryGetValue(a.ResidentId, out var code) ? code : "",
            SocialWorker = socialWorkerLookup.TryGetValue(a.StaffUserId, out var swCode) ? swCode : "",
            a.EventName,
            a.AppointmentDate,
            a.AppointmentTime,
            a.AppointmentType,
            a.SessionFormat,
            a.Location,
            a.Notes,
            a.Status,
            a.CreatedAt,
            a.UpdatedAt
        });

        return Ok(new { total, page, pageSize, data });
    }

    [HttpPost("appointments")]
    [Authorize(Roles = "ExecutiveAdmin,RegionalManager,SocialWorker")]
    public async Task<IActionResult> AddAppointment([FromBody] Appointment appointment)
    {
        if (appointment.ResidentId <= 0)
        {
            return BadRequest("Resident is required.");
        }

        if (User.IsInRole("SocialWorker"))
        {
            var user = await _userManager.GetUserAsync(User);
            if (user is null)
            {
                return Unauthorized();
            }

            appointment.StaffUserId = user.Id;
        }

        appointment.CreatedAt = DateTime.UtcNow;
        appointment.UpdatedAt = DateTime.UtcNow;
        if (string.IsNullOrWhiteSpace(appointment.Status))
        {
            appointment.Status = "Scheduled";
        }
        if (string.IsNullOrWhiteSpace(appointment.EventName))
        {
            appointment.EventName = appointment.AppointmentType;
        }

        _context.Appointments.Add(appointment);
        await _context.SaveChangesAsync();
        return Ok(appointment);
    }

    [HttpPut("appointments/{appointmentId:int}")]
    [Authorize(Roles = "ExecutiveAdmin,RegionalManager,SocialWorker")]
    public async Task<IActionResult> UpdateAppointment(int appointmentId, [FromBody] AppointmentUpdateRequest request)
    {
        var appointment = await _context.Appointments.FirstOrDefaultAsync(a => a.AppointmentId == appointmentId);
        if (appointment is null)
        {
            return NotFound();
        }

        if (User.IsInRole("SocialWorker"))
        {
            var user = await _userManager.GetUserAsync(User);
            if (user is null)
            {
                return Unauthorized();
            }

            if (appointment.StaffUserId != user.Id)
            {
                return Forbid();
            }
        }

        if (request.ResidentId > 0) appointment.ResidentId = request.ResidentId;
        if (!string.IsNullOrWhiteSpace(request.EventName)) appointment.EventName = request.EventName;
        if (!string.IsNullOrWhiteSpace(request.AppointmentType)) appointment.AppointmentType = request.AppointmentType;
        if (!string.IsNullOrWhiteSpace(request.SessionFormat)) appointment.SessionFormat = request.SessionFormat;
        appointment.Notes = request.Notes;
        if (!string.IsNullOrWhiteSpace(request.Status)) appointment.Status = request.Status;

        if (DateOnly.TryParse(request.AppointmentDate, out var parsedDate))
        {
            appointment.AppointmentDate = parsedDate;
        }
        if (TimeOnly.TryParse(request.AppointmentTime, out var parsedTime))
        {
            appointment.AppointmentTime = parsedTime;
        }

        appointment.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return Ok(appointment);
    }

    [HttpDelete("appointments/{appointmentId:int}")]
    [Authorize(Roles = "ExecutiveAdmin,RegionalManager,SocialWorker")]
    public async Task<IActionResult> DeleteAppointment(int appointmentId)
    {
        var appointment = await _context.Appointments.FirstOrDefaultAsync(a => a.AppointmentId == appointmentId);
        if (appointment is null)
        {
            return NotFound();
        }

        if (User.IsInRole("SocialWorker"))
        {
            var user = await _userManager.GetUserAsync(User);
            if (user is null)
            {
                return Unauthorized();
            }

            if (appointment.StaffUserId != user.Id)
            {
                return Forbid();
            }
        }

        _context.Appointments.Remove(appointment);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("appointments/{appointmentId:int}/complete")]
    [Authorize(Roles = "ExecutiveAdmin,RegionalManager,SocialWorker")]
    public async Task<IActionResult> SetAppointmentComplete(int appointmentId, [FromBody] CompletionUpdateRequest request)
    {
        var appointment = await _context.Appointments.FirstOrDefaultAsync(a => a.AppointmentId == appointmentId);
        if (appointment is null)
        {
            return NotFound();
        }

        if (User.IsInRole("SocialWorker"))
        {
            var user = await _userManager.GetUserAsync(User);
            if (user is null)
            {
                return Unauthorized();
            }

            if (appointment.StaffUserId != user.Id)
            {
                return Forbid();
            }
        }

        appointment.Status = request.Completed ? "Completed" : "Scheduled";
        appointment.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return Ok(appointment);
    }

    [HttpGet("todos")]
    [Authorize(Roles = "SocialWorker")]
    public async Task<IActionResult> GetMyTodos()
    {
        var user = await _userManager.GetUserAsync(User);
        if (user is null)
        {
            return Unauthorized();
        }

        var data = await _context.TodoItems
            .Where(t => t.UserId == user.Id)
            .OrderBy(t => t.IsCompleted)
            .ThenBy(t => t.DisplayOrder)
            .ToListAsync();
        return Ok(data);
    }

    [HttpPost("todos")]
    [Authorize(Roles = "SocialWorker")]
    public async Task<IActionResult> AddTodo([FromBody] TodoCreateRequest request)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user is null)
        {
            return Unauthorized();
        }

        var maxOrder = await _context.TodoItems.Where(t => t.UserId == user.Id).Select(t => (int?)t.DisplayOrder).MaxAsync() ?? 0;
        var todo = new TodoItem
        {
            UserId = user.Id,
            TaskText = request.TaskText,
            DisplayOrder = maxOrder + 1
        };
        _context.TodoItems.Add(todo);
        await _context.SaveChangesAsync();
        return Ok(todo);
    }

    [HttpPost("todos/{todoId:int}/toggle")]
    [Authorize(Roles = "SocialWorker")]
    public async Task<IActionResult> ToggleTodo(int todoId)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user is null)
        {
            return Unauthorized();
        }

        var todo = await _context.TodoItems.FirstOrDefaultAsync(t => t.TodoId == todoId && t.UserId == user.Id);
        if (todo is null)
        {
            return NotFound();
        }

        todo.IsCompleted = !todo.IsCompleted;
        todo.CompletedAt = todo.IsCompleted ? DateTime.UtcNow : null;
        await _context.SaveChangesAsync();
        return Ok(todo);
    }

    [HttpDelete("todos/{todoId:int}")]
    [Authorize(Roles = "SocialWorker")]
    public async Task<IActionResult> DeleteTodo(int todoId)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user is null)
        {
            return Unauthorized();
        }

        var todo = await _context.TodoItems.FirstOrDefaultAsync(t => t.TodoId == todoId && t.UserId == user.Id);
        if (todo is null)
        {
            return NotFound();
        }

        _context.TodoItems.Remove(todo);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("todos/clear-completed")]
    [Authorize(Roles = "SocialWorker")]
    public async Task<IActionResult> ClearCompletedTodos()
    {
        var user = await _userManager.GetUserAsync(User);
        if (user is null)
        {
            return Unauthorized();
        }

        var completedTodos = await _context.TodoItems
            .Where(t => t.UserId == user.Id && t.IsCompleted)
            .ToListAsync();

        if (completedTodos.Count == 0)
        {
            return NoContent();
        }

        _context.TodoItems.RemoveRange(completedTodos);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    private async Task EnsureDemoAppointmentsForUserAsync(ApplicationUser user)
    {
        var hasAppointments = await _context.Appointments.AnyAsync(a => a.StaffUserId == user.Id);
        if (hasAppointments)
        {
            return;
        }

        var residentIds = await _context.Residents
            .OrderBy(r => r.ResidentId)
            .Select(r => r.ResidentId)
            .Take(4)
            .ToListAsync();

        if (residentIds.Count == 0)
        {
            return;
        }

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var monthStart = new DateOnly(today.Year, today.Month, 1);
        var demo = new List<Appointment>
        {
            new()
            {
                StaffUserId = user.Id,
                ResidentId = residentIds[0],
                EventName = "Healing Follow-Up",
                AppointmentDate = monthStart.AddDays(-5),
                AppointmentTime = new TimeOnly(9, 0),
                AppointmentType = "Healing",
                SessionFormat = "Individual",
                Location = "Room A",
                Notes = "Past counseling session",
                Status = "Completed"
            },
            new()
            {
                StaffUserId = user.Id,
                ResidentId = residentIds[Math.Min(1, residentIds.Count - 1)],
                EventName = "Family Support Visit",
                AppointmentDate = monthStart.AddDays(4),
                AppointmentTime = new TimeOnly(10, 30),
                AppointmentType = "Caring",
                SessionFormat = "Individual",
                Location = "Family home visit",
                Notes = "Follow-up visit",
                Status = "Scheduled"
            },
            new()
            {
                StaffUserId = user.Id,
                ResidentId = residentIds[Math.Min(2, residentIds.Count - 1)],
                EventName = "Legal Documentation Review",
                AppointmentDate = monthStart.AddDays(12),
                AppointmentTime = new TimeOnly(13, 0),
                AppointmentType = "Legal Services",
                SessionFormat = "Individual",
                Location = "Partner office",
                Notes = "Documentation review",
                Status = "Scheduled"
            },
            new()
            {
                StaffUserId = user.Id,
                ResidentId = residentIds[Math.Min(3, residentIds.Count - 1)],
                EventName = "Exam Readiness Coaching",
                AppointmentDate = monthStart.AddDays(20),
                AppointmentTime = new TimeOnly(15, 0),
                AppointmentType = "Teaching",
                SessionFormat = "Group",
                Location = "Study room",
                Notes = "Exam prep workshop",
                Status = "Scheduled"
            }
        };

        _context.Appointments.AddRange(demo);
        await _context.SaveChangesAsync();
    }

    private async Task EnsureSocialWorkerMappingsForAppointmentsAsync(IQueryable<Appointment> appointmentQuery)
    {
        var staffUserIds = await appointmentQuery
            .Select(a => a.StaffUserId)
            .Distinct()
            .ToListAsync();

        if (staffUserIds.Count == 0)
        {
            return;
        }

        var linkedUserIds = await _context.SocialWorkerUsers
            .Where(x => staffUserIds.Contains(x.UserId))
            .Select(x => x.UserId)
            .ToListAsync();

        var missingUserIds = staffUserIds.Except(linkedUserIds).ToList();
        if (missingUserIds.Count == 0)
        {
            return;
        }

        foreach (var userId in missingUserIds)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user is null)
            {
                continue;
            }

            var roleNames = await (
                from userRole in _context.UserRoles
                join role in _context.Roles on userRole.RoleId equals role.Id
                where userRole.UserId == userId
                select role.Name
            ).ToListAsync();

            if (!roleNames.Contains("SocialWorker"))
            {
                continue;
            }

            var workerCode = await NextWorkerCodeAsync();
            var worker = new SocialWorker
            {
                WorkerCode = workerCode,
                DisplayName = string.IsNullOrWhiteSpace(user.DisplayName) ? (user.Email ?? workerCode) : user.DisplayName
            };
            _context.SocialWorkers.Add(worker);
            await _context.SaveChangesAsync();

            _context.SocialWorkerUsers.Add(new SocialWorkerUser
            {
                UserId = userId,
                SocialWorkerId = worker.SocialWorkerId
            });
            await _context.SaveChangesAsync();
        }
    }

    private async Task<string> NextWorkerCodeAsync()
    {
        var existingCodes = await _context.SocialWorkers.Select(sw => sw.WorkerCode).ToListAsync();
        var nextNumber = 1;
        while (existingCodes.Contains($"SW_{nextNumber:00}"))
        {
            nextNumber++;
        }

        return $"SW_{nextNumber:00}";
    }

    public class AppointmentUpdateRequest
    {
        public int ResidentId { get; set; }
        public string EventName { get; set; } = string.Empty;
        public string AppointmentDate { get; set; } = string.Empty;
        public string AppointmentTime { get; set; } = string.Empty;
        public string AppointmentType { get; set; } = string.Empty;
        public string SessionFormat { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public string Status { get; set; } = string.Empty;
    }

    public class CompletionUpdateRequest
    {
        public bool Completed { get; set; }
    }
}
