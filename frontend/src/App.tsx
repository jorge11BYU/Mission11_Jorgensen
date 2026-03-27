import { Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import './App.css'
import Header from './components/Header'
import BookList from './components/BookList'
import { CartView } from './components/CartView'

function App() {
  return (
    <CartProvider>
      <Header />
      <Routes>
        <Route path="/" element={<BookList />} />
        <Route path="/cart" element={<CartView />} />
      </Routes>
    </CartProvider>
  )
}

export default App
