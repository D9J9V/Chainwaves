"use client";

import { useState } from "react";

export default function UploadPage() {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchWithTimeout = (
    url: string,
    options: RequestInit,
    timeout: number,
  ) => {
    return Promise.race([
      fetch(url, options),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timed out")), timeout),
      ),
    ]) as Promise<Response>;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFiles(event.target.files);
    }
  };

  const handleProtectAudio = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      alert("Please select a file first.");
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append("file", selectedFiles[0]);

    try {
      const response = await fetchWithTimeout(
        "http://localhost:5000/apply_watermark",
        {
          method: "POST",
          body: formData,
        },
        300000, // 5 minutos de timeout
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Watermark applied successfully:", result);

      const audioBlob = base64ToBlob(result.watermarked_audio, "audio/mpeg");

      // Crear una URL para el Blob
      const audioUrl = URL.createObjectURL(audioBlob);

      const audioElement = new Audio(audioUrl);
      audioElement.play();

      // O crear un enlace de descarga:
      const downloadLink = document.createElement("a");
      downloadLink.href = audioUrl;
      downloadLink.download = "watermarked_audio.mp3";
      downloadLink.click();

      const modal = document.getElementById("my_modal_1") as HTMLDialogElement;
      if (modal) {
        modal.showModal();
      }
    } catch (error) {
      console.error("Error applying watermark:", error);
      if (error instanceof Error && error.message === "Request timed out") {
        alert(
          "The watermark process is taking longer than expected. Please try again or contact support.",
        );
      } else {
        alert("There was an error applying the watermark. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  function base64ToBlob(base64: string, mimeType: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="">
        <div className="max-w-7xl w-full space-y-8 grid grid-cols-2">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block text-indigo-600">Welcome to</span>
              <span className="block">Chain Waves</span>
            </h1>
            <p className="mt-6 text-xl text-gray-500 max-w-3xl ">
              Securely protect your audio creations on the blockchain.
            </p>
          </div>
          <div className=" justify-center px-80">
            <a
              href=""
              className="btn bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl justify-end px"
            >
              MINT
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg shadow-md p-8 flex flex-col items-center">
            <label
              htmlFor="audio-files"
              className="block text-lg font-medium text-gray-700 mb-4"
            >
              Upload your audio files
            </label>
            <input
              type="file"
              className="file-input file-input-bordered w-full max-w-xs"
              onChange={handleFileChange}
              multiple
            />
            {selectedFiles && (
              <div className="mt-4">
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  Selected Files:
                </h3>
                <ul className="list-disc list-inside">
                  {Array.from(selectedFiles || []).map((file, index) => (
                    <li key={index}>{file.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="bg-white rounded-lg shadow-md p-8 flex flex-col items-center justify-center">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">
              Protect Your Audio with a Watermark
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Add an invisible watermark to your audio file to secure your
              intellectual property and track its usage.
            </p>

            <button
              className="btn bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl"
              onClick={handleProtectAudio}
              disabled={isLoading || !selectedFiles}
            >
              {isLoading ? "Processing..." : "Protect my audio"}
            </button>
            <dialog id="my_modal_1" className="modal">
              <div className="modal-box">
                <h3 className="font-bold text-lg">Congrats!</h3>
                <p className="py-4">
                  Your watermarked file downloaded successfully
                </p>
                <div className="modal-action">
                  <form method="dialog">
                    <button className="btn btn-primary">Close</button>
                  </form>
                </div>
              </div>
            </dialog>
          </div>
        </div>
      </div>
    </div>
  );
}
