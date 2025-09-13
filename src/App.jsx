import React, { useState, useEffect } from 'react';
import './index.css';
import { db } from './firebase';
// import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

import { collection, getDocs, setDoc, doc,deleteDoc } from 'firebase/firestore';
const App = () => {
  const [repairs, setRepairs] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRepair, setEditingRepair] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isDeleting, setIsDeleting] = useState(false);
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
      id: Date.now().toString(),
      mobileName: formData.get('mobileName'),
      ownerName: formData.get('ownerName'),
      contactNumber: formData.get('contactNumber'),
      password: formData.get('password') || 'N/A',
      amount: parseFloat(formData.get('amount')) || 0,
      status: formData.get('status') || 'Received',
      deliveryTime: formData.get('deliveryTime'),
      createdAt: new Date().toLocaleString(),
      issueDescription: formData.get('issueDescription'),
      extraInfo: formData.get('extraInfo')
    };

    if (editingRepair) {
      setRepairs(repairs.map(r => r.id === editingRepair.id ? newRepair : r));
      setEditingRepair(null);
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
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'repairs', id));
      setRepairs(repairs.filter(r => r.id !== id));
    } catch (error) {
      console.error("Error deleting repair:", error);
      alert("Failed to delete repair. Please try again.");
    } finally {
      setIsDeleting(false);
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

  return (
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Password</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRepairs.length > 0 ? (
                  filteredRepairs.map((repair) => (
                    <tr key={repair.id} className="hover:bg-gray-50 transition-colors duration-150">
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
                        <div className="text-sm font-medium text-indigo-600">₹{repair.amount.toFixed(2)}</div>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditRepair(repair)}
                            className="text-indigo-600 hover:text-indigo-900 transition-colors duration-150"
                          >
                            Edit
                          </button>
                          {/* <button
                            onClick={() => handleDeleteRepair(repair.id)}
                            className="text-red-600 hover:text-red-900 transition-colors duration-150"
                          >
                            Delete
                          </button> */}

                          <button
                            onClick={() => handleDeleteRepair(repair.id)}
                            disabled={isDeleting}
                            className="text-red-600 hover:text-red-900 transition-colors duration-150"
                          >
                            {isDeleting ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                        <div className="mt-2">
                          <select
                            value={repair.status}
                            onChange={(e) => handleUpdateStatus(repair.id, e.target.value)}
                            className="text-xs px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            {getStatusOptions().map(status => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                        </div>
                      </td>
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
    </div>
  );
};

export default App;
