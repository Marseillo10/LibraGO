import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BooksProvider } from '../../context/BooksContext';
import { EnhancedReaderScreen } from './EnhancedReaderScreen';

// Mock the contexts
jest.mock('../../context/BooksContext', () => {
  const originalModule = jest.requireActual('../../context/BooksContext');
  return {
    ...originalModule,
    useBooks: () => ({
      currentBook: {
        id: '1',
        title: 'Test Book',
        author: 'Test Author',
        image: 'http://example.com/image.jpg',
        iaId: 'test-ia-id',
      },
      updateBookProgress: jest.fn(),
      fetchBookDetails: jest.fn(),
      readerSettings: {
        theme: 'light',
        fontSize: 16,
        lineHeight: 1.5,
        fontFamily: 'Inter',
        brightness: 100,
        readingMode: 'paginated',
        backgroundEffects: false,
        ttsSpeed: 1,
        contentProtection: false,
        bionicReading: false,
        textAlign: 'left',
        wordsPerPage: 250,
        isItalic: false,
        ttsVoice: null,
        isContinuousReading: false,
        readerWidth: 'normal',
      },
      updateReaderSettings: jest.fn(),
    }),
  };
});

jest.mock('../reader/ReaderContext', () => {
  const originalModule = jest.requireActual('../reader/ReaderContext');
  return {
    ...originalModule,
    useReader: () => ({
      bookmarks: [],
      addBookmark: jest.fn(),
      removeBookmark: jest.fn(),
      addHighlight: jest.fn(),
      viewMode: 'text',
      setViewMode: jest.fn(),
      isTextAvailable: true,
      setIsTextAvailable: jest.fn(),
      readerWidth: 'normal',
    }),
  };
});

describe('EnhancedReaderScreen', () => {
  it('renders without crashing', () => {
    render(
      <BooksProvider>
        <EnhancedReaderScreen onBack={() => {}} userName="test" userEmail="test@example.com" />
      </BooksProvider>
    );
    expect(screen.getByText('Test Book')).toBeInTheDocument();
  });
});
