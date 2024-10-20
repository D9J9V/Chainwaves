'use client'
import React, { useState, ChangeEvent, FormEvent } from "react";
import { UploadIcon, CheckIcon, Music } from "lucide-react";
import { useClient } from "@xmtp/react-sdk";
import { Crown, Briefcase } from "lucide-react";

interface SimilarityResponse {
  similarity: number;
}

interface Song {
  title: string;
  artist: string;
  coverUrl: string;
}


const FileSimilarityChecker: React.FC = () => {
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [similarity, setSimilarity] = useState<number | null>(0.7);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const featuredSongs: Song[] = [
    { title: "Try Again", artist: "Keane", coverUrl: "https://shop-obc.michael45.com/wp-content/uploads/2024/06/IMG_1092-scaled.jpg" },
    { title: "Imagine", artist: "John Lennon", coverUrl: "https://townsquare.media/site/295/files/2018/03/92397_0.jpg?w=1200&h=0&zc=1&s=0&a=t&q=89" },
    { title: "Father Stretch My Hands Pt. 1", artist: "Kanye West", coverUrl: "https://images.genius.com/842fbad2849dadaa73a93caca252a795.680x680x1.jpg" },
  ];



  const handleFileChange = (event: ChangeEvent<HTMLInputElement>, setFile: React.Dispatch<React.SetStateAction<File | null>>) => {
    const file = event.target.files?.[0] || null;
    setFile(file);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file1 || !file2) {
      alert("Please select two files");
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("file1", file1);
    formData.append("file2", file2);

    try {
      const response = await fetch("http://localhost:5000/compare", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: SimilarityResponse = await response.json();
      setSimilarity(data.similarity);
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while processing the files");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen  bg-white text-black">
      <header className="bg-cyan-300 p-6 border-b-2 border-black flex items-center">
        <div>
          <h1 className="text-4xl font-bold">File Similarity Checker</h1>
          <p className="text-xl mt-2">Compare two files and check their similarity</p>
        </div>
      </header>

      <main className="p-6 space-y-8">
        <section className="border-2 border-black p-6 rounded-md shadow-[8px_8px_0px_rgba(0,0,0,1)] bg-yellow-200">
          <h2 className="text-2xl font-bold mb-4">Upload Files</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-2 font-bold">File 1</label>
              <input
                type="file"
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleFileChange(e, setFile1)}
                className="w-full p-2 border-2 border-black rounded"
              />
            </div>
            <div>
              <label className="block mb-2 font-bold">File 2</label>
              <input
                type="file"
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleFileChange(e, setFile2)}
                className="w-full p-2 border-2 border-black rounded"
              />
            </div>
            <button
              type="submit"
              className="w-full p-3 bg-cyan-300 border-2 border-black rounded font-bold hover:bg-cyan-400 transition-colors flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="animate-spin mr-2">
                  <UploadIcon size={20} />
                </span>
              ) : (
                  <UploadIcon size={20} className="mr-2" />
                )}
              {isLoading ? "Processing..." : "Compare Files"}
            </button>
          </form>
        </section>

        {similarity !== null && (
          <section className="border-2 border-black p-6 rounded-md shadow-[8px_8px_0px_rgba(0,0,0,1)] bg-lime-200">
            <h2 className="text-2xl font-bold mb-4">Result</h2>
            <div className="flex items-center space-x-2 p-4 border-2 border-black rounded-md bg-white">
              <CheckIcon size={24} className="text-green-500" />
              <div>
                <p className="text-xl font-bold">Similarity Score</p>
                <p className="text-3xl font-bold text-green-500">{similarity.toFixed(2)}</p>
              </div>
            </div>
          </section>
        )}
        {similarity !== null && (
          <section className="border-2 border-black p-6 rounded-md shadow-[8px_8px_0px_rgba(0,0,0,1)] bg-pink-300">
            <h2 className="text-2xl font-bold mb-4">My Platforms</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button className="flex items-center space-x-2 p-3 border-2 border-black rounded-md bg-yellow-300 hover:bg-yellow-400">
                <span className="flex items-center">
                  <Briefcase size={16} className="mr-1" /> Dispute
                </span>
              </button>
              <button className="flex items-center space-x-2 p-3 border-2 border-black rounded-md bg-cyan-200 hover:bg-cyan-400">
                <span className="flex items-center">
                  <Crown size={16} className="mr-1" /> Claim royalties
                </span>
              </button>
            </div>
          </section>
        )}
        <section className="border-2 border-black p-6 rounded-md shadow-[8px_8px_0px_rgba(0,0,0,1)] bg-purple-200">
          <h2 className="text-2xl font-bold mb-4">Recently minted and secured</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredSongs.map((song, index) => (
              <div key={index} className="border-2 border-black p-4 rounded-md shadow-[4px_4px_0px_rgba(0,0,0,1)] bg-white hover:bg-gray-100 transition-colors">
                <div className="aspect-square mb-2 overflow-hidden rounded-md">
                  <img src={song.coverUrl} alt={`${song.title} cover`} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-lg font-bold">{song.title}</h3>
                <p className="text-sm text-gray-600">{song.artist}</p>
                <button className="mt-2 flex items-center space-x-2 p-2 border-2 border-black rounded-md bg-cyan-200 hover:bg-cyan-300 transition-colors w-full justify-center">
                  <Music size={16} />
                  <span>Play</span>
                </button>
              </div>
            ))}
          </div>
        </section>

      </main>



      <footer className="bg-cyan-300 p-6 border-t-2 border-black mt-8">
        <p>&copy; 2023 File Similarity Checker. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default FileSimilarityChecker;
