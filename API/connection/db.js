import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

mongoose.set('debug', true);

const main = async () => {
    try {
    
        await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to the database');
    } catch (err) {
        console.log('Error connecting to the database. ' + err);
    }
}

export default main;