// npm i express-rate-limit

import { rateLimit } from 'express-rate-limit';


export const limiterDefault = rateLimit({
	windowMs: 1 * 60 * 1000, // 1 minute
	limit: 20 , // Limit each IP to 100 requests per `window` (here, per 20 minutes).
	standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
	// store: ... , // Redis, Memcached, etc. See below.

    message: ()=>{
        return {message: "You can only use 20 requests per Minute"}}
});


export const limiterBreak = rateLimit({
	windowMs: 5 * 60 * 1000, // 5 minutes
	limit: 1 , 
	
    message: ()=>{
        return {message: "You can only break once per 5 Minutes"}}
});

export const limiterCheck = rateLimit({
	windowMs: 60 * 60 * 1000, // 60 minutes
	limit: 1 , 

    message: ()=>{
        return {message: "You can only check once per Hour"}}
});

