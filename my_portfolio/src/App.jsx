import React from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import './App.css';
import About from './pages/About';
import Homepage from './pages/homepage';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import logo from './assets/logo.png';

export default function App() {
  return (
    <Router>
      <div>
        <Navbar fixed="sticky" bg="light" variant="light">
          <Navbar.Brand href="#">
            <img
              alt=""
              src={logo}
              width="30"
              height="30"
              className="d-inline-block align-top"
            />
          </Navbar.Brand>
          <Navbar.Collapse>
            <Nav className="justify-content-end">
              <Nav.Link href="/">Portfolio</Nav.Link>
              <Nav.Link href="/about">About</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Navbar>

        <Switch>
          <Route path="/about">
            <About />
          </Route>
          <Route path="/">
            <Homepage />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}
