import express from 'express';
import HttpError from 'http-errors';

import explorateurRepository from '../repositories/exporateur-repository.js';
import { authorizationJWT, refreshJWT } from '../middlewares/authorization.jwt.js';

const router = express.Router();

class ExplorateurRoutes {

    constructor() {
        router.post('/', this.post);
        router.get('/:idExplorateur', authorizationJWT, this.getOne);
        router.get('/', authorizationJWT, this.getByEmail)
        router.post('/login', this.login);
        router.post('/refresh', refreshJWT, this.refresh);
        router.get('/boosters/:idBooster', authorizationJWT, this.openBooster)

    }



    async getOne(req, res, next) {
        try {
            const { email } = req.accessToken;

            //console.log(email)

            const idExplorateur = req.params.idExplorateur;
            let explorateur = await explorateurRepository.retrieveOne(idExplorateur);
            if (!explorateur) {
                return next(HttpError.NotFound());
            }

            const isMe = email === explorateur.email;
            if (!isMe && !explorateur.isPublic) {
                return next(HttpError.Forbidden());
            }

            explorateur = explorateur.toObject({ getters: false, virtuals: false });
            explorateur = explorateurRepository.transform(explorateur);


            res.status(200).json(explorateur);

        } catch (err) {
            return next(err);
        }
    }

    async openBooster(req, res, next) {
        try {
            const { email } = req.accessToken;
            let explorateurLive = await explorateurRepository.retrieveOneByEmail(email);
            let loot = await explorateurRepository.openBooster(explorateurLive, req.params.idBooster);
            loot.explorateur = loot.explorateur.toObject({ getters: false, virtuals: false });
            loot.explorateur = explorateurRepository.transform(loot.explorateur);
            res.status(200).json(loot);
        } catch (err) {
            return next(err);
        }
    }

    async getByEmail(req, res, next) {
        try {
            const { email } = req.accessToken;

            let explorateur = await explorateurRepository.retrieveOneByEmail(email);
            const isMe = email === explorateur.email;
            if (!isMe && !explorateur.isPublic) {
                return next(HttpError.Forbidden());
            }

            explorateur = explorateur.toObject({ getters: false, virtuals: false });
            explorateur = explorateurRepository.transform(explorateur);


            res.status(200).json(explorateur);
        } catch (err) {
            return next(err);
        }
    }

    async login(req, res, next) {
        const { email, username, password } = req.body;
        if ((email && username) || email === "" || username === "") {
            return next(HttpError.BadRequest(''));
        }

        const result = await explorateurRepository.login(email, username, password);
        if (result.explorateur) {
            //Nous sommes connectés
            let explorateur = result.explorateur.toObject({ getters: false, virtuals: false });
            explorateur = explorateurRepository.transform(explorateur);
            const tokens = explorateurRepository.generateJWT(explorateur.email);
            res.status(201).json({ explorateur, tokens });
        } else {
            //Erreur lors de la connexion
            return next(result.err);
        }
    }

    async post(req, res, next) {
        try {
            let explorateur = await explorateurRepository.create(req.body);
            explorateur = await explorateurRepository.setElementZero(explorateur.email);
            explorateur = explorateur.toObject({ getters: false, virtuals: false });
            const tokens = explorateurRepository.generateJWT(explorateur.email);
            explorateur = explorateurRepository.transform(explorateur);
            res.status(201).json({ explorateur, tokens });
        } catch (err) {
            return next(err);
        }

    }

    refresh(req, res, next) {
        try {
            const tokens = explorateurRepository.generateJWT(req.refreshToken.email);
            res.status(201).json(tokens);
        } catch (err) {
            return next(err);
        }
    }
}

new ExplorateurRoutes();
export default router;