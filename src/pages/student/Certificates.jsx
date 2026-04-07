import React, { useState, useEffect } from 'react';
import { certificateService } from '../../services/certificate';
import Loader from '../../components/common/Loader';
import { DocumentArrowDownIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';

const Certificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const response = await certificateService.getMyCertificates();
      setCertificates(response.data || []);
    } catch (error) {
      console.error('Error fetching certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (id) => {
    try {
      const blob = await certificateService.downloadCertificate(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificate_${id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-20 md:pb-8">
      <h1 className="text-2xl font-bold mb-6">My Certificates</h1>
      
      {certificates.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-12 text-center">
          <CheckBadgeIcon className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No certificates yet</h3>
          <p className="text-gray-500">Complete courses with 70%+ score to earn certificates</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map(cert => (
            <div key={cert.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{cert.course?.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Issued: {new Date(cert.issueDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500">Score: {cert.quizScore}%</p>
                  <p className="text-xs text-gray-400 mt-2">ID: {cert.certificateNumber}</p>
                </div>
                <button
                  onClick={() => handleDownload(cert.id)}
                  className="btn-primary flex items-center gap-2"
                >
                  <DocumentArrowDownIcon className="w-5 h-5" />
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Certificates;