import { NextResponse } from "next/server";
import pinataSDK from "@pinata/sdk";
import { Readable } from "stream";

const pinata = new pinataSDK({
  pinataJWTKey:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJhN2MyYzM1OS03NzA3LTQ5NTAtYWQwMC00MzIyNTZlMDA0MzciLCJlbWFpbCI6ImppbWVuZXp2ZGllZ29AaG90bWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiYmE1NzBmNjJiYjBjOWMxZGYzNGYiLCJzY29wZWRLZXlTZWNyZXQiOiJjOTdlZmFmODU5MTIzZjI5YzFjNTUyMmRhNDE1M2I0YmJhMTYyNDNjMzcwZDhjNTc1NTVlNTAxZWExMjM1N2NmIiwiZXhwIjoxNzYwOTM0MTUzfQ.MnLTCAYkddIPLOUkVZF1zis5KAmc0B09uDcBkXtr4yw",
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
