using Microsoft.EntityFrameworkCore;
using Mission11_Jorgensen.Data;

var builder = WebApplication.CreateBuilder(args);

// Register core ASP.NET services
builder.Services.AddControllers();
builder.Services.AddOpenApi();

// Configure CORS to allow requests from the React frontend running on localhost:5173
// This is required for development; should be restricted in production
const string AllowFrontendOrigins = "AllowFrontendOrigins";
builder.Services.AddCors(options =>
{
    options.AddPolicy(AllowFrontendOrigins, policy =>
    {
        // Allow the common local development frontend origins and API test origins
        policy.WithOrigins(
                "http://localhost:5173",
                "https://localhost:5173",
                "http://127.0.0.1:5173",
                "https://127.0.0.1:5173",
                "http://localhost:5180",
                "https://localhost:5180"
            )
            .AllowAnyHeader()
            .AllowAnyMethod();

        // For simpler local debugging, uncomment to allow all origins (not for production)
        // policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
    });
});

// Configure Entity Framework Core with SQLite database
// Connection string is read from appsettings.json
builder.Services.AddDbContext<BookstoreDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("BookstoreConnection")));

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// Middleware pipeline setup
app.UseHttpsRedirection();
app.UseAuthorization();
app.UseCors(AllowFrontendOrigins); // Enable CORS for frontend requests

app.MapControllers();

app.Run();
