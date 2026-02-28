using Microsoft.EntityFrameworkCore;
using StudentInfo.Api.Data;

var builder = WebApplication.CreateBuilder(args);

// Controllers + Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// DbContext (Azure SQL Server)
builder.Services.AddDbContext<AppDbContext>(options =>
{
    var conn = builder.Configuration.GetConnectionString("DefaultConnection");
    options.UseSqlServer(conn, sqlOptions =>
    {
        sqlOptions.EnableRetryOnFailure(
            maxRetryCount: 5,
            maxRetryDelay: TimeSpan.FromSeconds(10),
            errorNumbersToAdd: null);
    });
});

// Health check
builder.Services.AddHealthChecks();

var app = builder.Build();

// Auto-apply migrations on startup (with retry for Azure SQL cold-start)
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<AppDbContext>>();
    var retries = 0;
    const int maxRetries = 5;
    while (true)
    {
        try
        {
            db.Database.Migrate();
            logger.LogInformation("Database migration applied successfully.");
            break;
        }
        catch (Exception ex) when (retries < maxRetries)
        {
            retries++;
            logger.LogWarning("Migration attempt {Attempt}/{Max} failed: {Message}. Retrying in 10s...",
                retries, maxRetries, ex.Message);
            Thread.Sleep(TimeSpan.FromSeconds(10));
        }
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.MapControllers();
app.MapHealthChecks("/health");

app.Run();
