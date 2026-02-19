using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentInfo.Api.Data;
using StudentInfo.Api.Dtos;
using StudentInfo.Api.Models;

namespace StudentInfo.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StudentsController : ControllerBase
{
    private readonly AppDbContext _db;

    public StudentsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<StudentReadDto>>> GetAll()
    {
        var students = await _db.Students
            .AsNoTracking()
            .Select(s => new StudentReadDto
            {
                Id = s.Id,
                Name = s.Name,
                Email = s.Email,
                MobileNo = s.MobileNo
            })
            .ToListAsync();

        return Ok(students);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<StudentReadDto>> GetById(int id)
    {
        var s = await _db.Students.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
        if (s == null) return NotFound();

        return Ok(new StudentReadDto
        {
            Id = s.Id,
            Name = s.Name,
            Email = s.Email,
            MobileNo = s.MobileNo
        });
    }

    [HttpPost]
    public async Task<ActionResult<StudentReadDto>> Create(StudentCreateDto dto)
    {
        var emailExists = await _db.Students.AnyAsync(x => x.Email == dto.Email);
        if (emailExists) return BadRequest("Email already exists.");

        var student = new Student
        {
            Name = dto.Name,
            Email = dto.Email,
            MobileNo = dto.MobileNo
        };

        _db.Students.Add(student);
        await _db.SaveChangesAsync();

        var result = new StudentReadDto
        {
            Id = student.Id,
            Name = student.Name,
            Email = student.Email,
            MobileNo = student.MobileNo
        };

        return CreatedAtAction(nameof(GetById), new { id = student.Id }, result);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, StudentUpdateDto dto)
    {
        var student = await _db.Students.FirstOrDefaultAsync(x => x.Id == id);
        if (student == null) return NotFound();

        student.Name = dto.Name;
        student.Email = dto.Email;
        student.MobileNo = dto.MobileNo;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var student = await _db.Students.FirstOrDefaultAsync(x => x.Id == id);
        if (student == null) return NotFound();

        _db.Students.Remove(student);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
