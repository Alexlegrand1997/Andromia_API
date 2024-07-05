
import Ally from '../models/ally-model.js';

class AllyRepository {
    async create(ally) {
        try {
            return Ally.create(ally);
        } catch (err) {
            throw err;
        }

    }

    async patch(ally, user) {
        try {

            return await Ally.findByIdAndUpdate(ally, { user: user.id })
        } catch (err) {
            throw err;
        }
    }

    async retrieveAll(idUser) {
        try {

            return await Ally.find({ user: idUser })
        } catch (err) {
            throw err;
        }
    }

    async retrieveOne(idAlly, idUser) {
        try {

            return await Ally.findOne({ _id: idAlly, user: idUser })
        } catch (err) {
            throw err;
        }
    }


    transform(ally) {
        ally.href = `${process.env.BASE_URL}/allies/${ally._id}`;
        delete ally._id;
        delete ally.__v;
        return ally;

    }
}

export default new AllyRepository();