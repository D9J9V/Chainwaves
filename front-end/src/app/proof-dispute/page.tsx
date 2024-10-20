"use client";

import { useState } from "react";
import { http, Address, toHex } from "viem";
import { useWalletClient } from "wagmi";
import { useIsLoggedIn } from "@dynamic-labs/sdk-react-core";
import { DynamicWidget } from "../lib/dynamic";
import {
  StoryClient,
  StoryConfig,
  IpMetadata,
  PIL_TYPE,
  RegisterIpAndAttachPilTermsResponse,
} from "@story-protocol/core-sdk";
import { uploadJSONToIPFS, uploadFileToIPFS } from "../utils/uploadToIpfs";
import { mintNFT } from "../utils/mintNFT";
import { NFTContractAddress } from "../utils/utils";
import { UploadIcon, FileAudioIcon, WalletIcon } from "lucide-react";

interface IpMetadataWithFeatures extends IpMetadata {
  attributes: Array<{ key: string; value: string }>;
}
export default function ProofDispute() {
  const isLoggedIn = useIsLoggedIn();
  const { data: wallet } = useWalletClient();
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [nftInfo, setNftInfo] = useState<{
    ipId: string;
    tokenId: string | number;
    txHash: string;
  } | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleUploadAndMint = async () => {
    if (!file || !wallet) {
      alert("Please select a file and connect your wallet");
      return;
    }

    setIsLoading(true);

    try {
      console.log("1. Applying watermark...");
      const formData = new FormData();
      formData.append("file", file);
      const watermarkResponse = await fetch(
        "https://3253-104-244-25-79.ngrok-free.app/apply_watermark",
        {
          method: "POST",
          body: formData,
        },
      );

      if (!watermarkResponse.ok) {
        throw new Error(
          `Failed to apply watermark: ${watermarkResponse.statusText}`,
        );
      }

      const watermarkResult = await watermarkResponse.json();
      console.log("Watermark applied successfully");
      const { watermarked_audio, stft_features, mellin_features } =
        watermarkResult;

      console.log("2. Uploading watermarked audio to IPFS...");
      const watermarkedAudioBuffer = Buffer.from(watermarked_audio, "base64");
      const ipfsHash = await uploadFileToIPFS(
        watermarkedAudioBuffer,
        "audio/mpeg",
      );
      console.log("Audio uploaded to IPFS:", ipfsHash);

      console.log("3. Preparing metadata...");
      const metadata: IpMetadata = {
        title: "Watermarked Audio",
        description: "This audio file contains a watermark",
        ipType: "Music",
        media: [
          {
            name: "Watermarked Audio",
            url: `https://ipfs.io/ipfs/${ipfsHash}`,
            mimeType: "audio/mpeg",
          },
        ],
        attributes: [
          { key: "stft_features", value: JSON.stringify(stft_features) },
          { key: "mellin_features", value: JSON.stringify(mellin_features) },
        ],
        creators: [
          {
            name: "Creator",
            address: wallet.account.address as Address,
            contributionPercent: 100,
          },
        ],
      };

      console.log("4. Uploading metadata to IPFS...");
      const metadataIpfsHash = await uploadJSONToIPFS(metadata);
      console.log("Metadata uploaded to IPFS:", metadataIpfsHash);

      console.log("5. Minting NFT...");
      const tokenId = await mintNFT(
        wallet.account.address as Address,
        `https://ipfs.io/ipfs/${metadataIpfsHash}`,
      );

      if (!tokenId) {
        throw new Error("Failed to mint NFT");
      }
      console.log("NFT minted with tokenId:", tokenId);

      console.log("6. Registering IP with Story Protocol...");
      const config: StoryConfig = {
        wallet: wallet,
        transport: http("https://testnet.storyrpc.io"),
        chainId: "iliad",
      };
      const client = StoryClient.newClient(config);

      const registerIpResponse: RegisterIpAndAttachPilTermsResponse =
        await client.ipAsset.registerIpAndAttachPilTerms({
          nftContract: NFTContractAddress,
          tokenId: tokenId,
          pilType: PIL_TYPE.COMMERCIAL_USE,
          mintingFee: 2,
          currency: "0x91f6F05B08c16769d3c85867548615d270C42fC7",
          ipMetadata: {
            ipMetadataURI: `https://ipfs.io/ipfs/${metadataIpfsHash}`,
            ipMetadataHash: toHex("test-metadata-hash", { size: 32 }),
            nftMetadataHash: toHex("test-nft-metadata-hash", { size: 32 }),
            nftMetadataURI: `https://ipfs.io/ipfs/${metadataIpfsHash}`,
          },
          txOptions: { waitForTransaction: true },
        });

      console.log("IP registered successfully:", registerIpResponse);

      setNftInfo({
        ipId: registerIpResponse.ipId?.toString() ?? "",
        tokenId: tokenId.toString(),
        txHash: registerIpResponse.txHash ?? "",
      });

      console.log("Process completed successfully");
    } catch (error) {
      console.error("Error details:", error);
      let errorMessage = "An unknown error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      alert(`An error occurred while processing your request: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-full bg-white text-black">
      <header className="bg-cyan-300 p-6 border-b-2 border-black flex items-center">
        <WalletIcon size={48} className="mr-4" />
        <div>
          <h1 className="text-4xl font-bold">Audio NFT Minter</h1>
          <p className="text-xl mt-2">Upload and Mint Watermarked Audio</p>
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
              <h2 className="text-2xl font-bold mb-4">Upload Audio</h2>
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

            <section className="mt-8 border-2 border-black p-6 rounded-md shadow-[8px_8px_0px_rgba(0,0,0,1)] bg-orange-200">
              <h2 className="text-2xl font-bold mb-4">Mint NFT</h2>
              <button
                onClick={handleUploadAndMint}
                disabled={isLoading || !file}
                className="flex items-center justify-center space-x-2 p-3 w-full border-2 border-black rounded-md bg-blue-300 hover:bg-blue-400 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <UploadIcon size={24} />
                <span>{isLoading ? "Processing..." : "Upload and Mint"}</span>
              </button>
            </section>

            {nftInfo && (
              <section className="mt-8 border-2 border-black p-6 rounded-md shadow-[8px_8px_0px_rgba(0,0,0,1)] bg-pink-200">
                <h2 className="text-2xl font-bold mb-4">NFT Minted</h2>
                <p>
                  <strong>IP ID:</strong> {nftInfo.ipId}
                </p>
                <p>
                  <strong>Token ID:</strong> {nftInfo.tokenId}
                </p>
                <p>
                  <strong>Transaction Hash:</strong> {nftInfo.txHash}
                </p>
                <a
                  href={`https://explorer.story.foundation/ipa/${nftInfo.ipId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline mt-2 inline-block"
                >
                  View on Explorer
                </a>
              </section>
            )}
          </div>
        ) : (
          <p className="text-2xl font-bold text-red-500 text-center">
            Please log in to continue.
          </p>
        )}
      </main>

      <footer className="bg-cyan-300 p-6 border-t-2 border-black mt-8">
        <DynamicWidget />
      </footer>
    </div>
  );
}