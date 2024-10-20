export async function uploadJSONToIPFS(jsonMetadata: any): Promise<string> {
    try {
      const response = await fetch("/api/uploadToIpfs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jsonMetadata),
      });
  
      if (!response.ok) {
        throw new Error("Failed to upload JSON to IPFS");
      }
  
      const data = await response.json();
      return data.IpfsHash;
    } catch (error) {
      console.error("Error in uploadJSONToIPFS:", error);
      throw error;
    }
  }
  
  export async function uploadFileToIPFS(
    file: File | Buffer,
    contentType: string,
  ): Promise<string> {
    try {
      const formData = new FormData();
  
      if (file instanceof File) {
        formData.append("file", file);
      } else {
        // Si es un Buffer, lo convertimos a Blob
        const blob = new Blob([file], { type: contentType });
        formData.append("file", blob, "audio.mp3"); // Nombre de archivo por defecto
      }
  
      const response = await fetch("/api/uploadFileToIpfs", {
        method: "POST",
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error("Failed to upload file to IPFS");
      }
  
      const data = await response.json();
      return data.IpfsHash;
    } catch (error) {
      console.error("Error in uploadFileToIPFS:", error);
      throw error;
    }
  }