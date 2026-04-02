import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getStorage } from "../../utils/storage";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
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
} from "@heroicons/react/24/outline";

const API_URL = "http://localhost:5000/api";

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [courses, setCourses] = useState([]);
  const [modules, setModules] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("courses");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);

  // Modal states
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);

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

  // Fetch modules for a specific course - Get from course data
  const fetchModules = async (courseId) => {
    try {
      const token = getStorage("token");
      console.log("🔍 Fetching course data for ID:", courseId);

      const response = await fetch(`${API_URL}/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      console.log("📦 Course data:", data);

      if (data.success && data.data) {
        const modulesData = data.data.modules || [];
        console.log("✅ Found modules:", modulesData.length);
        setModules(modulesData);
      } else {
        setModules([]);
      }
    } catch (error) {
      console.error("❌ Error fetching modules:", error);
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
        (m) => m.id === moduleId,
      );
      setLessons(foundModule?.lessons || []);
    } catch (error) {
      console.error("Error fetching lessons:", error);
      setLessons([]);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const token = getStorage("token");
      console.log("📊 Fetching stats...");

      const response = await fetch(`${API_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      console.log("📊 Stats response:", data);
      console.log("   Students:", data.data?.users?.students);
      console.log("   Active Subs:", data.data?.subscriptions?.active);
      console.log("   Revenue:", data.data?.revenue?.total);

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

  // Auto-refresh stats every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeTab === "courses") {
        fetchStats();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [activeTab]);

  // Handle course selection
  const handleSelectCourse = async (course) => {
    console.log("📘 Selected course:", course.title);
    setSelectedCourse(course);
    setSelectedModule(null);
    setActiveTab("modules");
    await fetchModules(course.id);
  };

  // Handle module selection
  const handleSelectModule = async (module) => {
    console.log("📁 Selected module:", module.title);
    setSelectedModule(module);
    setActiveTab("lessons");
    await fetchLessons(module.id);
  };

  // Handle back to courses
  const handleBackToCourses = () => {
    setSelectedCourse(null);
    setSelectedModule(null);
    setActiveTab("courses");
    setModules([]);
    setLessons([]);
  };

  // Manual refresh function
  const handleRefresh = async () => {
    setLoading(true);
    await Promise.all([fetchCourses(), fetchStats()]);
    if (selectedCourse) {
      await fetchModules(selectedCourse.id);
    }
    setLoading(false);
    alert("Dashboard refreshed!");
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
    console.log("📝 Adding module to course:", selectedCourse.id);

    const response = await fetch(
      `${API_URL}/admin/courses/${selectedCourse.id}/modules`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(moduleForm),
      },
    );

    const result = await response.json();
    console.log("Add module response:", result);

    if (response.ok) {
      alert("Module added successfully!");
      setShowModuleModal(false);
      setModuleForm({ title: "", order: 1 });

      // Wait a moment for database to update, then refresh
      setTimeout(async () => {
        await fetchModules(selectedCourse.id);
      }, 500);
    } else {
      alert("Failed to add module: " + (result.message || "Unknown error"));
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
      },
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

  // Delete course
  const handleDeleteCourse = async (id) => {
    if (
      confirm("Delete this course? All modules and lessons will be deleted.")
    ) {
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
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
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
            Manage courses, modules and lessons
          </p>
        </div>
        <button onClick={logout} className="text-red-600 hover:text-red-700">
          Logout
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex items-center gap-3">
          <UsersIcon className="w-8 h-8 text-primary-500" />
          <div>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {stats?.users?.students || 0}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total Students
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex items-center gap-3">
          <BookOpenIcon className="w-8 h-8 text-primary-500" />
          <div>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {stats?.content?.courses || 0}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total Courses
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex items-center gap-3">
          <AcademicCapIcon className="w-8 h-8 text-primary-500" />
          <div>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {stats?.subscriptions?.active || 0}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Active Subscriptions
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex items-center gap-3">
          <CurrencyRupeeIcon className="w-8 h-8 text-primary-500" />
          <div>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              ₹{stats?.revenue?.total || 0}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total Revenue
            </p>
          </div>
        </div>
      </div>

      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        {activeTab !== "courses" && (
          <button
            onClick={handleBackToCourses}
            className="flex items-center gap-1 hover:text-primary-600"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Courses
          </button>
        )}
        {selectedCourse && activeTab !== "courses" && (
          <>
            <ChevronRightIcon className="w-4 h-4" />
            <span className="text-gray-800 dark:text-white font-medium">
              {selectedCourse.title}
            </span>
          </>
        )}
        {selectedModule && activeTab === "lessons" && (
          <>
            <ChevronRightIcon className="w-4 h-4" />
            <span className="text-gray-800 dark:text-white font-medium">
              {selectedModule.title}
            </span>
          </>
        )}
      </div>

      {/* Courses Tab */}
      {activeTab === "courses" && (
        <div>
          <button
            onClick={() => setShowCourseModal(true)}
            className="btn-primary mb-6 flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" /> Add New Course
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.length === 0 ? (
              <div className="col-span-full bg-white dark:bg-gray-800 rounded-xl shadow p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  No courses yet. Click "Add New Course" to create one.
                </p>
              </div>
            ) : (
              courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg transition-all overflow-hidden"
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-800 dark:text-white">
                          {course.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                          {course.description}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                            1M: ₹{course.price_1month}
                          </span>
                          <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                            3M: ₹{course.price_3months}
                          </span>
                          <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                            6M: ₹{course.price_6months}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteCourse(course.id)}
                        className="text-red-500 hover:text-red-600 p-1"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                    <button
                      onClick={() => handleSelectCourse(course)}
                      className="mt-4 w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900 hover:text-primary-600 transition text-sm font-medium"
                    >
                      Manage Modules
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modules Tab */}
      {activeTab === "modules" && selectedCourse && (
        <div>
          <button
            onClick={() => setShowModuleModal(true)}
            className="btn-primary mb-6 flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" /> Add Module to "
            {selectedCourse.title}"
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules.length === 0 ? (
              <div className="col-span-full bg-white dark:bg-gray-800 rounded-xl shadow p-8 text-center">
                <FolderIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">
                  No modules yet. Click "Add Module" to create one.
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Check browser console for debug info (F12)
                </p>
              </div>
            ) : (
              modules.map((module) => (
                <div
                  key={module.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg transition-all overflow-hidden"
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800 dark:text-white">
                          {module.title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          Order: {module.order}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {module.lessons?.length || 0} lessons
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteModule(module.id)}
                        className="text-red-500 hover:text-red-600 p-1"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                    <button
                      onClick={() => handleSelectModule(module)}
                      className="mt-4 w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900 hover:text-primary-600 transition text-sm font-medium"
                    >
                      Manage Lessons
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Lessons Tab */}
      {activeTab === "lessons" && selectedModule && (
        <div>
          <button
            onClick={() => setShowLessonModal(true)}
            className="btn-primary mb-6 flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" /> Add Lesson to "
            {selectedModule.title}"
          </button>

          <div className="space-y-4">
            {lessons.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-8 text-center">
                <VideoCameraIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">
                  No lessons yet. Click "Add Lesson" to create one.
                </p>
              </div>
            ) : (
              lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 hover:shadow-lg transition-all"
                >
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-xl flex items-center justify-center">
                      <VideoCameraIcon className="w-6 h-6 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-gray-800 dark:text-white">
                            {lesson.title}
                          </h3>
                          <div className="flex gap-3 mt-1">
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <ClockIcon className="w-3 h-3" />{" "}
                              {lesson.duration || 0} min
                            </span>
                            <span className="text-xs text-gray-500">
                              Order: {lesson.order}
                            </span>
                          </div>
                          {lesson.pdfUrl && (
                            <a
                              href={lesson.pdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-600 text-xs hover:underline mt-2 inline-flex items-center gap-1"
                            >
                              <DocumentTextIcon className="w-3 h-3" /> Download
                              Resources
                            </a>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteLesson(lesson.id)}
                          className="text-red-500 hover:text-red-600 p-1"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
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
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  Create New Course
                </h2>
                <button onClick={() => setShowCourseModal(false)}>
                  <XMarkIcon className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Course Title *
                  </label>
                  <input
                    type="text"
                    value={courseForm.title}
                    onChange={(e) =>
                      setCourseForm({ ...courseForm, title: e.target.value })
                    }
                    className="input"
                    placeholder="e.g., Complete JavaScript Course"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Description
                  </label>
                  <textarea
                    value={courseForm.description}
                    onChange={(e) =>
                      setCourseForm({
                        ...courseForm,
                        description: e.target.value,
                      })
                    }
                    className="input"
                    rows={3}
                    placeholder="Course description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Thumbnail URL
                  </label>
                  <input
                    type="text"
                    value={courseForm.thumbnail}
                    onChange={(e) =>
                      setCourseForm({
                        ...courseForm,
                        thumbnail: e.target.value,
                      })
                    }
                    className="input"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      1 Month (₹)
                    </label>
                    <input
                      type="number"
                      value={courseForm.price_1month}
                      onChange={(e) =>
                        setCourseForm({
                          ...courseForm,
                          price_1month: parseInt(e.target.value) || 0,
                        })
                      }
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      3 Months (₹)
                    </label>
                    <input
                      type="number"
                      value={courseForm.price_3months}
                      onChange={(e) =>
                        setCourseForm({
                          ...courseForm,
                          price_3months: parseInt(e.target.value) || 0,
                        })
                      }
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      6 Months (₹)
                    </label>
                    <input
                      type="number"
                      value={courseForm.price_6months}
                      onChange={(e) =>
                        setCourseForm({
                          ...courseForm,
                          price_6months: parseInt(e.target.value) || 0,
                        })
                      }
                      className="input"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleCreateCourse}
                  className="btn-primary flex-1"
                >
                  Create Course
                </button>
                <button
                  onClick={() => setShowCourseModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Module Modal */}
      {showModuleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  Add Module to "{selectedCourse?.title}"
                </h2>
                <button onClick={() => setShowModuleModal(false)}>
                  <XMarkIcon className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Module Title *
                  </label>
                  <input
                    type="text"
                    value={moduleForm.title}
                    onChange={(e) =>
                      setModuleForm({ ...moduleForm, title: e.target.value })
                    }
                    className="input"
                    placeholder="e.g., Introduction to JavaScript"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Order (1, 2, 3...)
                  </label>
                  <input
                    type="number"
                    value={moduleForm.order}
                    onChange={(e) =>
                      setModuleForm({
                        ...moduleForm,
                        order: parseInt(e.target.value) || 1,
                      })
                    }
                    className="input"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleAddModule}
                  className="btn-primary flex-1"
                >
                  Add Module
                </button>
                <button
                  onClick={() => setShowModuleModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lesson Modal */}
      {showLessonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  Add Lesson to "{selectedModule?.title}"
                </h2>
                <button onClick={() => setShowLessonModal(false)}>
                  <XMarkIcon className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Lesson Title *
                  </label>
                  <input
                    type="text"
                    value={lessonForm.title}
                    onChange={(e) =>
                      setLessonForm({ ...lessonForm, title: e.target.value })
                    }
                    className="input"
                    placeholder="e.g., Variables and Data Types"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Video URL *
                  </label>
                  <input
                    type="text"
                    value={lessonForm.videoUrl}
                    onChange={(e) =>
                      setLessonForm({ ...lessonForm, videoUrl: e.target.value })
                    }
                    className="input"
                    placeholder="https://vimeo.com/123456789"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Vimeo or YouTube URL
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Resources (PDF URL)
                  </label>
                  <input
                    type="text"
                    value={lessonForm.pdfUrl}
                    onChange={(e) =>
                      setLessonForm({ ...lessonForm, pdfUrl: e.target.value })
                    }
                    className="input"
                    placeholder="https://example.com/resource.pdf"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Order
                    </label>
                    <input
                      type="number"
                      value={lessonForm.order}
                      onChange={(e) =>
                        setLessonForm({
                          ...lessonForm,
                          order: parseInt(e.target.value) || 1,
                        })
                      }
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      value={lessonForm.duration}
                      onChange={(e) =>
                        setLessonForm({
                          ...lessonForm,
                          duration: parseInt(e.target.value) || 0,
                        })
                      }
                      className="input"
                      placeholder="15"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleAddLesson}
                  className="btn-primary flex-1"
                >
                  Add Lesson
                </button>
                <button
                  onClick={() => setShowLessonModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
