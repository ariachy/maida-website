'use client';

import { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Star, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  Trash2,
  Mail,
  Clock,
  Calendar
} from 'lucide-react';

interface Feedback {
  id: string;
  foodRating: number;
  serviceRating: number;
  atmosphereRating: number;
  message: string | null;
  name: string | null;
  email: string | null;
  submittedAt: string;
  dayOfWeek: string;
  mealPeriod: string;
}

interface Stats {
  total: number;
  averages: {
    food: number;
    service: number;
    atmosphere: number;
    overall: number;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    mealPeriod: '',
    dayOfWeek: '',
    hasMessage: false,
  });
  const [showFilters, setShowFilters] = useState(false);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });

      if (filters.mealPeriod) params.set('mealPeriod', filters.mealPeriod);
      if (filters.dayOfWeek) params.set('dayOfWeek', filters.dayOfWeek);
      if (filters.hasMessage) params.set('hasMessage', 'true');

      const response = await fetch(`/api/admin/review/feedback?${params}`);
      const data = await response.json();

      if (data.success) {
        setFeedback(data.feedback);
        setStats(data.stats);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, [page, filters]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this feedback?')) return;

    try {
      const response = await fetch(`/api/admin/review/feedback?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchFeedback();
      }
    } catch (error) {
      console.error('Failed to delete feedback:', error);
    }
  };

  const RatingDisplay = ({ value, label }: { value: number; label: string }) => {
    const emojis = ['😞', '😕', '😐', '😊', '😍'];
    return (
      <div className="flex items-center gap-2">
        <span className="text-stone text-xs w-20">{label}</span>
        <span className="text-lg">{emojis[value - 1]}</span>
        <span className="text-charcoal font-medium">{value}/5</span>
      </div>
    );
  };

  const StatCard = ({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) => (
    <div className="bg-warm-white rounded-xl p-4 border border-sand">
      <div className="flex items-center gap-3 mb-2">
        <div className="text-terracotta">{icon}</div>
        <span className="text-stone text-sm">{label}</span>
      </div>
      <p className="text-2xl font-display text-charcoal">{value}</p>
    </div>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display text-charcoal">Customer Feedback</h1>
          <p className="text-stone">View and manage feedback from the review tablet</p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
            showFilters ? 'bg-terracotta text-warm-white border-terracotta' : 'border-sand hover:border-terracotta'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Responses"
            value={stats.total}
            icon={<MessageSquare className="w-5 h-5" />}
          />
          <StatCard
            label="Food Average"
            value={`${stats.averages.food}/5`}
            icon={<Star className="w-5 h-5" />}
          />
          <StatCard
            label="Service Average"
            value={`${stats.averages.service}/5`}
            icon={<Star className="w-5 h-5" />}
          />
          <StatCard
            label="Overall Average"
            value={`${stats.averages.overall}/5`}
            icon={<Star className="w-5 h-5 fill-current" />}
          />
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="bg-cream rounded-xl p-4 mb-6 flex flex-wrap gap-4">
          <div>
            <label className="text-xs text-stone block mb-1">Meal Period</label>
            <select
              value={filters.mealPeriod}
              onChange={(e) => setFilters({ ...filters, mealPeriod: e.target.value })}
              className="bg-warm-white border border-sand rounded-lg px-3 py-2 text-sm"
            >
              <option value="">All</option>
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="afternoon">Afternoon</option>
              <option value="dinner">Dinner</option>
              <option value="late-night">Late Night</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-stone block mb-1">Day of Week</label>
            <select
              value={filters.dayOfWeek}
              onChange={(e) => setFilters({ ...filters, dayOfWeek: e.target.value })}
              className="bg-warm-white border border-sand rounded-lg px-3 py-2 text-sm"
            >
              <option value="">All</option>
              <option value="Monday">Monday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
              <option value="Saturday">Saturday</option>
              <option value="Sunday">Sunday</option>
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.hasMessage}
                onChange={(e) => setFilters({ ...filters, hasMessage: e.target.checked })}
                className="rounded border-sand"
              />
              <span className="text-sm text-charcoal">Has message only</span>
            </label>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ mealPeriod: '', dayOfWeek: '', hasMessage: false })}
              className="text-sm text-terracotta hover:underline"
            >
              Clear filters
            </button>
          </div>
        </div>
      )}

      {/* Feedback List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-terracotta border-t-transparent rounded-full mx-auto" />
        </div>
      ) : feedback.length === 0 ? (
        <div className="text-center py-12 bg-cream rounded-xl">
          <MessageSquare className="w-12 h-12 text-stone mx-auto mb-4" />
          <p className="text-stone">No feedback yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {feedback.map((item) => (
            <div key={item.id} className="bg-warm-white rounded-xl p-5 border border-sand">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4 text-sm text-stone">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(item.submittedAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {new Date(item.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="bg-cream px-2 py-1 rounded text-xs">
                    {item.dayOfWeek} · {item.mealPeriod}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-stone hover:text-red-500 transition-colors p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Ratings */}
              <div className="flex flex-wrap gap-6 mb-4">
                <RatingDisplay value={item.foodRating} label="Food" />
                <RatingDisplay value={item.serviceRating} label="Service" />
                <RatingDisplay value={item.atmosphereRating} label="Atmosphere" />
              </div>

              {/* Message */}
              {item.message && (
                <div className="bg-cream rounded-lg p-3 mb-4">
                  <p className="text-charcoal">&ldquo;{item.message}&rdquo;</p>
                </div>
              )}

              {/* Contact info */}
              {(item.name || item.email) && (
                <div className="flex items-center gap-4 text-sm text-stone">
                  {item.name && <span>{item.name}</span>}
                  {item.email && (
                    <a href={`mailto:${item.email}`} className="flex items-center gap-1 text-terracotta hover:underline">
                      <Mail className="w-4 h-4" />
                      {item.email}
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="p-2 rounded-lg border border-sand hover:border-terracotta disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-stone">
            Page {page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page === pagination.totalPages}
            className="p-2 rounded-lg border border-sand hover:border-terracotta disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
