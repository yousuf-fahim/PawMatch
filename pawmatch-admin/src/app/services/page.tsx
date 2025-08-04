'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import { Plus, Search, MapPin, Phone, Mail, Calendar, Check, X, Edit, Trash2, Star, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface PetService {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  website: string;
  description: string;
  is_verified: boolean;
  service_type: string;
  rating: number;
  created_at: string;
}

export default function PetServicesPage() {
  const [services, setServices] = useState<PetService[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'verified' | 'pending'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'created_at' | 'rating'>('name');
  const [error, setError] = useState<string | null>(null);
  const { user, isAdmin } = useAuth();
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('pet_services')
        .select(`
          id,
          name,
          email,
          phone,
          address,
          city,
          state,
          zip_code,
          website,
          description,
          is_verified,
          service_type,
          rating,
          created_at
        `);

      if (error) {
        throw error;
      }

      // Process and calculate additional properties if needed
      const processedServices = data.map(service => ({
        ...service,
        rating: service.rating || 0
      }));

      setServices(processedServices);
    } catch (error: any) {
      console.error('Error fetching services:', error);
      setError(error.message || 'Failed to load pet services');
    } finally {
      setLoading(false);
    }
  };

  const verifyService = async (serviceId: string, isVerified: boolean) => {
    try {
      const { error } = await supabase
        .from('pet_services')
        .update({ is_verified: isVerified })
        .eq('id', serviceId);

      if (error) {
        throw error;
      }

      // Update local state
      setServices(services.map(service => 
        service.id === serviceId 
          ? { ...service, is_verified: isVerified } 
          : service
      ));
    } catch (error: any) {
      console.error('Error updating service verification status:', error);
      alert('Failed to update verification status: ' + error.message);
    }
  };

  const deleteService = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('pet_services')
        .delete()
        .eq('id', serviceId);

      if (error) {
        throw error;
      }

      // Update local state
      setServices(services.filter(service => service.id !== serviceId));
    } catch (error: any) {
      console.error('Error deleting service:', error);
      alert('Failed to delete service: ' + error.message);
    }
  };

  const filteredServices = services
    .filter(service => {
      // Apply search filter
      const matchesSearch = searchTerm === '' || 
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.service_type.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Apply status filter
      const matchesStatus = 
        filterStatus === 'all' || 
        (filterStatus === 'verified' && service.is_verified) || 
        (filterStatus === 'pending' && !service.is_verified);
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      // Apply sorting
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'created_at':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

  // Calculate summary statistics
  const stats = {
    total: services.length,
    verified: services.filter(s => s.is_verified).length,
    pending: services.filter(s => !s.is_verified).length,
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-center mb-2">Access Denied</h1>
          <p className="text-gray-600 text-center mb-6">
            You don't have permission to view this page.
          </p>
          <Link 
            href="/dashboard" 
            className="block w-full bg-indigo-600 text-white text-center py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Pet Services</h1>
              <p className="text-sm text-gray-500">Manage pet services listings</p>
            </div>
            <Link 
              href="/services/add" 
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Add Service</span>
            </Link>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="text-sm font-medium text-gray-500 mb-1">Total Services</div>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="text-sm font-medium text-gray-500 mb-1">Verified Services</div>
            <div className="text-3xl font-bold text-green-600">{stats.verified}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="text-sm font-medium text-gray-500 mb-1">Pending Verification</div>
            <div className="text-3xl font-bold text-amber-500">{stats.pending}</div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Error:</span> {error}
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search services by name, city, or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <div>
                <label htmlFor="filter-status" className="block text-sm font-medium text-gray-700 mb-1">
                  Verification Status
                </label>
                <select
                  id="filter-status"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">All</option>
                  <option value="verified">Verified</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              <div>
                <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700 mb-1">
                  Sort By
                </label>
                <select
                  id="sort-by"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="name">Name (A-Z)</option>
                  <option value="created_at">Newest First</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Services List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Services Directory</h2>
          </div>
          
          {loading ? (
            <div className="p-12 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No services found</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                {searchTerm || filterStatus !== 'all' 
                  ? "Try adjusting your search filters to find what you're looking for."
                  : "There are no pet services in the system yet. Get started by adding one."}
              </p>
              <Link 
                href="/services/add" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add a Service
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredServices.map(service => (
                <div key={service.id} className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{service.name}</h3>
                        {service.is_verified ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <Check className="h-3 w-3 mr-1" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            Pending
                          </span>
                        )}
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {service.service_type}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-500 flex flex-wrap gap-x-6 gap-y-2 mb-3">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                          <span>{[service.city, service.state].filter(Boolean).join(', ')}</span>
                        </div>
                        {service.phone && (
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-1 flex-shrink-0" />
                            <span>{service.phone}</span>
                          </div>
                        )}
                        {service.email && (
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-1 flex-shrink-0" />
                            <span>{service.email}</span>
                          </div>
                        )}
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
                          <span>Added {formatDate(service.created_at)}</span>
                        </div>
                      </div>
                      
                      {service.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">{service.description}</p>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap md:flex-nowrap items-center gap-2">
                      <div className="flex items-center bg-gray-100 px-2 py-1 rounded text-sm font-medium text-gray-700">
                        <Star className="h-4 w-4 text-amber-400 mr-1" />
                        {service.rating.toFixed(1)}
                      </div>
                      
                      <button
                        onClick={() => verifyService(service.id, !service.is_verified)}
                        className={`px-3 py-1 rounded text-sm font-medium flex items-center gap-1 transition-colors
                          ${service.is_verified 
                            ? 'bg-red-50 text-red-700 hover:bg-red-100' 
                            : 'bg-green-50 text-green-700 hover:bg-green-100'}`}
                      >
                        {service.is_verified ? (
                          <>
                            <X className="h-4 w-4" />
                            <span>Unverify</span>
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4" />
                            <span>Verify</span>
                          </>
                        )}
                      </button>
                      
                      <Link
                        href={`/services/edit/${service.id}`}
                        className="px-3 py-1 rounded text-sm font-medium flex items-center gap-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Edit</span>
                      </Link>
                      
                      <button
                        onClick={() => deleteService(service.id)}
                        className="px-3 py-1 rounded text-sm font-medium flex items-center gap-1 bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
