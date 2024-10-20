"use client";

import { http, useContractWrite, useWalletClient } from "wagmi";
import { DynamicWidget } from "./lib/dynamic";
import { useIsLoggedIn } from '@dynamic-labs/sdk-react-core';
import { uploadJSONToIPFS } from './utils/uploadToIpfs'
import { createHash } from 'crypto'
import { mintNFT } from './utils/mintNFT'
import { AddressZero, IpMetadata, PIL_TYPE, RegisterIpAndAttachPilTermsResponse, StoryClient, StoryConfig } from '@story-protocol/core-sdk'
import { NFTContractAddress } from "./utils/utils";
import { Address, erc20Abi, toHex } from 'viem';
import {
  ClaimRevenueResponse,
  CollectRoyaltyTokensResponse,
  RegisterDerivativeResponse,
  RegisterIpAndMakeDerivativeResponse,
  RegisterIpResponse,
  SnapshotResponse,
} from '@story-protocol/core-sdk'

export default function Main() {
  const isLoggedIn = useIsLoggedIn();
  const { data: wallet } = useWalletClient();

  // Updated Method: initializeStoryClient as async
  const initializeStoryClient = async () => {
    const config: StoryConfig = {
      wallet: wallet,
      transport: http('https://testnet.storyrpc.io'),
      chainId: 'iliad',
    };
    const client = StoryClient.newClient(config);

    console.log('StoryClient initialized:', client);

    const ipMetadata: IpMetadata = client.ipAsset.generateIpMetadata({
      title: 'Musica de ferxxo',
      description: 'This is a test IP asset',
      ipType: 'Music',
      media: [
        {
          name: 'Tony',
          url: 'https://cdn1.suno.ai/937e3060-65c0-4934-acab-7d8cc05eb9a6.mp3',
          mimeType: 'audio/mpeg',
        },
      ],
      attributes: [
        {
          key: 'Artist',
          value: 'ferxxo',
        },
        {
          key: 'Artist ID',
          value: '4123743b-8ba6-4028-a965-75b79a3ad424',
        },
        {
          key: 'Source',
          value: 'tony.com',
        },
      ],
      creators: [
        {
          name: 'ferxxo',
          address: wallet?.account.address,
          contributionPercent: 100,
        },
      ],
    })

    const nftMetadata = {
      name: 'Musica de ferxxo',
      description: 'This is a test NFT',
      image: 'https://image-cdn-ak.spotifycdn.com/image/ab67706c0000da8499bd03e20087531cb6eb9c88',
      media: [
        {
          name: 'Tony',
          url: 'https://cdn1.suno.ai/937e3060-65c0-4934-acab-7d8cc05eb9a6.mp3',
          mimeType: 'audio/mpeg',
        },
      ],
      attributes: [
        {
          key: 'Artist',
          value: 'v',
        },
        {
          key: 'Artist ID',
          value: 'c66df5d6-100e-4887-af26-96024aa0933e',
        },
        {
          key: 'Source',
          value: 'tony.com',
        },
      ],
    }

    const ipIpfsHash = await uploadJSONToIPFS(ipMetadata);
    const ipHash = createHash('sha256').update(JSON.stringify(ipMetadata)).digest('hex');
    const nftIpfsHash = await uploadJSONToIPFS(nftMetadata);
    const nftHash = createHash('sha256').update(JSON.stringify(nftMetadata)).digest('hex');

    // Mint an NFT
    const tokenId = await mintNFT(wallet?.account.address, `https://ipfs.io/ipfs/${nftIpfsHash}`);
    console.log(`NFT minted with tokenId ${tokenId}`);
    

    const registerIpResponse: RegisterIpAndAttachPilTermsResponse = await client.ipAsset.registerIpAndAttachPilTerms({
      nftContract: NFTContractAddress,
      tokenId: tokenId!,
      pilType: PIL_TYPE.COMMERCIAL_USE,
      mintingFee: 2, // empty - doesn't apply
      currency: "0x91f6F05B08c16769d3c85867548615d270C42fC7", // empty - doesn't apply
      ipMetadata: {
        ipMetadataURI: 'test-uri',
        ipMetadataHash: toHex('test-metadata-hash', { size: 32 }),
        nftMetadataHash: toHex('test-nft-metadata-hash', { size: 32 }),
        nftMetadataURI: 'test-nft-uri',
      },
      txOptions: { waitForTransaction: true },
  }) 

  console.log(`Root IPA created at transaction hash ${registerIpResponse.txHash}, IPA ID: ${registerIpResponse.ipId}`)
  console.log(`View on the explorer: https://explorer.story.foundation/ipa/${registerIpResponse.ipId}`)

  const derivativeTokenId = await mintNFT(wallet?.account.address, 'test-uri')
  const registerIpDerivativeResponse: RegisterIpResponse = await client.ipAsset.register({
      nftContract: NFTContractAddress,
      tokenId: derivativeTokenId!,
      // NOTE: The below metadata is not configured properly. It is just to make things simple.
      // See `simpleMintAndRegister.ts` for a proper example.
      ipMetadata: {
          ipMetadataURI: 'test-uri',
          ipMetadataHash: toHex('test-metadata-hash', { size: 32 }),
          nftMetadataHash: toHex('test-nft-metadata-hash', { size: 32 }),
          nftMetadataURI: 'test-nft-uri',
      },
      txOptions: { waitForTransaction: true },
  })
  console.log(
      `Derivative IPA created at transaction hash ${registerIpDerivativeResponse.txHash}, IPA ID: ${registerIpDerivativeResponse.ipId}`
  )

  // 4. Make the Child IP Asset a Derivative of the Parent IP Asset
  //
  // Docs: https://docs.story.foundation/docs/spg-functions#register--derivative
  const linkDerivativeResponse: RegisterDerivativeResponse = await client.ipAsset.registerDerivative({
      childIpId: registerIpDerivativeResponse.ipId as Address,
      parentIpIds: [registerIpResponse.ipId as Address],
      //licenseTermsIds: ["5"],
      licenseTermsIds: [registerIpResponse.licenseTermsId as bigint],
      txOptions: { waitForTransaction: true },
  })
  console.log(`Derivative linked at transaction hash ${linkDerivativeResponse.txHash}`)



  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex flex-col items-center justify-center text-white">
      
      {isLoggedIn ? (
        <div>
          <p className="mb-4 text-green-500">You are logged in!</p>
          <p className="mb-4">Wallet Address: {wallet?.account.address}</p>
          
          {/* New Button to Initialize Story Client */}
          <button
            onClick={initializeStoryClient}
            className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600"
          >
            Initialize Story Client
          </button>
        </div>
      ) : (
        <p className="mb-4 text-red-500">Please log in to continue.</p>
      )}

      <DynamicWidget />

    </div>
  );
}
