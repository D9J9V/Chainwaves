import { InstagramIcon, TwitchIcon, YoutubeIcon, TiktokIcon, UsersIcon, ThumbsUpIcon, MessageCircleIcon } from 'lucide-react';
import React from 'react';

function Account({ accountObj, attributes }) {
  return (
    <div>
    <header className="bg-cyan-300 p-6 border-b-2 border-black flex items-center">
        <img
          src={accountObj["profile_pic_url"]}
          alt="Jane Creator"
          className="w-16 h-16 rounded-full border-2 border-black mr-4"
        />
        <div>
          <h1 className="text-4xl font-bold">{accountObj["platform_profile_name"]}</h1>
        </div>
      </header>

      <div className="p-6 space-y-8">
        <section className="border-2 border-black p-6 rounded-md shadow-[8px_8px_0px_rgba(0,0,0,1)] bg-lime-200">
            <h2 className="text-2xl font-bold mb-4">My Platforms</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <a className="flex items-center space-x-2 p-3 border-2 border-black rounded-md bg-yellow-300 hover:bg-yellow-400">
                <span>{accountObj["platform_profile_name"]}</span>
                </a>
            </div>
            </section>

            <section className="border-2 border-black p-6 rounded-md shadow-[8px_8px_0px_rgba(0,0,0,1)] bg-orange-200">
          <h2 className="text-2xl font-bold mb-4">Engagement Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2 p-4 border-2 border-black rounded-md bg-cyan-300">
              <UsersIcon size={24} />
              <div>
                <p className="text-xl font-bold">2</p>
                <p>Followers</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 p-4 border-2 border-black rounded-md bg-yellow-300">
              <ThumbsUpIcon size={24} />
              <div>
                <p className="text-xl font-bold">0</p>
                <p>Likes</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 p-4 border-2 border-black rounded-md bg-pink-300">
              <MessageCircleIcon size={24} />
              <div>
                <p className="text-xl font-bold">0</p>
                <p>Comments</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Account;