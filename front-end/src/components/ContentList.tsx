import React from 'react';

const ContentList = ({ contents }) => {
  return (
    <div className="p-4">
      {contents.map((content, index) => (
        <div key={content.id} className="mb-6 p-4 border rounded-lg shadow-sm">
          <div className="flex items-center mb-4">
            <img
              src={content.work_platform.logo_url}
              alt={content.work_platform.name}
              className="w-10 h-10 mr-3"
            />
            <h2 className="text-xl font-bold">{content.title}</h2>
          </div>
          <div className="flex mb-4">
            <img
              src={content.thumbnail_url}
              alt={content.title}
              className="w-32 h-32 mr-4"
            />
            <div>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Platform:</strong> {content.work_platform.name}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Published At:</strong> {new Date(content.published_at).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Duration:</strong> {content.duration} seconds
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Visibility:</strong> {content.visibility}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Views:</strong> {content.engagement.view_count}
              </p>
              <a
                href={content.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                Watch Video
              </a>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            <p><strong>Platform Profile:</strong> {content.platform_profile_name}</p>
            <p><strong>External ID:</strong> {content.external_id}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ContentList;
