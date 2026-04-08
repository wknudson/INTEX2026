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

// Build connection string from environment variables, falling back to appsettings
var pgHost = Environment.GetEnvironmentVariable("PGHOST") ?? builder.Configuration["Database:PGHOST"] ?? "localhost";
var pgPort = Environment.GetEnvironmentVariable("PGPORT") ?? builder.Configuration["Database:PGPORT"] ?? "5432";
var pgDatabase = Environment.GetEnvironmentVariable("PGDATABASE") ?? builder.Configuration["Database:PGDATABASE"] ?? "havyn";
var pgUser = Environment.GetEnvironmentVariable("PGUSER") ?? builder.Configuration["Database:PGUSER"] ?? "postgres";
var pgPassword = Environment.GetEnvironmentVariable("PGPASSWORD") ?? builder.Configuration["Database:PGPASSWORD"] ?? "";

// For development, disable SSL mode; for production, use 'require'
var sslMode = Environment.GetEnvironmentVariable("SSL_MODE") ?? builder.Configuration["Database:SSL_MODE"] ?? "require";
var connectionString = $"Host={pgHost};Port={pgPort};Database={pgDatabase};Username={pgUser};Password={pgPassword};SSL Mode={sslMode};";
builder.Services.AddDbContext<HavynDbContext>(options => options.UseNpgsql(connectionString));

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
    .AddEntityFrameworkStores<HavynDbContext>()
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
                "http://localhost:5173",
                "https://havyn-team0110-backend-gwhwcdbsfhcthbbr.mexicocentral-01.azurewebsites.net")
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
        "connect-src 'self' http://localhost:5173 https://localhost:5173 http://localhost:4000 https://localhost:5000; " +
        "frame-ancestors 'none';";
    await next();
});

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var db = services.GetRequiredService<HavynDbContext>();
    
    // EnsureCreatedAsync creates all tables defined in HavynDbContext
    await db.Database.EnsureCreatedAsync();
    
    // Seed roles and CSV data
    await RoleSeedService.SeedAsync(services);
    await CsvSeedService.SeedAsync(db, builder.Configuration);
}

app.MapGet("/api/auth/claims", (ClaimsPrincipal user) =>
{
    var claims = user.Claims.Select(c => new { c.Type, c.Value });
    return Results.Ok(claims);
}).RequireAuthorization();

app.Run();
