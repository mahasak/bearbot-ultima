import {Request, Response} from 'firebase-functions';

export let version = (request: Request, response: Response) => {
    response.send("Bearbot API - V.1.0.0");
}