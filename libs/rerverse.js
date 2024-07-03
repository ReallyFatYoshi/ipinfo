import dns from 'node:dns';
import net from 'node:net';

/**
 * Reverse lookup
 * @param {string} ip 
 * @returns Promise<string[]>
 */
async function reverseLookUp(ip) {
    return new Promise((resolve, reject) => {
        dns.reverse(ip, (error, hostnames) => {
            if (error) {
                reject(error);
            } else {
                resolve(hostnames);
            }
        });
    })
}

export default reverseLookUp;