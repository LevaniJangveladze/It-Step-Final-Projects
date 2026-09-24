using System.Text.Json;
using System.Text.Json.Serialization;
using C_Sharp_Final_Project___Levani_Jangveladze.Models;
using C_Sharp_Final_Project___Levani_Jangveladze.Common.Entities;

namespace C_Sharp_Final_Project___Levani_Jangveladze.Database;

public sealed class DataContext
{
    private const string FilePath = "database.json";

    private static readonly JsonSerializerOptions Options = new()
    {
        WriteIndented = true,
        Converters = { new JsonStringEnumConverter() }
    };

    public List<Game> Games { get; init; } = new();
    public List<Character> Characters { get; init; } = new();
    public List<User> Users { get; init; } = new();
    public List<Rental> Rentals { get; init; } = new();

    public static DataContext Load()
    {
        if (!File.Exists(FilePath)) return new DataContext();

        string json = File.ReadAllText(FilePath);
        return JsonSerializer.Deserialize<DataContext>(json, Options) ?? new DataContext();
    }

    public void Save()
    {
        string json = JsonSerializer.Serialize(this, Options);
        File.WriteAllText(FilePath, json);
    }

    public void Add<T>(List<T> list, T entity) where T : Entity
    {
        entity.Id = list.Count == 0 ? 1 : list.Max(e => e.Id) + 1;
        list.Add(entity);
    }
}