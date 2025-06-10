import net from 'node:net';

import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

import { isVpn } from './libs/is-ip.js';
import reverseLookUp from './libs/reverse.js';
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
        const [extra, domains] = await Promise.all([
            fetch(`https://geoip.maxmind.com/geoip/v2.1/city/${ip}?demo=1&use-downloadable-db=1`,
                {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer v2.local.oXhVuNMuQWZyecM_TV0qqZBRl1ip8CzXeNFzAqIPJX971c4warC8k8ia3DwdHcoPQtMuZr-K_8OzUVqrFt7wC86dneMAdpfkHebHSBkCdg-dkHxZsn6u8AnRz9tGM7glG0b37sGAy924IqiR7um_WQeMiT67J5lwbCfI-15V-LeVA0-iMMFLRjOxMjN4-61IOUX8Jzw8xWUSaJ3j`
                    }
                }
            ).then((response) => response.json()),
            reverseLookUp(ip).catch(() => null),
        ]);

        const records = await lookup(domains?.at(0)).catch(() => null);

        reply.json({
            ip,
            domains,
            records,
            is_vpn: await isVpn(ip),
            is_ip4: net.isIPv4(ip),
            is_ip6: net.isIPv6(ip),
            //...extra
        })
    } catch (e) {
        console.error(e);
        reply.status(400).json({
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
