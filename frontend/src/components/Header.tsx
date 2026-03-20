/**
 * Header Component - Displays the application banner at the top of the page
 * Features:
 * - Full-width blue banner with white text
 * - Application title ("Bookstore") and subtitle
 * - Consistent branding across all pages
 */
function Header() {
  return (
    <header className="bg-primary text-white py-3 mb-4 w-100">
      <div className="text-center">
        <h1 className="h3 fw-bold mb-0 text-white">Bookstore</h1>
        <p className="small mb-0 text-white">Browse our collection of books</p>
      </div>
    </header>
  )
}

export default Header
