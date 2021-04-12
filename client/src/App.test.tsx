import React from 'react';
import {render, screen} from '@testing-library/react';
import App from './App';

test('Renders Vertex Cover title', () => {
    render(<App/>);
    const linkElement = screen.getByText(/Vertex Cover/i);
    expect(linkElement).toBeInTheDocument();
});
