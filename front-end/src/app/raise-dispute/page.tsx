"use client";

import { useState } from "react";
import { http } from "viem";
import { useWalletClient } from "wagmi";
import { useIsLoggedIn } from "@dynamic-labs/sdk-react-core";
import { DynamicWidget } from "../lib/dynamic";
import {
  StoryClient,
  StoryConfig,
  RaiseDisputeRequest,
  RaiseDisputeResponse as OriginalRaiseDisputeResponse,
  IpMetadata,
} from "@story-protocol/core-sdk";
import { uploadFileToIPFS } from "../utils/uploadToIpfs";
import { Address } from "viem";
import {
  UploadIcon,
  FileAudioIcon,
  WalletIcon,
  AlertTriangleIcon,
} from "lucide-react";

// Extend the original RaiseDisputeResponse to make disputeId optional
interface ExtendedRaiseDisputeResponse extends OriginalRaiseDisputeResponse {
  disputeId?: bigint;
}

// Define IpMetadataWithFeatures
interface IpMetadataWithFeatures extends IpMetadata {
  attributes: Array<{ key: string; value: string }>;
}

async function getWatermarkFeatures(ipId: string, wallet: any) {
  const config: StoryConfig = {
    wallet: wallet,
    transport: http("https://testnet.storyrpc.io"),
    chainId: "iliad",
  };
  const client = StoryClient.newClient(config);

  try {
    //const ipMetadata = await client.ipAsset.getMetadata(ipId);
    const ipMetadata: IpMetadataWithFeatures = {
      title: "Ejemplo de Audio con Watermark",
      description: "Este es un audio de ejemplo con watermark",
      ipType: "Music",
      media: [
        {
          name: "Audio Example",
          url: "https://ipfs.io/ipfs/QmExample123456789",
          mimeType: "audio/mpeg",
        },
      ],
      attributes: [
        {
          key: "stft_features",
          value: JSON.stringify([1.23, 4.56, 7.89, 10.11, 12.13]),
        },
        {
          key: "mellin_features",
          value: JSON.stringify([14.15, 16.17, 18.19, 20.21, 22.23]),
        },
        {
          key: "artist",
          value: "John Doe",
        },
      ],
      creators: [
        {
          name: "Creator Name",
          address: "0x1234567890123456789012345678901234567890" as Address,
          contributionPercent: 100,
        },
      ],
    };
    // Asegúrate de que ipMetadata tenga la estructura esperada
    if (!ipMetadata || !Array.isArray(ipMetadata.attributes)) {
      throw new Error("Invalid IP metadata structure");
    }

    const stftFeatures = ipMetadata.attributes.find(
      (attr: { key: string; value: string }) => attr.key === "stft_features",
    )?.value;
    const mellinFeatures = ipMetadata.attributes.find(
      (attr: { key: string; value: string }) => attr.key === "mellin_features",
    )?.value;

    if (!stftFeatures || !mellinFeatures) {
      throw new Error("Watermark features not found in IP metadata");
    }

    return {
      stft_features: JSON.parse(stftFeatures),
      mellin_features: JSON.parse(mellinFeatures),
    };
  } catch (error) {
    console.error("Error fetching watermark features:", error);
    throw error;
  }
}

