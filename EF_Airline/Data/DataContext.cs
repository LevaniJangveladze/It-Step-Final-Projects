using EF_Airline.Models;
using Microsoft.EntityFrameworkCore;

namespace EF_Airline.Data;

public class DataContext : DbContext
{
    public DbSet<Airline> Airlines { get; set; }
    public DbSet<Booking> Bookings { get; set; }
    public DbSet<Flight> Flights { get; set; }
    public DbSet<Passenger> Passengers { get; set; }
    public DbSet<Passport> Passports { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.UseSqlServer("Server=localhost,1433;Database=EF_Airline;User Id=sa;Password=Pihafej&77;TrustServerCertificate=True;");
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Passenger>(p =>
        {
            p.Property(x => x.FirstName).HasMaxLength(50);
            p.Property(x => x.LastName).HasMaxLength(50);
            p.Property(x => x.Email).HasMaxLength(100);
            p.HasIndex(x => x.Email).IsUnique();
        });

        modelBuilder.Entity<Passport>(p =>
        {
            p.Property(x => x.PassportNumber).HasMaxLength(20);
            p.HasIndex(x => x.PassportNumber).IsUnique();
        });
        
        modelBuilder.Entity<Flight>(f =>
        {
            f.Property(x => x.FlightNumber).HasMaxLength(10);
            f.Property(x => x.DepartureCity).HasMaxLength(50);
            f.Property(x => x.ArrivalCity).HasMaxLength(50);
        });

        modelBuilder.Entity<Booking>(b =>
        {
            b.Property(x => x.SeatNumber).HasMaxLength(5);
            b.Property(x => x.Status).HasMaxLength(20);

            b.HasIndex(x => new { x.FlightId, x.SeatNumber })
                .IsUnique()
                .HasFilter("[Status] <> 'Cancelled'");
        });
    }
}