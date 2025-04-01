import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import mockRootReducer from './mockReducers'; // Your mock reducer
import { MemoryRouter } from 'react-router-dom'; // Import MemoryRouter
import SignUp from '../../src/pages/SignUp';

// Create a mock Redux store
const store = createStore(mockRootReducer);

describe('SignUp Component', () => {
  test('renders the SignUp form', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>  {/* Wrap with MemoryRouter */}
          <SignUp />
        </MemoryRouter>
      </Provider>
    );

    // Check if the form fields are present
    expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/School Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
  });

  test('shows validation message for invalid email', async () => {
    render(
      <Provider store={store}>
        <MemoryRouter>  {/* Wrap with MemoryRouter */}
          <SignUp />
        </MemoryRouter>
      </Provider>
    );

    fireEvent.change(screen.getByLabelText(/School Email Address/i), {
      target: { value: 'invalidemail.com' },
    });
    fireEvent.submit(screen.getByRole('button', { name: /Create an account/i }));

    await waitFor(() => {
      expect(screen.getByText(/Email must end with @yorku.ca or @my.yorku.ca/i)).toBeInTheDocument();
    });
  });

  // Add more tests...
});
