import React, { useState } from 'react';
import Account from './Account';
import {
  EyeIcon,
  ThumbsUpIcon,
  MessageCircleIcon,
  InstagramIcon,
  YoutubeIcon,
  TwitchIcon,
  UsersIcon,
} from "lucide-react";

function UserInterface({ accounts, attributes, socialContents, handleOpenPhylloSDK, handleMintIP, handleUseAsCollateral, handleGetLoan }) {
  const [mintedIPs, setMintedIPs] = useState({});
  const [showGetLoanButton, setShowGetLoanButton] = useState({});

  const handleMintAndTrackIP = async (content) => {
    const registerIpResponse = await handleMintIP(content);
    setMintedIPs((prev) => ({
      ...prev,
      [content.id]: registerIpResponse.ipId,
    }));
  };

  const handleUseAsCollateralWithTimer = (content) => {
    handleUseAsCollateral(content);
    setShowGetLoanButton(prev => ({
      ...prev,
      [content.id]: false
    }));
    setTimeout(() => {
      setShowGetLoanButton(prev => ({
        ...prev,
        [content.id]: true
      }));
    }, 15000);
  };

  return (
    <div className="w-full max-w-full bg-white text-black">
        {accounts.map((account, idx) => (
               <Account accountObj={account} attributes={attributes} />
            ))}

      <main className="p-6 space-y-8">
        <section className="border-2 border-black p-6 rounded-md shadow-[8px_8px_0px_rgba(0,0,0,1)] bg-pink-200">
          <h2 className="text-2xl font-bold mb-4">Social Contents</h2>
          <div className="grid grid-cols-1 md:grid-cols-5  gap-6">
            {socialContents.map((content) => (
              <div key={content.id} className="w-full border-black border-2 rounded-md shadow-[8px_8px_0px_rgba(0,0,0,1)] bg-white">
                <figure className="w-full h-48 border-black border-b-2">
                  <img
                    src={content.thumbnail_url}
                    alt={content.title}
                    className="w-full h-full object-cover"
                  />
                </figure>
                <div className="px-4 py-3 text-left">
                  <h3 className="text-lg font-bold mb-2">{content.title}</h3>
                  <p className="text-sm mb-2 line-clamp-2">{content.description}</p>
                  <a href={content.url} className="text-sm font-bold">View Content</a>
                  <div className="flex justify-between mt-2">
                    <span className="flex items-center">
                      <EyeIcon size={16} className="mr-1" /> {content.engagement.view_count}
                    </span>
                    <span className="flex items-center">
                      <ThumbsUpIcon size={16} className="mr-1" /> {content.engagement.like_count}
                    </span>
                    <span className="flex items-center">
                      <MessageCircleIcon size={16} className="mr-1" /> {content.engagement.comment_count}
                    </span>
                  </div>
                  {mintedIPs[content.id] && (
                    <div className="flex flex-col space-y-2 mt-2">
                      <button 
                        onClick={() => window.open(`https://explorer.story.foundation/ipa/${mintedIPs[content.id]}`, '_blank')}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                      >
                        View My IP
                      </button>
                      {!showGetLoanButton[content.id] && (
                        <button 
                          onClick={() => handleUseAsCollateralWithTimer(content)}
                          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
                        >
                          Use as Collateral
                        </button>
                      )}
                      {showGetLoanButton[content.id] && (
                        <button 
                          onClick={() => handleGetLoan(content)}
                          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
                        >
                          Get Loan
                        </button>
                      )}
                    </div>
                  )}
                  {!mintedIPs[content.id] && (
                    <div className="mt-2 w-full">
                      <button 
                        onClick={() => handleMintAndTrackIP(content)} 
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 w-full text-center"
                      >
                        Mint IP
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default UserInterface;
