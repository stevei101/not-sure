import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MagnifyingGlass, Sparkle, CheckCircle } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { queryAI, type QueryResponse } from '@/lib/api';
import { v4 as uuidv4 } from 'uuid';

interface SearchResult {
  id: string;
  prompt: string;
  response: QueryResponse;
  timestamp: Date;
}

export function Search() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    setIsLoading(true);
    const currentQuery = query;
    setQuery(''); // Clear input immediately for better UX

    try {
      const response = await queryAI({
        prompt: currentQuery,
        model: 'cloudflare',
      });

      const newResult: SearchResult = {
        id: uuidv4(),
        prompt: currentQuery,
        response,
        timestamp: new Date(),
      };

      setResults((prev) => [newResult, ...prev]);
      
      if (response.cached) {
        toast.info('Retrieved from cache', { duration: 2000 });
      } else {
        toast.success('Search completed', { duration: 2000 });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Search failed';
      toast.error(message);
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg gradient-bg flex items-center justify-center">
                <Sparkle size={24} weight="bold" className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text">Lornu AI</h1>
                <p className="text-sm text-muted-foreground">RAG-Powered Search</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span>Online</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Card className="border-2">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <MagnifyingGlass 
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" 
                      size={20} 
                    />
                    <Input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Ask me anything... I'm powered by Cloudflare Workers AI"
                      className="pl-10 h-12 text-base"
                      disabled={isLoading}
                    />
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isLoading || !query.trim()}
                    className="gradient-bg hover:opacity-90 px-8"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Searching...
                      </>
                    ) : (
                      <>
                        Search
                        <MagnifyingGlass size={20} weight="bold" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Results */}
        <div className="space-y-4">
          {results.map((result, index) => (
            <motion.div
              key={result.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card className="border-2 hover:border-secondary transition-colors">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Question */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                          <MagnifyingGlass size={14} className="text-primary" />
                        </div>
                        <span className="text-sm font-semibold text-foreground">Question</span>
                        {result.response.cached && (
                          <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">
                            Cached
                          </span>
                        )}
                      </div>
                      <p className="text-foreground ml-8">{result.prompt}</p>
                    </div>

                    {/* Answer */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center">
                          <CheckCircle size={14} className="text-accent" />
                        </div>
                        <span className="text-sm font-semibold text-foreground">Answer</span>
                        <span className="text-xs text-muted-foreground">
                          Model: {result.response.model}
                        </span>
                      </div>
                      <div className="ml-8 prose prose-slate max-w-none">
                        <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                          {result.response.answer}
                        </p>
                      </div>
                    </div>

                    {/* Timestamp */}
                    <div className="text-xs text-muted-foreground ml-8">
                      {result.timestamp.toLocaleString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {results.length === 0 && !isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Sparkle size={32} className="text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Start your search
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Ask me anything and I'll use RAG (Retrieval-Augmented Generation) to find the best answer.
              </p>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}

