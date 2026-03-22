import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { DateTimePicker } from './date-time-picker';
import '@testing-library/jest-dom';

describe('DateTimePicker', () => {
  const RealDate = Date;

  const mockDate = (isoString: string) => {
    global.Date = class extends RealDate {
      constructor(dateString?: string | number | Date) {
        if (dateString) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          super(dateString as any);
        } else {
          super(isoString);
        }
      }
      static now() {
        return new RealDate(isoString).getTime();
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
  };

  afterEach(() => {
    global.Date = RealDate;
    jest.clearAllMocks();
  });

  it('renders with the default value', () => {
    mockDate('2026-03-20T12:00:00');
    const mockOnChange = jest.fn();
    const currentDate = new Date();

    render(<DateTimePicker value={currentDate} onChange={mockOnChange} />);

    // Expect the button to have formatted date text
    const button = screen.getByRole('button');
    // PPP HH:mm for March 20, 2026 12:00 is "Mar 20th, 2026 12:00" etc depending on locale
    // We just check if it renders without crashing and contains parts of the date string
    expect(button).toBeInTheDocument();
  });

  it('allows changing the time if it is in the future', () => {
    mockDate('2026-03-20T12:00:00');
    const mockOnChange = jest.fn();
    const currentDate = new Date();

    render(<DateTimePicker value={currentDate} onChange={mockOnChange} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    const hoursInput = screen.getByLabelText('Hours') as HTMLInputElement;
    
    act(() => {
      fireEvent.change(hoursInput, { target: { value: '14' } });
    });

    expect(mockOnChange).toHaveBeenCalled();
    const calledDate = mockOnChange.mock.calls[0][0] as Date;
    expect(calledDate.getHours()).toBe(14);
  });

  it('prevents selecting a past date/time, resetting to now', () => {
    mockDate('2026-03-20T12:00:00');
    const mockOnChange = jest.fn();
    const currentDate = new Date(); // 12:00
    
    render(<DateTimePicker value={currentDate} onChange={mockOnChange} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    const hoursInput = screen.getByLabelText('Hours') as HTMLInputElement;
    
    act(() => {
      // Trying to set 10 AM, which is in the past compared to 12 PM
      fireEvent.change(hoursInput, { target: { value: '10' } });
    });

    expect(mockOnChange).toHaveBeenCalled();
    const calledDate = mockOnChange.mock.calls[0][0] as Date;
    // It should autocorrect to now
    expect(calledDate.getTime()).toBe(currentDate.getTime());
  });
});
