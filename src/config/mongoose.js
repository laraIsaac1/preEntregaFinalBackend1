import mongoose from 'mongoose';

export async function connectMongo(uri) {
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, {
    dbName: uri.includes('mongodb.net') ? undefined : undefined,
  });
  console.log('✅ Conectado a MongoDB');
}
