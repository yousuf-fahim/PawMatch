'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  Check, 
  X, 
  AlertCircle, 
  Eye, 
  ArrowUpDown, 
  Search, 
  Clock, 
  User, 
  Heart, 
  MessageCircle, 
  FileText,
  Calendar
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/AdminLayout';

  // Status badge color mapping
const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  withdrawn: 'bg-gray-100 text-gray-800'
};

export default function AdoptionApplicationsPage() {
  const { user, isAdmin } = useAuth();
  const supabase = createClientComponentClient();
  
  type Application = {
    id: string;
    status: string;
    submitted_at: string;
    processed_at?: string;
    admin_notes?: string;
    application_message?: string;
    user_id: string;
    pet_id: string;
    processed_by?: string;
    pets?: {
      id: string;
      name?: string;
      species?: string;
      breed?: string;
      gender?: string;
      age?: string;
      size?: string;
      energy_level?: string;
      good_with_children?: boolean;
      good_with_other_pets?: boolean;
      description?: string;
      image_url?: string;
    };
    users?: {
      id: string;
      email?: string;
      display_name?: string;
      phone?: string;
      created_at?: string;
    };
    messages?: Array<{
      id: string;
      message: string;
      sender_id: string;
      sent_at: string;
      read: boolean;
    }>;
  };
  
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('submitted_at');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Detail view
  const [selectedApplication, setSelectedApplication] = useState<string | null>(null);
  const [applicationDetails, setApplicationDetails] = useState<Application | null>(null);
  const [petDetails, setPetDetails] = useState<Application['pets'] | null>(null);
  const [userDetails, setUserDetails] = useState<Application['users'] | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  
  // Notes and processing
  const [adminNotes, setAdminNotes] = useState('');
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [processingSuccess, setProcessingSuccess] = useState<string | null>(null);
  
  // Fetch applications on component mount
  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('adoption_applications')
        .select(`
          *,
          pets:pet_id (id, name, species, breed, gender),
          users:user_id (id, email, display_name)
        `)
        .order(sortBy, { ascending: sortOrder === 'asc' });
      
      if (error) throw error;
      
      setApplications(data || []);
    } catch (error: unknown) {
      console.error('Error fetching applications:', error);
      setError('Failed to load adoption applications');
    } finally {
      setLoading(false);
    }
  }, [supabase, sortBy, sortOrder]);

  useEffect(() => {
    if (!user) return;
    fetchApplications();
  }, [user, fetchApplications]);
  
  // Format date function
  const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get application details
  const getApplicationDetails = useCallback(async (applicationId: string): Promise<void> => {
    try {
      setDetailsLoading(true);
      
      // Get the application with more detailed joins
      const { data, error } = await supabase
        .from('adoption_applications')
        .select(`
          *,
          pets:pet_id (
            id, name, species, breed, age, gender, size, 
            image_url, description, good_with_children, 
            good_with_other_pets, energy_level
          ),
          users:user_id (
            id, email, display_name, phone, 
            created_at
          ),
          messages:user_messages (
            id, message, sender_id, sent_at, read
          )
        `)
        .eq('id', applicationId)
        .single();
      
      if (error) throw error;
      
      setApplicationDetails(data as Application);
      setPetDetails(data.pets);
      setUserDetails(data.users);
      setAdminNotes(data.admin_notes || '');
      
    } catch (error: unknown) {
      console.error('Error fetching application details:', error);
      setError('Failed to load application details');
    } finally {
      setDetailsLoading(false);
    }
  }, [supabase, setDetailsLoading, setApplicationDetails, setPetDetails, setUserDetails, setAdminNotes, setError]);
  
  // Handle application status update
  const updateApplicationStatus = useCallback(async (status: string): Promise<void> => {
    if (!selectedApplication) return;
    
    try {
      setProcessingError(null);
      setProcessingSuccess(null);
      
      const { error } = await supabase
        .from('adoption_applications')
        .update({
          status: status,
          admin_notes: adminNotes,
          processed_at: new Date().toISOString(),
          processed_by: user?.id
        })
        .eq('id', selectedApplication)
        .select();
      
      if (error) throw error;
      
      // Update local state
      setApplications(applications.map((app: Application) => 
        app.id === selectedApplication 
          ? { ...app, status: status, admin_notes: adminNotes, processed_at: new Date().toISOString() } 
          : app
      ));
      
      // Update details view
      if (applicationDetails) {
        setApplicationDetails({
          ...applicationDetails,
          status: status,
          admin_notes: adminNotes,
          processed_at: new Date().toISOString()
        });
      }
      
      setProcessingSuccess(`Application successfully ${status}`);
      
      // Refresh data
      fetchApplications();
      
    } catch (error: unknown) {
      console.error('Error updating application:', error);
      setProcessingError('Failed to update application status');
    }
  }, [selectedApplication, supabase, adminNotes, user?.id, applications, applicationDetails, setProcessingError, setProcessingSuccess, setApplications, setApplicationDetails, fetchApplications]);
  
  // Save admin notes without changing status
  const saveAdminNotes = useCallback(async (): Promise<void> => {
    if (!selectedApplication) return;
    
    try {
      setProcessingError(null);
      setProcessingSuccess(null);
      
      const { error } = await supabase
        .from('adoption_applications')
        .update({
          admin_notes: adminNotes
        })
        .eq('id', selectedApplication)
        .select();
      
      if (error) throw error;
      
      // Update local state
      setApplications(applications.map((app: Application) => 
        app.id === selectedApplication 
          ? { ...app, admin_notes: adminNotes } 
          : app
      ));
      
      setProcessingSuccess('Notes saved successfully');
      
    } catch (error: unknown) {
      console.error('Error saving notes:', error);
      setProcessingError('Failed to save notes');
    }
  }, [selectedApplication, supabase, adminNotes, applications, setProcessingError, setProcessingSuccess, setApplications]);
  
  // Filter applications
  const filteredApplications = applications.filter((app: Application) => {
    // Status filter
    if (statusFilter !== 'all' && app.status !== statusFilter) {
      return false;
    }
    
    // Search term filter (check pet name, user email, or application ID)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const petName = app.pets?.name?.toLowerCase() || '';
      const userEmail = app.users?.email?.toLowerCase() || '';
      const applicationId = app.id?.toLowerCase() || '';
      
      return petName.includes(searchLower) || 
             userEmail.includes(searchLower) || 
             applicationId.includes(searchLower);
    }
    
    return true;
  });
  
  // Open application detail view
  const openApplicationDetail = (applicationId: string): void => {
    setSelectedApplication(applicationId);
    getApplicationDetails(applicationId);
  };
  
  // Close application detail view
  const closeApplicationDetail = (): void => {
    setSelectedApplication(null);
    setApplicationDetails(null);
    setPetDetails(null);
    setUserDetails(null);
    setAdminNotes('');
    setProcessingError(null);
    setProcessingSuccess(null);
  };
  
  // Access control
  if (!isAdmin) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-center mb-2">Access Denied</h1>
            <p className="text-gray-600 text-center mb-6">
              You don&apos;t have permission to view this page.
            </p>
            <Link 
              href="/dashboard" 
              className="block w-full bg-indigo-600 text-white text-center py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Adoption Applications</h1>
        </div>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-400">
            <div className="text-sm font-medium text-gray-500">Pending</div>
            <div className="text-2xl font-bold">
              {applications.filter(a => a.status === 'pending').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-400">
            <div className="text-sm font-medium text-gray-500">Approved</div>
            <div className="text-2xl font-bold">
              {applications.filter(a => a.status === 'approved').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-400">
            <div className="text-sm font-medium text-gray-500">Rejected</div>
            <div className="text-2xl font-bold">
              {applications.filter(a => a.status === 'rejected').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-gray-400">
            <div className="text-sm font-medium text-gray-500">Withdrawn</div>
            <div className="text-2xl font-bold">
              {applications.filter(a => a.status === 'withdrawn').length}
            </div>
          </div>
        </div>
        
        {/* Filter and Search */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by pet name, user email, or application ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <div>
                <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="withdrawn">Withdrawn</option>
                </select>
              </div>
              <div>
                <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700 mb-1">
                  Sort By
                </label>
                <select
                  id="sort-by"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="submitted_at">Submission Date</option>
                  <option value="status">Status</option>
                  <option value="processed_at">Processing Date</option>
                </select>
              </div>
              <div>
                <label htmlFor="sort-order" className="block text-sm font-medium text-gray-700 mb-1">
                  Order
                </label>
                <select
                  id="sort-order"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>{error}</span>
            </div>
          </div>
        )}
        
        {/* Applications Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading applications...</p>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No applications found matching your filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pet
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applicant
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Processed
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {app.pets?.image_url ? (
                            <Image 
                              className="h-10 w-10 rounded-full object-cover mr-3" 
                              src={app.pets.image_url} 
                              alt={app.pets?.name || 'Pet'} 
                              width={40}
                              height={40}
                              onError={() => {
                                // Handle error by setting a fallback image
                                console.error('Image failed to load:', app.pets?.image_url);
                              }}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                              <span className="text-gray-500 text-xs">No img</span>
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-900">
                              {app.pets?.name || 'Unknown Pet'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {app.pets?.species} • {app.pets?.breed}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {app.users?.display_name || 'Unknown User'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {app.users?.email || 'No email'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[app.status] || 'bg-gray-100 text-gray-800'}`}>
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                          {formatDate(app.submitted_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {app.processed_at ? (
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1 text-gray-400" />
                            {formatDate(app.processed_at)}
                          </div>
                        ) : (
                          <span className="text-gray-400">Not processed</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => openApplicationDetail(app.id)}
                          className="text-indigo-600 hover:text-indigo-900 flex items-center justify-end"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {/* Application Detail Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Application Details
              </h2>
              <button
                onClick={closeApplicationDetail}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            {detailsLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading application details...</p>
              </div>
            ) : applicationDetails ? (
              <div className="overflow-y-auto max-h-[calc(90vh-5rem)]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                  {/* Status and Application Info */}
                  <div className="bg-gray-50 rounded-lg p-4 col-span-2">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Status</h3>
                        <span className={`mt-1 px-3 py-1 inline-flex text-sm font-semibold rounded-full ${statusColors[applicationDetails.status] || 'bg-gray-100 text-gray-800'}`}>
                          {applicationDetails.status.charAt(0).toUpperCase() + applicationDetails.status.slice(1)}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Submitted</h3>
                        <div className="mt-1 text-sm">{formatDate(applicationDetails.submitted_at)}</div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Processed</h3>
                        <div className="mt-1 text-sm">
                          {applicationDetails.processed_at ? formatDate(applicationDetails.processed_at) : 'Not processed'}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Application ID</h3>
                        <div className="mt-1 text-sm font-mono">{applicationDetails.id}</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Pet Information */}
                  <div className="bg-white rounded-lg shadow p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Pet Information</h3>
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="md:w-1/3">
                        {petDetails?.image_url ? (
                          <Image 
                            className="w-full h-40 object-cover rounded-lg" 
                            src={petDetails.image_url} 
                            alt={petDetails?.name || 'Pet'} 
                            width={300}
                            height={160}
                            onError={() => {
                              console.error('Image failed to load:', petDetails?.image_url);
                            }}
                          />
                        ) : (
                          <div className="w-full h-40 bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-gray-500">No image available</span>
                          </div>
                        )}
                      </div>
                      <div className="md:w-2/3">
                        <h4 className="text-xl font-semibold">{petDetails?.name || 'Unknown Pet'}</h4>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div>
                            <span className="text-sm text-gray-500">Species:</span>
                            <p className="text-sm">{petDetails?.species || 'Unknown'}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">Breed:</span>
                            <p className="text-sm">{petDetails?.breed || 'Unknown'}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">Age:</span>
                            <p className="text-sm">{petDetails?.age || 'Unknown'}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">Gender:</span>
                            <p className="text-sm">{petDetails?.gender || 'Unknown'}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">Size:</span>
                            <p className="text-sm">{petDetails?.size || 'Unknown'}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">Energy Level:</span>
                            <p className="text-sm">{petDetails?.energy_level || 'Unknown'}</p>
                          </div>
                        </div>
                        <div className="mt-2">
                          <button
                            onClick={() => window.open(`/pets/edit/${petDetails?.id}`, '_blank')}
                            className="text-sm text-indigo-600 hover:text-indigo-900"
                          >
                            View pet details in admin
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Applicant Information */}
                  <div className="bg-white rounded-lg shadow p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Applicant Information</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-gray-500">Name:</span>
                        <p>{userDetails?.display_name || 'Unknown'}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Email:</span>
                        <p>{userDetails?.email || 'Unknown'}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Phone:</span>
                        <p>{userDetails?.phone || 'Not provided'}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Member Since:</span>
                        <p>{userDetails?.created_at ? formatDate(userDetails.created_at) : 'Unknown'}</p>
                      </div>
                      <div className="mt-2">
                        <button
                          onClick={() => window.open(`/users?email=${userDetails?.email}`, '_blank')}
                          className="text-sm text-indigo-600 hover:text-indigo-900"
                        >
                          View user profile in admin
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Application Message */}
                  <div className="bg-white rounded-lg shadow p-4 col-span-2">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Application Message</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="whitespace-pre-wrap">{applicationDetails?.application_message || 'No message provided'}</p>
                    </div>
                  </div>
                  
                  {/* Admin Notes */}
                  <div className="bg-white rounded-lg shadow p-4 col-span-2">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Admin Notes</h3>
                    <textarea
                      className="w-full h-32 border border-gray-300 rounded-lg p-3 focus:ring-indigo-500 focus:border-indigo-500"
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add admin notes here..."
                    ></textarea>
                    <div className="mt-2 flex justify-end">
                      <button
                        onClick={saveAdminNotes}
                        className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-200 text-sm"
                      >
                        Save Notes
                      </button>
                    </div>
                  </div>
                  
                  {/* Messages (if any) */}
                  {applicationDetails.messages && applicationDetails.messages.length > 0 && (
                    <div className="bg-white rounded-lg shadow p-4 col-span-2">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Communication History</h3>
                      <div className="space-y-4">
                        {applicationDetails.messages
                          .sort((a, b) => new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime())
                          .map((message) => (
                            <div 
                              key={message.id} 
                              className={`p-3 rounded-lg ${
                                message.sender_id === user?.id 
                                  ? 'bg-indigo-50 ml-8' 
                                  : 'bg-gray-50 mr-8'
                              }`}
                            >
                              <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>
                                  {message.sender_id === user?.id ? 'You' : userDetails?.display_name || 'Applicant'}
                                </span>
                                <span>{formatDate(message.sent_at)}</span>
                              </div>
                              <p className="text-sm">{message.message}</p>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Status change and processing section */}
                <div className="border-t border-gray-200 p-6 bg-gray-50">
                  {processingError && (
                    <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4">
                      <div className="flex items-center">
                        <AlertCircle className="h-5 w-5 mr-2" />
                        <span>{processingError}</span>
                      </div>
                    </div>
                  )}
                  
                  {processingSuccess && (
                    <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-4">
                      <div className="flex items-center">
                        <Check className="h-5 w-5 mr-2" />
                        <span>{processingSuccess}</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap justify-end gap-3">
                    <button
                      onClick={closeApplicationDetail}
                      className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
                    >
                      Close
                    </button>
                    
                    {applicationDetails.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateApplicationStatus('rejected')}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Reject Application
                        </button>
                        <button
                          onClick={() => updateApplicationStatus('approved')}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Approve Application
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-gray-700">Failed to load application details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
