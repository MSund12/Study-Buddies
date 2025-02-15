import { render, screen, fireEvent } from '@testing-library/react'
import GroupChatSidebar from '../src/pages/GroupChatSidebar'

describe('GroupChatSidebar', () => {
  it('toggles open and closed', () => {
    render(<GroupChatSidebar username="testuser" />)
    
    // Verify initial state
    const chatButton = screen.getByRole('button', { name: /chat/i })
    expect(chatButton).toBeInTheDocument()

    // Open chat
    fireEvent.click(chatButton)
    const minimizeButton = screen.getByRole('button', { name: '_' })
    expect(minimizeButton).toBeInTheDocument()

    // Close chat
    fireEvent.click(minimizeButton)
    expect(screen.getByRole('button', { name: /chat/i })).toBeInTheDocument()
  })

  it('sends and displays messages', () => {
    render(<GroupChatSidebar username="testuser" />)
    
    // Open chat
    fireEvent.click(screen.getByRole('button', { name: /chat/i }))
    
    // Send message
    const input = screen.getByPlaceholderText(/type a message/i)
    const sendButton = screen.getByRole('button', { name: /send/i })
    
    fireEvent.change(input, { target: { value: 'Hello World' } })
    fireEvent.click(sendButton)

    // Verify message
    expect(screen.getByText(/testuser:/i)).toBeInTheDocument()
    expect(screen.getByText(/hello world/i)).toBeInTheDocument()
  })
})