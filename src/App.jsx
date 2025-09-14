import React, { useState, useEffect } from 'react';
import './index.css';
import { db } from './firebase';
// import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

import { collection, getDocs, setDoc, doc,deleteDoc } from 'firebase/firestore';
// Firebase Auth imports
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
const App = () => {
  const [repairs, setRepairs] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRepair, setEditingRepair] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [deletingId, setDeletingId] = useState(null); // null = no deletion in progress
  const [viewingRepair, setViewingRepair] = useState(null);
  const [user, setUser] = useState(null); // null = not logged in
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [authError, setAuthError] = useState('');
const [loading, setLoading] = useState(false);

// Initialize auth
const auth = getAuth();

// Listen for auth changes (persists login)
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      setUser(user);
    } else {
      setUser(null);
    }
  });

  return () => unsubscribe();
}, []);
/*
  // Load data from localStorage on component mount
  useEffect(() => {
    const savedRepairs = localStorage.getItem('mobileRepairs');
    if (savedRepairs) {
      setRepairs(JSON.parse(savedRepairs));
    }
  }, []);

  // Save to localStorage whenever repairs change
  useEffect(() => {
    localStorage.setItem('mobileRepairs', JSON.stringify(repairs));
  }, [repairs]);
*/

    useEffect(() => {
  const loadRepairs = async () => {
    const querySnapshot = await getDocs(collection(db, 'repairs'));
    const repairsList = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setRepairs(repairsList);
  };

  loadRepairs();
}, []);
/*
useEffect(() => {
  const saveRepairs = async () => {
    const promises = repairs.map(repair =>
      repair.id
        ? updateDoc(doc(db, 'repairs', repair.id), repair)
        : addDoc(collection(db, 'repairs'), repair)
    );
    await Promise.all(promises);
  };

  saveRepairs();
}, [repairs]);
*/
useEffect(() => {
  const loadRepairs = async () => {
    const querySnapshot = await getDocs(collection(db, 'repairs'));
    const repairsList = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setRepairs(repairsList);
  };

  loadRepairs();
}, []);

useEffect(() => {
  const saveRepairs = async () => {
    const promises = repairs.map(repair =>
      setDoc(doc(db, 'repairs', repair.id), repair, { merge: true })
    );
    await Promise.all(promises);
  };

  saveRepairs();
}, [repairs]);
  const handleAddRepair = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const newRepair = {
      id: editingRepair?editingRepair.id:Date.now().toString(),
      mobileName: formData.get('mobileName'),
      ownerName: formData.get('ownerName'),
      contactNumber: formData.get('contactNumber'),
      password: formData.get('password') || 'N/A',
      amount: formData.get('amount') || 0,
      status: formData.get('status') || 'Received',
      deliveryTime: formData.get('deliveryTime'),
      createdAt: new Date().toLocaleString(),
      issueDescription: formData.get('issueDescription'),
      extraInfo: formData.get('extraInfo')
    };

    if (editingRepair) {
      setRepairs(repairs.map(r => r.id === editingRepair.id ? newRepair : r));
      setEditingRepair(null);
      // Also update viewingRepair if we're viewing this repair
      setViewingRepair(newRepair); // Keep modal in sync    
      
    } else {
      setRepairs([...repairs, newRepair]);
    }

    e.target.reset();
    setShowAddForm(false);
  };

  const handleEditRepair = (repair) => {
    setEditingRepair(repair);
    setShowAddForm(true);
  };

  /* const handleDeleteRepair = (id) => {
  //   if (window.confirm('Are you sure you want to delete this repair entry?')) {
  //     setRepairs(repairs.filter(r => r.id !== id));
  //   }
  // };

  const handleDeleteRepair = async (id) => {
  if (window.confirm('Are you sure you want to delete this repair entry?')) {
    try {
      // 1. Delete from Firestore
      await deleteDoc(doc(db, 'repairs', id));

      // 2. Remove from local state
      setRepairs(repairs.filter(r => r.id !== id));
    } catch (error) {
      console.error("Error deleting repair:", error);
      alert("Failed to delete repair. Please try again.");
    }
  }
};*/

