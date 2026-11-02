# EF_Airline — ავიაბილეთების ჯავშნის სისტემა

კონსოლის აპლიკაცია C#-ზე, Entity Framework Core-ით და MSSQL Server-ით.
პროექტი ახდენს ავიაკომპანიების, რეისების, მგზავრების და ჯავშნების მართვას.

---

## პროექტის სტრუქტურა

```
EF_Airline/
├── Models/        — მოდელები (ცხრილები)
├── Data/          — DataContext (ბაზასთან კავშირი)
├── Services/      — ბიზნეს ლოგიკა
├── Menus/         — კონსოლის მენიუები
├── Migrations/    — მიგრაციები
└── Program.cs     — მთავარი მენიუ
```

---

## მოდელები და კავშირები

| მოდელი | რას ინახავს |
|---|---|
| **Airline** | ავიაკომპანია — სახელი, ქვეყანა |
| **Flight** | რეისი — ნომერი, საიდან/სად, დრო, ფასი, ადგილების რაოდენობა |
| **Passenger** | მგზავრი — სახელი, გვარი, ელ-ფოსტა, ტელეფონი |
| **Passport** | პასპორტი — ნომერი, ვადის გასვლის თარიღი |
| **Booking** | ჯავშანი — რომელი მგზავრი, რომელ რეისზე, რომელ ადგილზე |

### სამივე ტიპის კავშირი

**One-to-One — Passenger ↔ Passport**
ერთ მგზავრს აქვს ერთი პასპორტი. `Passports.PassengerId`-ზე დადებულია unique index, რაც უზრუნველყოფს, რომ ერთ მგზავრზე ორი პასპორტი ვერ დარეგისტრირდება.

**One-to-Many — Airline → Flights**
ერთ ავიაკომპანიას ბევრი რეისი აქვს, მაგრამ ერთი რეისი მხოლოდ ერთ ავიაკომპანიას ეკუთვნის. Foreign key `Flights.AirlineId`.

**Many-to-Many — Passenger ↔ Flight (Booking-ის გავლით)**
ერთი მგზავრი ბევრ რეისზე დაფრინავს, ერთ რეისზე ბევრი მგზავრია.
მნიშვნელოვანი დეტალი: `Booking` არ არის ავტომატურად გენერირებული join ცხრილი — ის ცალკე მოდელია, რადგან თავად კავშირს აქვს საკუთარი ინფორმაცია: `SeatNumber`, `BookedAt`, `Status`. ჩვეულებრივ join ცხრილში ეს ველები ვერ მოთავსდებოდა.

---

## ფუნქციონალი

**CRUD** — ყველა მოდელზე სრული Create / Read / Update / Delete.

**ფილტრაციები და სერჩი**
- რეისების ძებნა მარშრუტით (საიდან → სად)
- ფილტრაცია ფასის დიაპაზონით
- მომავალი რეისების ჩვენება
- მგზავრების ძებნა სახელით ან გვარით

**ჯავშნის ვალიდაცია** — `BookingService.CreateBooking()` ჯავშნის შექმნამდე ამოწმებს:
1. არსებობს თუ არა რეისი
2. არსებობს თუ არა მგზავრი
3. არ გაფრინდა თუ არა უკვე რეისი
4. დაკავებულია თუ არა ეს ადგილი ამ რეისზე
5. უკვე დაჯავშნული ხომ არ აქვს ამ მგზავრს ეს რეისი
6. სავსეა თუ არა რეისი

**რეპორტები (GROUP BY, SUM, COUNT)**
- შემოსავალი ავიაკომპანიების მიხედვით
- რეისების დატვირთულობა (დაჯავშნილი / სულ ადგილები)
- ყველაზე პოპულარული მარშრუტები
- კონკრეტული რეისის მგზავრების სია პასპორტებით
- ვადაგასული პასპორტები

---

## გაშვების ინსტრუქცია

### რა არის საჭირო

- .NET SDK 10.0 ან ზემოთ — https://dotnet.microsoft.com/download
- MSSQL Server
- Rider ან Visual Studio

### 1. SQL Server-ის მომზადება

**Windows:**
SQL Server Express ან LocalDB. LocalDB უკვე მოყვება Visual Studio-ს.

**Mac / Linux:**
Docker-ით:
```bash
docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=YourPassword123" \
  -p 1433:1433 -d mcr.microsoft.com/mssql/server:2022-latest
```

### 2. Connection string-ის შეცვლა

გახსენით `Data/DataContext.cs` და `OnConfiguring`-ში ჩაწერეთ თქვენი ბაზის მონაცემები:

```csharp
optionsBuilder.UseSqlServer("Server=localhost,1433;Database=EF_Airline;User Id=sa;Password=YourPassword123;TrustServerCertificate=True;");
```

**Windows-ზე LocalDB-ით:**
```csharp
optionsBuilder.UseSqlServer(@"Server=(localdb)\MSSQLLocalDB;Database=EF_Airline;Trusted_Connection=True;TrustServerCertificate=True;");
```

### 3. ბაზის შექმნა

პროექტის ფოლდერში:

```bash
dotnet restore
dotnet ef database update
```

თუ `dotnet ef` არ მუშაობს:
```bash
dotnet tool install --global dotnet-ef
```

### 4. გაშვება

```bash
dotnet run
```

ან Rider / Visual Studio-ში Run ღილაკით.

---

## მენიუ

```
=== AIRLINE BOOKING SYSTEM ===
1. Airlines     — ავიაკომპანიები
2. Flights      — რეისები (+ ძებნა, ფილტრაცია)
3. Passengers   — მგზავრები (+ პასპორტის დამატება)
4. Bookings     — ჯავშნები
5. Reports      — რეპორტები
x. Exit
```

თავდაპირველად ბაზა ცარიელია, ამიტომ თანმიმდევრობა ასეთია:
ჯერ ავიაკომპანია → მერე რეისი → მერე მგზავრი → მერე ჯავშანი.
