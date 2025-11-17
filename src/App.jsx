import { useState } from 'react'
import Footer from './components/Footer';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import ArticleDetail from './pages/ArticleDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './services/ProtectedRoute';
import { BrowserRouter,Routes,Route } from 'react-router-dom';
import CreateArticle from './pages/CreateArticle';
import OverView from './pages/OverView';
import ArticlesListing from "./pages/ArticlesListing"
import "./styles/components.css"
function App() {

  return (
    <>
      <BrowserRouter>
      <NavBar/>
        <Routes>
           <Route path='/' element={<Home/>}/>
          <Route path='/create-ariticle' element={
            <ProtectedRoute>
              <CreateArticle/>
            </ProtectedRoute>
            }/>
          {/* <Route path='/read-articles' element={<ArticleDetail/>}/> */}
          <Route path='/login' element={<Login/>}/>
          <Route path='/register' element={<Register/>}/>
          <Route path='/dash-board' element={
            <ProtectedRoute>
              <OverView/>
              </ProtectedRoute>}/>
          <Route path='/browse-articles' element={<ArticlesListing />} />
       
<Route path='/read-articles/:id' element={<ArticleDetail />} />

        </Routes>
        <Footer/>
      </BrowserRouter>
    </>
  )
}

export default App
