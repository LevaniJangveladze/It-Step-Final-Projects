using System.Text.Json.Serialization;

namespace C_Sharp_Final_Project___Levani_Jangveladze.Common.Entities;

public class Entity
{
    [JsonInclude]
    public int Id { get; internal set; }
}