/*global firebase*/
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import 'fixed-data-table/dist/fixed-data-table.min.css';

// Initialize Firebase

firebase.initializeApp(config);
ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
