import mongoose from 'mongoose';

const allySchema = mongoose.Schema({

    user: { type: String },
    stats: {
        life: { type: Number },
        speed: { type: Number },
        power: { type: Number },
        shield: { type: Number }
    },
    crypto: {
        hash: { type: String },
        signature: { type: String }
    },
    books: [String],
    kernel: [String],
    archiveIndex: { type: Number },
    name: { type: String },
    uuid: { type: String },
    affinity: { type: String },
    essence: { type: Number },
    href: { type: String },
    asset: { type: String },
    createdAt: { type: Date },
    updatedAt: { type: Date },
    expireAt: { type: Date },





},
    {
        collection: 'allies',
        strict: 'throw',
        timestamps: true
    });



export default mongoose.model('Ally', allySchema);