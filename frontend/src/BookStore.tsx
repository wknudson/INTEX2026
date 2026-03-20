import { useState } from 'react';
import { useEffect } from 'react';
import type { Book } from './types/Book';

function BookList() {

    const [books, setBooks] = useState<Book[]>([]);
    const [pageSize, setPageSize] = useState<number>(5);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [totalItems, setTotalItems] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [sortAsc, setSortAsc] = useState<boolean>(true);

    useEffect(() => {
        const fetchBooks = async () => {
            const response = await fetch(
                `https://localhost:5000/api/book/AllBooks?pageNumber=${pageNumber}&pageSize=${pageSize}&sortAsc=${sortAsc}`
            );
            const data = await response.json();
            setBooks(data.books);
            setTotalItems(data.totalBooks);                          
            setTotalPages(Math.ceil(data.totalBooks / pageSize));    
        };

        fetchBooks();
    }, [pageSize, pageNumber, sortAsc]);

    return (
        <div className="container my-4">
            <h1 className="mb-4">Book List</h1>

            <div className="mb-3 d-flex align-items-center gap-3">
                <button
                    className="btn btn-outline-secondary"
                    onClick={() => {
                        setSortAsc(!sortAsc);
                        setPageNumber(1);
                    }}
                >
                    Sort by Title {sortAsc ? '▲' : '▼'}
                </button>

                <label className="d-flex align-items-center gap-2 mb-0">
                    Results per page:
                    <select
                        className="form-select w-auto"
                        value={pageSize}
                        onChange={(e) => {
                            setPageSize(Number(e.target.value));
                            setPageNumber(1);
                        }}
                    >
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="25">25</option>
                    </select>
                </label>
            </div>

            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 mb-4">
                {books.map((book) => (
                    <div className="col" key={book.bookId}>
                        <div className="card h-100 shadow-sm">
                            <div className="card-body">
                                <h5 className="card-title">{book.title}</h5>
                                <ul className="list-unstyled mb-0">
                                    <li><strong>Author:</strong> {book.author}</li>
                                    <li><strong>Publisher:</strong> {book.publisher}</li>
                                    <li><strong>ISBN:</strong> {book.isbn}</li>
                                    <li><strong>Classification:</strong> {book.classification}</li>
                                    <li><strong>Category:</strong> {book.category}</li>
                                    <li><strong>Pages:</strong> {book.pageCount}</li>
                                    <li><strong>Price:</strong> ${book.price.toFixed(2)}</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <nav>
                <ul className="pagination justify-content-center flex-wrap">
                    <li className={`page-item ${pageNumber === 1 ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => setPageNumber(pageNumber - 1)}>
                            Previous
                        </button>
                    </li>
                    {totalPages > 0 && [...Array(totalPages)].map((_, index) => (
                        <li key={index} className={`page-item ${pageNumber === index + 1 ? 'active' : ''}`}>
                            <button className="page-link" onClick={() => setPageNumber(index + 1)}>
                                {index + 1}
                            </button>
                        </li>
                    ))}
                    <li className={`page-item ${pageNumber === totalPages ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => setPageNumber(pageNumber + 1)}>
                            Next
                        </button>
                    </li>
                </ul>
            </nav>
        </div>
    );
}

export default BookList;