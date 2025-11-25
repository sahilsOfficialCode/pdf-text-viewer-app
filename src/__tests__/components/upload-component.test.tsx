import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import UploadComponent from '@/components/upload-component'

global.fetch = jest.fn()

describe('UploadComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders upload area', () => {
    render(<UploadComponent />)
    
    expect(screen.getByText(/upload pdf/i)).toBeInTheDocument()
  })

  it('renders file input with correct accept attribute', () => {
    render(<UploadComponent />)
    
    const input = document.querySelector('input[type="file"]')
    expect(input).toHaveAttribute('accept', 'application/pdf')
  })

  it('shows upload button', () => {
    render(<UploadComponent />)
    
    expect(screen.getByRole('button', { name: /upload/i })).toBeInTheDocument()
  })

  it('upload button is disabled when no file selected', () => {
    render(<UploadComponent />)
    
    const button = screen.getByRole('button', { name: /upload/i })
    expect(button).toBeDisabled()
  })

  it('enables upload button when file is selected', async () => {
    render(<UploadComponent />)
    
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' })
    
    Object.defineProperty(input, 'files', {
      value: [file],
    })
    
    fireEvent.change(input)
    
    await waitFor(() => {
      const button = screen.getByRole('button', { name: /upload/i })
      expect(button).not.toBeDisabled()
    })
  })

  it('calls upload API when form is submitted', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    })

    render(<UploadComponent />)
    
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' })
    
    Object.defineProperty(input, 'files', {
      value: [file],
    })
    
    fireEvent.change(input)
    
    const button = screen.getByRole('button', { name: /upload/i })
    fireEvent.click(button)
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/upload', expect.objectContaining({
        method: 'POST',
      }))
    })
  })

  it('handles upload error', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'Upload failed' }),
    })

    render(<UploadComponent />)
    
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' })
    
    Object.defineProperty(input, 'files', {
      value: [file],
    })
    
    fireEvent.change(input)
    
    const button = screen.getByRole('button', { name: /upload/i })
    fireEvent.click(button)
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled()
    })
  })

  it('handles duplicate file error (409)', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: () => Promise.resolve({ error: 'A file with this name already exists.' }),
    })

    render(<UploadComponent />)
    
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['test content'], 'duplicate.pdf', { type: 'application/pdf' })
    
    Object.defineProperty(input, 'files', {
      value: [file],
    })
    
    fireEvent.change(input)
    
    const button = screen.getByRole('button', { name: /upload/i })
    fireEvent.click(button)
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled()
    })
  })
})
