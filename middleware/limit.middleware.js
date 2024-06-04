// npm i express-rate-limit

import { rateLimit } from 'express-rate-limit'



const limiter = rateLimit({
	windowMs: 1 * 60 * 1000, // 1 minute/s
	limit: 20 , // Limit each IP to 100 requests per `window` (here, per 15 minutes).
	standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
	// store: ... , // Redis, Memcached, etc. See below.

    message: ()=>{
        return {message: "You can only use 20 requests per minute"}}
})

export default limiter