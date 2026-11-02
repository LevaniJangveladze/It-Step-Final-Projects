using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EF_Airline.Migrations
{
    /// <inheritdoc />
    public partial class FilteredSeatIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Bookings_FlightId_SeatNumber",
                table: "Bookings");

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_FlightId_SeatNumber",
                table: "Bookings",
                columns: new[] { "FlightId", "SeatNumber" },
                unique: true,
                filter: "[Status] <> 'Cancelled'");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Bookings_FlightId_SeatNumber",
                table: "Bookings");

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_FlightId_SeatNumber",
                table: "Bookings",
                columns: new[] { "FlightId", "SeatNumber" },
                unique: true);
        }
    }
}
