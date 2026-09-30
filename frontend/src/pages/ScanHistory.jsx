import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { 
  History, 
  Search, 
  Filter, 
  ShieldAlert, 
  ShieldCheck, 
  MessageSquare, 
  ChevronLeft, 
  ChevronRight,
  Calendar,
  AlertCircle
} from 'lucide-react';

const ScanHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [filterVerdict, setFilterVerdict] = useState('ALL'); // ALL, FAKE, REAL
  const [searchQuery, setSearchQuery] = useState('');

  const navigate = useNavigate();

  const fetchHistory = async (pageNum = 0) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const response = await api.get(`/api/scan/history?page=${pageNum}&size=10`);
      setHistory(response.data.content || []);
      setTotalPages(response.data.totalPages || 1);
      setPage(response.data.number || 0);
    } catch (err) {
      // Local fallback if backend is offline
      const local = JSON.parse(localStorage.getItem('trustlens_scans') || '[]');
      if (local.length > 0) {
        setHistory(local);
        setTotalPages(1);
        setPage(0);
      } else {
        setErrorMsg(err.response?.data?.message || 'No scan history yet. Scan an image on the Dashboard!');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(page);
  }, [page]);

  const checkIsFake = (item) => {
    if (!item) return false;
    if (typeof item.isFake === 'boolean') return item.isFake;
    if (typeof item.fake === 'boolean') return item.fake;
    if (typeof item.is_fake === 'boolean') return item.is_fake;
    const exp = (item.explanation || '').toLowerCase();
    if (exp.includes('synthetic') || exp.includes('ai-generated') || exp.includes('deepfake')) {
      return true;
    }
    return false;
  };

  // Client-side filtering across the current page items
  const filteredItems = history.map(item => ({
    ...item,
    isFake: checkIsFake(item),
    fake: checkIsFake(item)
  })).filter((item) => {
    const isSynthetic = item.fake;
    const matchesFilter =
      filterVerdict === 'ALL' ||
      (filterVerdict === 'FAKE' && isSynthetic) ||
      (filterVerdict === 'REAL' && !isSynthetic);

    const matchesSearch = item.imageName?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-gray-800 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center space-x-3">
            <History className="w-8 h-8 text-red-500" />
            <span>Scan Audit Trail</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Historical image verification records and forensic classifications
          </p>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-500" />
            <input
              type="text"
              placeholder="Search filename..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors w-48 sm:w-60"
            />
          </div>

          <div className="flex items-center space-x-1 bg-gray-900 border border-gray-800 rounded-lg p-1 text-xs font-medium">
            <button
              onClick={() => setFilterVerdict('ALL')}
              className={`px-3 py-1 rounded-md transition-colors ${
                filterVerdict === 'ALL' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterVerdict('REAL')}
              className={`px-3 py-1 rounded-md transition-colors ${
                filterVerdict === 'REAL' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Real
            </button>
            <button
              onClick={() => setFilterVerdict('FAKE')}
              className={`px-3 py-1 rounded-md transition-colors ${
                filterVerdict === 'FAKE' ? 'bg-rose-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Synthetic
            </button>
          </div>

          <button
            onClick={() => {
              localStorage.removeItem('trustlens_scans');
              setHistory([]);
            }}
            className="px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-xs text-gray-400 hover:text-red-400 hover:border-red-800 transition-colors"
            title="Clear all stored test scans"
          >
            Clear Log
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="mt-6 p-4 rounded-xl bg-red-950/60 border border-red-800/80 flex items-center space-x-3 text-red-200 text-sm">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Table / List */}
      <div className="mt-6 bg-gray-900/60 border border-gray-800 rounded-2xl overflow-hidden backdrop-blur-xl">
        {loading ? (
          <div className="py-20 flex justify-center items-center">
            <div className="w-8 h-8 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin"></div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            <History className="w-10 h-10 mx-auto text-gray-700 mb-2" />
            <p className="text-sm font-medium text-gray-400">No scan records found</p>
            <p className="text-xs text-gray-600 mt-1">Images you scan from the Dashboard will appear in this audit log.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-950/40">
                  <th className="py-3.5 px-6">Image Name</th>
                  <th className="py-3.5 px-6">Verdict</th>
                  <th className="py-3.5 px-6">Confidence</th>
                  <th className="py-3.5 px-6">Scanned At</th>
                  <th className="py-3.5 px-6">Forensic Findings</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="py-4 px-6 font-medium text-white max-w-xs truncate" title={item.imageName}>
                      {item.imageName}
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap">
                      {item.fake ? (
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-950/60 border border-rose-800/60 text-rose-300">
                          <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                          <span>AI-Generated</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/60 border border-emerald-800/60 text-emerald-300">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Authentic</span>
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-white">{(item.confidence * 100).toFixed(0)}%</span>
                        <div className="w-16 bg-gray-950 h-1.5 rounded-full overflow-hidden border border-gray-800">
                          <div
                            className={`h-full ${item.fake ? 'bg-red-500' : 'bg-emerald-500'}`}
                            style={{ width: `${item.confidence * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap text-xs text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-gray-500" />
                        <span>{new Date(item.scannedAt).toLocaleDateString()} {new Date(item.scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-xs text-gray-400 max-w-sm truncate" title={item.explanation}>
                      {item.explanation}
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap text-right">
                      <button
                        onClick={() => navigate(`/chat?scanId=${item.id}`)}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs font-medium text-gray-200 transition-colors border border-gray-700"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-red-400" />
                        <span>Ask AI</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-800 flex items-center justify-between text-xs text-gray-400">
            <span>
              Page <span className="font-medium text-white">{page + 1}</span> of{' '}
              <span className="font-medium text-white">{totalPages}</span>
            </span>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScanHistory;
