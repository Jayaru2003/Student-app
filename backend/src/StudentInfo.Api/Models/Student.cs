using System.ComponentModel.DataAnnotations;

namespace StudentInfo.Api.Models;

public class Student
{
    public int Id { get; set; }

    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required, EmailAddress, MaxLength(150)]
    public string Email { get; set; } = string.Empty;

    [Required, MaxLength(20)]
    public string MobileNo { get; set; } = string.Empty;
}
