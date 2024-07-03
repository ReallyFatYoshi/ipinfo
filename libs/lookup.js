import dns from 'node:dns';

/**
 * Reverse lookup
 * @param {string} hostname 
 * @returns Promise<string[]>
 */
async function lookup(hostname) {
    return new Promise((resolve, reject) => {
        dns.lookup(hostname, {
            hints: dns.ALL,
            all: true
        },
            (error, hostnames) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(hostnames);
                }
            });
    })
}

export default lookup;