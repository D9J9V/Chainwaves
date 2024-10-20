import { NextResponse } from 'next/server'
import pinataSDK from '@pinata/sdk'

// Ensure you have these environment variables set in your .env file
const pinata = new pinataSDK({ pinataJWTKey: "" })

export async function POST(request: Request) {
    try {
        const jsonMetadata = await request.json()
        const { IpfsHash } = await pinata.pinJSONToIPFS(jsonMetadata)
        return NextResponse.json({ IpfsHash })
    } catch (error) {
        console.error('Error uploading to IPFS:', error)
        return NextResponse.json({ error: 'Failed to upload to IPFS' }, { status: 500 })
    }
}
