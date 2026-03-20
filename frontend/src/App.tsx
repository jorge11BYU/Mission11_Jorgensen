import './App.css'
import Header from './components/Header'
import BookList from './components/BookList'

/*
- Header: Navigation/branding banner at the top
- BookList: Main content area with book listing, pagination, and sorting
 */
function App() {
  return (
    <>
      <Header />
      <BookList />
    </>
  )
}

export default App