const handleDeleteRepair = async (id) => {
  if (window.confirm('Are you sure you want to delete this repair entry?')) {
    setDeletingId(id); // Set the ID being deleted
    try {
      await deleteDoc(doc(db, 'repairs', id));
      setRepairs(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error("Error deleting repair:", error);
      alert("Failed to delete. Please try again.");
    } finally {
      setDeletingId(null); // Reset after completion
    }
  }
};

  const handleUpdateStatus = (id, newStatus) => {
    setRepairs(repairs.map(r => 
      r.id === id ? { ...r, status: newStatus } : r
    ));
  };

  const filteredRepairs = repairs.filter(repair => {
    const matchesSearch = repair.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         repair.mobileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         repair.contactNumber.includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || repair.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'Received': return 'bg-blue-100 text-blue-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      case 'Ready for Pickup': return 'bg-purple-100 text-purple-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusOptions = () => [
    'Received', 'In Progress', 'Ready for Pickup', 'Completed', 'Cancelled'
  ];
const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true);
  setAuthError('');

  try {
    await signInWithEmailAndPassword(auth, email, password);
    // Success: user.state will update automatically via onAuthStateChanged
  } catch (error) {
    switch (error.code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        setAuthError('Invalid email or password.');
        break;
      case 'auth/too-many-requests':
        setAuthError('Too many attempts. Try again later.');
        break;
      default:
        setAuthError('Login failed. Please try again.');
    }
  } finally {
    setLoading(false);
  }
};
  return (!user ? (
  <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center p-4">
    <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Imran Mobiles</h1>
        <p className="text-gray-600 mt-2">Staff Login Only</p>
      </div>

      {authError && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
          {authError}
        </div>
      )}

      <form onSubmit={handleLogin}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="employee@imranmobiles.com"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium py-3 px-6 rounded-lg shadow transition-colors duration-200"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </div>
      </form>

      <button
        onClick={() => signOut(auth)}
        className="mt-4 text-sm text-gray-500 hover:text-gray-700"
      >
        ← Back to Home
      </button>
    </div>
  </div>
) : (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <svg className="w-12 h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
              </svg>
              <h1 className="ml-3 text-3xl font-bold text-gray-900">Imran Mobiles</h1>
            </div>
            <button
              onClick={() => {
                setShowAddForm(true);
                setEditingRepair(null);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg shadow-md transition-colors duration-200 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Add New Repair
            </button>
          </div>
        </div>
      </header>

      {/* Search and Filter Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search by Owner, Mobile or Phone</label>
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Statuses</option>
                {getStatusOptions().map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <span className="text-sm font-medium text-gray-700">
                Total: {filteredRepairs.length} repairs
              </span>
            </div>
          </div>
        </div>

        {/* Repairs List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Problem/Condition</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Added</th>
                  {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th> */}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Password</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRepairs.length > 0 ? (
                  filteredRepairs.map((repair) => (
                    // <tr key={repair.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <tr key={repair.id} className={`${   deletingId === repair.id ? 'opacity-50 pointer-events-none' : 'hover:bg-gray-50' } transition-all duration-150 cursor-pointer`}  onClick={() => setViewingRepair(repair)}>
                    {/* <tr key={repair.id}  className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer" onClick={() => setViewingRepair(repair)} > */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{repair.mobileName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{repair.extraInfo}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{repair.issueDescription}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{repair.ownerName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{repair.contactNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-indigo-600">₹{repair.amount}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getStatusColor(repair.status)}`}>
                          {repair.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{repair.deliveryTime || 'Not set'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{repair.createdAt}</div>
                      </td>
                    {/*  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditRepair(repair);
                            }}
                            className="text-indigo-600 hover:text-indigo-900 transition-colors duration-150"
                          >
                            Edit
                          </button> */}
                          {/* <button
                            onClick={() => handleDeleteRepair(repair.id)}
                            className="text-red-600 hover:text-red-900 transition-colors duration-150"
                          >
                            Delete
                          </button> */}
                        {/*
                          <button
                            onClick={(e) =>{ 
                              e.stopPropagation();
                              handleDeleteRepair(repair.id);
                            }}
                            disabled={deletingId=== repair.id}
                            className="text-red-600 hover:text-red-900 transition-colors duration-150"
                          >
                            {deletingId === repair.id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      {/*  <div className="mt-2">
                          {/* <select
                            value={repair.status}
                            onChange={(e) =>{ e.stopPropagation();
                              handleUpdateStatus(repair.id, e.target.value)}}
                            className="text-xs px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            {getStatusOptions().map(status => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select> 
                        </div> 
                      </td> */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{repair.password}</div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                      No repair records found. Add your first repair entry above!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      

      

      {/* Add/Edit Repair Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingRepair ? 'Edit Repair' : 'Add New Repair'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingRepair(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-150"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              <form onSubmit={handleAddRepair}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                    <input
                      type="text"
                      name="mobileName"
                      defaultValue={editingRepair?.mobileName || ''}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g., iPhone 14 Pro"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Details</label>
                    <input
                      type="text"
                      name="extraInfo"
                      defaultValue={editingRepair?.extraInfo || ''}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="color:Black , 5G, IMEI- 497867590261303"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Problem/Condition</label>
                    <input
                      type="text"
                      name="issueDescription"
                      defaultValue={editingRepair?.issueDescription || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Touch glass change.."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                    <input
                      type="text"
                      name="ownerName"
                      defaultValue={editingRepair?.ownerName || ''}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter owner's name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                    <input
                      type="tel"
                      name="contactNumber"
                      defaultValue={editingRepair?.contactNumber || ''}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password (if any)</label>
                    <input
                      type="text"
                      name="password"
                      defaultValue={editingRepair?.password || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Leave blank if no password"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Repair Amount (₹)</label>
                    <input
                      type="number"
                      name="amount"
                      defaultValue={editingRepair?.amount || ''}
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter amount"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      name="status"
                      defaultValue={editingRepair?.status || 'Received'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {getStatusOptions().map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Delivery Time</label>
                    <input
                      type="text"
                      name="deliveryTime"
                      defaultValue={editingRepair?.deliveryTime || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g., 2 days, June 15, 2023"
                    />
                  </div>
                  
                </div>

                <div className="flex justify-end space-x-3 mt-8">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingRepair(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-150"
                  >
                    {editingRepair ? 'Update' : 'Add'} Repair
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Repair Details Modal 
{viewingRepair && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-screen overflow-y-auto">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Repair Details</h2>
          <button
            onClick={() => setViewingRepair(null)}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-150"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div className="space-y-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Brand:</span>
            <p className="text-gray-900">{viewingRepair.mobileName}</p>
          </div>

          <div>
            <span className="font-medium text-gray-700">Details:</span>
            <p className="text-gray-900">{viewingRepair.extraInfo || 'N/A'}</p>
          </div>

          <div>
            <span className="font-medium text-gray-700">Problem/Condition:</span>
            <p className="text-gray-900">{viewingRepair.issueDescription || 'N/A'}</p>
          </div>

          <div>
            <span className="font-medium text-gray-700">Customer Name:</span>
            <p className="text-gray-900">{viewingRepair.ownerName}</p>
          </div>

          <div>
            <span className="font-medium text-gray-700">Contact Number:</span>
            <p className="text-gray-900">{viewingRepair.contactNumber}</p>
          </div>

          <div>
            <span className="font-medium text-gray-700">Password:</span>
            <p className="text-gray-900">{viewingRepair.password}</p>
          </div>

          <div>
            <span className="font-medium text-gray-700">Amount:</span>
            <p className="text-indigo-600 font-medium">₹{viewingRepair.amount.toFixed(2)}</p>
          </div>

          <div>
            <span className="font-medium text-gray-700">Status:</span>
            <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(viewingRepair.status)}`}>
              {viewingRepair.status}
            </span>
          </div>

          <div>
            <span className="font-medium text-gray-700">Delivery Time:</span>
            <p className="text-gray-900">{viewingRepair.deliveryTime || 'Not set'}</p>
          </div>

          <div>
            <span className="font-medium text-gray-700">Added On:</span>
            <p className="text-gray-900">{viewingRepair.createdAt}</p>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={() => setViewingRepair(null)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
)} */}
{/* View Repair Details Modal */}
{viewingRepair && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-screen overflow-y-auto">
      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-xl font-bold text-gray-900">Repair Details</h2>
          <button
            onClick={() => setViewingRepair(null)}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-150"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div className="space-y-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Brand:</span>
            <p className="text-gray-900">{viewingRepair.mobileName}</p>
          </div>

          <div>
            <span className="font-medium text-gray-700">Details:</span>
            <p className="text-gray-900">{viewingRepair.extraInfo || 'N/A'}</p>
          </div>

          <div>
            <span className="font-medium text-gray-700">Problem/Condition:</span>
            <p className="text-gray-900">{viewingRepair.issueDescription || 'N/A'}</p>
          </div>

          <div>
            <span className="font-medium text-gray-700">Customer Name:</span>
            <p className="text-gray-900">{viewingRepair.ownerName}</p>
          </div>

          <div>
            <span className="font-medium text-gray-700">Contact Number:</span>
            <p className="text-gray-900">{viewingRepair.contactNumber}</p>
          </div>

          <div>
            <span className="font-medium text-gray-700">Password:</span>
            <p className="text-gray-900">{viewingRepair.password}</p>
          </div>

          <div>
            <span className="font-medium text-gray-700">Amount:</span>
            <p className="text-indigo-600 font-medium">₹{viewingRepair.amount}</p>
          </div>

          {/* Status Update */}
          <div>
            <span className="font-medium text-gray-700">Status:</span>
            <div className="mt-1">
              <select
                value={viewingRepair.status}
                onChange={(e) => {
                  const newStatus = e.target.value;
                  // Update Firestore
                  handleUpdateStatus(viewingRepair.id, newStatus);
                  // Update local view
                  setViewingRepair({ ...viewingRepair, status: newStatus });
                }}
                className="text-xs px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
              >
                {getStatusOptions().map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <span className="font-medium text-gray-700">Delivery Time:</span>
            <p className="text-gray-900">{viewingRepair.deliveryTime || 'Not set'}</p>
          </div>

          <div>
            <span className="font-medium text-gray-700">Added On:</span>
            <p className="text-gray-900">{viewingRepair.createdAt}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={() => {
              handleEditRepair(viewingRepair);
              setViewingRepair(null);
            }}
            className="flex-1 px-4 py-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors duration-150 flex items-center justify-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>

          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this repair?')) {
                handleDeleteRepair(viewingRepair.id);
                setViewingRepair(null);
              }
            }}
            className="flex-1 px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors duration-150 flex items-center justify-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
        <div className="flex flex-col items-center mt-6 w-full px-6">
          <button
            onClick={() => setViewingRepair(null)}
            className="w-4/5 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-150 font-medium text-center"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
)}
</div>
))
};


export default App;
