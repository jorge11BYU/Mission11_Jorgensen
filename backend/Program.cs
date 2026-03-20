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
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
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
