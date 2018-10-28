// modulo voi so am
const mod = (x, n) => (x % n + n) % n

// Test pointAdding
const kq = pointAdding({x1: BigInteger("2353455345345345345234"),y1: BigInteger("234194612478471498734") },{x2: BigInteger("2347623847238962384734"), y2: BigInteger("23094871037481092831923409134087")})
console.log(kq);
console.log(kq.x3.toString());
console.log(kq.y3.toString());

// Test pointDoubling
const kq = pointDoubling({x1: BigInteger("2353455345345345345234"),y1: BigInteger("234194612478471498734") })
console.log(kq);
console.log(kq.x3.toString());
console.log(kq.y3.toString());

// Test doi nhi phan
console.log(bigP.toString(2).length);

// Test Doubling and Add
const kq = scalarMultiply({ x: bigG.x, y: bigG.y }, bigP);
console.log(kq);
