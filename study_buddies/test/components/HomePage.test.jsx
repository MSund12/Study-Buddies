import { render, screen, fireEvent } from '@testing-library/react'
import HomePage from '../../src/pages/HomePage'

describe('HomePage', () => {
  it('navigates to group finder', () => {
    render(<HomePage currentUser={{ username: 'testuser' }} />)
    
    fireEvent.click(screen.getByRole('button', { name: /find a group/i }))
    expect(screen.getByText(/eecs 2311/i)).toBeInTheDocument()
  })
})