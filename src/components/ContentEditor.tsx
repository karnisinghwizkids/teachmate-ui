import React, { useState, useEffect } from 'react';
import { X, HelpCircle } from 'lucide-react';
import {
  kitem,
  AIEvaluationContent,
  Quiz,
  QuizQuestion,
  QuestionType,
} from '../types';
import { renderContent, getYouTubeEmbedUrl } from '../utils/markdown';
import 'katex/dist/katex.min.css';

interface ContentEditorProps {
  initialData: Partial<kitem>;
  onSave: (
    content: string,
    aiEvaluation?: AIEvaluationContent,
    quiz?: Quiz
  ) => void;
  onClose: () => void;
}

const MARKDOWN_EXAMPLE = `## Example Markdown

You can use:
- **Bold text**
- *Italic text*
- ~~Strikethrough~~
- \`inline code\`

### Math Examples
Inline math: $E = mc^2$

Block math:
$$
\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}
$$

### HTML Examples
<div style="background-color: #f0f0f0; padding: 1rem; border-radius: 0.5rem; margin: 1rem 0;">
  <h4 style="color: #2563eb;">Custom HTML Content</h4>
  <p>You can use <strong>HTML</strong> directly in your content!</p>
  <ul style="list-style-type: square;">
    <li>Custom styling</li>
    <li>Complex layouts</li>
    <li>Interactive elements</li>
  </ul>
</div>

### TikZ Diagrams
Create diagrams using TikZ:

\`\`\`tikz
\\begin{tikzpicture}
  \\draw (0,0) circle (1cm);
  \\draw (0,0) -- (1,0);
  \\draw (0,0) -- (0,1);
\\end{tikzpicture}
\`\`\`

More complex example:

\`\`\`tikz
\\begin{tikzpicture}
  \\draw[thick,rounded corners=8pt] (0,0) -- (2,0) -- (2,1) -- (1,1) -- (1,2) -- (0,2) -- cycle;
  \\draw[fill=red] (0.5,0.5) circle (0.2);
  \\draw[fill=blue] (1.5,1.5) circle (0.2);
  \\draw[->] (0.5,0.5) -- (1.5,1.5);
\\end{tikzpicture}
\`\`\`

### Images
![Beautiful landscape](https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&h=800&q=80)

### Videos
To embed a YouTube video, paste the video URL:
https://www.youtube.com/watch?v=dQw4w9WgXcQ

### Tables
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |

### Code Blocks
\`\`\`python
def hello_world():
    print("Hello, World!")
\`\`\`
`;

const QUIZ_SCHEMA_EXAMPLE = `# Quiz Example

[passing_score]
70

[single]
What is the **capital** of France?

Here's a hint:
- It's known as the *City of Light*
- It has the famous **Eiffel Tower**
- Population: ~2.2 million

![Paris Skyline](https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80)

- (x) Paris
- ( ) London
- ( ) Berlin
- ( ) Madrid

E:= Paris has been the capital of France since 987 CE. It's not only the political capital but also the economic and cultural heart of France.

[multiple]
Which of these are **primary colors**?

$\\text{Remember the color wheel:}$

\`\`\`tikz
\\begin{tikzpicture}
  \\draw[fill=red] (0,0) circle (0.5);
  \\draw[fill=blue] (1.5,0) circle (0.5);
  \\draw[fill=yellow] (0.75,1.3) circle (0.5);
\\end{tikzpicture}
\`\`\`

- [x] Red
- [ ] Green
- [x] Blue
- [x] Yellow
- [ ] Purple
- [ ] Orange

E:= Primary colors are the basic colors that can be mixed to create all other colors. In traditional color theory, they are Red, Blue, and Yellow.

[text]
What is the main function of photosynthesis?

Key points to consider:
1. Energy transformation
2. Raw materials: $\\text{CO}_2$ and $\\text{H}_2\\text{O}$
3. Products: $\\text{C}_6\\text{H}_{12}\\text{O}_6$ and $\\text{O}_2$

R:= To convert light energy into chemical energy in the form of glucose

E:= Photosynthesis is the process by which plants convert light energy into chemical energy. This process produces glucose for the plant's energy needs and releases oxygen as a byproduct, which is essential for most life on Earth.`;

function MarkdownHelpModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Markdown Help</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-4">Markdown Format</h3>
              <pre className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap font-mono text-sm">
                {MARKDOWN_EXAMPLE}
              </pre>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Preview</h3>
              <div className="prose">{renderContent(MARKDOWN_EXAMPLE)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuizHelpModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Quiz Schema Help</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-4">Schema Format</h3>
              <pre className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap font-mono text-sm">
                {QUIZ_SCHEMA_EXAMPLE}
              </pre>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Preview</h3>
              {renderQuizPreview(parseQuiz(QUIZ_SCHEMA_EXAMPLE))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const parseQuiz = (content: string): Quiz => {
  const questions: QuizQuestion[] = [];
  const lines = content.split('\n');
  let currentQuestion: Partial<QuizQuestion> | null = null;
  let currentOptions: string[] = [];
  let correctAnswers: string[] = [];
  let passingScore: number | undefined;
  let questionContent: string[] = [];
  let explanation: string | undefined;

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
          explanation,
        } as QuizQuestion);
      }

      currentOptions = [];
      correctAnswers = [];
      questionContent = [];
      explanation = undefined;
      currentQuestion = null;

      const type = line.slice(1, -1) as QuestionType;
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
      } else if (
        line.startsWith('- [') &&
        currentQuestion.type === 'multiple'
      ) {
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
      } else if (line.startsWith('E:=')) {
        explanation = line.slice(4).trim();
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
      explanation,
    } as QuizQuestion);
  }

  return { questions, passingScore };
};

