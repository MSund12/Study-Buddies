import { render, screen, fireEvent } from '@testing-library/react'
import GroupFinderPage from '../../src/pages/GroupFinderPage'

describe('GroupFinderPage', () => {
  const mockGroups = [
    { id: 1, name: 'EECS 2311' },
    { id: 2, name: 'Math 2015' }
  ]

  it('displays groups and handles selection', () => {
    const mockSelect = vi.fn()
    render(<GroupFinderPage onBack={vi.fn()} onSelectGroup={mockSelect} />)
    
    // Verify groups render
    expect(screen.getByText('EECS 2311')).toBeInTheDocument()
    expect(screen.getByText('Math 2015')).toBeInTheDocument()

    // Test group selection
    fireEvent.click(screen.getByText('EECS 2311'))
    expect(mockSelect).toHaveBeenCalledWith({ id: 1, name: 'EECS 2311' })
  })

  it('handles back button', () => {
    const mockBack = vi.fn()
    render(<GroupFinderPage onBack={mockBack} onSelectGroup={vi.fn()} />)
    
    fireEvent.click(screen.getByRole('button', { name: /back/i }))
    expect(mockBack).toHaveBeenCalled()
  })
})