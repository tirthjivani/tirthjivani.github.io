import React, { Component } from 'react';
import { Button } from 'react-bootstrap';

export default class Homepage extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    return (
      <>
        <h2>Hello, I'm Tirth!</h2>
        <Button variant="primary">Hii</Button>
      </>
    );
  }
}
