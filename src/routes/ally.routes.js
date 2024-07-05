import allyRepository from "../repositories/ally-repository.js";
import explorateurRepository from '../repositories/exporateur-repository.js';
import { authorizationJWT, refreshJWT } from '../middlewares/authorization.jwt.js';
import express from 'express';
import HttpError from 'http-errors';
const router = express.Router();

class AllyRoutes {


    constructor() {
        router.patch('/:idAlly', authorizationJWT, this.patchAlly);
        router.get('/', authorizationJWT, this.getAllById);
        router.get('/:idAlly', authorizationJWT, this.getOne)

    }

    async patchAlly(req, res, next) {
        try {
            let user = await explorateurRepository.retrieveOneByEmail(req.accessToken.email)
            let ally = await allyRepository.patch(req.params.idAlly, user)

            res.status(200).json(ally);
        } catch (err) {
            return next(err);
        }
    }

    async getAllById(req, res, next) {
        let newAllies = [];
        try {
            let user = await explorateurRepository.retrieveOneByEmail(req.accessToken.email)
            let allies = await allyRepository.retrieveAll(user.id);
            allies.forEach(ally => {
                ally = ally.toObject({ getters: false, virtuals: false })

                newAllies.push(allyRepository.transform(ally));

            });
            res.status(200).json(newAllies);
        } catch (err) {
            return next(err);
        }
    }

    async getOne(req, res, next) {
        try {
            let user = await explorateurRepository.retrieveOneByEmail(req.accessToken.email)
            let ally = await allyRepository.retrieveOne(req.params.idAlly, user.id)
            ally = ally.toObject({ getters: false, virtuals: false })
            ally = allyRepository.transform(ally);
            res.status(200).json(ally);
        } catch (err) {
            return next(err);
        }
    }




}

new AllyRoutes();
export default router;