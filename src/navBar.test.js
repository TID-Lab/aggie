// Testing navBar functionality

import React from 'react';
import { render, screen } from '@testing-library/react'; 
import { BrowserRouter } from 'react-router-dom';
import AggieNavbar from './components/AggieNavbar'; // component to test

// This will check that the groups link on the navbar works
test('render groups link', () => {
    const { getByText } = render(
        <BrowserRouter>
            <AggieNavbar/>
        </BrowserRouter>
    );
    expect(getByText(/Groups/).toBeInTheDocument);
})

// This will check that the Analysis link on the navbar works
test('render Analysis link', () => {
    const { getByText } = render(
        <BrowserRouter>
            <AggieNavbar/>
        </BrowserRouter>
    );
    expect(getByText(/Analysis/).toBeInTheDocument);
})

// This will check that the Relevant Reports link on the navbar works
test('render relevant Reports link', () => {
    const { getByText } = render(
        <BrowserRouter>
            <AggieNavbar/>
        </BrowserRouter>
    );
    expect(getByText(/Relevant Reports/).toBeInTheDocument);
})

// This will check that the Reports link on the navbar works
test('render relevant Reports link', () => {
    const { getAllByText } = render(
        <BrowserRouter>
            <AggieNavbar/>
        </BrowserRouter>
    );
    const links = getAllByText(/Reports/);
    expect(links).toHaveLength(2);
})