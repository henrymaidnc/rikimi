import { useState } from 'react';
import { apiClient, Chapter, Vocabulary, PracticeActivity } from '@/lib/api';

export default function TestApi() {
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [endpoint, setEndpoint] = useState<string>('chapters');

  const testEndpoints = {
    chapters: {
      name: 'Chapters',
      test: async () => {
        const data = await apiClient.getChapters();
        return data;
      },
    },
    vocabularies: {
      name: 'Vocabularies',
      test: async () => {
        const data = await apiClient.getVocabularies();
        return data;
      },
    },
    activities: {
      name: 'Activities',
      test: async () => {
        const data = await apiClient.getActivities();
        return data;
      },
    },
    progress: {
      name: 'Progress',
      test: async () => {
        const data = await apiClient.getProgress();
        return data;
      },
    },
  };

  const handleTest = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await testEndpoints[endpoint as keyof typeof testEndpoints].test();
      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error testing endpoint:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">API Test Page</h1>
      
      {/* Endpoint Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Endpoint
        </label>
        <select
          value={endpoint}
          onChange={(e) => setEndpoint(e.target.value)}
          className="block w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          {Object.entries(testEndpoints).map(([key, { name }]) => (
            <option key={key} value={key}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {/* Test Button */}
      <button
        onClick={handleTest}
        disabled={loading}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test Endpoint'}
      </button>

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {/* Response Display */}
      {response && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Response:</h2>
          <div className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-96">
            <pre className="text-sm">
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
} 