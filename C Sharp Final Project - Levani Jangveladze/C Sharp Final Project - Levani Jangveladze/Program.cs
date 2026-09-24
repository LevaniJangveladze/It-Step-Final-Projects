using C_Sharp_Final_Project___Levani_Jangveladze.Common.Auth;
using C_Sharp_Final_Project___Levani_Jangveladze.Common.Email;
using C_Sharp_Final_Project___Levani_Jangveladze.Common.Helpers;
using C_Sharp_Final_Project___Levani_Jangveladze.Common.Validation;
using C_Sharp_Final_Project___Levani_Jangveladze.Database;
using C_Sharp_Final_Project___Levani_Jangveladze.Enums;
using C_Sharp_Final_Project___Levani_Jangveladze.Models;
using C_Sharp_Final_Project___Levani_Jangveladze.Services;
using System.Text.Json;  

DataContext db = DataContext.Load();
JsonDocument config = JsonDocument.Parse(File.ReadAllText("appsettings.json"));
JsonElement emailConfig = config.RootElement.GetProperty("Email");

string emailFrom = emailConfig.GetProperty("From").GetString()!;
string emailPassword = emailConfig.GetProperty("AppPassword").GetString()!;

IEmailSender email = new SmtpEmailSender(emailFrom, emailPassword);

AuthService authService = new AuthService(db, email);
GameService gameService = new GameService(db);
CharacterService characterService = new CharacterService(db);
RentalService rentalService = new RentalService(db);
AdminService adminService = new AdminService(db);

