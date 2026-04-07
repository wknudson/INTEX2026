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
        var total = await query.CountAsync();
        var data = await query.OrderBy(a => a.AppointmentDate).ThenBy(a => a.AppointmentTime).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
        return Ok(new { total, page, pageSize, data });
    }

    [HttpPost("appointments")]
    [Authorize(Roles = "ExecutiveAdmin,RegionalManager,SocialWorker")]
    public async Task<IActionResult> AddAppointment([FromBody] Appointment appointment)
    {
        appointment.UpdatedAt = DateTime.UtcNow;
        _context.Appointments.Add(appointment);
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
}
