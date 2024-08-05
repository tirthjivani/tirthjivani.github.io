import Homescreen from './components/Homescreen';
import React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import PageNotFound from './components/PageNotFound';

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Homescreen />}></Route>

          <Route path="*" element={<PageNotFound />}></Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
