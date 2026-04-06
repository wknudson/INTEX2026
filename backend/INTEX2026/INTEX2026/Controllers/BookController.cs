using INTEX2026.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace INTEX2026.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BookController : ControllerBase
    {
        private BookstoreDbContext _context;

        public BookController(BookstoreDbContext context)
        {
            _context = context;
        }

        [HttpGet("AllBooks")]
        public IActionResult GetAllBooks(int pageNumber = 1, int pageSize = 10, bool sortAsc = true)
        {
            var query = sortAsc
                ? _context.Books.OrderBy(b => b.Title)
                : _context.Books.OrderByDescending(b => b.Title);

            var books = query.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToList();

            var totalBooks = _context.Books.Count();

            var booksObject = new
            {
                TotalBooks = totalBooks,
                PageNumber = pageNumber,
                PageSize = pageSize,
                Books = books
            };

            return Ok(booksObject);
        }

        [HttpGet("FunctionalBooks")]
        public IEnumerable<Book> GetFunctionalBooks()
        {
            return _context.Books.Where(b => b.Category == "Functional").ToList();
        }
    }
}