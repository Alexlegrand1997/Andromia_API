import express from 'express';
import HttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import explorationRepository from '../repositories/exploration-repository.js';
import explorateurRepository from '../repositories/exporateur-repository.js';
import allyRepository from '../repositories/ally-repository.js';
import { authorizationJWT, refreshJWT } from '../middlewares/authorization.jwt.js';

const router = express.Router();




class ExplorationRoutes {
    constructor() {
        router.post('/:idPortal', authorizationJWT, this.post);
        router.get('/:idExploration', this.getOne);
        router.get('/', authorizationJWT, this.getAllById);

    }
    async getOne(req, res, next) {
        try {


            const idExploration = req.params.idExploration;
            let exploration = await explorationRepository.retrieveOne(idExploration);
            if (!exploration) {
                return next(HttpError.NotFound());
            }


            exploration = exploration.toObject({ getters: false, virtuals: false });
            exploration = explorationRepository.transform(exploration);


            res.status(200).json(exploration);

        } catch (err) {
            return next(err);
        }
    }

    async getAllById(req, res, next) {
        let newExplorations = [];
        try {
            let user = await explorateurRepository.retrieveOneByEmail(req.accessToken.email)
            let explorations = await explorationRepository.retrieveAll(user.id);
            explorations.forEach(exploration => {
                exploration = exploration.toObject({ getters: false, virtuals: false })

                newExplorations.push(explorationRepository.transform(exploration));

            });
            res.status(200).json(newExplorations);
        } catch (err) {
            return next(err);
        }
    }

    async post(req, res, next) {


        const idPortal = req.params.idPortal;
        try {
            let user = await explorateurRepository.retrieveOneByEmail(req.accessToken.email)
            let exploration = await explorationRepository.retrieveOne(idPortal);
            if (exploration.status == 200) {
                exploration = exploration.data
                exploration.user = user.id
                let ally = exploration.ally;
                ally = await allyRepository.create(ally);
                exploration.ally = ally.id
                let newExploration = await explorationRepository.create(exploration)
                let explorateur = {};

                explorateur = await explorateurRepository.updateExplorateur(req.accessToken, newExploration.destination, newExploration.vault.inox, newExploration.vault.elements)

                newExploration = await explorationRepository.retrieveOneLocal(newExploration.id);
                exploration.user = `${process.env.BASE_URL}/explorateurs/${user.id}`
                newExploration = newExploration.toObject({ getters: false, virtuals: true });
                exploration = explorationRepository.transform(newExploration);
                res.status(201).json({ exploration, explorateur });
            }
        } catch (err) {
            return next(err);
        }


    }

}

new ExplorationRoutes();
export default router;