"use client";

import React, { useState } from "react";
import { logoutAction } from "../login/actions";
import AdminSidebar, { AdminTab } from "./components/AdminSidebar";
import AdminTopBar from "./components/AdminTopBar";
import WelcomeBanner from "./components/WelcomeBanner";
import KpiCards from "./components/KpiCards";
import { UserGrowthChart, ProficiencyDonut } from "./components/Charts";
import TopLanguagesCard from "./components/TopLanguagesCard";
import RecentUsersTable from "./components/RecentUsersTable";
import RecentActivityFeed from "./components/RecentActivityFeed";
import SystemStatusCard from "./components/SystemStatusCard";
import UsersView from "./components/UsersView";
import CoursesLessonsView from "./components/CoursesLessonsView";
import VocabularyView from "./components/VocabularyView";
import AiConversationsView from "./components/AiConversationsView";
import AnalyticsView from "./components/AnalyticsView";
import ContentManagementView from "./components/ContentManagementView";
import LanguageSettingsView from "./components/LanguageSettingsView";
import SystemSettingsView from "./components/SystemSettingsView";
import ManageAdminsView from "./components/ManageAdminsView";
import ReportsView from "./components/ReportsView";
import NotificationsView from "./components/NotificationsView";
import AdminProfileView from "./components/AdminProfileView";
import { UserDetailModal, EditUserModal, CreateUserModal, AdminUserRecord } from "./components/UserModals";
import { CourseModal, LessonModal, VocabularyModal } from "./components/CmsModals";
import type {
  AdminUserData,
  AdminCourseData,
  AdminLessonData,
  AdminVocabularyData,
  AdminPracticeAttemptData,
} from "./page";

interface AdminClientProps {
  initialUsers: AdminUserData[];
  initialCourses: AdminCourseData[];
  initialLessons: AdminLessonData[];
  initialVocabularies: AdminVocabularyData[];
  initialAttempts: AdminPracticeAttemptData[];
  currentAdmin: {
    id: number;
    email: string;
    name?: string | null;
    username?: string | null;
  };
  userName: string;
  userInitials: string;
  hasGeminiKey: boolean;
}

