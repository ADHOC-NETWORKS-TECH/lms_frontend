import React, { useState, useEffect } from "react";
import { getStorage } from "../../utils/storage";
import Loader from "../../components/common/Loader";
import { DocumentArrowDownIcon, TrophyIcon, LinkIcon } from "@heroicons/react/24/outline";

const API_URL =
  import.meta.env.VITE_API_URL || "https://lms-backend-g1cy.onrender.com/api";

const getVerificationUrl = (code) => {
  return `${window.location.origin}/verify-certificate/${code}`;
};

const Certificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const token = getStorage("token");
      const response = await fetch(`${API_URL}/certificates/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setCertificates(data.data || []);
    } catch (error) {
      console.error("Error fetching certificates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (id) => {
    try {
      const token = getStorage("token");
      const response = await fetch(`${API_URL}/certificates/${id}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `certificate_${id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download certificate");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Verification link copied to clipboard!");
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-20 md:pb-8">
      <h1 className="text-2xl font-bold mb-6">My Certificates</h1>

      {certificates.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-12 text-center">
          <TrophyIcon className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No certificates yet</h3>
          <p className="text-gray-500">
            Complete courses with 70%+ score to earn certificates
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6"
            >
              {/* Certificate Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-800 dark:text-white">
                    {cert.course?.title || "Course"}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Issued: {new Date(cert.issueDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    Score: {cert.quizScore}%
                  </p>
                </div>
                <button
                  onClick={() => handleDownload(cert.id)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
                >
                  <DocumentArrowDownIcon className="w-5 h-5" />
                  Download
                </button>
              </div>

              {/* Certificate ID */}
              <div className="mb-3">
                <p className="text-xs text-gray-400">Certificate ID:</p>
                <p className="text-xs font-mono text-gray-500 break-all">
                  {cert.certificateNumber}
                </p>
              </div>

              {/* Verification Section */}
              <div className="border-t border-gray-100 dark:border-gray-700 pt-3">
                <p className="text-xs text-gray-500 mb-2">Verification Link:</p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <p className="text-xs font-mono text-primary-600 bg-gray-50 dark:bg-gray-700 p-2 rounded break-all flex-1">
                    {getVerificationUrl(cert.verificationCode)}
                  </p>
                  <button
                    onClick={() => copyToClipboard(getVerificationUrl(cert.verificationCode))}
                    className="text-primary-600 text-xs hover:underline flex items-center gap-1 justify-center px-3 py-1 border border-primary-600 rounded-lg"
                  >
                    <LinkIcon className="w-3 h-3" />
                    Copy Link
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Certificates;