import { render, screen, fireEvent, act } from '@testing-library/react'
import { ThemeProvider, useTheme } from '@/components/resume/ThemeContext'

function TestConsumer() {
  const { theme, toggleTheme } = useTheme()
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button onClick={toggleTheme}>toggle</button>
    </div>
  )
}

describe('ThemeContext', () => {
  beforeEach(() => localStorage.clear())

  it('defaults to dark theme', () => {
    render(<ThemeProvider><TestConsumer /></ThemeProvider>)
    expect(screen.getByTestId('theme').textContent).toBe('dark')
  })

  it('toggles to light on click', () => {
    render(<ThemeProvider><TestConsumer /></ThemeProvider>)
    fireEvent.click(screen.getByText('toggle'))
    expect(screen.getByTestId('theme').textContent).toBe('light')
  })

  it('toggles back to dark on second click', () => {
    render(<ThemeProvider><TestConsumer /></ThemeProvider>)
    fireEvent.click(screen.getByText('toggle'))
    fireEvent.click(screen.getByText('toggle'))
    expect(screen.getByTestId('theme').textContent).toBe('dark')
  })

  it('reads saved theme from localStorage', () => {
    localStorage.setItem('portfolio-resume-theme', 'light')
    render(<ThemeProvider><TestConsumer /></ThemeProvider>)
    expect(screen.getByTestId('theme').textContent).toBe('light')
  })

  it('saves theme to localStorage on toggle', () => {
    render(<ThemeProvider><TestConsumer /></ThemeProvider>)
    fireEvent.click(screen.getByText('toggle'))
    expect(localStorage.getItem('portfolio-resume-theme')).toBe('light')
  })
})
