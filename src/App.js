import React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import Homescreen from './components/Homescreen';
import PageNotFound from './components/PageNotFound';
import './index.css';

function App() {
  return (
    <div className="cursor-default">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Homescreen />}></Route>

          <Route path="*" element={<PageNotFound />}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
