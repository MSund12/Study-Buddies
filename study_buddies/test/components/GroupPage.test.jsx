import { render, screen, fireEvent } from '@testing-library/react'
import GroupPage from '../src/pages/GroupPage'

describe('GroupPage', () => {
  const mockGroup = { name: 'Test Group' }
  const mockUser = { username: 'testuser' }

  it('handles resource upload', () => {
    render(<GroupPage group={mockGroup} onBack={jest.fn()} currentUser={mockUser} />)
    
    // Fill form
    fireEvent.change(screen.getByPlaceholderText('Title'), { target: { value: 'React Docs' } })
    fireEvent.change(screen.getByPlaceholderText('Link'), { target: { value: 'https://react.dev' } })
    fireEvent.change(screen.getByPlaceholderText('Description'), { target: { value: 'Official docs' } })
    
    // Submit
    fireEvent.click(screen.getByText('Upload'))
    
    // Verify resource
    expect(screen.getByText('React Docs')).toBeInTheDocument()
    expect(screen.getByText('https://react.dev')).toBeInTheDocument()
  })

  it('handles back navigation', () => {
    const mockBack = jest.fn()
    render(<GroupPage group={mockGroup} onBack={mockBack} currentUser={mockUser} />)
    
    fireEvent.click(screen.getByRole('button', { name: /back/i }))
    expect(mockBack).toHaveBeenCalled()
  })
})