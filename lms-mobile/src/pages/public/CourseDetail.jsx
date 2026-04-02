import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getStorage } from '../../utils/storage';
import Loader from '../../components/common/Loader';
import { ShoppingCartIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const API_URL = 'http://localhost:5000/api';

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [course, setCourse] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState('3months');
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const token = getStorage('token');
        const response = await fetch(`${API_URL}/courses/${courseId}`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        const data = await response.json();
        setCourse(data.data);
      } catch (error) {
        console.error('Error fetching course:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    setPurchasing(true);
    try {
      const token = getStorage('token');
      const response = await fetch(`${API_URL}/payments/mock-purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          courseId: parseInt(courseId), 
          plan: selectedPlan, 
          paymentId: 'mock_' + Date.now() 
        })
      });
      const data = await response.json();
      
      if (data.success) {
        alert('🎉 Course purchased successfully!');
        navigate(`/course/${courseId}/play`);
      } else if (data.message === 'You already have an active subscription for this course') {
        alert('✅ You already have access to this course!');
        navigate(`/course/${courseId}/play`);
      } else {
        alert(data.message || 'Purchase failed');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Purchase failed. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) return <Loader />;

  if (!course) return null;

  const plans = [
    { id: '1month', name: '1 Month', price: course.prices?.['1month'] || 599, days: 30, savings: 0 },
    { id: '3months', name: '3 Months', price: course.prices?.['3months'] || 1499, days: 90, savings: 'Save 15%' },
    { id: '6months', name: '6 Months', price: course.prices?.['6months'] || 2499, days: 180, savings: 'Save 25%' },
  ];

  const hasAccess = course.userAccess?.hasAccess;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-20 md:pb-8">
      <img
        src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=400&fit=crop'}
        alt={course.title}
        className="w-full h-64 object-cover rounded-2xl shadow-lg mb-6"
      />
      
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">{course.title}</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">{course.description}</p>
      
      {hasAccess ? (
        <div className="bg-green-50 dark:bg-green-900/30 rounded-2xl p-6 text-center border border-green-200 dark:border-green-800">
          <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <p className="text-green-600 dark:text-green-400 text-lg mb-4">You have access to this course!</p>
          <button 
            onClick={() => navigate(`/course/${courseId}/play`)} 
            className="btn-primary inline-flex items-center gap-2"
          >
            <PlayCircleIcon className="w-5 h-5" />
            Start Learning
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Choose Your Plan</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Get lifetime access with one payment</p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {plans.map(plan => (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`p-5 border-2 rounded-2xl text-left transition-all ${
                    selectedPlan === plan.id
                      ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/30 shadow-lg scale-105'
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 hover:shadow-md'
                  }`}
                >
                  <div className="font-bold text-xl text-gray-800 dark:text-white">{plan.name}</div>
                  <div className="text-3xl font-bold text-primary-600 mt-2">₹{plan.price}</div>
                  <div className="text-sm text-gray-500 mt-1">{plan.days} days access</div>
                  {plan.savings && (
                    <span className="inline-block mt-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      {plan.savings}
                    </span>
                  )}
                </button>
              ))}
            </div>
            
            <button
              onClick={handlePurchase}
              disabled={purchasing}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-lg"
            >
              {purchasing ? (
                'Processing...'
              ) : (
                <>
                  <ShoppingCartIcon className="w-5 h-5" />
                  Purchase - ₹{plans.find(p => p.id === selectedPlan)?.price}
                </>
              )}
            </button>
            
            <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4">
              ✅ Secure payment • ✅ Instant access • ✅ 30-day money-back guarantee
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// Import missing icon
import { PlayCircleIcon } from '@heroicons/react/24/outline';

export default CourseDetail;