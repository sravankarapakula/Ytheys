'use client';

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { Send, Sparkles, ExternalLink, Star, Briefcase, TrendingUp, Trophy, Flame, DollarSign, Award, Building2 } from 'lucide-react';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Agency {
  id: string;
  name: string;
  domain: string;
  description: string;
  team_size: number;
  funding_stage: string;
  views: number;
  country: string;
  city: string;
  email: string;
  website: string;
  skills: string[];
  sdg_alignment: number[];
  founded_year?: number;
  similarity_score: number;
  imgUrl?: string;
  popularity?: "legendary" | "famous" | "popular" | "rising";
  category?: 'best_match' | 'most_popular' | 'budget_friendly' | 'our_recommendation' | 'other';
}

interface APIResponse {
  success: boolean;
  data: {
    prompt: string;
    total_matches: number;
    showing: number;
    model_info: {
      name: string;
      dimension: number;
      normalized: boolean;
      device: string;
    };
    performance: {
      total_time_ms: number;
      embedding_time_ms: number;
      similarity_calc_ms: number;
      organizations_searched: number;
    };
    recommendations: {
      best_match: Agency;
      most_popular: Agency;
      budget_friendly: Agency;
      our_recommendation: Agency;
    };
    all_matches: Agency[];
  };
}

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  topRecommendations?: {
    best_match: Agency;
    most_popular: Agency;
    budget_friendly: Agency;
    our_recommendation: Agency;
  };
  otherAgencies?: Agency[];
  performance?: APIResponse['data']['performance'];
  timestamp: Date;
}

const getCategoryConfig = (category: string) => {
  const configs = {
    best_match: {
      label: 'Best Match',
      icon: Trophy,
      gradient: 'from-yellow-400 to-orange-500',
      borderColor: 'border-yellow-400/30',
      bgColor: 'bg-yellow-500/10',
      textColor: 'text-yellow-400',
      emoji: '🎯'
    },
    most_popular: {
      label: 'Most Popular',
      icon: Flame,
      gradient: 'from-orange-400 to-red-500',
      borderColor: 'border-orange-400/30',
      bgColor: 'bg-orange-500/10',
      textColor: 'text-orange-400',
      emoji: '🔥'
    },
    budget_friendly: {
      label: 'Budget Friendly',
      icon: DollarSign,
      gradient: 'from-green-400 to-emerald-500',
      borderColor: 'border-green-400/30',
      bgColor: 'bg-green-500/10',
      textColor: 'text-green-400',
      emoji: '💰'
    },
    our_recommendation: {
      label: 'Our Recommendation',
      icon: Award,
      gradient: 'from-purple-400 to-pink-500',
      borderColor: 'border-purple-400/30',
      bgColor: 'bg-purple-500/10',
      textColor: 'text-purple-400',
      emoji: '⭐'
    }
  };
  return configs[category as keyof typeof configs] || configs.best_match;
};

const getPopularity = (teamSize: number, views: number): "legendary" | "famous" | "popular" | "rising" => {
  if (views >= 100 || teamSize >= 50) return 'legendary';
  if (views >= 50 || teamSize >= 20) return 'famous';
  if (views >= 10 || teamSize >= 10) return 'popular';
  return 'rising';
};

const formatNumber = (n: number) =>
  n >= 1e6 ? `${+(n / 1e6).toFixed(1)}M` :
    n >= 1e3 ? `${+(n / 1e3).toFixed(1)}k` :
      n.toString();

