import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import http from 'http';
import configs from './config/database';
import routes from './router/indexRouter';
import path from "path";


dotenv.config();

const app: Express = express();
const server = http.createServer(app);

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', '*');
  next();
});

app.use(express.json());

app.use('/public/uploads', express.static(path.join(__dirname, '../public/uploads')));


app.use('/api', routes);

mongoose.connect(configs.DBConnection)
  .then(() => {
    console.log(' Successfully connected to the database');
  })
  .catch((err: Error) => {
    console.error(' Could not connect to the database. Exiting now...', err);
    process.exit(1);
  });

const PORT = process.env.PORT || 4200;
server.listen(PORT, async () => {
  console.log(` Server listening on port ${PORT}`);
});

export default app;