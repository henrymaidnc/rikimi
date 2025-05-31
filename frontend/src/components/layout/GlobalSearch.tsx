import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { API_BASE_URL } from '@/config';

export function GlobalSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Search all endpoints in parallel
      const [vocabRes, grammarRes, notesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/vocabularies/?search=${encodeURIComponent(searchQuery)}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }),
        fetch(`${API_BASE_URL}/grammar_patterns/?search=${encodeURIComponent(searchQuery)}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }),
        fetch(`${API_BASE_URL}/notes/?search=${encodeURIComponent(searchQuery)}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        })
      ]);

      const [vocabData, grammarData, notesData] = await Promise.all([
        vocabRes.ok ? vocabRes.json() : { results: [] },
        grammarRes.ok ? grammarRes.json() : { results: [] },
        notesRes.ok ? notesRes.json() : { results: [] },
      ]);

      // Add type to each result
      const vocabResults = (vocabData.results || []).map((item: any) => ({ ...item, _type: 'Vocabulary' }));
      const grammarResults = (grammarData.results || []).map((item: any) => ({ ...item, _type: 'Grammar' }));
      const notesResults = (notesData.results || []).map((item: any) => ({ ...item, _type: 'Note' }));
      console.log('Notes search results:', notesResults);

      setSearchResults([...vocabResults, ...grammarResults, ...notesResults]);
    } catch (error) {
      console.error("Error searching:", error);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery) {
        handleSearch();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  return (
    <div className="relative max-w-xl mx-auto px-4 py-2 w-full md:w-[32rem]">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search all..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8 w-full"
        />
      </div>
      {searchQuery && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-md shadow-lg border">
          {isSearching ? (
            <div className="p-4 text-center text-muted-foreground">Searching...</div>
          ) : searchResults.length > 0 ? (
            <div className="max-h-60 overflow-y-auto">
              {searchResults.map((item) => (
                <div
                  key={item.id + item._type}
                  className="p-3 hover:bg-green-50 cursor-pointer border-b last:border-b-0"
                  onClick={() => {
                    if (item._type === 'Vocabulary') navigate(`/chapters/${item.chapter}?highlight=${encodeURIComponent(item.word)}`);
                    else if (item._type === 'Grammar') navigate(`/chapters/${item.chapter}?highlight=${encodeURIComponent(item.pattern)}`);
                    else if (item._type === 'Note') {
                      if (searchQuery && searchQuery !== 'null') {
                        navigate(`/notes?highlight=${encodeURIComponent(searchQuery)}`);
                      } else {
                        navigate(`/notes`);
                      }
                    }
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-800">{item._type}</span>
                    <span className="font-medium">
                      {item._type === 'Vocabulary' && item.word}
                      {item._type === 'Grammar' && item.pattern}
                      {item._type === 'Note' && (item.content ? (item.content.slice(0, 40) + (item.content.length > 40 ? '...' : '')) : <span className="italic text-gray-400">No content</span>)}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {item._type === 'Vocabulary' && item.meaning}
                    {item._type === 'Grammar' && item.explanation}
                    {item._type === 'Note' && item.content}
                  </div>
                  {item.example && (
                    <div className="text-xs text-muted-foreground mt-1 italic">
                      Example: {item.example}
                    </div>
                  )}
                  {item.examples && item.examples.length > 0 && (
                    <div className="text-xs text-muted-foreground mt-1 italic">
                      Examples: {item.examples.join('; ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">No results found</div>
          )}
        </div>
      )}
    </div>
  );
} 