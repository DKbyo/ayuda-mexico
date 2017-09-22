import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom'
import Main from './screens/main'
import Admin from './screens/admin'

class App extends Component {
  render() {
    return (
        <Router>
          <div className="full">
            <Route exact path="/" component={Main}/>
            <Route path="/admin" component={Admin}/>
          </div>
        </Router>
    );
  }
}

export default App;
