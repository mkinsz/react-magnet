import React from 'react';
import { render } from 'react-dom';
import App from './app';

const root = document.createElement('div');
root.style.height = '100%';
document.body.appendChild(root)
document.body.style.background = 'white'

render(<App />, root);
