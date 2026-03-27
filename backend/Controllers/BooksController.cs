using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Mission11_Jorgensen.Data;
using Mission11_Jorgensen.Models;

namespace Mission11_Jorgensen.Controllers;

/// <summary>
/// Books API Controller - Provides endpoints for retrieving book data with pagination and sorting
/// Base route: /api/books
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class BooksController : ControllerBase
{
    private readonly BookstoreDbContext _context;

    public BooksController(BookstoreDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// GET /api/books - Retrieves a paginated list of books with optional sorting
    /// </summary>
    /// <param name="page">1-based page number (default: 1)</param>
    /// <param name="pageSize">Number of books per page (default: 5)</param>
    /// <param name="sortBy">Column to sort by: 'id' or 'title' (default: 'id')</param>
    /// <param name="sortOrder">Sort direction: 'asc' or 'desc' (default: 'asc')</param>
    /// <returns>JSON object with total books, current page, totalPages, pageSize, and books array</returns>
    [HttpGet]
    public async Task<IActionResult> GetBooks(int page = 1, int pageSize = 5, string sortBy = "id", string sortOrder = "asc", string? category = null)
    {
        // Validate and sanitize page/pageSize input
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 5;

        // Start building the query
        IQueryable<Book> query = _context.Books;

        // Apply category filter if provided
        if (!string.IsNullOrEmpty(category))
        {
            query = query.Where(b => b.Category == category);
        }

        // Apply sorting based on sortBy parameter (title or id)
        if (sortBy == "title")
        {
            query = sortOrder.ToLower() == "desc" 
                ? query.OrderByDescending(b => b.Title)
                : query.OrderBy(b => b.Title);
        }
        else
        {
            // Default sort by BookId
            query = sortOrder.ToLower() == "desc"
                ? query.OrderByDescending(b => b.BookId)
                : query.OrderBy(b => b.BookId);
        }

        // Calculate total books and total pages for response metadata AFTER filtering
        var total = await query.CountAsync();
        var totalPages = (int)Math.Ceiling(total / (double)pageSize);

        // Apply pagination: skip to the start of the requested page, then take pageSize records
        var books = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        // Return paginated results with metadata needed by frontend
        return Ok(new
        {
            total,
            page,
            pageSize,
            totalPages,
            books
        });
    }

    /// <summary>
    /// GET /api/books/categories - Retrieves a distinct list of categories from the database
    /// </summary>
    /// <returns>JSON array of strings</returns>
    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories()
    {
        var categories = await _context.Books
            .Where(b => !string.IsNullOrEmpty(b.Category))
            .Select(b => b.Category)
            .Distinct()
            .OrderBy(c => c)
            .ToListAsync();

        return Ok(categories);
    }
}