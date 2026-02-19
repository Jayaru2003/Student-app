using Microsoft.Data.SqlClient;

var connStr = "Server=tcp:test-project1.database.windows.net,1433;Initial Catalog=Test-project;Persist Security Info=False;User ID=admin123;Password=Jayaru123;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;";

using var conn = new SqlConnection(connStr);
conn.Open();
Console.WriteLine("Connected to Azure SQL.");

string[] cmds = [
    "IF OBJECT_ID('Students', 'U') IS NOT NULL DROP TABLE Students",
    "IF OBJECT_ID('__EFMigrationsHistory', 'U') IS NOT NULL DELETE FROM __EFMigrationsHistory"
];

foreach (var sql in cmds)
{
    using var cmd = new SqlCommand(sql, conn);
    cmd.ExecuteNonQuery();
    Console.WriteLine($"OK: {sql}");
}

Console.WriteLine("Database cleaned successfully.");
