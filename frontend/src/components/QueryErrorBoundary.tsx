import React from 'react';
import { useQueryErrorResetBoundary } from '@tanstack/react-query';
import ErrorBoundary from './ErrorBoundary';

interface QueryErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const QueryErrorBoundary: React.FC<QueryErrorBoundaryProps> = ({ 
  children, 
  fallback 
}) => {
  const { reset } = useQueryErrorResetBoundary();

  return (
    <ErrorBoundary
      fallback={
        fallback || (
          <div className="query-error-boundary">
            <h2>Something went wrong with data loading.</h2>
            <p>There was an error fetching data. Please try again.</p>
            <button onClick={() => reset()}>
              Try again
            </button>
          </div>
        )
      }
    >
      {children}
    </ErrorBoundary>
  );
};

export default QueryErrorBoundary;
