import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getStorage } from "../../utils/storage";
import {
  PlusIcon,
  TrashIcon,
  BookOpenIcon,
  UsersIcon,
  CurrencyRupeeIcon,
  AcademicCapIcon,
  XMarkIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  ClockIcon,
  ChevronRightIcon,
  FolderIcon,
  ArrowLeftIcon,
  ChartBarIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";

const API_URL = "https://lms-backend-g1cy.onrender.com/api";

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [courses, setCourses] = useState([]);
  const [modules, setModules] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("courses");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);

  // Modal states
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);

  // Form data
  const [courseForm, setCourseForm] = useState({
    title: "",
    description: "",
    price_1month: 599,
    price_3months: 1499,
    price_6months: 2499,
    thumbnail: "",
  });

  const [moduleForm, setModuleForm] = useState({
    title: "",
    order: 1,
  });

  const [lessonForm, setLessonForm] = useState({
    title: "",
    videoUrl: "",
    pdfUrl: "",
    order: 1,
    duration: 0,
  });

  // Quiz states
  const [quizForm, setQuizForm] = useState({
    title: "",
    description: "",
    type: "final",
    passingScore: 70,
    timeLimit: 30,
  });
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    questionText: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
    points: 1,
  });

  // Fetch all courses
  const fetchCourses = async () => {
    try {
      const response = await fetch(`${API_URL}/courses`);
      const data = await response.json();
      setCourses(data.data || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  // Fetch modules for a specific course
  const fetchModules = async (courseId) => {
    try {
      const token = getStorage("token");
      const response = await fetch(`${API_URL}/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success && data.data) {
        setModules(data.data.modules || []);
      } else {
        setModules([]);
      }
    } catch (error) {
      console.error("Error fetching modules:", error);
      setModules([]);
    }
  };

  // Fetch lessons for a specific module
  const fetchLessons = async (moduleId) => {
    try {
      const token = getStorage("token");
      const response = await fetch(`${API_URL}/courses/${selectedCourse?.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      const foundModule = (data.data?.modules || []).find(
        (m) => m.id === moduleId
      );
      setLessons(foundModule?.lessons || []);
    } catch (error) {
      console.error("Error fetching lessons:", error);
      setLessons([]);
    }
  };

  // Fetch quizzes for a course
  const fetchQuizzes = async (courseId) => {
    try {
      const token = getStorage("token");
      const response = await fetch(`${API_URL}/quizzes/course/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setQuizzes(data.data || []);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      setQuizzes([]);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const token = getStorage("token");
      const response = await fetch(`${API_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setStats(data.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchCourses(), fetchStats()]);
      setLoading(false);
    };
    loadData();
  }, []);

  // Handle course selection
  const handleSelectCourse = async (course) => {
    setSelectedCourse(course);
    setSelectedModule(null);
    setActiveTab("modules");
    await fetchModules(course.id);
  };

  // Handle module selection
  const handleSelectModule = async (module) => {
    setSelectedModule(module);
    setActiveTab("lessons");
    await fetchLessons(module.id);
  };

  // Handle quiz tab
  const handleQuizTab = async () => {
    setActiveTab("quizzes");
    if (selectedCourse) {
      await fetchQuizzes(selectedCourse.id);
    }
  };

  // Handle back to courses
  const handleBackToCourses = () => {
    setSelectedCourse(null);
    setSelectedModule(null);
    setActiveTab("courses");
    setModules([]);
    setLessons([]);
    setQuizzes([]);
  };

  // Handle back to modules
  const handleBackToModules = () => {
    setSelectedModule(null);
    setActiveTab("modules");
    setLessons([]);
    if (selectedCourse) {
      fetchModules(selectedCourse.id);
    }
  };

  // Create course
  const handleCreateCourse = async () => {
    if (!courseForm.title) {
      alert("Course title is required");
      return;
    }

    const token = getStorage("token");
    const response = await fetch(`${API_URL}/admin/courses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(courseForm),
    });

    if (response.ok) {
      alert("Course created successfully!");
      setShowCourseModal(false);
      setCourseForm({
        title: "",
        description: "",
        price_1month: 599,
        price_3months: 1499,
        price_6months: 2499,
        thumbnail: "",
      });
      await fetchCourses();
      await fetchStats();
    } else {
      alert("Failed to create course");
    }
  };

  // Create module
  const handleAddModule = async () => {
    if (!moduleForm.title || !selectedCourse) {
      alert("Module title is required");
      return;
    }

    const token = getStorage("token");
    const response = await fetch(
      `${API_URL}/admin/courses/${selectedCourse.id}/modules`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(moduleForm),
      }
    );

    if (response.ok) {
      alert("Module added successfully!");
      setShowModuleModal(false);
      setModuleForm({ title: "", order: 1 });
      setTimeout(async () => {
        await fetchModules(selectedCourse.id);
      }, 500);
    } else {
      alert("Failed to add module");
    }
  };

  // Create lesson
  const handleAddLesson = async () => {
    if (!lessonForm.title || !lessonForm.videoUrl || !selectedModule) {
      alert("Lesson title and video URL are required");
      return;
    }

    const token = getStorage("token");
    const response = await fetch(
      `${API_URL}/admin/modules/${selectedModule.id}/lessons`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(lessonForm),
      }
    );

    if (response.ok) {
      alert("Lesson added successfully!");
      setShowLessonModal(false);
      setLessonForm({
        title: "",
        videoUrl: "",
        pdfUrl: "",
        order: 1,
        duration: 0,
      });
      setTimeout(async () => {
        await fetchLessons(selectedModule.id);
      }, 500);
    } else {
      alert("Failed to add lesson");
    }
  };

  // Add question to list
  const addQuestion = () => {
    if (!currentQuestion.questionText) {
      alert("Question text is required");
      return;
    }
    const emptyOptions = currentQuestion.options.some((opt) => opt === "");
    if (emptyOptions) {
      alert("Please fill all 4 options");
      return;
    }
    setQuestions([...questions, { ...currentQuestion }]);
    setCurrentQuestion({
      questionText: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      points: 1,
    });
  };

  // Remove question
  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  // Create quiz
  const handleCreateQuiz = async () => {
    if (!quizForm.title) {
      alert("Quiz title is required");
      return;
    }

    const token = getStorage("token");
    const response = await fetch(`${API_URL}/quizzes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        courseId: selectedCourse.id,
        ...quizForm,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      alert("Quiz created successfully!");

      if (questions.length > 0) {
        await fetch(`${API_URL}/quizzes/${data.data.id}/questions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ questions }),
        });
      }

      setShowQuizModal(false);
      setQuizForm({
        title: "",
        description: "",
        type: "final",
        passingScore: 70,
        timeLimit: 30,
      });
      setQuestions([]);
      await fetchQuizzes(selectedCourse.id);
    } else {
      alert("Failed to create quiz");
    }
  };

  // Delete course
  const handleDeleteCourse = async (id) => {
    if (confirm("Delete this course? All modules and lessons will be deleted.")) {
      const token = getStorage("token");
      await fetch(`${API_URL}/admin/courses/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (selectedCourse?.id === id) {
        handleBackToCourses();
      }
      await fetchCourses();
      await fetchStats();
    }
  };

  // Delete module
  const handleDeleteModule = async (id) => {
    if (confirm("Delete this module? All lessons will be deleted.")) {
      const token = getStorage("token");
      await fetch(`${API_URL}/admin/modules/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchModules(selectedCourse.id);
    }
  };

  // Delete lesson
  const handleDeleteLesson = async (id) => {
    if (confirm("Delete this lesson?")) {
      const token = getStorage("token");
      await fetch(`${API_URL}/admin/lessons/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchLessons(selectedModule.id);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-20 md:pb-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage courses, modules, lessons and quizzes
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/admin/analytics" className="btn-secondary flex items-center gap-2">
            <ChartBarIcon className="w-5 h-5" />
            Analytics
          </Link>
          <button onClick={logout} className="text-red-600 hover:text-red-700">
            Logout
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex items-center gap-3">
          <UsersIcon className="w-8 h-8 text-primary-500" />
          <div>
            <p className="text-2xl font-bold">{stats?.users?.students || 0}</p>
            <p className="text-sm text-gray-500">Total Students</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex items-center gap-3">
          <BookOpenIcon className="w-8 h-8 text-primary-500" />
          <div>
            <p className="text-2xl font-bold">{courses.length}</p>
            <p className="text-sm text-gray-500">Total Courses</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex items-center gap-3">
          <AcademicCapIcon className="w-8 h-8 text-primary-500" />
          <div>
            <p className="text-2xl font-bold">{stats?.subscriptions?.active || 0}</p>
            <p className="text-sm text-gray-500">Active Subscriptions</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex items-center gap-3">
          <CurrencyRupeeIcon className="w-8 h-8 text-primary-500" />
          <div>
            <p className="text-2xl font-bold">₹{stats?.revenue?.total || 0}</p>
            <p className="text-sm text-gray-500">Total Revenue</p>
          </div>
        </div>
      </div>

      {/* Tabs - Show only when course selected */}
      {selectedCourse && (
        <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab("modules")}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "modules"
                ? "text-primary-600 border-b-2 border-primary-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Modules
          </button>
          <button
            onClick={handleQuizTab}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "quizzes"
                ? "text-primary-600 border-b-2 border-primary-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Quizzes
          </button>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <button onClick={handleBackToCourses} className="flex items-center gap-1 hover:text-primary-600">
          <ArrowLeftIcon className="w-4 h-4" />
          Courses
        </button>
        {selectedCourse && (
          <>
            <ChevronRightIcon className="w-4 h-4" />
            <span className="text-gray-800 dark:text-white font-medium">{selectedCourse.title}</span>
          </>
        )}
        {selectedModule && activeTab === "lessons" && (
          <>
            <ChevronRightIcon className="w-4 h-4" />
            <span className="text-gray-800 dark:text-white font-medium">{selectedModule.title}</span>
          </>
        )}
      </div>

      {/* Courses Tab */}
      {activeTab === "courses" && (
        <div>
          <button onClick={() => setShowCourseModal(true)} className="btn-primary mb-6 flex items-center gap-2">
            <PlusIcon className="w-5 h-5" /> Add New Course
          </button>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
              <div key={course.id} className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
                <h3 className="font-bold text-lg">{course.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{course.description}</p>
                <button
                  onClick={() => handleSelectCourse(course)}
                  className="mt-4 w-full bg-gray-100 py-2 rounded-lg hover:bg-primary-100 transition"
                >
                  Manage Course
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modules Tab */}
      {activeTab === "modules" && selectedCourse && (
        <div>
          <button onClick={() => setShowModuleModal(true)} className="btn-primary mb-6 flex items-center gap-2">
            <PlusIcon className="w-5 h-5" /> Add Module
          </button>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules.map((module) => (
              <div key={module.id} className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
                <h3 className="font-bold">{module.title}</h3>
                <p className="text-xs text-gray-500 mt-1">Order: {module.order}</p>
                <button
                  onClick={() => handleSelectModule(module)}
                  className="mt-4 w-full bg-gray-100 py-2 rounded-lg hover:bg-primary-100 transition"
                >
                  Manage Lessons
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lessons Tab */}
      {activeTab === "lessons" && selectedModule && (
        <div>
          <button onClick={() => setShowLessonModal(true)} className="btn-primary mb-6 flex items-center gap-2">
            <PlusIcon className="w-5 h-5" /> Add Lesson
          </button>
          <div className="space-y-4">
            {lessons.map((lesson) => (
              <div key={lesson.id} className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
                <h3 className="font-bold">{lesson.title}</h3>
                <p className="text-xs text-gray-500">{lesson.duration} min | Order: {lesson.order}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quizzes Tab */}
      {activeTab === "quizzes" && selectedCourse && (
        <div>
          <button onClick={() => setShowQuizModal(true)} className="btn-primary mb-6 flex items-center gap-2">
            <PlusIcon className="w-5 h-5" /> Create Quiz
          </button>
          <div className="space-y-4">
            {quizzes.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-8 text-center">
                <QuestionMarkCircleIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No quizzes yet. Click "Create Quiz" to add one.</p>
              </div>
            ) : (
              quizzes.map((quiz) => (
                <div key={quiz.id} className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
                  <h3 className="font-bold text-lg">{quiz.title}</h3>
                  <p className="text-sm text-gray-500">{quiz.description}</p>
                  <div className="flex gap-3 mt-2">
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      Passing: {quiz.passingScore}%
                    </span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      Time: {quiz.timeLimit} min
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Course Modal */}
      {showCourseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Create New Course</h2>
              <button onClick={() => setShowCourseModal(false)}>
                <XMarkIcon className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Course Title"
                value={courseForm.title}
                onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                className="input"
              />
              <textarea
                placeholder="Description"
                value={courseForm.description}
                onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                className="input"
                rows={3}
              />
              <div className="grid grid-cols-3 gap-3">
                <input
                  type="number"
                  placeholder="1 Month Price"
                  value={courseForm.price_1month}
                  onChange={(e) => setCourseForm({ ...courseForm, price_1month: parseInt(e.target.value) })}
                  className="input"
                />
                <input
                  type="number"
                  placeholder="3 Months Price"
                  value={courseForm.price_3months}
                  onChange={(e) => setCourseForm({ ...courseForm, price_3months: parseInt(e.target.value) })}
                  className="input"
                />
                <input
                  type="number"
                  placeholder="6 Months Price"
                  value={courseForm.price_6months}
                  onChange={(e) => setCourseForm({ ...courseForm, price_6months: parseInt(e.target.value) })}
                  className="input"
                />
              </div>
              <button onClick={handleCreateCourse} className="btn-primary w-full">
                Create Course
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Module Modal */}
      {showModuleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add Module to "{selectedCourse?.title}"</h2>
              <button onClick={() => setShowModuleModal(false)}>
                <XMarkIcon className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Module Title"
                value={moduleForm.title}
                onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                className="input"
              />
              <input
                type="number"
                placeholder="Order"
                value={moduleForm.order}
                onChange={(e) => setModuleForm({ ...moduleForm, order: parseInt(e.target.value) })}
                className="input"
              />
              <button onClick={handleAddModule} className="btn-primary w-full">
                Add Module
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lesson Modal */}
      {showLessonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add Lesson to "{selectedModule?.title}"</h2>
              <button onClick={() => setShowLessonModal(false)}>
                <XMarkIcon className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Lesson Title"
                value={lessonForm.title}
                onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                className="input"
              />
              <input
                type="text"
                placeholder="Video URL"
                value={lessonForm.videoUrl}
                onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
                className="input"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Order"
                  value={lessonForm.order}
                  onChange={(e) => setLessonForm({ ...lessonForm, order: parseInt(e.target.value) })}
                  className="input"
                />
                <input
                  type="number"
                  placeholder="Duration (min)"
                  value={lessonForm.duration}
                  onChange={(e) => setLessonForm({ ...lessonForm, duration: parseInt(e.target.value) })}
                  className="input"
                />
              </div>
              <button onClick={handleAddLesson} className="btn-primary w-full">
                Add Lesson
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Modal */}
      {showQuizModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Create Quiz for "{selectedCourse?.title}"</h2>
              <button onClick={() => setShowQuizModal(false)}>
                <XMarkIcon className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Quiz Details */}
            <div className="space-y-4 mb-6">
              <h3 className="font-semibold">Quiz Details</h3>
              <input
                type="text"
                placeholder="Quiz Title"
                value={quizForm.title}
                onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                className="input"
              />
              <textarea
                placeholder="Description"
                value={quizForm.description}
                onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
                className="input"
                rows={2}
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Passing Score (%)"
                  value={quizForm.passingScore}
                  onChange={(e) => setQuizForm({ ...quizForm, passingScore: parseInt(e.target.value) })}
                  className="input"
                />
                <input
                  type="number"
                  placeholder="Time Limit (minutes)"
                  value={quizForm.timeLimit}
                  onChange={(e) => setQuizForm({ ...quizForm, timeLimit: parseInt(e.target.value) })}
                  className="input"
                />
              </div>
            </div>

            {/* Questions Section */}
            <div className="space-y-4 mb-6">
              <h3 className="font-semibold">Questions ({questions.length})</h3>
              {questions.map((q, idx) => (
                <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between">
                    <p className="font-medium">Q{idx + 1}: {q.questionText}</p>
                    <button onClick={() => removeQuestion(idx)} className="text-red-500">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Add Question */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Add New Question</h4>
                <input
                  type="text"
                  placeholder="Question text"
                  value={currentQuestion.questionText}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, questionText: e.target.value })}
                  className="input mb-3"
                />
                {currentQuestion.options.map((opt, idx) => (
                  <input
                    key={idx}
                    type="text"
                    placeholder={`Option ${idx + 1}`}
                    value={opt}
                    onChange={(e) => {
                      const newOptions = [...currentQuestion.options];
                      newOptions[idx] = e.target.value;
                      setCurrentQuestion({ ...currentQuestion, options: newOptions });
                    }}
                    className="input mb-2"
                  />
                ))}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <select
                    value={currentQuestion.correctAnswer}
                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, correctAnswer: parseInt(e.target.value) })}
                    className="input"
                  >
                    {currentQuestion.options.map((_, idx) => (
                      <option key={idx} value={idx}>Correct: Option {idx + 1}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    placeholder="Points"
                    value={currentQuestion.points}
                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, points: parseInt(e.target.value) })}
                    className="input"
                  />
                </div>
                <button onClick={addQuestion} className="btn-secondary w-full">
                  + Add Question
                </button>
              </div>
            </div>

            <button onClick={handleCreateQuiz} className="btn-primary w-full">
              Create Quiz with {questions.length} Questions
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;