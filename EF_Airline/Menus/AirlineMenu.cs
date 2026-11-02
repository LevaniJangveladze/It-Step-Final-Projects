using EF_Airline.Models;
using EF_Airline.Services;

namespace EF_Airline.Menus;

public class AirlineMenu
{
    public static void Start(AirlineService airlineService)
    {
        bool isOpen = true;

        while (isOpen)
        {
            Console.WriteLine("\n--- AIRLINES ---");
            Console.WriteLine("1. Create airline");
            Console.WriteLine("2. Show all airlines");
            Console.WriteLine("3. Update airline");
            Console.WriteLine("4. Delete airline");
            Console.WriteLine("x. back");

            Console.Write("Enter key: ");
            string key = Console.ReadLine()!;

            try
            {
                switch (key)
                {
                    case "1":
                        Console.Write("Enter airline name: ");
                        string name = Console.ReadLine();

                        Console.Write("Enter country: ");
                        string country = Console.ReadLine();

                        airlineService.Create(new Airline { Name = name, Country = country });
                        Console.WriteLine("Created airline");
                        break;
                    case "2":
                        foreach (var a in airlineService.GetAll())
                            Console.WriteLine($"{a.Id}, {a.Name} ({a.Country})");
                        break;

                    case "3":

                        foreach (var a in airlineService.GetAll())
                        {
                            Console.WriteLine($"{a.Id}, {a.Name} ({a.Country})");
                        }

                        Console.Write("Enter airline id: ");
                        int updatedId = int.Parse(Console.ReadLine());
                        Console.Write("Enter updated airline name: ");
                        string updatedName = Console.ReadLine();
                        Console.Write("Enter updated country: ");
                        string updatedCountry = Console.ReadLine();


                        airlineService.Update(updatedId, updatedName, updatedCountry);
                        Console.WriteLine("Airline updated.");
                        break
                            ;

                    case "4":
                        foreach (var a in airlineService.GetAll())
                            Console.WriteLine($"{a.Id}. {a.Name} ({a.Country})");

                        Console.Write("Enter airline id: ");
                        int deletedId = int.Parse(Console.ReadLine()!);

                        airlineService.Delete(deletedId);
                        Console.WriteLine("Airline deleted.");
                        break;


                    case "x":
                        isOpen = false;
                        break;
                }
            }
            catch (Exception e)
            {
                Console.WriteLine($"Error: {e.Message}");
            }
        }
    }
}