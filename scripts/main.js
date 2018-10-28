/****************           Thông số kĩ thuật                       **************************/
/**************** Đường cong Elliptic sử dụng trong demo: secp256k1 **************************/
// Phương trình đường cong: y2 = x3 + 7
// Định nghĩa trên trường hữu hạn Zp với
// p = 2256 - 232 - 29 - 28 - 27 - 26 - 24 - 1
//   = FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFE FFFFFC2F (256 bit)
// Số phần tử của đường cong #E
// ~ n = FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFE BAAEDCE6 AF48A03B BFD25E8C D0364141 (256 bit)
// Điểm cơ sở
// G (79BE667E F9DCBBAC 55A06295 CE870B07 029BFCDB 2DCE28D9 59F2815B 16F81798,
// 483ADA77 26A3C465 5DA4FBFC 0E1108A8 FD17B448 A6855419 9C47D08F FB10D4B8)
//
// Theo https://en.bitcoin.it/wiki/Secp256k1

// Thư viện sử dụng: `BigInteger` để tính toán modulo số nguyên lớn, `sha256` thư viện tạo mã băm
const BigInteger = require("big-integer");
const sha256 = require('js-sha256');

// Các biến
const inputMessage = document.getElementById('inputMessage').value;
const a = 0;
const b = 7;
const p = "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F";
const n = "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141";
const G = {
  x: "79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798",
  y: "483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8"
}

const bigP = BigInteger(p, 16);
const bigG = {
  x: BigInteger(G.x, 16),
  y: BigInteger(G.y, 16)
}

// Cac ham` phụ trợ
// Lấy thông điệp tu input
const getInputMessage = () => {
  return inputMessage;
}

// Băm thông điệp dung ham bam sha256, return ma bam
const hashMessage = (message) => {
  return new sha256(message);
}

// Convert hexa to decimal ( hệ 16 => hệ 10)
const hexToDec = (hexString) => {
  return BigInteger(p, 16);
}

// Sinh số ngẫu nhiên trong khoảng  min < x < max
const randomBetween = (min, max) => {
  minInt = BigInteger(min, 16);
  maxInt = BigInteger(max, 16);
  return BigInteger.randBetween(minInt, maxInt);
}

// Doi so nguyen lon sang nhi phan - Dung cho Doubling-and-Add
const toBinary = (bigP) => {
  return bigP.toString(2);
}

// Cong 2 diem (x1, y1) + (x2, y2)
const pointAdding = ({ x1, y1 }, { x2, y2 }) => {
  // Ap dung cong thuc : tinh s trong giao trinh
  const s =
  y2.minus(y1)                  // y2 - y1
  .divide(x2.minus(x1))         // chia (x2 - x1)
  .mod(bigP)                    // mod p
  .add(bigP).mod(bigP);         // Đổi kết quả về số dương (mod p) trong trường hợp modulo trả về âm
  // Ap dung cong thuc : tinh x3 y3 trong giao trinh
  const x3 =
  s.pow(2).minus(x1).minus(x2).mod(bigP)             // x3 = s^2 −x1 −x2
  .add(bigP).mod(bigP);                                 // Đổi kết quả về số dương (mod p) trong trường hợp modulo trả về âm
  const y3 =
  x1.minus(x3).multiply(s).minus(y1).mod(bigP)       // y3 = s(x1 −x3)−y1
  .add(bigP).mod(bigP);
  // Tra ve diem P + Q
  return { x: x3, y: y3 };
}

// Phep nhan doi 2.(x1, y1)
const pointDoubling = ({ x1, y1 }) => {
  // Ap dung cong thuc : tinh s trong giao trinh
  const s =
  x1.pow(2).multiply(3)         // 3(x1^2) + a = 3(x1^2) do đường cong ta chọn có a = 0
  .divide(y1.multiply(2))       // chia 2y1
  .mod(bigP)                    // mod p
  .add(bigP).mod(bigP);         // Đổi kết quả về số dương (mod p) trong trường hợp modulo trả về âm
  // Ap dung cong thuc : tinh x3 y3 trong giao trinh
  const x3 =
  s.pow(2).minus(x1).minus(x1).mod(bigP)             // x3 = s^2 −x1 −x2 = x3 = s^2 −x1 −x1 do P = Q
  .add(bigP).mod(bigP);                              // Đổi kết quả về số dương (mod p) trong trường hợp modulo trả về âm
  const y3 =
  x1.minus(x3).multiply(s).minus(y1).mod(bigP)       // y3 = s(x1 −x3)−y1
  .add(bigP).mod(bigP);
  // Tra ve diem 2P
  return { x: x3, y: y3 };
}

// Phep toan k.G su dung thuat toan Double-and-Add Algorithm
const scalarMultiply = ({x, y}, k) => {
  let k_binary = toBinary(k);
  let isFirstBit = true;
  // Khoi tao diem ban dau chinh bang G
  let endPoint = {
    x: x,
    y: y
  }
  // Duyet qua tat ca cac bit cua k
  for (const bit of k_binary){
    // Ta bo qua bit dau tien
    if ( isFirstBit ) {
      isFirstBit = false;
      continue;
    }
    // Neu bit = 0 ta thuc hien phep nhan doi, update lai endPoint
    if ( bit === "0" ) {
      endPoint = pointDoubling({ x1: endPoint.x, y1: endPoint.y });
    }
    // Neu bit = 1 ta thuc hien phep nhan doi, update lai endPoint, sau do + G, update endPoint lan 2
    if ( bit === "1" ) {
      endPoint = pointDoubling({ x1: endPoint.x, y1: endPoint.y });
      endPoint = pointAdding({ x1: endPoint.x, y1: endPoint.y }, { x2: bigG.x, y2: bigG.y });
    }
  }
  return endPoint;
}

/************************************/
/********** Sinh khóa ***************/
/************************************/