while (true)
{
    try
    {
        if (!Session.IsLoggedIn())
        {
            Output.Clear();
            Output.Title("GameVault");
            Output.Line("1) Register");
            Output.Line("2) Login");
            Output.Line("3) Verify email");
            Output.Line("4) Forgot password");
            Output.Line("5) Reset password");
            Output.Line("0) Exit");
            Output.Line();

            string choice = ConsoleInput.ReadString("Choice");

            switch (choice)
            {
                case "1":
                    string fullname = ConsoleInput.ReadString("Full name");
                    string regEmail = ConsoleInput.ReadString("Email");
                    string regPassword = ConsoleInput.ReadPassword("Password");
                    authService.Register(fullname, regEmail, regPassword);
                    Output.Success("Registered. Check your email for the verification code.");
                    Output.Pause();
                    break;

                case "2":
                    string logEmail = ConsoleInput.ReadString("Email");
                    string logPassword = ConsoleInput.ReadPassword("Password");
                    User user = authService.Login(logEmail, logPassword);
                    Session.Login(user);
                    Output.Success($"Welcome back, {user.Fullname}.");
                    Output.Pause();
                    break;

                case "3":
                    string verEmail = ConsoleInput.ReadString("Email");
                    string verCode = ConsoleInput.ReadString("Code");
                    authService.VerifyEmail(verEmail, verCode);
                    Output.Success("Your email has been verified. You can log in now.");
                    Output.Pause();
                    break;

                case "4":
                    string forgotEmail = ConsoleInput.ReadString("Email");
                    authService.ForgotPassword(forgotEmail);
                    Output.Success("A reset code has been sent to your email.");
                    Output.Pause();
                    break;

                case "5":
                    string resetEmail = ConsoleInput.ReadString("Email");
                    string resetCode = ConsoleInput.ReadString("Code");
                    string newPassword = ConsoleInput.ReadPassword("New password");
                    authService.ResetPassword(resetEmail, resetCode, newPassword);
                    Output.Success("Your password has been reset.");
                    Output.Pause();
                    break;

                case "0":
                    return;

                default:
                    Output.Error("Invalid choice.");
                    Output.Pause();
                    break;
            }
        }
        else
        {
            User current = Session.Current();
            bool isStaff = current.Role is UserRole.Admin or UserRole.Manager;
            bool isAdmin = current.Role is UserRole.Admin;

            Output.Clear();
            Output.Title($"GameVault - {current.Fullname} ({current.Role})");
            Output.Line("1) Browse games");
            Output.Line("2) Search games");
            Output.Line("3) Filter by genre");
            Output.Line("4) Game details");
            Output.Line("5) Rent a game");
            Output.Line("6) My rentals");
            Output.Line("7) Return a game");

            if (isStaff)
            {
                Output.Divider();
                Output.Line("8) Add game");
                Output.Line("9) Add character");
                Output.Line("10) All rentals");
                Output.Line("11) Add stock");
            }

            if (isAdmin)
            {
                Output.Divider();
                Output.Line("12) All users");
                Output.Line("13) Change user role");
            }

            Output.Divider();
            Output.Line("99) Logout");
            Output.Line("0) Exit");
            Output.Line();

            string choice = ConsoleInput.ReadString("Choice");

            switch (choice)
            {
                case "1":
                    List<Game> games = gameService.GetAll();
                    Output.Title("All games");
                    if (games.Count == 0) Output.Info("No games in the catalogue yet.");
                    foreach (Game g in games)
                        Output.Line($"#{g.Id}  {g.Name}  ({g.Genre})  stock: {g.Stock}");
                    Output.Pause();
                    break;

                case "2":
                    string term = ConsoleInput.ReadString("Search term");
                    List<Game> found = gameService.Search(term);
                    Output.Title("Search results");
                    if (found.Count == 0) Output.Info("No games matched that search.");
                    foreach (Game g in found)
                        Output.Line($"#{g.Id}  {g.Name}  ({g.Genre})  stock: {g.Stock}");
                    Output.Pause();
                    break;

                case "3":
                    Genre filterGenre = ConsoleInput.ReadEnum<Genre>("Genre");
                    List<Game> filtered = gameService.FilterByGenre(filterGenre);
                    Output.Title($"Games in {filterGenre}");
                    if (filtered.Count == 0) Output.Info("No games in this genre.");
                    foreach (Game g in filtered)
                        Output.Line($"#{g.Id}  {g.Name}  stock: {g.Stock}");
                    Output.Pause();
                    break;

                case "4":
                    int detailsId = ConsoleInput.ReadInt("Game ID");
                    Game detail = gameService.GetById(detailsId);
                    List<Character> roster = characterService.GetByGame(detailsId);

                    Output.Title(detail.Name);
                    Output.Line($"Studio:   {detail.Studio}");
                    Output.Line($"Genre:    {detail.Genre}");
                    Output.Line($"Players:  {detail.MinPlayers}-{detail.MaxPlayers}");
                    Output.Line($"Stock:    {detail.Stock}");
                    Output.Line($"Released: {detail.ReleasedAt:yyyy-MM-dd}");
                    Output.Line();
                    Output.Line(detail.Description);
                    Output.Divider();

                    if (roster.Count == 0)
                        Output.Info("No characters added for this game yet.");
                    else
                    {
                        Output.Line("Characters:");
                        foreach (Character c in roster)
                            Output.Line($"  #{c.Id}  {c.Name}  ({c.Role})  ult: {c.Ultimate}");
                    }
                    Output.Pause();
                    break;

                case "5":
                    int gameId = ConsoleInput.ReadInt("Game ID");
                    rentalService.Rent(gameId);
                    Output.Success("You have rented the game.");
                    Output.Pause();
                    break;

                case "6":
                    List<Rental> mine = rentalService.GetMyRentals();
                    List<Game> catalogue = gameService.GetAll();

                    Output.Title("My rentals");
                    if (mine.Count == 0) Output.Info("You haven't rented anything yet.");

                    foreach (Rental r in mine)
                    {
                        Game? rentedGame = catalogue.FirstOrDefault(g => g.Id == r.GameId);
                        string gameName = rentedGame?.Name ?? "(removed game)";

                        Output.Line($"#{r.Id}  {gameName}  rented {r.RentedAt:yyyy-MM-dd}  " +
                                    (r.ReturnedAt == null ? "[OUT]" : "[returned]"));
                    }
                    Output.Pause();
                    break;

                case "7":
                    int rentalId = ConsoleInput.ReadInt("Rental ID");
                    rentalService.Return(rentalId);
                    Output.Success("You have returned the rental.");
                    Output.Pause();
                    break;

                case "8":
                    string gName = ConsoleInput.ReadString("Name");
                    string gStudio = ConsoleInput.ReadString("Studio");
                    Genre gGenre = ConsoleInput.ReadEnum<Genre>("Genre");
                    string gDesc = ConsoleInput.ReadString("Description");
                    int gMin = ConsoleInput.ReadInt("Min players");
                    int gMax = ConsoleInput.ReadInt("Max players");
                    DateTime gReleased = ConsoleInput.ReadDate("Released at");
                    Game created = gameService.Create(gName, gStudio, gGenre, gDesc, gMin, gMax, gReleased);
                    Output.Success($"Game added as #{created.Id}. Use 'Add stock' to put copies on the shelf.");
                    Output.Pause();
                    break;

                case "9":
                    string cName = ConsoleInput.ReadString("Character name");
                    string cRole = ConsoleInput.ReadString("Role (Tank / Damage / Support)");
                    string cUlt = ConsoleInput.ReadString("Ultimate ability");
                    int cGameId = ConsoleInput.ReadInt("Game ID");
                    characterService.Create(cName, cRole, cUlt, cGameId);
                    Output.Success("Character added.");
                    Output.Pause();
                    break;

                case "10":
                    List<Rental> all = rentalService.GetAll();
                    List<Game> allGames = gameService.GetAll();

                    Output.Title("All rentals");
                    if (all.Count == 0) Output.Info("No rentals yet.");

                    foreach (Rental r in all)
                    {
                        Game? rented = allGames.FirstOrDefault(g => g.Id == r.GameId);
                        string title = rented?.Name ?? "(removed game)";

                        Output.Line($"#{r.Id}  user #{r.UserId}  {title}  " +
                                    $"rented {r.RentedAt:yyyy-MM-dd}  " +
                                    (r.ReturnedAt == null ? "[OUT]" : "[returned]"));
                    }
                    Output.Pause();
                    break;

                case "11":
                    int stockId = ConsoleInput.ReadInt("Game ID");
                    int stockAmount = ConsoleInput.ReadInt("Copies to add");
                    gameService.AddStock(stockId, stockAmount);
                    Output.Success("Stock updated.");
                    Output.Pause();
                    break;
                
                case "12":
                    List<User> users = adminService.GetAllUsers();
                    Output.Title("All users");
                    foreach (User u in users)
                        Output.Line($"#{u.Id}  {u.Fullname}  {u.Email}  [{u.Role}]");
                    Output.Pause();
                    break;

                case "13":
                    int targetId = ConsoleInput.ReadInt("User ID");
                    UserRole newRole = ConsoleInput.ReadEnum<UserRole>("New role");
                    adminService.ChangeRole(targetId, newRole);
                    Output.Success("Role updated.");
                    Output.Pause();
                    break;

                case "99":
                    Session.Logout();
                    Output.Success("Logged out.");
                    Output.Pause();
                    break;

                case "0":
                    return;

                default:
                    Output.Error("Invalid choice.");
                    Output.Pause();
                    break;
            }
        }
    }
    catch (ValidationException ex)
    {
        Output.Error(ex.Message);
        Output.Pause();
    }
    catch (Exception ex)
    {
        Output.Error(ex.Message);   // TEMPORARY - for debugging
        Output.Pause();
    }
}