const renderQuizPreview = (quiz: Quiz) => {
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
      {quiz.questions.map((question, index) => (
        <div key={index} className="border rounded-lg p-4 bg-white">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              Question {index + 1}
            </span>
            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
              {question.type === 'single'
                ? 'Single Choice'
                : question.type === 'multiple'
                ? 'Multiple Choice'
                : 'Text Answer'}
            </span>
          </div>
          <div className="prose mb-4">{renderContent(question.question)}</div>
          {question.type !== 'text' ? (
            <div className="space-y-2">
              {question.options?.map((option, optionIndex) => (
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
                <span className="font-medium text-gray-700">
                  Expected Answer:{' '}
                </span>
                <span className="text-green-600">
                  {question.correctAnswers?.[0]}
                </span>
              </div>
            </div>
          )}
          {question.explanation && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-900 mb-1">Explanation:</p>
              <div className="prose prose-sm text-blue-800">
                {renderContent(question.explanation)}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export function ContentEditor({
  initialData,
  onSave,
  onClose,
}: ContentEditorProps) {
  const [content, setContent] = useState(initialData.content || '');
  const [showHelp, setShowHelp] = useState(false);
  const [aiEvaluation, setAiEvaluation] = useState<AIEvaluationContent>(
    initialData.aiEvaluation || { prompt: '', instructions: '' }
  );

  useEffect(() => {
    if (
      (initialData.blockType === 'Learning' &&
        initialData.contentType === 'Text') ||
      initialData.blockType === 'Mastery'
    ) {
      const elements = document.querySelectorAll('script[type="text/tikz"]');
      elements.forEach((element) => {
        if (window.tikzjax) {
          window.tikzjax.parse(element);
        }
      });
    }
  }, [content, initialData.contentType, initialData.blockType]);

  const isAIEvaluation =
    initialData.blockType === 'Evaluation' &&
    initialData.evaluationType === 'AI Evaluation';
  const isQuiz =
    initialData.blockType === 'Evaluation' &&
    initialData.evaluationType === 'Quiz';
  const isMarkdownEditor =
    (initialData.blockType === 'Learning' &&
      initialData.contentType === 'Text') ||
    initialData.blockType === 'Mastery';

  const handleSave = () => {
    if (isAIEvaluation) {
      onSave(content, aiEvaluation);
    } else if (isQuiz) {
      const quiz = parseQuiz(content);
      onSave(content, undefined, quiz);
    } else {
      onSave(content);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-auto py-8">
        <div className="bg-white rounded-lg w-full max-w-6xl mx-4">
          <div className="flex justify-between items-center p-6 border-b">
            <div>
              <h2 className="text-2xl font-bold">Edit Content</h2>
              <p className="text-sm text-gray-500 mt-1">
                {isAIEvaluation
                  ? 'Configure AI Evaluation settings'
                  : isQuiz
                  ? 'Create quiz using the quiz schema format'
                  : isMarkdownEditor
                  ? 'Supports Markdown, HTML, LaTeX equations, and TikZ diagrams'
                  : initialData.contentType === 'Video'
                  ? 'Enter a YouTube video URL'
                  : `Enter a URL for ${initialData.contentType?.toLowerCase()} content`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {(isQuiz || isMarkdownEditor) && (
                <button
                  onClick={() => setShowHelp(true)}
                  className="flex items-center gap-1 text-gray-600 hover:text-gray-800"
                >
                  <HelpCircle size={16} />
                  <span className="text-sm">
                    {isQuiz ? 'Quiz Schema Help' : 'Markdown Help'}
                  </span>
                </button>
              )}
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 p-6">
            <div className="space-y-4">
              <h3 className="font-semibold">Edit</h3>
              {isAIEvaluation ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prompt
                    </label>
                    <textarea
                      className="w-full h-[200px] p-4 border rounded-lg font-mono text-sm"
                      value={aiEvaluation.prompt}
                      onChange={(e) =>
                        setAiEvaluation((prev) => ({
                          ...prev,
                          prompt: e.target.value,
                        }))
                      }
                      placeholder="Enter the prompt for AI evaluation..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Evaluation Instructions
                    </label>
                    <textarea
                      className="w-full h-[200px] p-4 border rounded-lg font-mono text-sm"
                      value={aiEvaluation.instructions}
                      onChange={(e) =>
                        setAiEvaluation((prev) => ({
                          ...prev,
                          instructions: e.target.value,
                        }))
                      }
                      placeholder="Enter instructions for how the AI should evaluate responses..."
                    />
                  </div>
                </div>
              ) : (
                <textarea
                  className="w-full h-[calc(100vh-300px)] p-4 border rounded-lg font-mono text-sm"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={
                    isQuiz
                      ? 'Enter quiz questions using the schema format...'
                      : isMarkdownEditor
                      ? 'Enter your content here...'
                      : initialData.contentType === 'Video'
                      ? 'Enter YouTube video URL...'
                      : `Enter ${initialData.contentType?.toLowerCase()} URL...`
                  }
                />
              )}
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Preview</h3>
              {isAIEvaluation ? (
                <div className="w-full h-[calc(100vh-300px)] p-4 border rounded-lg bg-gray-50 overflow-auto space-y-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Prompt</h4>
                    <div className="prose">
                      {renderContent(aiEvaluation.prompt || '_No prompt yet_')}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Instructions
                    </h4>
                    <div className="prose">
                      {renderContent(
                        aiEvaluation.instructions || '_No instructions yet_'
                      )}
                    </div>
                  </div>
                </div>
              ) : isQuiz ? (
                <div className="w-full h-[calc(100vh-300px)] p-4 border rounded-lg bg-gray-50 overflow-auto">
                  {content ? (
                    renderQuizPreview(parseQuiz(content))
                  ) : (
                    <p className="text-gray-500 italic">
                      Enter quiz questions to see preview
                    </p>
                  )}
                </div>
              ) : isMarkdownEditor ? (
                <div className="w-full h-[calc(100vh-300px)] p-4 border rounded-lg bg-gray-50 overflow-auto prose">
                  {renderContent(content || '_No content yet_')}
                </div>
              ) : (
                <div className="w-full h-[calc(100vh-300px)] p-4 border rounded-lg bg-gray-50 flex items-center justify-center">
                  {initialData.contentType === 'Image' && content && (
                    <img
                      src={content}
                      alt="Preview"
                      className="max-w-full h-auto"
                    />
                  )}
                  {initialData.contentType === 'Video' && content && (
                    <iframe
                      src={getYouTubeEmbedUrl(content)}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full rounded-lg"
                    ></iframe>
                  )}
                  {initialData.contentType === 'Audio' && content && (
                    <audio src={content} controls className="w-full" />
                  )}
                  {!content && (
                    <p className="text-gray-500 italic">
                      Enter a URL to preview{' '}
                      {initialData.contentType?.toLowerCase()} content
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {showHelp &&
        (isQuiz ? (
          <QuizHelpModal onClose={() => setShowHelp(false)} />
        ) : (
          <MarkdownHelpModal onClose={() => setShowHelp(false)} />
        ))}
    </>
  );
}