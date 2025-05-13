import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { 
  Plus, 
  Save,
  Type,
  Music,
  Image as ImageIcon,
  Video,
  BookOpen,
  Pencil,
  Target,
  Gamepad,
  ArrowLeft,
  GraduationCap,
  Award,
  ClipboardCheck,
  BrainCircuit,
  ListChecks
} from 'lucide-react';
import { ContentEditor } from './ContentEditor';
import { DraggableBlock } from './DraggableBlock';
import { ContentType, ContentStyle, Subject, kitem, BlockType, EvaluationType, AIEvaluationContent, AITutorConfig } from '../types';
import { topics } from '../mocks/mockData';
import { useFlashbar } from '../App';
import axios from 'axios';

const LEVELS = Array.from({ length: 16 }, (_, i) => (i + 1).toString());
const SUBJECTS: Subject[] = [
  'Science',
  'Technology',
  'Entrepreneurship',
  'Arts',
  'Mathematics',
  'Self Development'
];

const BLOCK_TYPES: { type: BlockType; icon: React.ReactNode }[] = [
  { type: 'Learning', icon: <GraduationCap size={24} /> },
  { type: 'Mastery', icon: <Award size={24} /> },
  { type: 'Evaluation', icon: <ClipboardCheck size={24} /> },
];

const EVALUATION_TYPES: { type: EvaluationType; icon: React.ReactNode }[] = [
  { type: 'Quiz', icon: <ListChecks size={24} /> },
  { type: 'AI Evaluation', icon: <BrainCircuit size={24} /> },
];

const CONTENT_TYPES: { type: ContentType; icon: React.ReactNode }[] = [
  { type: 'Text', icon: <Type size={24} /> },
  { type: 'Audio', icon: <Music size={24} /> },
  { type: 'Image', icon: <ImageIcon size={24} /> },
  { type: 'Video', icon: <Video size={24} /> },
];

const CONTENT_STYLES: { type: ContentStyle; icon: React.ReactNode }[] = [
  { type: 'Narrative', icon: <BookOpen size={24} /> },
  { type: 'Descriptive', icon: <Pencil size={24} /> },
  { type: 'Expository', icon: <Type size={24} /> },
  { type: 'Persuasive', icon: <Target size={24} /> },
  { type: 'Gamified', icon: <Gamepad size={24} /> },
];

const initialFormData = {
  name: '',
  level: LEVELS[0],
  subject: SUBJECTS[0],
  topic: '',
  blockType: 'Learning' as BlockType,
  contentType: '' as ContentType | '',
  contentStyle: '' as ContentStyle | '',
  evaluationType: '' as EvaluationType | '',
  aiTutor: {
    enabled: false,
    instructions: '',
  } as AITutorConfig,
};

