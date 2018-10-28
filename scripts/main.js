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
var sha256 = require('js-sha256');

// Các biến
const inputMessage = document.getElementById('inputMessage').value;


// Helper functions

// Lấy thông điệp
function getInputMessage() {
  return inputMessage;
}

// Băm thông điệp
function functionName() {

}