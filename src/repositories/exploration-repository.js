import dayjs from 'dayjs';
import axios from 'axios';
import Exploration from '../models/exploration-model.js';

class ExplorationRepository {
    async retrieveOne(idPortal) {

        let exploration = await axios.get(`${process.env.API_YANNICK_URL}/portals/${idPortal}`)
        return exploration;
    }
    async retrieveOneLocal(idExploration) {
        let exploration = await Exploration.findById(idExploration).populate('ally')
        return exploration
    }
    async retrieveAll(idUser) {
        return Exploration.find({ user: idUser }).populate('ally');
    }
    async create(exploration) {
        try {
            return Exploration.create(exploration);
        } catch (err) {
            throw err;
        }

    }

    transform(exploration) {
        let newExploration = exploration
        newExploration.href = `${process.env.BASE_URL}/explorations/${newExploration._id}`;
        delete newExploration._id;
        delete newExploration.__v;
        if (newExploration.ally) {
            newExploration.ally.captureMe = `${process.env.BASE_URL}/allies/${newExploration.ally._id}`
            delete newExploration.ally.id
            delete newExploration.ally._id
            delete newExploration.ally.__v
        }
        return newExploration;

    }
}


export default new ExplorationRepository();