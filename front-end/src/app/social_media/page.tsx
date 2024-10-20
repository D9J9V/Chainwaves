import {
  EyeIcon,
  ThumbsUpIcon,
  MessageCircleIcon,
  InstagramIcon,
  YoutubeIcon,
  TwitchIcon,
  UsersIcon,
} from "lucide-react";
import React from "react";
import { render } from "react-dom";
const ContentCreatorPortfolio = () => {
  return (
    <div className="w-full max-w-full bg-white text-black">
      <header className="bg-cyan-300 p-6 border-b-2 border-black flex items-center">
        <img
          src="/profile-photo.jpg"
          alt="Jane Creator"
          className="w-16 h-16 rounded-full border-2 border-black mr-4"
        />
        <div>
          <h1 className="text-4xl font-bold">Jane Creator</h1>
          <p className="text-xl mt-2">Digital Content Maven</p>
        </div>
      </header>

      <main className="p-6 space-y-8">
        <section className="border-2 border-black p-6 rounded-md shadow-[8px_8px_0px_rgba(0,0,0,1)] bg-yellow-200">
          <h2 className="text-2xl font-bold mb-4">About Me</h2>
          <p>
            Hey there! I'm Jane, a passionate content creator specializing in
            lifestyle, tech, and travel content. With over 5 years of experience
            across multiple platforms, I love engaging with my audience and
            sharing exciting stories!
          </p>
        </section>

        <section className="border-2 border-black p-6 rounded-md shadow-[8px_8px_0px_rgba(0,0,0,1)] bg-lime-200">
          <h2 className="text-2xl font-bold mb-4">My Platforms</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a className="flex items-center space-x-2 p-3 border-2 border-black rounded-md bg-yellow-300 hover:bg-yellow-400">
              <InstagramIcon size={24} />
              <span>@jane_creates</span>
            </a>
            <a className="flex items-center space-x-2 p-3 border-2 border-black rounded-md bg-pink-300 hover:bg-pink-400">
              <YoutubeIcon size={24} />
              <span>Jane Creates</span>
            </a>
            <a className="flex items-center space-x-2 p-3 border-2 border-black rounded-md bg-lime-300 hover:bg-lime-400">
              <TwitchIcon size={24} />
              <span>jane_live</span>
            </a>
            <a className="flex items-center space-x-2 p-3 border-2 border-black rounded-md bg-orange-300 hover:bg-orange-400">
              <div size={24} />
              <span>@janecreates</span>
            </a>
          </div>
        </section>

        <section className="border-2 border-black p-6 rounded-md shadow-[8px_8px_0px_rgba(0,0,0,1)] bg-orange-200">
          <h2 className="text-2xl font-bold mb-4">Engagement Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2 p-4 border-2 border-black rounded-md bg-cyan-300">
              <UsersIcon size={24} />
              <div>
                <p className="text-xl font-bold">1.2M</p>
                <p>Followers</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 p-4 border-2 border-black rounded-md bg-yellow-300">
              <ThumbsUpIcon size={24} />
              <div>
                <p className="text-xl font-bold">5.7M</p>
                <p>Likes</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 p-4 border-2 border-black rounded-md bg-pink-300">
              <MessageCircleIcon size={24} />
              <div>
                <p className="text-xl font-bold">980K</p>
                <p>Comments</p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-2 border-black p-6 rounded-md shadow-[8px_8px_0px_rgba(0,0,0,1)] bg-pink-200">
          <h2 className="text-2xl font-bold mb-4">Featured Content</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="w-full border-black border-2 rounded-md shadow-[8px_8px_0px_rgba(0,0,0,1)] bg-white">
              <figure className="w-full h-48 border-black border-b-2">
                <img
                  src="https://images.unsplash.com/photo-1492724441997-5dc865305da7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
                  alt="Travel vlog thumbnail"
                  className="w-full h-full object-cover"
                />
              </figure>
              <div className="px-4 py-3 text-left">
                <h3 className="text-lg font-bold mb-2">Epic Travel Vlog</h3>
                <p className="text-sm mb-2 line-clamp-2">
                  Join me on my adventure through the mountains of Peru!
                </p>
                <a className="text-sm font-bold">Watch Now</a>
                <div className="flex justify-between mt-2">
                  <span className="flex items-center">
                    <EyeIcon size={16} className="mr-1" /> 10.5K
                  </span>
                  <span className="flex items-center">
                    <ThumbsUpIcon size={16} className="mr-1" /> 2.3K
                  </span>
                  <span className="flex items-center">
                    <MessageCircleIcon size={16} className="mr-1" /> 456
                  </span>
                </div>
              </div>
            </div>
            <div className="w-full border-black border-2 rounded-md shadow-[8px_8px_0px_rgba(0,0,0,1)] bg-white">
              <figure className="w-full h-48 border-black border-b-2">
                <img
                  src="https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
                  alt="Tech review thumbnail"
                  className="w-full h-full object-cover"
                />
              </figure>
              <div className="px-4 py-3 text-left">
                <h3 className="text-lg font-bold mb-2">Latest Tech Review</h3>
                <p className="text-sm mb-2 line-clamp-2">
                  Check out my honest review of the newest smartphone!
                </p>
                <a className="text-sm font-bold">Read More</a>
                <div className="flex justify-between mt-2">
                  <span className="flex items-center">
                    <EyeIcon size={16} className="mr-1" /> 8.7K
                  </span>
                  <span className="flex items-center">
                    <ThumbsUpIcon size={16} className="mr-1" /> 1.9K
                  </span>
                  <span className="flex items-center">
                    <MessageCircleIcon size={16} className="mr-1" /> 312
                  </span>
                </div>
              </div>
            </div>
            <div className="w-full border-black border-2 rounded-md shadow-[8px_8px_0px_rgba(0,0,0,1)] bg-white">
              <figure className="w-full h-48 border-black border-b-2">
                <img
                  src="https://images.unsplash.com/photo-1466637574441-749b8f19452f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1500&q=80"
                  alt="Lifestyle post thumbnail"
                  className="w-full h-full object-cover"
                />
              </figure>
              <div className="px-4 py-3 text-left">
                <h3 className="text-lg font-bold mb-2">Lifestyle Tips</h3>
                <p className="text-sm mb-2 line-clamp-2">
                  5 easy ways to boost your productivity and happiness!
                </p>
                <a className="text-sm font-bold">Learn More</a>

                <div className="flex justify-between mt-2">
                  <span className="flex items-center">
                    <EyeIcon size={16} className="mr-1" /> 12.3K
                  </span>
                  <span className="flex items-center">
                    <ThumbsUpIcon size={16} className="mr-1" /> 3.1K
                  </span>
                  <span className="flex items-center">
                    <MessageCircleIcon size={16} className="mr-1" /> 578
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-cyan-300 p-6 border-t-2 border-black mt-8">
        <p>&copy; 2023 Jane Creator. All rights reserved.</p>
      </footer>
    </div>
  );
};
export default ContentCreatorPortfolio;
//render(<ContentCreatorPortfolio />, document.getElementById("root"));
