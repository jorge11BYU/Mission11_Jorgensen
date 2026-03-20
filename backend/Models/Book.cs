using System;
using System.Collections.Generic;

namespace Mission11_Jorgensen.Models;

public partial class Book
{
    public int BookId { get; set; }

    public required string Title { get; set; }

    public required string Author { get; set; }

    public required string Publisher { get; set; }

    public required string Isbn { get; set; }

    public required string Classification { get; set; }

    public required string Category { get; set; }

    public int PageCount { get; set; }

    public double Price { get; set; }
}
