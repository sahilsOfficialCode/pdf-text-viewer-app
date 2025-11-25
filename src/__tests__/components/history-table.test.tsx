import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { HistoryTable } from '@/components/history-table'

// Mock fetch
global.fetch = jest.fn()

const mockHistory = [
  {
    id: '1',
    fileName: 'test-file.pdf',
    uploadedAt: new Date('2024-01-15'),
    fileContent: 'This is the extracted text content from the PDF file for testing purposes.',
  },
  {
    id: '2',
    fileName: 'another-document.pdf',
    uploadedAt: new Date('2024-01-16'),
    fileContent: 'Another PDF content here with different text.',
  },
]

describe('HistoryTable', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders empty state when no history', () => {
    render(<HistoryTable history={[]} />)
    expect(screen.getByText('No history found')).toBeInTheDocument()
  })

  it('renders table with history items', () => {
    render(<HistoryTable history={mockHistory} />)
    
    expect(screen.getByText('test-file.pdf')).toBeInTheDocument()
    expect(screen.getByText('another-document.pdf')).toBeInTheDocument()
  })

  it('displays content preview truncated', () => {
    render(<HistoryTable history={mockHistory} />)
    
    // Content should be truncated to 50 chars + "..."
    expect(screen.getByText(/This is the extracted text content from the PDF fi.../)).toBeInTheDocument()
  })

  it('renders View and Delete buttons for each item', () => {
    render(<HistoryTable history={mockHistory} />)
    
    const viewButtons = screen.getAllByRole('button', { name: /view/i })
    const deleteButtons = screen.getAllByRole('button')
    
    expect(viewButtons).toHaveLength(2)
    // Each row has View + Delete button
    expect(deleteButtons.length).toBeGreaterThanOrEqual(4)
  })

  it('shows confirmation dialog on delete click', async () => {
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(false)
    
    render(<HistoryTable history={mockHistory} />)
    
    const deleteButtons = screen.getAllByRole('button').filter(
      btn => btn.querySelector('svg.lucide-trash-2')
    )
    
    fireEvent.click(deleteButtons[0])
    
    expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to delete this PDF?')
    confirmSpy.mockRestore()
  })

  it('calls delete API when confirmed', async () => {
    jest.spyOn(window, 'confirm').mockReturnValue(true)
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true })
    
    render(<HistoryTable history={mockHistory} />)
    
    const deleteButtons = screen.getAllByRole('button').filter(
      btn => btn.querySelector('svg.lucide-trash-2')
    )
    
    fireEvent.click(deleteButtons[0])
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/pdf?id=1', { method: 'DELETE' })
    })
  })

  it('renders table headers correctly', () => {
    render(<HistoryTable history={mockHistory} />)
    
    expect(screen.getByText('File Name')).toBeInTheDocument()
    expect(screen.getByText('Uploaded At')).toBeInTheDocument()
    expect(screen.getByText('Content Preview')).toBeInTheDocument()
    expect(screen.getByText('Actions')).toBeInTheDocument()
  })
})
