'use client';

import * as Sentry from '@sentry/nextjs';

export default function TestSentryPage() {
  const testClientError = () => {
    throw new Error('Test client-side error for Sentry');
  };

  const testAsyncError = async () => {
    throw new Error('Test async error for Sentry');
  };

  const testSentryCapture = () => {
    Sentry.captureMessage('Test message from Sentry', 'info');
  };

  const testSentryException = () => {
    Sentry.captureException(new Error('Test exception captured by Sentry'));
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Sentry Test Page</h1>

      <div className="space-y-4">
        <button
          onClick={testClientError}
          className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Test Client Error (throws)
        </button>

        <button
          onClick={testAsyncError}
          className="w-full px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
        >
          Test Async Error
        </button>

        <button
          onClick={testSentryCapture}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test Sentry Message
        </button>

        <button
          onClick={testSentryException}
          className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Test Sentry Exception
        </button>
      </div>

      <div className="mt-6 p-4 bg-gray-100 rounded">
        <p className="text-sm text-gray-600">
          Click any button above to test Sentry error reporting.
          Check your Sentry dashboard to see if errors are being captured.
        </p>
      </div>
    </div>
  );
}
