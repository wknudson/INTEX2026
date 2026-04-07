using INTEX2026.Data;
using INTEX2026.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? "Data Source=havyn.sqlite";
builder.Services.AddDbContext<BookstoreDbContext>(options => options.UseSqlite(connectionString));

builder.Services
    .AddIdentity<ApplicationUser, IdentityRole>(options =>
    {
        options.Password.RequireDigit = true;
        options.Password.RequireLowercase = true;
        options.Password.RequireUppercase = true;
        options.Password.RequireNonAlphanumeric = true;
        options.Password.RequiredLength = 12;
        options.SignIn.RequireConfirmedAccount = false;
    })
    .AddEntityFrameworkStores<BookstoreDbContext>()
    .AddDefaultTokenProviders();

builder.Services.ConfigureApplicationCookie(options =>
{
    options.Cookie.Name = "havyn.auth";
    options.Cookie.HttpOnly = true;
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
    options.Cookie.SameSite = SameSiteMode.None;
    options.SlidingExpiration = true;
});

builder.Services.AddAuthentication();
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("RequireStaff", p => p.RequireRole("ExecutiveAdmin", "RegionalManager", "SocialWorker"));
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:3000",
                "http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseCors("Frontend");

app.Use(async (context, next) =>
{
    context.Response.Headers["Content-Security-Policy"] =
        "default-src 'self'; " +
        "script-src 'self'; " +
        "style-src 'self'; " +
        "img-src 'self' data:; " +
        "font-src 'self'; " +
        "connect-src 'self' http://localhost:5173 http://localhost:4000; " +
        "frame-ancestors 'none';";
    await next();
});

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var db = services.GetRequiredService<BookstoreDbContext>();
    await db.Database.EnsureCreatedAsync();
    await db.Database.ExecuteSqlRawAsync(@"
        CREATE TABLE IF NOT EXISTS SocialWorkers (
            SocialWorkerId INTEGER PRIMARY KEY AUTOINCREMENT,
            WorkerCode TEXT NOT NULL UNIQUE,
            DisplayName TEXT NOT NULL
        );
    ");
    await db.Database.ExecuteSqlRawAsync(@"
        CREATE TABLE IF NOT EXISTS SocialWorkerUsers (
            UserId TEXT PRIMARY KEY NOT NULL,
            SocialWorkerId INTEGER NOT NULL,
            FOREIGN KEY (SocialWorkerId) REFERENCES SocialWorkers(SocialWorkerId)
        );
    ");
    try
    {
        await db.Database.ExecuteSqlRawAsync("ALTER TABLE Appointments ADD COLUMN EventName TEXT;");
    }
    catch
    {
        // Column already exists.
    }
    await RoleSeedService.SeedAsync(services);
    await CsvSeedService.SeedAsync(db, builder.Configuration);
}

app.MapGet("/api/auth/claims", (ClaimsPrincipal user) =>
{
    var claims = user.Claims.Select(c => new { c.Type, c.Value });
    return Results.Ok(claims);
}).RequireAuthorization();

app.Run();
