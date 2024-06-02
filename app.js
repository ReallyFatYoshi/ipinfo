import net from 'net';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { isVpn, updateList } from './libs/is-ip.js';

const app = express();

const limiter = rateLimit({
    validate: { xForwardedForHeader: false },
    windowMs: 5 * 60 * 1000,
    limit: 120,
    standardHeaders: 'draft-7',
});

app.use(cors());
app.use(limiter);

app.get('/:ip', async (req, reply) => {
    const { ip } = req.params;

    if (!net.isIPv4(ip)) {
        return reply.status(400).json({
            statusCode: 400,
            error: "Invalid ip address"
        });
    }

    try {
        reply.json({
            ip,
            is_vpn: await isVpn(ip),
            is_ip4: net.isIPv4(ip),
            is_ip6: net.isIPv6(ip),
        })
    } catch (e) {
        console.error(e);
    }
});

app.all('/', (_, reply) => {
    reply.json({
        statusCode: 200,
        error: "Usage /:ip"
    })
});

app.all('*', (_, reply) => {
    reply.json({
        statusCode: 404,
        error: "Route was not found."
    })
});

export default app;