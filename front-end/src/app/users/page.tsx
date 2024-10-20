"use client";

import React, { useEffect, useState } from 'react';
import { getAccounts, getSocialContents } from './phylloServiceAPIs';
import { useIsLoggedIn } from '@dynamic-labs/sdk-react-core';
import { useWalletClient, useContractWrite } from 'wagmi';
import UserInterface from './UserInterface';
import { DynamicWidget } from '../lib/dynamic';
import PhylloSDK from './phylloSDK';
import { http } from "wagmi";
import { uploadJSONToIPFS } from '../utils/uploadToIpfs';
import { createHash } from 'crypto';
import { mintNFT } from '../utils/mintNFT';
import { AddressZero, IpMetadata, PIL_TYPE, RegisterIpAndAttachPilTermsResponse, StoryClient, StoryConfig } from '@story-protocol/core-sdk';
import { NFTContractAddress } from "../utils/utils";
import { Address, erc721Abi, toHex } from 'viem';
import { defaultNftContractAbi } from './contractAbi';
import {
  ClaimRevenueResponse,
  CollectRoyaltyTokensResponse,
  RegisterDerivativeResponse,
  RegisterIpAndMakeDerivativeResponse,
  RegisterIpResponse,
  SnapshotResponse,
} from '@story-protocol/core-sdk';