function TypeCard({ 
  icon, 
  title, 
  selected, 
  onClick,
  compact = false
}: { 
  icon: React.ReactNode; 
  title: string; 
  selected: boolean; 
  onClick: () => void;
  compact?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full p-4 rounded-lg border-2 transition-all ${
        selected 
          ? 'border-blue-500 bg-blue-50 shadow-md' 
          : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50'
      }`}
    >
      <div className="flex flex-col items-center gap-2">
        <div className={`${selected ? 'text-blue-500' : 'text-gray-500'}`}>
          {icon}
        </div>
        <span className={`text-sm font-medium ${selected ? 'text-blue-700' : 'text-gray-700'}`}>
          {title}
        </span>
      </div>
    </button>
  );
}

export function CreateLesson() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showFlashbar } = useFlashbar();
  const editingLesson = location.state?.lesson;
  
  const [kitems, setKitems] = useState<kitem[]>(editingLesson?.kitems || []);
  const [showEditor, setShowEditor] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState(editingLesson ? {
    name: editingLesson.name,
    level: editingLesson.level,
    subject: editingLesson.subject,
    topic: editingLesson.topic,
    blockType: 'Learning' as BlockType,
    contentType: '',
    contentStyle: '',
    evaluationType: '',
    aiTutor: {
      enabled: false,
      instructions: '',
    } as AITutorConfig,
  } : initialFormData);

  const [availableTopics, setAvailableTopics] = useState(topics.filter(
    topic => topic.level === formData.level && topic.subject === formData.subject
  ));

  useEffect(() => {
    const filtered = topics.filter(
      topic => topic.level === formData.level && topic.subject === formData.subject
    );
    setAvailableTopics(filtered);
    
    if (!filtered.find(topic => topic.name === formData.topic)) {
      setFormData(prev => ({ ...prev, topic: '' }));
    }
  }, [formData.level, formData.subject]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      const oldIndex = kitems.findIndex((kitem) => kitem.id === active.id);
      const newIndex = kitems.findIndex((kitem) => kitem.id === over.id);
      
      setKitems(arrayMove(kitems, oldIndex, newIndex));
    }
  };

  const handleCreate = () => {
    setShowEditor(true);
  };

  const handleSave = (content: string, aiEvaluation?: AIEvaluationContent) => {
    const newBlock: kitem = {
      id: Date.now().toString(),
      ...formData,
      blockType: formData.blockType as BlockType,
      contentType: formData.blockType === 'Learning' ? formData.contentType as ContentType : undefined,
      contentStyle: formData.blockType === 'Learning' ? formData.contentStyle as ContentStyle : undefined,
      content,
      evaluationType: formData.blockType === 'Evaluation' ? formData.evaluationType as EvaluationType : undefined,
      aiEvaluation,
      aiTutor: formData.blockType === 'Learning' ? formData.aiTutor : undefined,
    };
    setKitems([...kitems, newBlock]);
    setShowEditor(false);
    setFormData(prev => ({
      ...prev,
      contentType: '',
      contentStyle: '',
      evaluationType: '',
      aiTutor: {
        enabled: false,
        instructions: '',
      },
    }));
  };

  const handleFinalize = async () => {
    try {
      setIsSaving(true);
      const lessonData = {
        name: formData.name,
        level: formData.level,
        subject: formData.subject,
        topic: formData.topic,
        kitems: kitems,
        status: 'Draft' as const,
      };

      if (editingLesson) {
        await axios.put(`/api/lessons/${editingLesson.id}`, {
          ...lessonData,
          id: editingLesson.id,
          createdAt: editingLesson.createdAt,
          status: editingLesson.status,
        });
        showFlashbar('Lesson updated successfully!');
      } else {
        await axios.post('/api/lessons', {
          ...lessonData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        });
        showFlashbar('Lesson created successfully!');
      }
      
      navigate('/');
    } catch (error) {
      console.error('Error saving lesson:', error);
      showFlashbar('Failed to save lesson. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const isGenerateEnabled = formData.blockType === 'Mastery' 
    ? formData.topic && formData.name
    : formData.blockType === 'Evaluation'
    ? formData.evaluationType !== '' && formData.topic && formData.name
    : formData.blockType !== '' && formData.contentType !== '' && formData.contentStyle !== '' && formData.topic && formData.name;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            {editingLesson ? 'Edit Lesson' : 'Create Lesson'}
          </h1>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Lesson Name</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-lg"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter lesson name..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                <select
                  className="w-full p-2 border rounded-lg"
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                >
                  {LEVELS.map((level) => (
                    <option key={level} value={level}>
                      Level {level}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <select
                  className="w-full p-2 border rounded-lg"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value as Subject })}
                >
                  {SUBJECTS.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
                <select
                  className="w-full p-2 border rounded-lg"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                >
                  <option value="">Select a topic...</option>
                  {availableTopics.map((topic) => (
                    <option key={topic.id} value={topic.name}>
                      {topic.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Block Type</h2>
            <div className="grid grid-cols-3 gap-3">
              {BLOCK_TYPES.map(({ type, icon }) => (
                <TypeCard
                  key={type}
                  icon={icon}
                  title={type}
                  selected={formData.blockType === type}
                  onClick={() => setFormData({ ...formData, blockType: type, contentType: '', contentStyle: '', evaluationType: '' })}
                  compact
                />
              ))}
            </div>
          </div>

          {formData.blockType === 'Learning' && (
            <>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">AI Tutor</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Enable AI Tutor</label>
                    <button
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        aiTutor: {
                          ...prev.aiTutor,
                          enabled: !prev.aiTutor.enabled
                        }
                      }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        formData.aiTutor.enabled ? 'bg-blue-500' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          formData.aiTutor.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  {formData.aiTutor.enabled && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        AI Instructions
                      </label>
                      <textarea
                        className="w-full h-32 p-2 border rounded-lg"
                        value={formData.aiTutor.instructions}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          aiTutor: {
                            ...prev.aiTutor,
                            instructions: e.target.value
                          }
                        }))}
                        placeholder="Enter instructions for the AI tutor..."
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Content Configuration</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Content Type</label>
                    <div className="grid grid-cols-4 gap-3">
                      {CONTENT_TYPES.map(({ type, icon }) => (
                        <TypeCard
                          key={type}
                          icon={icon}
                          title={type}
                          selected={formData.contentType === type}
                          onClick={() => setFormData({ ...formData, contentType: type })}
                          compact
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Content Style</label>
                    <div className="grid grid-cols-5 gap-3">
                      {CONTENT_STYLES.map(({ type, icon }) => (
                        <TypeCard
                          key={type}
                          icon={icon}
                          title={type}
                          selected={formData.contentStyle === type}
                          onClick={() => setFormData({ ...formData, contentStyle: type })}
                          compact
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {formData.blockType === 'Evaluation' && (
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Evaluation Type</h2>
              <div className="grid grid-cols-2 gap-3">
                {EVALUATION_TYPES.map(({ type, icon }) => (
                  <TypeCard
                    key={type}
                    icon={icon}
                    title={type}
                    selected={formData.evaluationType === type}
                    onClick={() => setFormData({ ...formData, evaluationType: type })}
                    compact
                  />
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-center">
            <button
              onClick={handleCreate}
              disabled={!isGenerateEnabled}
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-colors ${
                isGenerateEnabled
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Plus size={20} />
              Generate Block
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Lesson Blocks</h2>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={kitems.map((kitem) => kitem.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {kitems.map((kitem) => (
                  <DraggableBlock 
                    key={kitem.id} 
                    block={kitem} 
                    onDelete={(id) => setKitems(kitems.filter(k => k.id !== id))}
                    onUpdate={(id, updates) => setKitems(kitems.map(k => 
                      k.id === id ? { ...k, ...updates } : k
                    ))}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {kitems.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No lesson blocks yet. Generate one to get started!
            </div>
          ) : (
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleFinalize}
                disabled={isSaving || !formData.topic || !formData.name}
                className={`flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg transition-colors ${
                  isSaving || !formData.topic || !formData.name ? 'opacity-75 cursor-not-allowed' : 'hover:bg-green-600'
                }`}
              >
                <Save size={20} className={isSaving ? 'animate-spin' : ''} />
                {isSaving ? 'Saving...' : (editingLesson ? 'Update Lesson' : 'Save Lesson')}
              </button>
            </div>
          )}
        </div>
      </div>

      {showEditor && (
        <ContentEditor
          initialData={formData}
          onSave={handleSave}
          onClose={() => setShowEditor(false)}
        />
      )}
    </div>
  );
}