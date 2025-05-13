import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';

export const getYouTubeEmbedUrl = (url: string) => {
  const videoId = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([\w-]{11})/);
  return videoId ? `https://www.youtube.com/embed/${videoId[1]}` : url;
};

const transformYouTubeLinks = (content: string) => {
  // Match YouTube URLs that are on their own line
  return content.replace(
    /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})$/gm,
    '<div class="aspect-w-16 aspect-h-9"><iframe src="https://www.youtube.com/embed/$4" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>'
  );
};

export const renderContent = (content: string) => {
  // First transform YouTube links
  const transformedContent = transformYouTubeLinks(content);

  // Then split and process TikZ blocks
  const parts = transformedContent.split(/(```tikz[\s\S]*?```)/g);
  return parts.map((part, index) => {
    if (part.startsWith('```tikz')) {
      const tikzCode = part.replace(/```tikz|```/g, '').trim();
      return (
        <div key={index} className="tikz-container">
          <script type="text/tikz" dangerouslySetInnerHTML={{ __html: tikzCode }} />
        </div>
      );
    }
    return (
      <ReactMarkdown
        key={index}
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeRaw]}
      >
        {part}
      </ReactMarkdown>
    );
  });
};