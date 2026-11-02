using EF_Airline.Models;
using EF_Airline.Services;

namespace EF_Airline.Menus;

public class PassengerMenu
{
    public static void Start(PassengerService passengerService)
    {
        bool isOpen = true;

        while (isOpen)
        {
            Console.WriteLine("\n--- PASSENGERS ---");
            Console.WriteLine("1. Create passenger");
            Console.WriteLine("2. Show all passengers");
            Console.WriteLine("3. Update passenger");
            Console.WriteLine("4. Delete passenger");
            Console.WriteLine("5. Search by name");
            Console.WriteLine("6. Add passport");
            Console.WriteLine("x. Back");

            Console.Write("Enter key: ");
            string key = Console.ReadLine()!;

            try
            {
                switch (key)
                {
                    case "1":
                        Console.Write("Enter firstname: ");
                        string firstName = Console.ReadLine();

                        Console.Write("Enter lastname: ");
                        string lastName = Console.ReadLine();

                        Console.Write("Enter email: ");
                        string email = Console.ReadLine();

                        Console.Write("Enter phone number: ");
                        string phoneNumber = Console.ReadLine();

                        passengerService.Create(new Passenger
                        {
                            FirstName = firstName,
                            LastName = lastName,
                            Email = email,
                            PhoneNumber = phoneNumber,
                        });
                        Console.WriteLine("Passenger created.");
                        break;

                    case "2":
                        foreach (var p in passengerService.GetPassengers())
                        {
                            Console.WriteLine(
                                $"{p.Id}. {p.FirstName} {p.LastName}, {p.Email}, {p.PhoneNumber}, passport: {p.Passport?.PassportNumber ?? "none"}");
                        }

                        break;

                    case "3":
                        foreach (var p in passengerService.GetPassengers())
                            Console.WriteLine($"{p.Id}. {p.FirstName} {p.LastName}, {p.Email}, {p.PhoneNumber}");

                        Console.Write("Enter passenger id to update: ");
                        int updateId = int.Parse(Console.ReadLine()!);

                        Console.Write("Enter new first name: ");
                        string newFirstName = Console.ReadLine()!;

                        Console.Write("Enter new last name: ");
                        string newLastName = Console.ReadLine()!;

                        Console.Write("Enter new email: ");
                        string newEmail = Console.ReadLine()!;

                        Console.Write("Enter new phone number: ");
                        string newPhoneNumber = Console.ReadLine()!;

                        passengerService.Update(updateId, newFirstName, newLastName, newEmail, newPhoneNumber);
                        Console.WriteLine("Passenger updated.");
                        break;


                    case "4":
                        foreach (var p in passengerService.GetPassengers())
                            Console.WriteLine($"{p.Id}. {p.FirstName} {p.LastName}, {p.Email}, {p.PhoneNumber}");

                        Console.Write("Enter passenger id to delete: ");
                        int deleteId = int.Parse(Console.ReadLine()!);
                        passengerService.Delete(deleteId);
                        Console.WriteLine("Passenger deleted.");
                        break;


                    case "5":
                        Console.Write("Enter name to search: ");
                        string searchText = Console.ReadLine()!;

                        foreach (var p in passengerService.SearchByName(searchText))
                            Console.WriteLine($"{p.Id}. {p.FirstName} {p.LastName}, {p.Email}, {p.PhoneNumber}");
                        break;

                    case "6":
                        foreach (var p in passengerService.GetPassengers())
                            Console.WriteLine($"{p.Id}. {p.FirstName} {p.LastName}, {p.Email}, {p.PhoneNumber}");

                        Console.Write("Enter passenger id to add passport: ");
                        int passengerId = int.Parse(Console.ReadLine()!);

                        Console.Write("Enter new passport number: ");
                        string newPassportNumber = Console.ReadLine();

                        Console.Write("Enter passport expiry date : ");
                        DateTime expiryDate = DateTime.Parse(Console.ReadLine()!);

                        passengerService.AddPassport(passengerId, newPassportNumber, expiryDate);
                        Console.WriteLine("Passport added.");
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