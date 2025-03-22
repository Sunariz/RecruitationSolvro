import mongoose from 'mongoose'

async function connectDB() {
  try {
    await mongoose.connect(
      'mongodb+srv://admin:admin@learningapi.pvva6.mongodb.net/?retryWrites=true&w=majority&appName=LearningAPI'
    )
    console.log('MongoDB connected successfully')
  } catch (error) {
    console.error('MongoDB connection error:', error)
  }
}

connectDB()
