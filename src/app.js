import express from 'express';
import expressRateLimit from 'express-rate-limit';

import database from './core/database.js';
import errors from './core/errors.js';

import limitRoutes from './routes/limits.routes.js';
import explorateurRoutes from './routes/explorateurs.routes.js';
import explorationRoutes from './routes/exploration.routes.js';
import explorateurRepository from './repositories/exporateur-repository.js';
import allyRoutes from './routes/ally.routes.js';
import cron from 'node-cron';
const app = express();

database();

app.use(express.json());

//Pour mettre un middleware sur toutes routes
const limiter = expressRateLimit({
    windowMs: 10 * 60 * 1000,
    max: 10,
    message: 'Too many requests'
});
//app.use(limiter);

app.use('/explorateurs', explorateurRoutes);
app.use('/explorations', explorationRoutes);
app.use('/allies', allyRoutes)
app.use(limitRoutes);

app.use(errors);

// cron.schedule('0 */12 * * *', () => {
//     //console.log('Cron job running');
//     explorateurRepository.generateBooster();
//     //console.log('Cron job finished');
// })
//################ Yannick Pour test :) ###############
cron.schedule('*/60 * * * * *', () => {
    console.log('Cron job running');
    explorateurRepository.generateBooster();
    explorateurRepository.addInox();
    explorateurRepository.addElement();
    console.log('Cron job finished');
});
//#########################INOX########################//
// cron.schedule('*/5 */1 * * *', () => {
//     //console.log('Cron job running');
//     explorateurRepository.addInox();
//     //console.log('Cron job finished');
// });
//######################ELEMENT########################//
// cron.schedule('*/60 * * * *', () => {
//     //console.log('Cron job running');
//     explorateurRepository.addElement();
//     //console.log('Cron job finished');
// });

export default app;