import React from 'react';
import ReactDOM from 'react-dom'
import { render, cleanup, screen } from '@testing-library/react';
import App from './App';
import { BrowserRouter } from 'react-router-dom';

afterEach(cleanup)

// Smoke Test: This test mounts a component and makes sure that it didn’t throw during rendering.
it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
});

/*
test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
*/
 // Checks if the app.js has the correct snapshot.
 it('should take a snapshot', () => {
    const { asFragment } = render(<App />)
    const firstFragment = asFragment();
    expect(firstFragment).toMatchSnapshot();
   });
  



