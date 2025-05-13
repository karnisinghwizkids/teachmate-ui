import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Eye, Edit } from 'lucide-react';
import { kitem } from '../types';
import { renderContent, getYouTubeEmbedUrl } from '../utils/markdown';
import { ContentEditor } from './ContentEditor';
import 'katex/dist/katex.min.css';

interface DraggableBlockProps {
  block: kitem;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<kitem>) => void;
}

const renderQuizPreview = (quiz: any) => {
  return (
    <div className="space-y-8">
      {quiz.passingScore !== undefined && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            <span className="font-medium">Passing Score Required: </span>
            {quiz.passingScore}%
          </p>
        </div>
      )}
      {quiz.questions.map((question: any, index: number) => (
        <div key={index} className="border rounded-lg p-4 bg-white">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              Question {index + 1}
            </span>
            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
              {question.type === 'single' ? 'Single Choice' : 
               question.type === 'multiple' ? 'Multiple Choice' : 
               'Text Answer'}
            </span>
          </div>
          <div className="prose mb-4">
            {renderContent(question.question)}
          </div>
          {question.type !== 'text' ? (
            <div className="space-y-2">
              {question.options?.map((option: string, optionIndex: number) => (
                <div key={optionIndex} className="flex items-center gap-2">
                  <input
                    type={question.type === 'single' ? 'radio' : 'checkbox'}
                    disabled
                    checked={question.correctAnswers?.includes(option)}
                    className="text-blue-500"
                  />
                  <label>{option}</label>
                  {question.correctAnswers?.includes(option) && (
                    <span className="text-green-600 text-sm">(Correct)</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <input
                type="text"
                disabled
                placeholder="Student's answer will appear here"
                className="w-full p-2 border rounded-lg bg-gray-50"
              />
              <div className="text-sm">
                <span className="font-medium text-gray-700">Expected Answer: </span>
                <span className="text-green-600">{question.correctAnswers?.[0]}</span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const renderAIEvaluationPreview = (aiEvaluation: any) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Prompt</h3>
        <div className="prose bg-gray-50 p-4 rounded-lg">
          {renderContent(aiEvaluation.prompt)}
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Evaluation Instructions</h3>
        <div className="prose bg-gray-50 p-4 rounded-lg">
          {renderContent(aiEvaluation.instructions)}
        </div>
      </div>
    </div>
  );
};

export function DraggableBlock({ block, onDelete, onUpdate }: DraggableBlockProps) {
  const [showPreview, setShowPreview] = React.useState(false);
  const [showEditor, setShowEditor] = React.useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  React.useEffect(() => {
    if (showPreview) {
      const elements = document.querySelectorAll('script[type="text/tikz"]');
      elements.forEach((element) => {
        if (window.tikzjax) {
          window.tikzjax.parse(element);
        }
      });
    }
  }, [showPreview, block.content]);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this block?')) {
      onDelete(block.id);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowEditor(true);
  };

  const handleSave = (content: string) => {
    onUpdate(block.id, { content });
    setShowEditor(false);
  };

  const parseQuiz = (content: string) => {
    const questions = [];
    const lines = content.split('\n');
    let currentQuestion = null;
    let currentOptions = [];
    let correctAnswers = [];
    let passingScore;
    let questionContent = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.startsWith('[passing_score]')) {
        const scoreValue = lines[i + 1]?.trim();
        if (scoreValue) {
          const score = parseInt(scoreValue, 10);
          if (!isNaN(score) && score >= 0 && score <= 100) {
            passingScore = score;
          }
        }
        i++;
        continue;
      }

      if (line.startsWith('[')) {
        if (currentQuestion) {
          questions.push({
            ...currentQuestion,
            question: questionContent.join('\n'),
            options: currentOptions,
            correctAnswers,
          });
        }

        currentOptions = [];
        correctAnswers = [];
        questionContent = [];
        currentQuestion = null;

        const type = line.slice(1, -1);
        if (['single', 'multiple', 'text'].includes(type)) {
          currentQuestion = { type };
        }
      } else if (currentQuestion) {
        if (line.startsWith('- (') && currentQuestion.type === 'single') {
          const isCorrect = line.includes('(x)');
          const optionStart = line.indexOf(')') + 1;
          const cleanOption = line.slice(optionStart).trim();
          if (cleanOption) {
            currentOptions.push(cleanOption);
            if (isCorrect) {
              correctAnswers.push(cleanOption);
            }
          }
        } else if (line.startsWith('- [') && currentQuestion.type === 'multiple') {
          const isCorrect = line.includes('[x]');
          const optionStart = line.indexOf(']') + 1;
          const cleanOption = line.slice(optionStart).trim();
          if (cleanOption) {
            currentOptions.push(cleanOption);
            if (isCorrect) {
              correctAnswers.push(cleanOption);
            }
          }
        } else if (line.startsWith('R:=') && currentQuestion.type === 'text') {
          correctAnswers = [line.slice(4).trim()];
        } else {
          questionContent.push(line);
        }
      }
    }

    if (currentQuestion) {
      questions.push({
        ...currentQuestion,
        question: questionContent.join('\n'),
        options: currentOptions,
        correctAnswers,
      });
    }

    return { questions, passingScore };
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className="bg-white rounded-lg shadow-sm border border-gray-200"
      >
        <div className="p-4 flex items-center gap-4 group">
          <div {...attributes} {...listeners} className="cursor-move">
            <GripVertical className="text-gray-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-gray-600">Level {block.level}</span>
              <span className="text-gray-400">•</span>
              <span className="text-sm font-medium text-gray-600">{block.subject}</span>
              <span className="text-gray-400">•</span>
              <span className="text-sm text-gray-600">{block.topic}</span>
            </div>
            <div className="flex gap-2">
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                {block.blockType}
              </span>
              {block.evaluationType && (
                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                  {block.evaluationType}
                </span>
              )}
              {block.blockType === 'Learning' && (
                <>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {block.contentType}
                  </span>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                    {block.contentStyle}
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Preview"
            >
              <Eye className="w-5 h-5 text-gray-500" />
            </button>
            <button
              onClick={handleEdit}
              className="p-2 hover:bg-blue-50 rounded-full transition-colors"
              title="Edit"
            >
              <Edit className="w-5 h-5 text-blue-500" />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 hover:bg-red-50 rounded-full transition-colors"
              title="Delete"
            >
              <Trash2 className="w-5 h-5 text-red-500" />
            </button>
          </div>
        </div>

        {showPreview && (
          <div className="border-t p-4">
            {block.blockType === 'Learning' ? (
              block.contentType === 'Text' ? (
                <div className="prose">
                  {renderContent(block.content)}
                </div>
              ) : block.contentType === 'Image' ? (
                <img src={block.content} alt="Content" className="max-w-full h-auto" />
              ) : block.contentType === 'Video' ? (
                <div className="aspect-w-16 aspect-h-9">
                  <iframe
                    src={getYouTubeEmbedUrl(block.content)}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-[400px] rounded-lg"
                  ></iframe>
                </div>
              ) : (
                <audio src={block.content} controls className="w-full" />
              )
            ) : block.blockType === 'Evaluation' && block.evaluationType === 'Quiz' ? (
              renderQuizPreview(parseQuiz(block.content))
            ) : block.blockType === 'Evaluation' && block.evaluationType === 'AI Evaluation' ? (
              renderAIEvaluationPreview(block.aiEvaluation)
            ) : (
              <div className="prose">
                {renderContent(block.content)}
              </div>
            )}
          </div>
        )}
      </div>

      {showEditor && (
        <ContentEditor
          initialData={block}
          onSave={handleSave}
          onClose={() => setShowEditor(false)}
        />
      )}
    </>
  );
}