import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_CONNECTION_STRING

if (!uri) {
    throw new Error('MONGODB_CONNECTION_STRING is not set')
}

// Cache connection for hot reloads in dev
const globalForMongo = global as unknown as { _mongoClient?: Promise<MongoClient> }
const clientPromise = globalForMongo._mongoClient ?? new MongoClient(uri).connect()
if (process.env.NODE_ENV !== 'production') {
    globalForMongo._mongoClient = clientPromise
}

export const getDB = async () => (await clientPromise).db('portfolio')