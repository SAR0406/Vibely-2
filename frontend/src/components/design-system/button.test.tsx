import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './button'
import { describe, it, expect, vi } from 'vitest'

describe('Button', () => {
    it('renders correctly', () => {
        render(<Button>Click me</Button>)
        expect(screen.getByText('Click me')).toBeInTheDocument()
    })

    it('handles click events', () => {
        const handleClick = vi.fn()
        render(<Button onClick={handleClick}>Click me</Button>)
        fireEvent.click(screen.getByText('Click me'))
        expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('shows loading state', () => {
        render(<Button isLoading>Submit</Button>)
        expect(screen.queryByText('Submit')).not.toBeInTheDocument()
        // It should probably show a spinner or loader
        // We can check if button is disabled
        expect(screen.getByRole('button')).toBeDisabled()
    })

    it('is disabled when disabled prop is passed', () => {
        render(<Button disabled>Disabled</Button>)
        expect(screen.getByRole('button')).toBeDisabled()
    })
})
