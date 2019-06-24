import {Request, Response} from 'firebase-functions';

export let webhook = (request: Request, response: Response) => {
    response.send("Bearbot API - V.1.0.0");
}