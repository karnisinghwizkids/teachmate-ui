import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, BookOpen, CheckCircle, XCircle, Send, Download } from 'lucide-react';
import { Lesson, LessonStatus } from '../types';
import { Modal } from './Modal';
import { useFlashbar } from '../App';
import axios from 'axios';

const StatusBadge = ({ status }: { status: LessonStatus }) => {
  const colors = {
    Draft: 'bg-gray-100 text-gray-800',
    Submitted: 'bg-yellow-100 text-yellow-800',
    Pending: 'bg-blue-100 text-blue-800',
    Approved: 'bg-green-100 text-green-800',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
      {status}
    </span>
  );
};

export function LessonList() {
  const navigate = useNavigate();
  const { showFlashbar } = useFlashbar();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; lessonId: string | null }>({
    isOpen: false,
    lessonId: null,
  });
  const isAdmin = true; // In a real app, this would come from auth context

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      const response = await axios.get('/api/lessons');
      setLessons(response.data);
    } catch (error) {
      console.error('Error fetching lessons:', error);
      showFlashbar('Failed to fetch lessons. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (lesson: Lesson) => {
    navigate('/create', { state: { lesson } });
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/lessons/${id}`);
      setLessons(lessons.filter(lesson => lesson.id !== id));
      showFlashbar('Lesson deleted successfully!');
    } catch (error) {
      console.error('Error deleting lesson:', error);
      showFlashbar('Failed to delete lesson. Please try again.');
    }
  };

  const handleSubmit = async (id: string) => {
    if (confirm('Are you sure you want to submit this lesson for approval?')) {
      try {
        const response = await axios.put(`/api/lessons/${id}/status`, {
          status: 'Submitted'
        });
        setLessons(lessons.map(lesson => 
          lesson.id === id ? response.data : lesson
        ));
        showFlashbar('Lesson submitted for approval!');
      } catch (error) {
        console.error('Error submitting lesson:', error);
        showFlashbar('Failed to submit lesson. Please try again.');
      }
    }
  };

  const handleApprove = async (id: string) => {
    if (confirm('Are you sure you want to approve this lesson?')) {
      try {
        const response = await axios.put(`/api/lessons/${id}/status`, {
          status: 'Approved',
          approver: 'Admin User' // In a real app, use actual admin name
        });
        setLessons(lessons.map(lesson => 
          lesson.id === id ? response.data : lesson
        ));
        showFlashbar('Lesson approved successfully!');
      } catch (error) {
        console.error('Error approving lesson:', error);
        showFlashbar('Failed to approve lesson. Please try again.');
      }
    }
  };

  const handleReject = async (id: string) => {
    if (confirm('Are you sure you want to reject this lesson?')) {
      try {
        const response = await axios.put(`/api/lessons/${id}/status`, {
          status: 'Draft'
        });
        setLessons(lessons.map(lesson => 
          lesson.id === id ? response.data : lesson
        ));
        showFlashbar('Lesson rejected.');
      } catch (error) {
        console.error('Error rejecting lesson:', error);
        showFlashbar('Failed to reject lesson. Please try again.');
      }
    }
  };

  const handleExportAll = () => {
    const fileName = `lessons-export-${new Date().toISOString().split('T')[0]}.json`;
    const jsonContent = JSON.stringify(lessons, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-8 flex items-center justify-center">
        <div className="text-gray-500">Loading lessons...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, lessonId: null })}
        onConfirm={() => {
          if (deleteModal.lessonId) {
            handleDelete(deleteModal.lessonId);
          }
        }}
        title="Delete Lesson"
        message="Are you sure you want to delete this lesson? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Lessons</h1>
        <div className="flex gap-3">
          {lessons.length > 0 && (
            <button
              onClick={handleExportAll}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Download size={20} />
              Export All
            </button>
          )}
          <button
            onClick={() => navigate('/create')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus size={20} />
            Create New Lesson
          </button>
        </div>
      </div>

      {lessons.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen size={24} className="text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Lessons Yet</h2>
          <p className="text-gray-600">
            Create your first lesson to get started with your teaching journey.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Name</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Topic</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Level</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Subject</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Created</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Status</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Blocks</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {lessons.map((lesson) => (
                <tr key={lesson.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{lesson.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">{lesson.topic}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">Level {lesson.level}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">{lesson.subject}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">
                      {new Date(lesson.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={lesson.status} />
                    {lesson.approvedBy && (
                      <div className="text-xs text-gray-500 mt-1">
                        by {lesson.approvedBy}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">{lesson.kitems.length} blocks</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {lesson.status === 'Draft' && (
                        <>
                          <button
                            onClick={() => handleEdit(lesson)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                            title="Edit lesson"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={() => handleSubmit(lesson.id)}
                            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-full transition-colors"
                            title="Submit for approval"
                          >
                            <Send size={18} />
                          </button>
                        </>
                      )}
                      {isAdmin && (lesson.status === 'Submitted' || lesson.status === 'Pending') && (
                        <>
                          <button
                            onClick={() => handleApprove(lesson.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                            title="Approve lesson"
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button
                            onClick={() => handleReject(lesson.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                            title="Reject lesson"
                          >
                            <XCircle size={18} />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => setDeleteModal({ isOpen: true, lessonId: lesson.id })}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        title="Delete lesson"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}