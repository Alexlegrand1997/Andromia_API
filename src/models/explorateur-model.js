import mongoose from 'mongoose';

const explorateurSchema = mongoose.Schema({

    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    uuid: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    elements: [{
        element: { type: String, required: true },
        quantity: { type: Number, required: true }
    }],
    inox: { type: Number, default: 0 },
    location: { type: String, default: 'unknown' },
    boosters: [{
        rarity: { type: String, required: true },
        price: { type: Number, required: true }
    }]



},
    {
        collection: 'explorateurs',
        strict: 'throw',
        timestamps: true
    });

export default mongoose.model('Explorateur', explorateurSchema);