export default function AIAgencyMatcher() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const checkAPIHealth = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/health`);
        if (response.ok) {
          setApiStatus('online');
        } else {
          setApiStatus('offline');
        }
      } catch (error) {
        console.error('API health check failed:', error);
        setApiStatus('offline');
      }
    };

    checkAPIHealth();
  }, []);

  const searchAgencies = async (prompt: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/recommendations/semantic`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, top_k: 10 }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result: APIResponse = await response.json();

      if (!result.success || !result.data.recommendations) {
        throw new Error('Invalid API response');
      }

      const { best_match, most_popular, budget_friendly, our_recommendation } = result.data.recommendations;
      const { all_matches } = result.data;

      // Add category and logo to top 4 recommendations
      const topRecommendations = {
        best_match: {
          ...best_match,
          category: 'best_match' as const,
          imgUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(best_match.name)}&background=random&size=128`,
          popularity: getPopularity(best_match.team_size, best_match.views),
        },
        most_popular: {
          ...most_popular,
          category: 'most_popular' as const,
          imgUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(most_popular.name)}&background=random&size=128`,
          popularity: getPopularity(most_popular.team_size, most_popular.views),
        },
        budget_friendly: {
          ...budget_friendly,
          category: 'budget_friendly' as const,
          imgUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(budget_friendly.name)}&background=random&size=128`,
          popularity: getPopularity(budget_friendly.team_size, budget_friendly.views),
        },
        our_recommendation: {
          ...our_recommendation,
          category: 'our_recommendation' as const,
          imgUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(our_recommendation.name)}&background=random&size=128`,
          popularity: getPopularity(our_recommendation.team_size, our_recommendation.views),
        },
      };

      // Filter out the top 4 from all_matches to get "other companies"
      const topIds = new Set([
        best_match.id,
        most_popular.id,
        budget_friendly.id,
        our_recommendation.id
      ]);

      const otherAgencies = all_matches
        .filter(org => !topIds.has(org.id))
        .map(org => ({
          ...org,
          category: 'other' as const,
          imgUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(org.name)}&background=random&size=128`,
          popularity: getPopularity(org.team_size, org.views),
        }));

      return { topRecommendations, otherAgencies, performance: result.data.performance };
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || apiStatus !== 'online') return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { topRecommendations, otherAgencies, performance } = await searchAgencies(userMessage.content);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `🎯 Using AI semantic search (GTE-Large), I found the perfect matches for you:`,
        topRecommendations,
        otherAgencies,
        performance,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: "⚠️ Sorry, I encountered an error while searching. Please make sure the API server is running and try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  const AgencyCard = ({ agency, isTopPick = false }: { agency: Agency; isTopPick?: boolean }) => {
    const config = agency.category ? getCategoryConfig(agency.category) : null;
    const Icon = config?.icon;

    return (
      <div className={`relative bg-neutral-900/60 border rounded-2xl p-6 hover:border-neutral-700/50 transition-all group backdrop-blur-sm hover:shadow-2xl ${
        isTopPick ? 'border-2 ' + config?.borderColor : 'border-neutral-800/50'
      }`}>
        {/* Category Badge for Top Picks */}
        {isTopPick && config && Icon && (
          <div className={`absolute -top-3 -left-3 px-4 py-2 bg-gradient-to-r ${config.gradient} rounded-xl flex items-center gap-2 shadow-xl`}>
            <Icon className="w-4 h-4 text-white" />
            <span className="text-white text-sm font-bold">{config.label}</span>
          </div>
        )}

        <div className="flex items-start gap-5">
          {/* Agency Logo */}
          {agency.imgUrl && (
            <div className="relative flex-shrink-0">
              <div className={`absolute inset-0 rounded-xl blur-md ${
                isTopPick ? `bg-gradient-to-br ${config?.gradient} opacity-30` : 'bg-gradient-to-br from-yellow-400/20 to-pink-500/20'
              }`} />
              <Image
                src={agency.imgUrl}
                alt={agency.name}
                width={64}
                height={64}
                className="relative rounded-xl border border-neutral-800/50"
                unoptimized
              />
            </div>
          )}

          {/* Agency Info */}
          <div className="flex-1 min-w-0">
            <div className="mb-3">
              <h3 className="text-xl font-bold text-white group-hover:text-yellow-300 transition-colors mb-2">
                {agency.name}
              </h3>
              <p className="text-sm text-neutral-400 leading-relaxed">
                {agency.description}
              </p>
            </div>

            {/* Domain & Skills */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1.5 bg-blue-500/15 text-blue-400 border border-blue-400/30 rounded-lg text-xs font-semibold">
                🎯 {agency.domain}
              </span>
              {agency.skills?.slice(0, 3).map((skill, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 bg-neutral-800/60 text-neutral-300 border border-neutral-700/40 rounded-lg text-xs font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>

            {/* Stats & Actions */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-5 text-sm">
                <div className="flex items-center gap-2 text-neutral-400">
                  <Briefcase className="w-4 h-4 text-blue-400" />
                  <span className="font-mono font-semibold text-white">{agency.team_size} team</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-400">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="font-mono font-semibold text-white">{formatNumber(agency.views)} views</span>
                </div>
                <span className="text-xs px-3 py-1 rounded-lg font-semibold bg-purple-500/15 text-purple-400 border border-purple-400/30">
                  {agency.funding_stage}
                </span>
              </div>

              {agency.website && (
                <Link
                  href={agency.website.startsWith('http') ? agency.website : `https://${agency.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105 active:scale-95 ${
                    isTopPick 
                      ? `bg-gradient-to-r ${config?.gradient} text-white shadow-lg`
                      : 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 hover:from-yellow-500/20 hover:to-orange-500/20 text-yellow-400 border border-yellow-400/30'
                  }`}
                >
                  Visit Website
                  <ExternalLink className="w-4 h-4" />
                </Link>
              )}
            </div>

            {/* Location & Contact */}
            <div className="mt-4 pt-4 border-t border-neutral-800/50 flex items-center justify-between text-xs flex-wrap gap-2">
              <span className="text-neutral-500">
                📍 {agency.city}, {agency.country}
              </span>
              {agency.email && (
                <span className="text-neutral-500">
                  ✉️ {agency.email}
                </span>
              )}
            </div>

            {/* AI Match Score */}
            {agency.similarity_score !== undefined && (
              <div className="mt-4 pt-4 border-t border-neutral-800/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-500 font-medium">AI Semantic Match</span>
                  <div className="flex items-center gap-3">
                    <div className="w-40 h-2 bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ease-out ${
                          isTopPick ? `bg-gradient-to-r ${config?.gradient}` : 'bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500'
                        }`}
                        style={{ width: `${Math.min(agency.similarity_score * 100, 100)}%` }}
                      />
                    </div>
                    <span className={`font-mono text-sm font-bold ${isTopPick ? config?.textColor : 'text-yellow-400'}`}>
                      {(agency.similarity_score * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full h-screen flex flex-col bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-yellow-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-pink-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      {/* Header */}
      <div className="relative border-b border-neutral-800/50 bg-black/40 backdrop-blur-xl sticky top-0 z-10 shadow-2xl">
        <div className="max-w-5xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500 rounded-2xl blur-md opacity-50" />
              </div>
              <div>
                <Link href="/" className="inline-flex font-instrument items-center font-mono text-white text-[1.9rem] sm:text-[2.5rem] font-medium leading-none tracking-tight">
                  <span className="text-white">Yth</span>
                  <span className="text-neutral-500">eys</span>
                </Link>
              </div>
            </div>
            
            {/* API Status Indicator */}
            <div className={`flex items-center gap-2 px-4 py-2 border rounded-lg ${
              apiStatus === 'online' 
                ? 'bg-green-900/20 border-green-700/30 text-green-400'
                : apiStatus === 'offline'
                ? 'bg-red-900/20 border-red-700/30 text-red-400'
                : 'bg-neutral-800/30 border-neutral-700/30 text-neutral-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                apiStatus === 'online' 
                  ? 'bg-green-400 animate-pulse'
                  : apiStatus === 'offline'
                  ? 'bg-red-400'
                  : 'bg-neutral-400 animate-pulse'
              }`} />
              <span className="text-sm font-medium">
                {apiStatus === 'online' ? 'AI Online' : apiStatus === 'offline' ? 'AI Offline' : 'Connecting...'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="relative flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-8">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 via-orange-500/20 to-pink-500/20 rounded-3xl blur-2xl" />
              </div>
              <div className="text-center space-y-3 max-w-2xl">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent">
                  What kind of organization are you looking for?
                </h2>
                <p className="text-neutral-400 text-lg">
                  Powered by GTE-Large AI • Semantic search through {apiStatus === 'online' ? '250+' : '...'} organizations
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-3xl mt-4">
                {[
                  { text: "AI partner for predictive analytics in energy", icon: "⚡" },
                  { text: "FinTech startup with blockchain expertise", icon: "💰" },
                  { text: "Sustainable agriculture with IoT solutions", icon: "🌾" },
                  { text: "HealthTech company for telemedicine platform", icon: "🏥" }
                ].map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(suggestion.text)}
                    className="group px-5 py-4 bg-neutral-900/30 hover:bg-neutral-800/50 border border-neutral-800/50 hover:border-neutral-700/50 rounded-xl text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{suggestion.icon}</span>
                      <span className="text-sm text-neutral-300 group-hover:text-white transition-colors">
                        {suggestion.text}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-4 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.type === 'assistant' && (
                    <div className="relative flex-shrink-0">
                      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500 rounded-2xl blur-md opacity-40" />
                      <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500 flex items-center justify-center shadow-lg">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  )}
                  
                  <div className={`flex flex-col gap-4 max-w-3xl w-full ${message.type === 'user' ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`px-5 py-3 rounded-2xl shadow-lg ${
                        message.type === 'user'
                          ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white'
                          : 'bg-neutral-900/60 border border-neutral-800/50 text-neutral-200 backdrop-blur-sm'
                      }`}
                    >
                      {message.content}
                    </div>

                    {/* Top 4 Recommendations */}
                    {message.topRecommendations && (
                      <div className="w-full space-y-6 mt-2">
                        <div className="space-y-4">
                          <AgencyCard agency={message.topRecommendations.best_match} isTopPick={true} />
                          <AgencyCard agency={message.topRecommendations.most_popular} isTopPick={true} />
                          <AgencyCard agency={message.topRecommendations.budget_friendly} isTopPick={true} />
                          <AgencyCard agency={message.topRecommendations.our_recommendation} isTopPick={true} />
                        </div>

                        {/* Other Companies Section */}
                        {message.otherAgencies && message.otherAgencies.length > 0 && (
                          <div className="mt-8 pt-8 border-t border-neutral-800/50">
                            <div className="flex items-center gap-3 mb-6">
                              <Building2 className="w-5 h-5 text-neutral-400" />
                              <h3 className="text-lg font-bold text-neutral-300">
                                Other Matching Organizations ({message.otherAgencies.length})
                              </h3>
                            </div>
                            <div className="space-y-4">
                              {message.otherAgencies.map((agency) => (
                                <AgencyCard key={agency.id} agency={agency} isTopPick={false} />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Performance Stats */}
                        {message.performance && (
                          <div className="mt-6 p-4 bg-neutral-900/40 border border-neutral-800/30 rounded-xl">
                            <div className="flex items-center justify-between text-xs text-neutral-500">
                              <span>⚡ Search completed in {message.performance.total_time_ms}ms</span>
                              <span>🔍 Searched {message.performance.organizations_searched} organizations</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {message.type === 'user' && (
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                      <span className="text-white text-xs font-bold">You</span>
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-4">
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500 rounded-2xl blur-md opacity-40" />
                    <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white animate-pulse" />
                    </div>
                  </div>
                  <div className="bg-neutral-900/60 border border-neutral-800/50 rounded-2xl px-5 py-3 backdrop-blur-sm">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="relative border-t border-neutral-800/50 bg-black/40 backdrop-blur-xl sticky bottom-0 shadow-2xl">
        <div className="max-w-5xl mx-auto px-6 py-5">
          <form onSubmit={handleSubmit} className="relative">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 via-orange-500/10 to-pink-500/10 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  apiStatus === 'online' 
                    ? "Describe what you're looking for... (Press Enter to send, Shift+Enter for new line)"
                    : "Waiting for API connection..."
                }
                disabled={apiStatus !== 'online' || isLoading}
                className="relative w-full px-6 py-4 pr-14 bg-neutral-900/60 border border-neutral-800/50 rounded-2xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 resize-none max-h-32 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm transition-all"
                rows={1}
              />
              <button
                type="submit"
                disabled={!input.trim() || apiStatus !== 'online' || isLoading}
                className="absolute right-3 bottom-3 p-2.5 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:from-neutral-700 disabled:to-neutral-700 disabled:cursor-not-allowed rounded-xl transition-all hover:scale-110 active:scale-95 shadow-lg"
              >
                <Send className="w-5 h-5 text-white" />
              </button>
            </div>
          </form>
          <p className="text-xs text-neutral-500 mt-3 text-center">
            ✨ Powered by GTE-Large AI (1024-dim semantic embeddings) • {apiStatus === 'online' ? 'Sub-second results' : 'Connecting to AI...'}
          </p>
        </div>
      </div>
    </div>
  );
}