export default function RaiseDispute() {
  const isLoggedIn = useIsLoggedIn();
  const { data: wallet } = useWalletClient();
  const [file, setFile] = useState<File | null>(null);
  const [targetIpId, setTargetIpId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [disputeResult, setDisputeResult] =
    useState<ExtendedRaiseDisputeResponse | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    type: "error" | "success";
    message: string;
  } | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleRaiseDispute = async () => {
    if (!file || !wallet || !targetIpId) {
      setStatusMessage({
        type: "error",
        message:
          "Please select a file, connect your wallet, and provide a target IP ID",
      });
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);

    try {
      console.log("1. Uploading suspect audio to IPFS...");
      const ipfsHash = await uploadFileToIPFS(file, file.type);
      console.log("Suspect audio uploaded to IPFS:", ipfsHash);

      console.log("2. Getting watermark features...");
      const watermarkFeatures = await getWatermarkFeatures(targetIpId, wallet);

      console.log("3. Checking watermark...");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("targetIpId", targetIpId);
      formData.append(
        "stft_features",
        JSON.stringify(watermarkFeatures.stft_features),
      );
      formData.append(
        "mellin_features",
        JSON.stringify(watermarkFeatures.mellin_features),
      );

      const watermarkResponse = await fetch(
        "https://3253-104-244-25-79.ngrok-free.app/check_watermark",
        {
          method: "POST",
          body: formData,
        },
      );

      if (!watermarkResponse.ok) {
        const errorText = await watermarkResponse.text();
        throw new Error(
          `Failed to check watermark: ${watermarkResponse.status} ${watermarkResponse.statusText}\n${errorText}`,
        );
      }

      const watermarkResult = await watermarkResponse.json();
      console.log("Watermark check result:", watermarkResult);

      if (!watermarkResult.watermark_detected) {
        setStatusMessage({
          type: "error",
          message: "No watermark detected. Cannot raise a dispute.",
        });
        return;
      }

      console.log("3. Initializing Story Protocol client...");
      const config: StoryConfig = {
        wallet: wallet,
        transport: http("https://testnet.storyrpc.io"),
        chainId: "iliad",
      };
      const client = StoryClient.newClient(config);

      console.log("4. Raising dispute...");
      const disputeRequest: RaiseDisputeRequest = {
        targetIpId: targetIpId as Address,
        arbitrationPolicy: "0x1234567890123456789012345678901234567890", // Replace with actual arbitration policy address
        linkToDisputeEvidence: `https://ipfs.io/ipfs/${ipfsHash}`,
        targetTag: "audio_similarity",
        calldata: "0x", // Optional: Add calldata if needed
      };

      const raiseDisputeResponse =
        await client.dispute.raiseDispute(disputeRequest);
      console.log("Dispute raised successfully:", raiseDisputeResponse);

      if (raiseDisputeResponse.disputeId) {
        setDisputeResult(raiseDisputeResponse);
        setStatusMessage({
          type: "success",
          message: "Dispute raised successfully!",
        });
      } else {
        console.error(
          "Dispute raised but no disputeId received:",
          raiseDisputeResponse,
        );
        setStatusMessage({
          type: "error",
          message:
            "Dispute was raised but no dispute ID was received. Please check the console for more details.",
        });
      }
    } catch (error) {
      console.error("Error details:", error);
      let errorMessage = "An unknown error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      setStatusMessage({
        type: "error",
        message: `An error occurred: ${errorMessage}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-full bg-white text-black">
      <header className="bg-red-300 p-6 border-b-2 border-black flex items-center">
        <AlertTriangleIcon size={48} className="mr-4" />
        <div>
          <h1 className="text-4xl font-bold">Raise Dispute</h1>
          <p className="text-xl mt-2">Upload Suspect Audio and Challenge IP</p>
        </div>
      </header>

      <main className="p-6 space-y-8">
        {isLoggedIn ? (
          <div className="w-full max-w-md mx-auto">
            <section className="border-2 border-black p-6 rounded-md shadow-[8px_8px_0px_rgba(0,0,0,1)] bg-yellow-200">
              <h2 className="text-2xl font-bold mb-4">Wallet Info</h2>
              <p className="flex items-center">
                <WalletIcon size={20} className="mr-2" />
                {wallet?.account.address}
              </p>
            </section>

            <section className="mt-8 border-2 border-black p-6 rounded-md shadow-[8px_8px_0px_rgba(0,0,0,1)] bg-lime-200">
              <h2 className="text-2xl font-bold mb-4">Upload Suspect Audio</h2>
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  id="audio-file"
                  accept="audio/*"
                />
                <label
                  htmlFor="audio-file"
                  className="flex items-center space-x-2 p-3 border-2 border-black rounded-md bg-yellow-300 hover:bg-yellow-400 cursor-pointer"
                >
                  <FileAudioIcon size={24} />
                  <span>{file ? file.name : "Choose audio file"}</span>
                </label>
              </div>
            </section>

            <section className="mt-8 border-2 border-black p-6 rounded-md shadow-[8px_8px_0px_rgba(0,0,0,1)] bg-blue-200">
              <h2 className="text-2xl font-bold mb-4">Target IP Information</h2>
              <input
                type="text"
                value={targetIpId}
                onChange={(e) => setTargetIpId(e.target.value)}
                placeholder="Enter target IP ID"
                className="w-full p-2 border-2 border-black rounded-md"
              />
            </section>

            <section className="mt-8 border-2 border-black p-6 rounded-md shadow-[8px_8px_0px_rgba(0,0,0,1)] bg-orange-200">
              <h2 className="text-2xl font-bold mb-4">Raise Dispute</h2>
              <button
                onClick={handleRaiseDispute}
                disabled={isLoading || !file || !targetIpId}
                className="flex items-center justify-center space-x-2 p-3 w-full border-2 border-black rounded-md bg-red-300 hover:bg-red-400 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <AlertTriangleIcon size={24} />
                <span>{isLoading ? "Processing..." : "Raise Dispute"}</span>
              </button>
            </section>

            {statusMessage && (
              <div
                className={`mt-4 p-4 rounded ${statusMessage.type === "error" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}
              >
                {statusMessage.message}
              </div>
            )}

            {disputeResult && (
              <section className="mt-8 border-2 border-black p-6 rounded-md shadow-[8px_8px_0px_rgba(0,0,0,1)] bg-pink-200">
                <h2 className="text-2xl font-bold mb-4">Dispute Raised</h2>
                <p>
                  <strong>Dispute ID:</strong>{" "}
                  {disputeResult.disputeId
                    ? disputeResult.disputeId.toString()
                    : "N/A"}
                </p>
                <p>
                  <strong>Transaction Hash:</strong>{" "}
                  {disputeResult.txHash || "N/A"}
                </p>
                {disputeResult.disputeId && (
                  <a
                    href={`https://explorer.story.foundation/dispute/${disputeResult.disputeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline mt-2 inline-block"
                  >
                    View Dispute on Explorer
                  </a>
                )}
              </section>
            )}
          </div>
        ) : (
          <p className="text-2xl font-bold text-red-500 text-center">
            Please log in to continue.
          </p>
        )}
      </main>

      <footer className="bg-red-300 p-6 border-t-2 border-black mt-8">
        <DynamicWidget />
      </footer>
    </div>
  );
}