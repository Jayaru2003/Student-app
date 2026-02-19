using Microsoft.EntityFrameworkCore;
using StudentInfo.Api.Models;

namespace StudentInfo.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Student> Students => Set<Student>();
}
