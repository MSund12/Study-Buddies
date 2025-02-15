// test/RegisterPage.test.jsx
import { render, screen, fireEvent } from '@testing-library/react'
import RegisterPage from '../src/pages/RegisterPage'

describe('RegisterPage', () => {
  it('renders registration form inputs', () => {
    render(<RegisterPage onRegister={() => {}} />)
    expect(screen.getByPlaceholderText(/username/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument()
  })

  it('submits the form with valid data', () => {
    const mockOnRegister = vi.fn()
    render(<RegisterPage onRegister={mockOnRegister} />)
    const usernameInput = screen.getByPlaceholderText(/username/i)
    const passwordInput = screen.getByPlaceholderText(/password/i)
    const submitButton = screen.getByRole('button', { name: /register/i })

    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.change(passwordInput, { target: { value: 'password' } })
    fireEvent.click(submitButton)
    
    expect(mockOnRegister).toHaveBeenCalledWith({
      username: 'testuser',
      password: 'password',
    })
    expect(screen.getByText(/registration successful for testuser/i)).toBeInTheDocument()
  })

  it('shows error message when fields are empty', () => {
    render(<RegisterPage onRegister={() => {}} />)
    const submitButton = screen.getByRole('button', { name: /register/i })
    fireEvent.click(submitButton)
    expect(screen.getByText(/please fill out all fields/i)).toBeInTheDocument()
  })
})
