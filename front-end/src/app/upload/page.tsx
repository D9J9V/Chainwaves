"use client";

import { useState } from "react";
import { http, useContractWrite, useWalletClient } from "wagmi";
import { DynamicWidget } from "../lib/dynamic";
import { useIsLoggedIn } from "@dynamic-labs/sdk-react-core";
import { uploadJSONToIPFS } from "../utils/uploadToIpfs";
import { createHash } from "crypto";
import { mintNFT } from "../utils/mintNFT";
import {
  AddressZero,
  IpMetadata,
  PIL_TYPE,
  RegisterIpAndAttachPilTermsResponse,
  StoryClient,
  StoryConfig,
} from "@story-protocol/core-sdk";
import { NFTContractAddress } from "../utils/utils";
import { Address, toHex, hexToBytes } from "viem";
import { ShieldCheck, UploadIcon, Music } from "lucide-react";
import Link from "next/link";

export default function Main() {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [watermarkedAudio, setWatermarkedAudio] = useState<string | null>(null);
  const isLoggedIn = useIsLoggedIn();
  const { data: wallet } = useWalletClient();

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
      const response = await fetch("http://localhost:5000/apply_watermark", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Watermark applied successfully:", result);

      setWatermarkedAudio(result.watermarked_audio);

      alert("Watermark applied successfully! You can now mint your NFT.");
    } catch (error) {
      console.error("Error applying watermark:", error);
      alert("There was an error applying the watermark. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMintNFT = async () => {
    if (!watermarkedAudio) {
      alert("Please apply a watermark to your audio first.");
      return;
    }

    if (!wallet) {
      alert("Wallet is not connected. Please connect your wallet.");
      return;
    }

    setIsLoading(true);

    try {
      const config: StoryConfig = {
        wallet: wallet,
        transport: http("https://testnet.storyrpc.io"),
        chainId: "iliad",
      };
      const client = StoryClient.newClient(config);

      const ipMetadata: IpMetadata = client.ipAsset.generateIpMetadata({
        title: "Watermarked Audio",
        description: "This is a watermarked audio file",
        ipType: "Music",
        media: [
          {
            name: "Watermarked Audio",
            url: "https://turquoise-actual-rattlesnake-852.mypinata.cloud/ipfs/QmSKAuYBbkeKKHxBqq8sMNWggmyTxzC2adMzcHaZ5cwctn",
            mimeType: "audio/mpeg",
          },
        ],
        attributes: [
          {
            key: "Artist",
            value: "Unknown",
          },
        ],
        creators: [
          {
            name: "Creator",
            address: wallet.account.address ?? AddressZero,
            contributionPercent: 100,
          },
        ],
      });

      const ipIpfsHash = await uploadJSONToIPFS(ipMetadata);
      const ipHash = createHash("sha256")
        .update(JSON.stringify(ipMetadata))
        .digest("hex");

      const ipHashHex = ipHash.startsWith("0x")
        ? ipHash
        : `0x${ipHash.slice(0, 64)}`;

      const tokenId = await mintNFT(
        wallet.account.address ?? AddressZero,
        `https://ipfs.io/ipfs/${ipIpfsHash}`,
      );

      if (!tokenId) {
        throw new Error("Failed to mint NFT");
      }

      const registerIpResponse: RegisterIpAndAttachPilTermsResponse =
        await client.ipAsset.registerIpAndAttachPilTerms({
          nftContract: NFTContractAddress,
          tokenId: tokenId,
          pilType: PIL_TYPE.COMMERCIAL_USE,
          mintingFee: 2,
          currency: "0x91f6F05B08c16769d3c85867548615d270C42fC7",
          ipMetadata: {
            ipMetadataURI: `https://ipfs.io/ipfs/${ipIpfsHash}`,
            ipMetadataHash: ipHashHex as `0x{ipIpfsHash} `,
            nftMetadataHash: ipHashHex as `0x{ipIpfsHash} `,
            nftMetadataURI: `https://ipfs.io/ipfs/${ipIpfsHash}`,
          },
          txOptions: { waitForTransaction: true },
        });

      console.log(
        `NFT minted and registered with IP ID: ${registerIpResponse.ipId}`,
      );
      alert(
        `NFT minted and registered successfully! IP ID: ${registerIpResponse.ipId}`,
      );
    } catch (error) {
      console.error("Error minting NFT:", error);
      alert("There was an error minting the NFT. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      <header className="bg-cyan-300 p-6 border-b-2 border-black">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-4xl font-bold">
            Audio Watermarking & NFT Minting
          </h1>
          <nav>
            <ul className="flex space-x-4">
              <li>
                <Link href="/upload">
                  <Link
                    href="/upload"
                    className="px-4 py-2 bg-yellow-300 border-2 border-black rounded font-bold hover:bg-yellow-400 transition-colors"
                  >
                    Mint and secure
                  </Link>
                </Link>
              </li>
              <li>
                <Link
                  href="/upload"
                  className="px-4 py-2 bg-yellow-300 border-2 border-black rounded font-bold hover:bg-yellow-400 transition-colors"
                >
                  Dispute
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        <p className="text-xl mt-2">Protect your IP before publishing</p>
      </header>

      <main className="flex-grow p-6 space-y-8">
        {isLoggedIn ? (
          <section className="border-2 border-black p-6 rounded-md shadow-[8px_8px_0px_rgba(0,0,0,1)] bg-yellow-200">
            <h2 className="text-2xl font-bold mb-4">Upload Your Audio</h2>
            <div className="space-y-4">
              <div className="border-2 border-black p-4 rounded-md bg-white">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full"
                  accept="audio/*"
                />
              </div>
              <button
                onClick={handleProtectAudio}
                disabled={isLoading || !selectedFiles}
                className="w-full p-3 bg-cyan-300 border-2 border-black rounded font-bold hover:bg-cyan-400 transition-colors flex items-center justify-center disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="animate-spin mr-2">
                    <UploadIcon size={20} />
                  </span>
                ) : (
                  <ShieldCheck size={20} className="mr-2" />
                )}
                {isLoading ? "Processing..." : "Apply Watermark"}
              </button>
              <button
                onClick={handleMintNFT}
                disabled={isLoading || !watermarkedAudio}
                className="w-full p-3 bg-lime-300 border-2 border-black rounded font-bold hover:bg-lime-400 transition-colors flex items-center justify-center disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="animate-spin mr-2">
                    <UploadIcon size={20} />
                  </span>
                ) : (
                  <Music size={20} className="mr-2" />
                )}
                {isLoading ? "Processing..." : "Mint NFT"}
              </button>
            </div>
          </section>
        ) : (
          <section className="border-2 border-black p-6 rounded-md shadow-[8px_8px_0px_rgba(0,0,0,1)] bg-red-200">
            <p className="text-xl font-bold text-red-600">
              Please log in to continue.
            </p>
          </section>
        )}
      </main>

      <footer className="bg-cyan-300 p-6 border-t-2 border-black">
        <DynamicWidget />
      </footer>
    </div>
  );
}
