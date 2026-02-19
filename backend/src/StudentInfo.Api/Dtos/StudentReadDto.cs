namespace StudentInfo.Api.Dtos;

public class StudentReadDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string MobileNo { get; set; } = string.Empty;
}