export default function AdminClient({
  initialUsers,
  initialCourses,
  initialLessons,
  initialVocabularies,
  initialAttempts,
  currentAdmin,
  userName,
  userInitials,
  hasGeminiKey,
}: AdminClientProps) {
  // Navigation & UI state
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Data state
  const [users, setUsers] = useState<AdminUserData[]>(initialUsers);
  const [courses, setCourses] = useState<AdminCourseData[]>(initialCourses);
  const [lessons, setLessons] = useState<AdminLessonData[]>(initialLessons);
  const [vocabularies, setVocabularies] = useState<AdminVocabularyData[]>(initialVocabularies);
  const [attempts, setAttempts] = useState<AdminPracticeAttemptData[]>(initialAttempts);

  // Modal states
  const [selectedUserDetail, setSelectedUserDetail] = useState<AdminUserRecord | null>(null);
  const [selectedUserEdit, setSelectedUserEdit] = useState<AdminUserRecord | null>(null);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);

  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<AdminCourseData | undefined>(undefined);

  const [showLessonModal, setShowLessonModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState<AdminLessonData | undefined>(undefined);

  const [showVocabModal, setShowVocabModal] = useState(false);
  const [editingVocab, setEditingVocab] = useState<AdminVocabularyData | undefined>(undefined);

  // Derived metrics from real PostgreSQL data
  const totalUsers = users.length;
  const totalStudents = users.filter((u) => u.role !== "admin").length;
  const totalCourses = courses.length;
  const totalLessons = lessons.length;
  const totalVocab = vocabularies.length;
  const totalAttempts = attempts.length;
  const averageScore =
    attempts.length > 0
      ? Math.round(attempts.reduce((acc, cur) => acc + cur.score, 0) / attempts.length)
      : 0;

  const beginnerCount = users.filter((u) => !u.level || u.level.toLowerCase() === "beginner").length;
  const intermediateCount = users.filter((u) => u.level && u.level.toLowerCase() === "intermediate").length;
  const advancedCount = users.filter((u) => u.level && u.level.toLowerCase() === "advanced").length;

  // Real activities mapped from PostgreSQL attempts, users, and lessons sorted by date
  const recentActivities = React.useMemo(() => {
    interface FeedItem {
      id: string;
      type: "attempt" | "user" | "lesson";
      title: string;
      subtitle: string;
      rawDate: number;
      timestamp: string;
    }

    const list: FeedItem[] = [];

    // Map practice attempts
    attempts.forEach((att) => {
      const d = new Date(att.createdAt);
      list.push({
        id: `att-${att.id}`,
        type: "attempt",
        title: "Speaking practice",
        subtitle: `"${att.phrase}" • Scored ${att.score}%`,
        rawDate: d.getTime(),
        timestamp: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      });
    });

    // Map user signups
    users.forEach((u) => {
      const d = new Date(u.createdAt);
      list.push({
        id: `usr-${u.id}`,
        type: "user",
        title: "New user registered",
        subtitle: `${u.name || u.username || u.email.split("@")[0]} joined the platform`,
        rawDate: d.getTime(),
        timestamp: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      });
    });

    // Map lessons
    lessons.forEach((l) => {
      const d = new Date(l.createdAt);
      list.push({
        id: `les-${l.id}`,
        type: "lesson",
        title: "New lesson created",
        subtitle: `"${l.title}" added to curriculum`,
        rawDate: d.getTime(),
        timestamp: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      });
    });

    // Sort latest first
    list.sort((a, b) => b.rawDate - a.rawDate);
    return list.slice(0, 5);
  }, [attempts, users, lessons]);

  const handleLogout = async () => {
    await logoutAction();
  };

  const handleRoleChanged = (userId: number, newRole: "admin" | "student") => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
  };

  const handleUserUpdated = (updatedUser: any) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? { ...u, ...updatedUser } : u))
    );
  };

  const handleUserCreated = (newUser: any) => {
    setUsers((prev) => [newUser, ...prev]);
  };

  const handleCourseSaved = (course: any) => {
    setCourses((prev) => {
      const idx = prev.findIndex((c) => c.id === course.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = course;
        return next;
      }
      return [course, ...prev];
    });
  };

  const handleCourseDeleted = (courseId: number) => {
    setCourses((prev) => prev.filter((c) => c.id !== courseId));
    setLessons((prev) =>
      prev.map((l) => (l.courseId === courseId ? { ...l, courseId: null } : l))
    );
  };

  const handleLessonSaved = (lesson: any) => {
    setLessons((prev) => {
      const idx = prev.findIndex((l) => l.id === lesson.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = lesson;
        return next;
      }
      return [lesson, ...prev];
    });
  };

  const handleLessonDeleted = (lessonId: number) => {
    setLessons((prev) => prev.filter((l) => l.id !== lessonId));
  };

  const handleVocabSaved = (vocab: any) => {
    setVocabularies((prev) => {
      const idx = prev.findIndex((v) => v.id === vocab.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = vocab;
        return next;
      }
      return [vocab, ...prev];
    });
  };

  const handleVocabDeleted = (vocabId: number) => {
    setVocabularies((prev) => prev.filter((v) => v.id !== vocabId));
  };

  return (
    <div className="min-h-screen bg-[#070914] text-slate-100 font-sans selection:bg-purple-600 selection:text-white flex">
      {/* 1. Left Navigation Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        userName={userName}
        userInitials={userInitials}
        adminEmail={currentAdmin.email}
        onLogout={handleLogout}
        unreadCount={3}
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 relative z-10">
        {/* Top Bar Header */}
        <AdminTopBar
          onToggleSidebar={() => setSidebarOpen(true)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          userName={userName}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          unreadNotificationsCount={3}
        />

        {/* Dynamic Tab Body */}
        <main className="flex-1 p-3 md:p-5 lg:p-6 space-y-4">
          {/* TAB: OVERVIEW (EXACT REPLICA OF APPROVED CONCEPT) */}
          {activeTab === "overview" && (
            <div className="space-y-4">
              {/* 1. Hero Welcome Banner with 3D Robot & Date */}
              <WelcomeBanner adminName={userName} />

              {/* 2. Row of 6 KPI Cards with real PostgreSQL metrics */}
              <KpiCards
                totalUsers={totalUsers}
                totalStudents={totalStudents}
                totalLessons={totalLessons}
                totalAttempts={totalAttempts}
                averageScore={averageScore}
              />

              {/* 3. Middle Row: User Growth + Users by Level + Top Learning Languages */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-6 xl:col-span-5">
                  <UserGrowthChart users={users} attempts={attempts} />
                </div>
                <div className="lg:col-span-6 xl:col-span-3">
                  <ProficiencyDonut
                    beginnerCount={beginnerCount}
                    intermediateCount={intermediateCount}
                    advancedCount={advancedCount}
                    totalUsers={totalUsers}
                  />
                </div>
                <div className="lg:col-span-12 xl:col-span-4">
                  <TopLanguagesCard users={users} />
                </div>
              </div>

              {/* 4. Bottom Row: Recent Users + Recent Activity + (System Status & Quick Actions) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-6 xl:col-span-5">
                  <RecentUsersTable realUsers={users} onViewAll={() => setActiveTab("users")} />
                </div>
                <div className="lg:col-span-6 xl:col-span-4">
                  <RecentActivityFeed activities={recentActivities} onViewAll={() => setActiveTab("ai_conversations")} />
                </div>
                <div className="lg:col-span-12 xl:col-span-3">
                  <SystemStatusCard
                    onAddLesson={() => {
                      setEditingLesson(undefined);
                      setShowLessonModal(true);
                    }}
                    onAddUser={() => setShowCreateUserModal(true)}
                    onViewReports={() => setActiveTab("reports")}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB: USERS */}
          {activeTab === "users" && (
            <UsersView
              users={users}
              onViewUser={(user) => setSelectedUserDetail(user)}
              onEditUser={(user) => setSelectedUserEdit(user)}
              onAddUser={() => setShowCreateUserModal(true)}
              onRoleChanged={handleRoleChanged}
              currentAdminId={currentAdmin.id}
            />
          )}

          {/* TAB: COURSES & LESSONS */}
          {activeTab === "courses" && (
            <CoursesLessonsView
              courses={courses}
              lessons={lessons}
              onAddCourse={() => {
                setEditingCourse(undefined);
                setShowCourseModal(true);
              }}
              onEditCourse={(c) => {
                setEditingCourse(c);
                setShowCourseModal(true);
              }}
              onCourseDeleted={handleCourseDeleted}
              onAddLesson={() => {
                setEditingLesson(undefined);
                setShowLessonModal(true);
              }}
              onEditLesson={(l) => {
                setEditingLesson(l);
                setShowLessonModal(true);
              }}
              onLessonDeleted={handleLessonDeleted}
            />
          )}

          {/* TAB: VOCABULARY */}
          {activeTab === "vocabulary" && (
            <VocabularyView
              vocabularies={vocabularies}
              onAddVocab={() => {
                setEditingVocab(undefined);
                setShowVocabModal(true);
              }}
              onEditVocab={(v) => {
                setEditingVocab(v);
                setShowVocabModal(true);
              }}
              onVocabDeleted={handleVocabDeleted}
            />
          )}

          {/* TAB: AI CONVERSATIONS */}
          {activeTab === "ai_conversations" && (
            <AiConversationsView attempts={attempts} users={users} />
          )}

          {/* TAB: ANALYTICS */}
          {activeTab === "analytics" && <AnalyticsView />}

          {/* TAB: CONTENT MANAGEMENT */}
          {activeTab === "content" && (
            <ContentManagementView
              coursesCount={totalCourses}
              lessonsCount={totalLessons}
              vocabCount={totalVocab}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onAddLesson={() => {
                setEditingLesson(undefined);
                setShowLessonModal(true);
              }}
              onAddCourse={() => {
                setEditingCourse(undefined);
                setShowCourseModal(true);
              }}
              onAddVocab={() => {
                setEditingVocab(undefined);
                setShowVocabModal(true);
              }}
            />
          )}

          {/* TAB: LANGUAGE SETTINGS */}
          {activeTab === "languages" && <LanguageSettingsView />}

          {/* TAB: SYSTEM SETTINGS */}
          {activeTab === "settings" && <SystemSettingsView hasGeminiKey={hasGeminiKey} />}

          {/* TAB: MANAGE ADMINS */}
          {activeTab === "admins" && (
            <ManageAdminsView
              users={users}
              currentAdminId={currentAdmin.id}
              onRoleChanged={handleRoleChanged}
              onAddAdminClick={() => setShowCreateUserModal(true)}
            />
          )}

          {/* TAB: REPORTS */}
          {activeTab === "reports" && (
            <ReportsView
              users={users}
              lessons={lessons}
              vocabularies={vocabularies}
              attempts={attempts}
            />
          )}

          {/* TAB: NOTIFICATIONS */}
          {activeTab === "notifications" && <NotificationsView />}

          {/* TAB: ADMIN PROFILE */}
          {activeTab === "profile" && (
            <AdminProfileView
              userName={userName}
              userInitials={userInitials}
              adminEmail={currentAdmin.email}
              onLogout={handleLogout}
            />
          )}
        </main>
      </div>

      {/* 3. Interactive Modals */}
      <UserDetailModal
        user={selectedUserDetail}
        onClose={() => setSelectedUserDetail(null)}
        onEdit={(user) => {
          setSelectedUserDetail(null);
          setSelectedUserEdit(user);
        }}
      />

      <EditUserModal
        user={selectedUserEdit}
        onClose={() => setSelectedUserEdit(null)}
        onSuccess={handleUserUpdated}
      />

      <CreateUserModal
        isOpen={showCreateUserModal}
        onClose={() => setShowCreateUserModal(false)}
        onSuccess={handleUserCreated}
      />

      <CourseModal
        isOpen={showCourseModal}
        onClose={() => setShowCourseModal(false)}
        initialData={editingCourse}
        onSuccess={handleCourseSaved}
      />

      <LessonModal
        isOpen={showLessonModal}
        onClose={() => setShowLessonModal(false)}
        courses={courses}
        initialData={editingLesson}
        onSuccess={handleLessonSaved}
      />

      <VocabularyModal
        isOpen={showVocabModal}
        onClose={() => setShowVocabModal(false)}
        initialData={editingVocab}
        onSuccess={handleVocabSaved}
      />
    </div>
  );
}
