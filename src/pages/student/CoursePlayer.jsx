import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getStorage } from "../../utils/storage";
import VideoPlayer from "../../components/course/VideoPlayer";
import Loader from "../../components/common/Loader";
import QuizModal from "../../components/quiz/QuizModal";
import RaiseDoubtModal from "../../components/doubt/RaiseDoubtModal";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  PlayCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  FolderIcon,
  QuestionMarkCircleIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";

const API_URL = "https://lms-backend-g1cy.onrender.com/api";

const CoursePlayer = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [expandedModules, setExpandedModules] = useState([]);
  const [courseProgress, setCourseProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [quizType, setQuizType] = useState('final');
  const [moduleQuizStatus, setModuleQuizStatus] = useState({});
  const [hasCertificate, setHasCertificate] = useState(false);
  const [showDoubtModal, setShowDoubtModal] = useState(false);

  // Fetch data function
  const fetchData = async () => {
    try {
      const token = getStorage("token");

      // Fetch course details
      const courseRes = await fetch(`${API_URL}/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const courseData = await courseRes.json();

      if (!courseData.data?.userAccess?.hasAccess) {
        navigate(`/course/${courseId}`);
        return;
      }

      setCourse(courseData.data);

      // Fetch progress
      const progressRes = await fetch(`${API_URL}/progress/course/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const progressData = await progressRes.json();
      setCourseProgress(progressData.data);

      // Fetch module quiz statuses
      await fetchModuleQuizStatuses(courseData.data.modules || []);

      // Mark completed lessons
      const completedMap = {};
      progressData.data?.lessons?.forEach((l) => {
        if (l.completed) completedMap[l.id] = true;
      });

      const modulesWithProgress = (courseData.data.modules || []).map(
        (module) => ({
          ...module,
          lessons: module.lessons.map((lesson) => ({
            ...lesson,
            completed: completedMap[lesson.id] || false,
          })),
        })
      );

      setModules(modulesWithProgress);
      setExpandedModules([modulesWithProgress[0]?.id]);

      // Set first incomplete lesson
      let firstIncomplete = null;
      for (const module of modulesWithProgress) {
        for (const lesson of module.lessons) {
          if (!lesson.completed) {
            firstIncomplete = lesson;
            break;
          }
        }
        if (firstIncomplete) break;
      }
      setCurrentLesson(firstIncomplete || modulesWithProgress[0]?.lessons[0]);
    } catch (error) {
      console.error("Error fetching course:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch module quiz statuses
  const fetchModuleQuizStatuses = async (modulesList) => {
    const token = getStorage("token");
    const statusMap = {};
    
    for (const module of modulesList) {
      try {
        const response = await fetch(`${API_URL}/quizzes/module/${module.id}/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (data.success && data.data.exists) {
          statusMap[module.id] = {
            quizId: data.data.quizId,
            passed: data.data.passed || false
          };
        }
      } catch (error) {
        console.error(`Error fetching quiz status for module ${module.id}:`, error);
      }
    }
    setModuleQuizStatus(statusMap);
  };

  // Check if module is complete (all lessons completed)
  const isModuleComplete = (module) => {
    if (!module.lessons || module.lessons.length === 0) return false;
    return module.lessons.every(lesson => lesson.completed);
  };

  // Take module quiz
  const takeModuleQuiz = async (moduleId) => {
    const token = getStorage("token");
    const response = await fetch(`${API_URL}/quizzes/module/${moduleId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (data.success && data.data.length > 0) {
      setQuiz(data.data[0]);
      setQuizType('module');
      setShowQuiz(true);
    } else {
      alert("No quiz found for this module.");
    }
  };

  // Take final quiz
  const takeFinalQuiz = async () => {
    const token = getStorage("token");
    const response = await fetch(`${API_URL}/quizzes/course/${courseId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (data.success && data.data.finalQuiz) {
      setQuiz(data.data.finalQuiz);
      setQuizType('final');
      setShowQuiz(true);
    } else {
      alert("No final quiz found for this course.");
    }
  };

  useEffect(() => {
    fetchData();
    checkCertificate();
  }, [courseId, navigate]);

  const checkCertificate = async () => {
    const token = getStorage("token");
    const response = await fetch(`${API_URL}/certificates/my`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    const certificateExists = data.data?.some(
      (cert) => cert.courseId === parseInt(courseId)
    );
    setHasCertificate(certificateExists);
  };

  // Mark lesson as complete
  const markComplete = async () => {
    if (!currentLesson) return;
    const token = getStorage("token");
    await fetch(`${API_URL}/progress/lesson/${currentLesson.id}/complete`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    await fetchData();
  };

  const handleToggleComplete = async () => {
    if (!currentLesson) return;
    const token = getStorage("token");
    if (currentLesson.completed) {
      await fetch(`${API_URL}/progress/lesson/${currentLesson.id}/complete`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    } else {
      await fetch(`${API_URL}/progress/lesson/${currentLesson.id}/complete`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    }
    await fetchData();
  };

  const handleQuizSubmit = async (answers) => {
    const token = getStorage("token");
    const response = await fetch(`${API_URL}/quizzes/${quiz.id}/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ answers }),
    });
    const data = await response.json();
    
    if (data.data.passed && quizType === 'final') {
      const certResponse = await fetch(`${API_URL}/certificates/generate/${courseId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quizScore: data.data.percentage }),
      });
      const certData = await certResponse.json();
      console.log("Certificate generation response:", certData);
    }
    
    // Refresh module quiz status
    await fetchModuleQuizStatuses(modules);
    return data.data;
  };

  const toggleModule = (moduleId) => {
    setExpandedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  if (loading) return <Loader />;

  if (!course || !course.userAccess?.hasAccess) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <p className="text-gray-600 mb-4">You don't have access to this course.</p>
        <a href="/courses" className="btn-primary inline-block">Browse Courses</a>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-20 md:pb-8">
      {/* Course Header with Progress */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          {course.title}
        </h1>
        {courseProgress && (
          <div className="mt-3">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
              <span>Course Progress</span>
              <span>{courseProgress.percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${courseProgress.percentage}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {courseProgress.completedLessons} of {courseProgress.totalLessons} lessons completed
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar - Modules */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden sticky top-20">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <h2 className="font-semibold text-gray-800 dark:text-white">Course Content</h2>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {modules.map((module) => {
                const moduleComplete = isModuleComplete(module);
                const quizPassed = moduleQuizStatus[module.id]?.passed;
                const hasModuleQuiz = moduleQuizStatus[module.id]?.quizId;
                
                return (
                  <div key={module.id}>
                    <button
                      onClick={() => toggleModule(module.id)}
                      className="w-full flex justify-between items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                      <div className="flex items-center gap-2">
                        <FolderIcon className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-sm">{module.title}</span>
                        {moduleComplete && !quizPassed && hasModuleQuiz && (
                          <span className="ml-2 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                            Quiz Pending
                          </span>
                        )}
                        {quizPassed && (
                          <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircleIcon className="w-3 h-3" /> Quiz Passed
                          </span>
                        )}
                      </div>
                      {expandedModules.includes(module.id) ? (
                        <ChevronUpIcon className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                      )}
                    </button>

                    {expandedModules.includes(module.id) && (
                      <div className="bg-gray-50 dark:bg-gray-900/50">
                        {/* Lessons */}
                        {module.lessons.map((lesson) => (
                          <button
                            key={lesson.id}
                            onClick={() => setCurrentLesson(lesson)}
                            className={`w-full flex justify-between items-center p-3 pl-8 hover:bg-gray-100 dark:hover:bg-gray-800 transition ${
                              currentLesson?.id === lesson.id
                                ? "bg-primary-50 dark:bg-primary-900/30"
                                : ""
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {lesson.completed ? (
                                <CheckCircleIcon className="w-4 h-4 text-green-500" />
                              ) : (
                                <PlayCircleIcon className="w-4 h-4 text-gray-400" />
                              )}
                              <span className="text-sm">{lesson.title}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <ClockIcon className="w-3 h-3 text-gray-400" />
                              <span className="text-xs">{lesson.duration} min</span>
                            </div>
                          </button>
                        ))}
                        
                        {/* Module Quiz Button */}
                        {hasModuleQuiz && !quizPassed && moduleComplete && (
                          <button
                            onClick={() => takeModuleQuiz(module.id)}
                            className="w-full flex items-center justify-center gap-2 p-3 bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/30 transition border-t border-gray-200 dark:border-gray-700"
                          >
                            <TrophyIcon className="w-4 h-4 text-yellow-600" />
                            <span className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
                              Take Module Quiz
                            </span>
                          </button>
                        )}
                        
                        {quizPassed && (
                          <div className="p-3 text-center text-green-600 text-sm border-t border-gray-200 dark:border-gray-700 flex items-center justify-center gap-2">
                            <CheckCircleIcon className="w-4 h-4" />
                            Module Quiz Completed!
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main - Video Player */}
        <div className="lg:col-span-2">
          {currentLesson ? (
            <>
              <VideoPlayer
                videoUrl={currentLesson.videoUrl}
                title={currentLesson.title}
                onComplete={markComplete}
                onToggleComplete={handleToggleComplete}
                isCompleted={currentLesson.completed}
                autoPlay
              />
              <button
                onClick={() => setShowDoubtModal(true)}
                className="btn-secondary w-full mt-3 flex items-center justify-center gap-2"
              >
                <QuestionMarkCircleIcon className="w-5 h-5" />
                Raise a Doubt
              </button>
            </>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-8 text-center">
              <PlayCircleIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Select a lesson to start learning</p>
            </div>
          )}
        </div>
      </div>

      {/* Final Quiz Button - Shows only when all modules are completed AND quizzes passed */}
      {modules.length > 0 && 
       modules.every(m => isModuleComplete(m) && (moduleQuizStatus[m.id]?.passed || !moduleQuizStatus[m.id]?.quizId)) && 
       !hasCertificate && (
        <div className="mt-6">
          <button
            onClick={takeFinalQuiz}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <TrophyIcon className="w-5 h-5" />
            Take Final Quiz
          </button>
        </div>
      )}

      {/* Certificate Earned Message */}
      {hasCertificate && (
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl text-center">
          <p className="text-green-600 dark:text-green-400 flex items-center justify-center gap-2">
            <CheckCircleIcon className="w-5 h-5" />
            🎉 Congratulations! You have earned a certificate for this course!
          </p>
        </div>
      )}

      {/* Quiz Modal */}
      {showQuiz && quiz && (
        <QuizModal
          isOpen={showQuiz}
          onClose={() => setShowQuiz(false)}
          quiz={quiz}
          onSubmit={handleQuizSubmit}
        />
      )}

      {/* Raise Doubt Modal */}
      <RaiseDoubtModal
        isOpen={showDoubtModal}
        onClose={() => setShowDoubtModal(false)}
        courseId={parseInt(courseId)}
        courseTitle={course?.title}
        lessonId={currentLesson?.id}
        lessonTitle={currentLesson?.title}
      />
    </div>
  );
};

export default CoursePlayer;