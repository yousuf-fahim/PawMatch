'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import { Plus, Search, MapPin, Phone, Mail, Users, Calendar, Check, X, Edit, Trash2, Star, AlertCircle } from 'lucide-react';

interface Shelter {
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
  total_pets: number;
  available_pets: number;
  adopted_pets: number;
  rating: number;
  created_at: string;
}

export default function SheltersPage() {
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'verified' | 'pending'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'created_at' | 'rating' | 'total_pets'>('name');
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchShelters();
  }, []);

  const fetchShelters = async () => {
    try {
      const { data, error } = await supabase
        .from('shelters')
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
          rating,
          created_at,
          pets!inner(count)
        `)
        .order('name');

      if (error) throw error;

      // Process the data to get pet counts
      const processedShelters = await Promise.all(
        data.map(async (shelter) => {
          // Get total pets count
          const { count: totalPets } = await supabase
            .from('pets')
            .select('*', { count: 'exact', head: true })
            .eq('shelter_id', shelter.id);

          // Get available pets count
          const { count: availablePets } = await supabase
            .from('pets')
            .select('*', { count: 'exact', head: true })
            .eq('shelter_id', shelter.id)
            .eq('adoption_status', 'available');

          // Get adopted pets count
          const { count: adoptedPets } = await supabase
            .from('pets')
            .select('*', { count: 'exact', head: true })
            .eq('shelter_id', shelter.id)
            .eq('adoption_status', 'adopted');

          return {
            ...shelter,
            total_pets: totalPets || 0,
            available_pets: availablePets || 0,
            adopted_pets: adoptedPets || 0,
          };
        })
      );

      setShelters(processedShelters);
    } catch (error) {
      console.error('Error fetching shelters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyToggle = async (shelterId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('shelters')
        .update({ is_verified: !currentStatus })
        .eq('id', shelterId);

      if (error) throw error;

      setShelters(shelters.map(shelter => 
        shelter.id === shelterId 
          ? { ...shelter, is_verified: !currentStatus }
          : shelter
      ));
    } catch (error) {
      console.error('Error updating shelter verification:', error);
    }
  };

  const handleDeleteShelter = async (shelterId: string) => {
    if (!confirm('Are you sure you want to delete this shelter? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('shelters')
        .delete()
        .eq('id', shelterId);

      if (error) throw error;

      setShelters(shelters.filter(shelter => shelter.id !== shelterId));
    } catch (error) {
      console.error('Error deleting shelter:', error);
      alert('Error deleting shelter. Please try again.');
    }
  };

  const filteredShelters = shelters
    .filter(shelter => {
      const matchesSearch = shelter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           shelter.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           shelter.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || 
                           (filterStatus === 'verified' && shelter.is_verified) ||
                           (filterStatus === 'pending' && !shelter.is_verified);
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'created_at':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'total_pets':
          return b.total_pets - a.total_pets;
        default:
          return 0;
      }
    });

  const stats = {
    total: shelters.length,
    verified: shelters.filter(s => s.is_verified).length,
    pending: shelters.filter(s => !s.is_verified).length,
    totalPets: shelters.reduce((sum, s) => sum + s.total_pets, 0),
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pet Services Management</h1>
          <p className="text-gray-600 mt-2">Manage pet services, clinics, and shops</p>
        </div>
        <Link
          href="/shelters/add"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Add New Service
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Shelters</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Verified Shelters</p>
              <p className="text-3xl font-bold text-green-600">{stats.verified}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Check className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Pending Verification</p>
              <p className="text-3xl font-bold text-orange-600">{stats.pending}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <AlertCircle className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Pets</p>
              <p className="text-3xl font-bold text-purple-600">{stats.totalPets}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Star className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search shelters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Shelters</option>
            <option value="verified">Verified Only</option>
            <option value="pending">Pending Verification</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="name">Sort by Name</option>
            <option value="created_at">Sort by Date Added</option>
            <option value="rating">Sort by Rating</option>
            <option value="total_pets">Sort by Pet Count</option>
          </select>

          {/* Results Count */}
          <div className="flex items-center text-gray-600">
            Showing {filteredShelters.length} of {shelters.length} shelters
          </div>
        </div>
      </div>

      {/* Shelters List */}
      <div className="space-y-6">
        {filteredShelters.map((shelter) => (
          <div key={shelter.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">{shelter.name}</h3>
                  {shelter.is_verified ? (
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                      <Check size={14} />
                      Verified
                    </span>
                  ) : (
                    <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                      <AlertCircle size={14} />
                      Pending
                    </span>
                  )}
                  {shelter.rating && (
                    <div className="flex items-center gap-1">
                      <Star size={16} className="text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600">{shelter.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} />
                    <span>{shelter.address}, {shelter.city}, {shelter.state} {shelter.zip_code}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={16} />
                    <span>{shelter.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={16} />
                    <span>{shelter.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>Joined {new Date(shelter.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {shelter.description && (
                  <p className="text-gray-700 mt-3 line-clamp-2">{shelter.description}</p>
                )}
              </div>

              <div className="flex items-center gap-2 ml-6">
                <Link
                  href={`/shelters/${shelter.id}/edit`}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit Shelter"
                >
                  <Edit size={18} />
                </Link>
                <button
                  onClick={() => handleVerifyToggle(shelter.id, shelter.is_verified)}
                  className={`p-2 rounded-lg transition-colors ${
                    shelter.is_verified 
                      ? 'text-orange-600 hover:bg-orange-50' 
                      : 'text-green-600 hover:bg-green-50'
                  }`}
                  title={shelter.is_verified ? 'Remove Verification' : 'Verify Shelter'}
                >
                  {shelter.is_verified ? <X size={18} /> : <Check size={18} />}
                </button>
                <button
                  onClick={() => handleDeleteShelter(shelter.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete Shelter"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            {/* Pet Statistics */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{shelter.total_pets}</p>
                <p className="text-sm text-gray-600">Total Pets</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{shelter.available_pets}</p>
                <p className="text-sm text-gray-600">Available</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{shelter.adopted_pets}</p>
                <p className="text-sm text-gray-600">Adopted</p>
              </div>
            </div>
          </div>
        ))}

        {filteredShelters.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No shelters found</h3>
            <p className="text-gray-600">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria.' 
                : 'Get started by adding your first shelter.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
