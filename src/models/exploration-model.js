import mongoose from 'mongoose';

const explorationSchema = mongoose.Schema({

    explorationDate: { type: Date, required: true },
    user: { type: String, required: true },
    destination: { type: String, required: true },
    affinity: { type: String, required: true },
    vault: {
        inox: { type: Number },
        elements: [
            {
                element: { type: String },
                quantity: { type: Number }
            }
        ]
    },
    ally: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ally',
    }




},
    {
        collection: 'explorations',
        strict: 'throw',
        timestamps: true
    });



export default mongoose.model('Exploration', explorationSchema);