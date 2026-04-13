import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CheckBadgeIcon, XMarkIcon, DocumentArrowDownIcon } from "@heroicons/react/24/outline";

const API_URL = import.meta.env.VITE_API_URL || "https://lms-backend-g1cy.onrender.com/api";

const VerifyCertificate = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    verifyCertificate();
  }, [code]);

  const verifyCertificate = async () => {
    try {
      const response = await fetch(`${API_URL}/certificates/verify/${code}`);
      const data = await response.json();
      
      if (data.valid) {
        setCertificate(data.data);
        setError(null);
      } else {
        setError(data.message || "Certificate not found");
        setCertificate(null);
      }
    } catch (err) {
      console.error("Verification error:", err);
      setError("Failed to verify certificate. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!certificate) return;
    
    try {
      // First, get the certificate ID from the certificate number
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/certificates/my`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await response.json();
      const cert = data.data?.find(c => c.certificateNumber === certificate.certificateNumber);
      
      if (cert) {
        const downloadRes = await fetch(`${API_URL}/certificates/${cert.id}/download`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const blob = await downloadRes.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `certificate_${certificate.certificateNumber}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        alert("Certificate PDF not available for download");
      }
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download certificate");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Verifying certificate...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XMarkIcon className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Invalid Certificate
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {error}
          </p>
          <button
            onClick={() => navigate("/")}
            className="btn-primary"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-center">
          <CheckBadgeIcon className="w-16 h-16 text-white mx-auto mb-2" />
          <h1 className="text-2xl font-bold text-white">Verified Certificate</h1>
          <p className="text-green-100">This is a valid LMS Portal certificate</p>
        </div>

        {/* Certificate Details */}
        <div className="p-8">
          <div className="space-y-6">
            {/* Student Name */}
            <div className="text-center border-b border-gray-200 dark:border-gray-700 pb-4">
              <p className="text-sm text-gray-500 uppercase tracking-wide">Awarded to</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">
                {certificate?.studentName}
              </p>
            </div>

            {/* Course */}
            <div className="text-center">
              <p className="text-sm text-gray-500 uppercase tracking-wide">Course Completed</p>
              <p className="text-xl font-semibold text-primary-600 mt-1">
                {certificate?.courseTitle}
              </p>
            </div>

            {/* Score & Date */}
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Score</p>
                <p className="text-xl font-bold text-gray-800 dark:text-white">
                  {certificate?.score}%
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Issue Date</p>
                <p className="text-sm font-medium text-gray-800 dark:text-white">
                  {certificate?.issueDate ? new Date(certificate.issueDate).toLocaleDateString() : "N/A"}
                </p>
              </div>
            </div>

            {/* Certificate ID */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Certificate ID</p>
              <p className="text-sm font-mono text-gray-600 dark:text-gray-300 mt-1 break-all">
                {certificate?.certificateNumber}
              </p>
            </div>

            {/* Verification Badge */}
            <div className="flex items-center justify-center gap-2 text-green-600">
              <CheckBadgeIcon className="w-5 h-5" />
              <span className="text-sm font-medium">Verified by LMS Portal</span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleDownload}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
              >
                <DocumentArrowDownIcon className="w-5 h-5" />
                Download PDF
              </button>
              <button
                onClick={() => navigate("/")}
                className="flex-1 btn-secondary"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyCertificate;