import net from 'node:net';

import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { load } from 'cheerio';

import { isVpn } from './libs/is-ip.js';
import reverseLookUp from './libs/rerverse.js';
import lookup from './libs/lookup.js';

const app = express();

const limiter = rateLimit({
    validate: { xForwardedForHeader: false },
    windowMs: 60 * 1000,
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
        const content = await fetch(`https://www.iana.org/whois?q=${ip}`).then((response) => response.text());
        const domains = await reverseLookUp(ip).catch(() => null);
        const records = await lookup(domains?.at(0)).catch(() => null);
        const $ = load(content);
        const text = $.text($(`pre`));
        const organisation = text.match(/(?<=organisation\:)([A-Za-z0-9 ]+)$/gm)[0].trim();
        reply.json({
            ip,
            organisation,
            domains,
            records,
            is_vpn: await isVpn(ip),
            is_ip4: net.isIPv4(ip),
            is_ip6: net.isIPv6(ip)
        })
    } catch (e) {
        console.error(e);
        return reply.status(400).json({
            statusCode: 400,
            error: "Invalid ip address"
        });
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