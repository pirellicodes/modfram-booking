"use client";

export default function SentryTestPage() {
  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Sentry Test Page</h1>
      <p className="mb-4 text-gray-600">
        Click the button below to test Sentry error capture functionality.
      </p>
      <button
        type="button"
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
        onClick={() => {
          throw new Error("Sentry Test Error");
        }}
      >
        Break the world
      </button>
      <p className="mt-4 text-sm text-gray-500">
        This error will be captured by Sentry and sent to your dashboard.
      </p>
    </div>
  );
}
