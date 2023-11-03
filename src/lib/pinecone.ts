import { PineconeClient,Pinecone } from '@pinecone-database/pinecone';

export const pinecone = new Pinecone({ 
    apiKey: process.env.PINECONE!,
    environment: 'gcp-starter'
})

/*export const getPineconeClient = async () => {
    const client = new PineconeClient()
  
    await client.init({
      apiKey: process.env.PINECONE!,
      environment: 'gcp-starter',
    })
  
    return client
  }
  */
