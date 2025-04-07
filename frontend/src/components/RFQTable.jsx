import React, { useState } from "react";
import { format } from "date-fns";
import { Eye, CheckCircle, XCircle, X } from "lucide-react";
import axios from "axios";

const RFQTable = ({ rfqs, role, fetchRFQs }) => {
  const [selectedRFQ, setSelectedRFQ] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Format date from ISO string to readable format
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (error) {
      return dateString;
    }
  };

  // Status colors mapping
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    completed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  };

  const handleViewDetails = (rfq) => {
    setSelectedRFQ(rfq);
  };

  const closeDetails = () => {
    setSelectedRFQ(null);
  };

  // Handle status update (approve/reject)
  const handleUpdateStatus = async (rfqId, status) => {
    try {

      setIsUpdating(true);
      const token = localStorage.getItem("token");
      
      await axios.patch(
        "http://localhost:3000/api/v1/RFQS/updateRFQStatus",
        {id: rfqId, status },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      // Refresh RFQs list after update
      if (fetchRFQs) {
        await fetchRFQs();
      }
      
      // If the RFQ being updated is currently displayed in the modal, update its status
      if (selectedRFQ && selectedRFQ._id === rfqId) {
        setSelectedRFQ({
          ...selectedRFQ,
          status: status
        });
      }
      
      setIsUpdating(false);
    } catch (error) {
      console.error("Failed to update RFQ status:", error);
      setIsUpdating(false);
      alert("Failed to update RFQ status. Please try again.");
    }
  };

  // Render action buttons based on role and current status
  const renderActionButtons = (rfq) => {
    if (role === "admin" && rfq.status === "pending") {
      return (
        <div className="flex space-x-2">
          <button
            onClick={() =>{ handleUpdateStatus(rfq._id, "accepted");
              console.log(rfq._id)
            }}
            disabled={isUpdating}
            className="p-1 text-green-500 hover:text-green-700 dark:text-green-400 dark:hover:text-green-200 disabled:opacity-50"
            title="Approve"
          >
            <CheckCircle size={18} />
          </button>
          <button
            onClick={() => handleUpdateStatus(rfq._id, "rejected")}
            disabled={isUpdating}
            className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200 disabled:opacity-50"
            title="Reject"
          >
            <XCircle size={18} />
          </button>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-750 border-b border-gray-200 dark:border-gray-700">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  RFQ ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Deadline
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                {role !== "client" && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Client
                  </th>
                )}
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {rfqs.length > 0 ? (
                rfqs.map((rfq) => (
                  <tr
                    key={rfq._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{rfq._id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{rfq.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">{rfq.serviceRequired || "-"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">{formatDate(rfq.deadline)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${statusColors[rfq.status || "pending"]}`}>
                        {rfq.status || "Pending"}
                      </span>
                    </td>
                    {role !== "client" && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{rfq.clientName || rfq.companyName || "Unknown"}</div>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end items-center space-x-2">
                        {renderActionButtons(rfq)}
                        <button 
                          onClick={() => handleViewDetails(rfq)}
                          className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                          <Eye size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={role !== "client" ? "7" : "6"} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                    No RFQs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RFQ Details Modal */}
      {selectedRFQ && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">RFQ Details</h3>
              <button 
                onClick={closeDetails}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Company Information</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400">Company Name</label>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedRFQ.companyName}</p>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400">Contact Name</label>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedRFQ.name}</p>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400">Email</label>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedRFQ.email}</p>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400">Phone Number</label>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedRFQ.phoneNumber}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Project Details</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400">Service Required</label>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedRFQ.serviceRequired}</p>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400">Estimated Budget</label>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">${selectedRFQ.estimatedBudget?.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400">Deadline</label>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(selectedRFQ.deadline)}</p>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400">Status</label>
                    <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${statusColors[selectedRFQ.status || "pending"]}`}>
                      {selectedRFQ.status || "Pending"}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="col-span-1 md:col-span-2">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Project Description</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                  {selectedRFQ.projectDescription}
                </p>
              </div>
              
              {selectedRFQ.additionalNotes && (
                <div className="col-span-1 md:col-span-2">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Additional Notes</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                    {selectedRFQ.additionalNotes}
                  </p>
                </div>
              )}
              
              <div className="col-span-1 md:col-span-2">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Request Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400">RFQ ID</label>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedRFQ._id}</p>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400">Submission Date</label>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatDate(selectedRFQ.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
              {role === "admin" && selectedRFQ.status === "pending" && (
                <>
                  <button
                    onClick={() => {
                      handleUpdateStatus(selectedRFQ._id, "accepted");
                    }}
                    disabled={isUpdating}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    Accept RFQ
                  </button>
                  <button
                    onClick={() => {
                      handleUpdateStatus(selectedRFQ._id, "rejected");
                    }}
                    disabled={isUpdating}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    Reject RFQ
                  </button>
                </>
              )}
              <button
                onClick={closeDetails}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md text-sm font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RFQTable;