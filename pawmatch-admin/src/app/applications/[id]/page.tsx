'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Check, X, AlertCircle, MessageCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/AdminLayout';

export default function ApplicationDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const supabase = createClientComponentClient();
  const applicationId = React.use(params).id;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applicationDetails, setApplicationDetails] = useState<any>(null);
  const [petDetails, setPetDetails] = useState<any>(null);
  const [userDetails, setUserDetails] = useState<any>(null);
  
  const [adminNotes, setAdminNotes] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [processingStatus, setProcessingStatus] = useState('');
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [processingSuccess, setProcessingSuccess] = useState<string | null>(null);
  
  // Fetch application on component mount
  useEffect(() => {
    if (!user || !applicationId) return;
    fetchApplicationDetails();
  }, [user, applicationId]);
  
  // Format date function
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Fetch application details
  const fetchApplicationDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
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
      
      setApplicationDetails(data);
      setPetDetails(data.pets);
      setUserDetails(data.users);
      setAdminNotes(data.admin_notes || '');
      
    } catch (error: any) {
      console.error('Error fetching application details:', error);
      setError('Failed to load application details');
    } finally {
      setLoading(false);
    }
  };
  
  // Update application status
  const updateApplicationStatus = async (status: string) => {
    try {
      setProcessingError(null);
      setProcessingSuccess(null);
      setProcessingStatus(status);
      
      const { data, error } = await supabase
        .from('adoption_applications')
        .update({
          status: status,
          admin_notes: adminNotes,
          processed_at: new Date().toISOString(),
          processed_by: user?.id
        })
        .eq('id', applicationId)
        .select();
      
      if (error) throw error;
      
      setApplicationDetails({
        ...applicationDetails,
        status: status,
        admin_notes: adminNotes,
        processed_at: new Date().toISOString()
      });
      
      setProcessingSuccess(`Application successfully ${status}`);
      
    } catch (error: any) {
      console.error('Error updating application:', error);
      setProcessingError('Failed to update application status');
    } finally {
      setProcessingStatus('');
    }
  };
  
  // Save admin notes
  const saveAdminNotes = async () => {
    try {
      setProcessingError(null);
      setProcessingSuccess(null);
      
      const { data, error } = await supabase
        .from('adoption_applications')
        .update({
          admin_notes: adminNotes
        })
        .eq('id', applicationId)
        .select();
      
      if (error) throw error;
      
      setApplicationDetails({
        ...applicationDetails,
        admin_notes: adminNotes
      });
      
      setProcessingSuccess('Notes saved successfully');
      
    } catch (error: any) {
      console.error('Error saving notes:', error);
      setProcessingError('Failed to save notes');
    }
  };
  
  // Send message to applicant
  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    
    try {
      setProcessingError(null);
      
      const { data, error } = await supabase
        .from('user_messages')
        .insert({
          application_id: applicationId,
          sender_id: user?.id,
          receiver_id: applicationDetails.user_id,
          message: newMessage,
          sent_at: new Date().toISOString()
        })
        .select();
      
      if (error) throw error;
      
      // Update local state with new message
      setApplicationDetails({
        ...applicationDetails,
        messages: [...(applicationDetails.messages || []), data[0]]
      });
      
      // Clear message input
      setNewMessage('');
      
    } catch (error: any) {
      console.error('Error sending message:', error);
      setProcessingError('Failed to send message');
    }
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
              You don't have permission to view this page.
            </p>
            <button 
              onClick={() => router.push('/dashboard')}
              className="block w-full bg-indigo-600 text-white text-center py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-6">
        <button
          onClick={() => router.push('/applications')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Applications
        </button>
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Application Details</h1>
          {applicationDetails && (
            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-2">Status:</span>
              <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${
                applicationDetails.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                applicationDetails.status === 'approved' ? 'bg-green-100 text-green-800' :
                applicationDetails.status === 'rejected' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {applicationDetails?.status?.charAt(0).toUpperCase() + applicationDetails?.status?.slice(1) || 'Unknown'}
              </span>
            </div>
          )}
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>{error}</span>
            </div>
          </div>
        )}
        
        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading application details...</p>
          </div>
        ) : applicationDetails ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main Application Details */}
            <div className="md:col-span-2 space-y-6">
              {/* Basic Info */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Application for {petDetails?.name || 'Unknown Pet'}
                    </h2>
                    <p className="text-sm text-gray-500">
                      Submitted {formatDate(applicationDetails.submitted_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Application ID</p>
                    <p className="text-sm font-mono">{applicationId}</p>
                  </div>
                </div>
                
                {/* Application Message */}
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Application Message</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="whitespace-pre-wrap">{applicationDetails?.application_message || 'No message provided'}</p>
                  </div>
                </div>
              </div>
              
              {/* Admin Notes */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Admin Notes</h3>
                <textarea
                  className="w-full h-32 border border-gray-300 rounded-lg p-3 focus:ring-indigo-500 focus:border-indigo-500"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add admin notes here..."
                ></textarea>
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={saveAdminNotes}
                    className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-200 text-sm"
                  >
                    Save Notes
                  </button>
                </div>
              </div>
              
              {/* Communication History */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Communication</h3>
                
                {applicationDetails.messages && applicationDetails.messages.length > 0 ? (
                  <div className="space-y-4 mb-4 max-h-96 overflow-y-auto p-2">
                    {applicationDetails.messages
                      .sort((a: any, b: any) => new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime())
                      .map((message: any) => (
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
                              {message.sender_id === user?.id ? 'You (Admin)' : userDetails?.display_name || 'Applicant'}
                            </span>
                            <span>{formatDate(message.sent_at)}</span>
                          </div>
                          <p className="text-sm">{message.message}</p>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>No messages yet</p>
                  </div>
                )}
                
                {/* Send Message Form */}
                <div className="mt-4">
                  <div className="flex">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message to the applicant..."
                      className="flex-grow border border-gray-300 rounded-l-lg p-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-r-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Sidebar - Pet and Applicant Info */}
            <div className="md:col-span-1 space-y-6">
              {/* Pet Information */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Pet Information</h3>
                
                {petDetails?.image_url ? (
                  <img 
                    className="w-full h-48 object-cover rounded-lg mb-3" 
                    src={petDetails.image_url} 
                    alt={petDetails?.name || 'Pet'} 
                    onError={(e: any) => {
                      e.target.onerror = null;
                      e.target.src = '/placeholder-pet.png';
                    }}
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center mb-3">
                    <span className="text-gray-500">No image available</span>
                  </div>
                )}
                
                <h4 className="text-lg font-semibold">{petDetails?.name || 'Unknown Pet'}</h4>
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
                </div>
                
                <div className="mt-3">
                  <button
                    onClick={() => window.open(`/pets/edit/${petDetails?.id}`, '_blank')}
                    className="text-sm text-indigo-600 hover:text-indigo-900"
                  >
                    View pet details
                  </button>
                </div>
              </div>
              
              {/* Applicant Information */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Applicant Information</h3>
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
                      View user profile
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Actions</h3>
                
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
                
                {applicationDetails.status === 'pending' ? (
                  <div className="space-y-2">
                    <button
                      onClick={() => updateApplicationStatus('approved')}
                      disabled={!!processingStatus}
                      className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center"
                    >
                      {processingStatus === 'approved' ? (
                        <span className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <Check className="h-4 w-4 mr-2" />
                          Approve Application
                        </span>
                      )}
                    </button>
                    
                    <button
                      onClick={() => updateApplicationStatus('rejected')}
                      disabled={!!processingStatus}
                      className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center"
                    >
                      {processingStatus === 'rejected' ? (
                        <span className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <X className="h-4 w-4 mr-2" />
                          Reject Application
                        </span>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <p className="text-gray-600">
                      This application has already been {applicationDetails.status}.
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {applicationDetails.processed_at && `Processed on ${formatDate(applicationDetails.processed_at)}`}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Application Not Found</h2>
            <p className="text-gray-600">
              The application you are looking for does not exist or has been deleted.
            </p>
            <button
              onClick={() => router.push('/applications')}
              className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              Back to Applications
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
