import React from 'react';
import { render } from '@testing-library/react';

import Welcome from '../jsx/Welcome';

describe('Welcome', () => {
    test('renders Welcome component', () => {
        render(<Welcome/>);
    });
});