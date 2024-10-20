import { NextResponse } from "next/server";
import pinataSDK from "@pinata/sdk";
import { Readable } from "stream";

const pinata = new pinataSDK({
  pinataJWTKey:
    "",
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const stream = Readable.from(buffer);

    const { IpfsHash } = await pinata.pinFileToIPFS(stream, {
      pinataMetadata: {
        name: file.name,
      },
    });

    return NextResponse.json({ IpfsHash });
  } catch (error) {
    console.error("Error uploading file to IPFS:", error);
    return NextResponse.json(
      { error: "Failed to upload file to IPFS" },
      { status: 500 },
    );
  }
}