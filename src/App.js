import React from 'react';
import './App.css';

// Import your components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProductList from './components/ProductList';
import Login from './components/Login';
import Register from './components/Register';
import Products from './components/Products';

// Import your context
import  GeneralContextProvider  from './context/GeneralContext';

function App() {
  return (
    <GeneralContextProvider>
      <div className="App">
        <Navbar />
        
        <main>
          <h1>Welcome to ShopEZ</h1>
          <ProductList />
          {/* You can conditionally render different components based on routing */}
          {/* <Login /> */}
          {/* <Register /> */}
          {/* <Products /> */}
        </main>
        
        <Footer />
      </div>
    </GeneralContextProvider>
  );
}

export default App;