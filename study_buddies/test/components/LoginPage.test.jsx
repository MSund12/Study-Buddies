import { render, screen, fireEvent } from '@testing-library/react'
import LoginPage from '../src/pages/LoginPage'

describe('LoginPage', () => {
  const mockUsers = [
    { username: 'user1', password: 'pass1' },
    { username: 'user2', password: 'pass2' }
  ]

  it('handles successful login', () => {
    const mockLogin = jest.fn()
    render(<LoginPage users={mockUsers} onLoginSuccess={mockLogin} />)
    
    // Fill credentials
    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'user1' } })
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'pass1' } })
    
    // Submit
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    expect(mockLogin).toHaveBeenCalled()
  })

  it('shows error for invalid login', () => {
    render(<LoginPage users={mockUsers} onLoginSuccess={jest.fn()} />)
    
    // Fill wrong credentials
    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'wrong' } })
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'wrong' } })
    
    // Submit
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    expect(screen.getByText(/invalid username/i)).toBeInTheDocument()
  })
})