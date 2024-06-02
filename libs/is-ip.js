// we use an interval tree to quickly query a large number of CIDR IP ranges.
// the naive approach takes ~7ms per query on my laptop, whereas this takes 0.2ms.

class IntervalNode {
  constructor(interval) {
    this.interval = interval; // interval is an object like {start: x, end: y}
    this.max = interval.end;
    this.left = null;
    this.right = null;
  }
}

class IntervalTree {
  constructor() {
    this.root = null;
  }

  insert(interval) {
    if (!this.root) {
      this.root = new IntervalNode(interval);
      return;
    }

    let node = this.root;
    while (true) {
      node.max = Math.max(node.max, interval.end);

      if (interval.start < node.interval.start) {
        if (!node.left) {
          node.left = new IntervalNode(interval);
          break;
        }
        node = node.left;
      } else {
        if (!node.right) {
          node.right = new IntervalNode(interval);
          break;
        }
        node = node.right;
      }
    }
  }

  query(point) {
    let node = this.root;
    while (node) {
      if (point >= node.interval.start && point <= node.interval.end) {
        return true;
      }

      if (node.left && point <= node.left.max) {
        node = node.left;
      } else {
        node = node.right;
      }
    }
    return false;
  }
}

let itree;
updateList();
export async function updateList() {
  let timeoutMs = 20000;
  itree = new IntervalTree();
  const ipv4CidrRanges = await fetch("https://raw.githubusercontent.com/josephrocca/is-vpn/main/vpn-or-datacenter-ipv4-ranges.txt", { signal: AbortSignal.timeout(timeoutMs) }).then(r => r.text()).then(t => t.trim().split("\n"));
  ipv4CidrRanges.map(ipv4CidrToRange).forEach(range => itree.insert(range));
}

setInterval(updateList, 1000 * 60 * 60 * 12); // fetch updated ip range list every 12 hours

function ipToBinary(ip) {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0);
}

function ipv4CidrToRange(cidr) {
  const [baseIp, subnetMask] = cidr.split('/');
  const ipBinary = ipToBinary(baseIp);
  const rangeStart = ipBinary;
  const rangeEnd = ipBinary | ((1 << (32 - subnetMask)) - 1);
  return { start: rangeStart, end: rangeEnd };
}

export function isVpn(ip) {
  const ipBinary = ipToBinary(ip);
  return itree.query(ipBinary);
}

/*
    MIT License

    Copyright (c) 2023 josephrocca

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
*/