export async function uploadJSONToIPFS(jsonMetadata: any): Promise<string> {
    try {
        const response = await fetch('/api/uploadToIpfs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(jsonMetadata),
        })

        if (!response.ok) {
            throw new Error('Failed to upload JSON to IPFS')
        }

        const data = await response.json()
        return data.IpfsHash
    } catch (error) {
        console.error('Error in uploadJSONToIPFS:', error)
        throw error
    }
}