function Page() {
  const [users, setUsers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [attributes, setAttributes] = useState({});
  const [socialContents, setSocialContents] = useState([]);
  const [registeredIpId, setRegisteredIpId] = useState<number | null>(null);
  const phylloSDK = new PhylloSDK();
  const isLoggedIn = useIsLoggedIn();
  const { data: wallet } = useWalletClient();

  useEffect(() => {
    if (!isLoggedIn) {
      console.log("User is not logged in.");
      return;
    }

    const loadAccounts = async () => {
      let response = await getAccounts(localStorage.getItem("PHYLLO_USER_ID"));
      let arr = response.data.data;
      if (arr.length > 0) {
        let updatedArray = arr.map((obj) => flattenObj(obj));
        setAccounts(updatedArray);
        setAttributes(updatedArray[0]);
      }
    };

    loadAccounts();

    const script = document.createElement('script');
    script.src = "https://cdn.getphyllo.com/connect/v2/phyllo-connect.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [isLoggedIn]);

  useEffect(() => {
    if (accounts.length > 0) {
      fetchSocialContentsData();
    }
  }, [accounts]);

  const handleMintIP = async (content) => {
    const config: StoryConfig = {
      wallet: wallet,
      transport: http('https://testnet.storyrpc.io'),
      chainId: 'iliad',
    };
    const client = StoryClient.newClient(config);

    console.log('StoryClient initialized:', client);

    const ipMetadata: IpMetadata = client.ipAsset.generateIpMetadata({
      title: content.title,
      description: content.description,
      ipType: 'video',
      media: [
        {
          name: content.title,
          url: content.media_url,
          mimeType: 'video/mp4',
        },
      ],
      attributes: [
        {
          key: 'Artist',
          value: content.account.username,
        },
        {
          key: 'Artist ID',
          value: content.account.id,
        },
        {
          key: 'Source',
          value: content.account.url,
        },
      ],
      creators: [
        {
          name: content.account.username,
          address: wallet?.account.address,
          contributionPercent: 100,
        },
      ],
    });

    const nftMetadata = {
      name: content.title,
      description: content.description,
      image: content.persistent_thumbnail_url,
      media: [
        {
          name: content.title,
          url: content.media_url,
          mimeType: 'video/mp4',
        },
      ],
      attributes: [
        {
          key: 'Artist',
          value: content.account.username,
        },
        {
          key: 'Artist ID',
          value: content.account.id,
        },
        {
          key: 'Source',
          value: content.account.url,
        },
      ],
    };

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
      mintingFee: 2,
      currency: "0x91f6F05B08c16769d3c85867548615d270C42fC7",
      ipMetadata: {
        ipMetadataURI: 'test-uri',
        ipMetadataHash: toHex('test-metadata-hash', { size: 32 }),
        nftMetadataHash: toHex('test-nft-metadata-hash', { size: 32 }),
        nftMetadataURI: 'test-nft-uri',
      },
      txOptions: { waitForTransaction: true },
    });

    console.log(`Root IPA created at transaction hash ${registerIpResponse.txHash}, IPA ID: ${registerIpResponse.ipId}`);
    console.log(`View on the explorer: https://explorer.story.foundation/ipa/${registerIpResponse.ipId}`);

    // Store the registered IP ID in the state
    setRegisteredIpId(tokenId!);

    const derivativeTokenId = await mintNFT(wallet?.account.address, 'test-uri');
    const registerIpDerivativeResponse: RegisterIpResponse = await client.ipAsset.register({
      nftContract: NFTContractAddress,
      tokenId: derivativeTokenId!,
      ipMetadata: {
        ipMetadataURI: 'test-uri',
        ipMetadataHash: toHex('test-metadata-hash', { size: 32 }),
        nftMetadataHash: toHex('test-nft-metadata-hash', { size: 32 }),
        nftMetadataURI: 'test-nft-uri',
      },
      txOptions: { waitForTransaction: true },
    });
    console.log(`Derivative IPA created at transaction hash ${registerIpDerivativeResponse.txHash}, IPA ID: ${registerIpDerivativeResponse.ipId}`);

    const linkDerivativeResponse: RegisterDerivativeResponse = await client.ipAsset.registerDerivative({
      childIpId: registerIpDerivativeResponse.ipId as Address,
      parentIpIds: [registerIpResponse.ipId as Address],
      licenseTermsIds: [registerIpResponse.licenseTermsId as bigint],
      txOptions: { waitForTransaction: true },
    });
    console.log(`Derivative linked at transaction hash ${linkDerivativeResponse.txHash}`);

    return registerIpResponse;
  };

  const handleOpenPhylloSDK = async () => {
    if (!isLoggedIn) {
      console.error("User must be logged in to open Phyllo SDK.");
      return;
    }
    await phylloSDK.initializeSDK();
  };

  const fetchSocialContentsData = async () => {
    if (accounts.length === 0) return;
    const accountId = accounts[0].id;
    const limit = 10;
    const contents = await getSocialContents(accountId, limit);
    setSocialContents(contents.data);
    console.log("Fetched social contents:", contents.data);
  };

  const flattenObj = (ob) => {
    let result = {};
    for (const i in ob) {
      if (typeof ob[i] === "object" && !Array.isArray(ob[i])) {
        const temp = flattenObj(ob[i]);
        for (const j in temp) {
          result[i + "." + j] = temp[j];
        }
      } else {
        result[i] = ob[i];
      }
    }
    return result;
  };

  const handleUseAsCollateral = async (content, recipientAddress) => {
    if (!wallet) {
      console.error("Wallet client is not connected.");
      return;
    }

    if (!registeredIpId) {
      console.error("No registered IP ID available. Please mint an IP first.");
      return;
    }

    try {
      // Send the transaction
      const txHash = await wallet.writeContract({
        address: '0xd2a4a4Cb40357773b658BECc66A6c165FD9Fc485',
        abi: erc721Abi,
        functionName: 'transferFrom',
        args: [wallet.account.address, '0x8f1D9b34fff4427661Cb4CeE353404be026746E3', registeredIpId],
      });

      console.log("Transaction sent:", txHash);

      // Wait for the transaction to be mined
      const receipt = await wallet.waitForTransactionReceipt({ hash: txHash });
      console.log("Transaction mined:", receipt);

    } catch (error) {
      console.error("Error using content as collateral:", error);
    }
  };

  const handleGetLoan = async (content) => {
    if (!wallet) {
      console.error("Wallet client is not connected.");
      return;
    }

    try {
      // Assuming the loan amount is fixed or calculated based on the content
      const loanAmount = BigInt(1000000000000000000); // 1 token (adjust as needed)
      const loanContractAddress = '0xYourLoanContractAddress'; // Replace with actual address

      // Send the transaction
      const txHash = await wallet.writeContract({
        address: '0x6eB93e23ea3A64bAa5170824a4593B47d3ABf602',
        abi: defaultNftContractAbi,
        functionName: 'withdrawERC20',
        args: ['0x91f6F05B08c16769d3c85867548615d270C42fC7', loanAmount],
      });

      console.log("Loan transaction sent:", txHash);

      // Wait for the transaction to be mined
      const receipt = await wallet.waitForTransactionReceipt({ hash: txHash });
      console.log("Loan transaction mined:", receipt);

      // You might want to update the UI or state here to reflect the loan
      console.log(`Loan of ${loanAmount} tokens received for content:`, content.title);

    } catch (error) {
      console.error("Error getting loan:", error);
    }
  };

  // Add this new function
  const handleConnectAccount = () => {
    handleOpenPhylloSDK();
  };

  return (
    <div className="">
      {isLoggedIn ? (
        <div>
          {accounts.length > 0 ? (
            <UserInterface
              accounts={accounts}
              attributes={attributes}
              socialContents={socialContents}
              handleOpenPhylloSDK={handleOpenPhylloSDK}
              handleMintIP={handleMintIP}
              handleUseAsCollateral={handleUseAsCollateral}
              handleGetLoan={handleGetLoan}
            />
          ) : (
            <div className="flex justify-center items-center min-h-screen bg-gray-100">
              <div className="max-w-md w-full bg-white border-2 border-black rounded-lg shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-cyan-300 to-blue-300 p-6">
                  <h2 className="text-2xl font-bold text-center text-black">Connect Your Account</h2>
                </div>
                <div className="p-6">
                  <p className="text-center text-lg mb-4 text-gray-700">
                    No accounts connected. Please connect an account to continue.
                  </p>
                  <div className="flex justify-center">
                    <button
                      onClick={handleConnectAccount}
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-transform transform hover:scale-105"
                    >
                      Connect Account
                    </button>
                  </div>
                </div>
                <div className="bg-gray-200 p-4 text-center">
                  <p className="text-sm text-gray-600">Secure and easy connection with Phyllo SDK</p>
                </div>
              </div>
            </div>
          )}
          <DynamicWidget />
        </div>
      ) : (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="max-w-md w-full bg-white border-2 border-black rounded-lg shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-red-300 to-pink-300 p-6">
                <h2 className="text-2xl font-bold text-center text-black">Authentication Required</h2>
                </div>
                <div className="p-6">
                <p className="text-center text-lg mb-4 text-red-500">
                    Please log in to continue.
                </p>
                <div className="flex justify-center">
        <div className="flex justify-center w-full">
            <DynamicWidget />
                    </div>
                </div>
                </div>
                <div className="bg-gray-200 p-4 text-center">
                <p className="text-sm text-gray-600">Access your account to explore more features.</p>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}

export default Page;
