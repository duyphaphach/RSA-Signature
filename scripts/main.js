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
const bigN = BigInteger(n, 16);

// Cac ham` phụ trợ

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

// Lay n bit trai nhat cua 1 so
const leftMostBits = (bigNumber, n) => {
  let temp = toBinary(bigNumber);       // Chuyen doi bigNumber thanh chuoi nhi phan
  return  BigInteger(                   // Tra lai bigNumber ở dạng số Nguyên lớn
          temp.substring(0,n), 2);      // Voi n bit dau tien cua chuoi
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
  .add(bigP).mod(bigP);                              // Đổi kết quả về số dương (mod p) trong trường hợp modulo trả về âm
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

// 1) Chon ngẫu nhiên d trong đoạn [1, n-1] lam khoa bi mat
const d = randomBetween(1, n);
console.log("Khoa bi mat: ");
console.log(d.toString());
// 2) Tinh diem Q = d G lam khoa cong khai
const Q = scalarMultiply({ x: bigG.x, y: bigG.y}, d)
console.log("Khoa cong khai: ");
console.log("Qx");
console.log(Q.x.toString());
console.log("Qy");
console.log(Q.y.toString());


/*************************************/
/********** Tao chu ky ***************/
/*************************************/

const createSignature = (message) => {
  // 0) Cac bien phu
  // So bit cua n
  const nLength = toBinary(bigN).length;
  // 1) Tính e = HASH(m), với HASH là hàm băm, su dung sha256 ( SHA-2 )
  // Lay message nhap vao tu nguoi dung, doi sang hex, roi doi tiep sang Big Int
  const e = BigInteger(sha256(message), 16);
  // 2) Cho z bằng Ln bit trái nhất của e, với Ln (n_length) là độ dài bit của n
  const z = leftMostBits(e, nLength);

  while (true) {
    // 3) Chọn một số nguyên ngẫu nhiên k trong khoảng [1, n-1]
    const k = randomBetween(1, n);
    // 4: Tính H (x1, y1) = k. G;
    const H = scalarMultiply({ x: bigG.x, y: bigG.y }, k);
    // 5: Tính r = x1 mod n. Nếu r = 0, quay lại bước 3.
    // H.x tuong ung voi toa do x1
    const r = H.x.mod(bigN);
    // Quay lai 3) neu r = 0
    if(r.isZero()){
      continue;
    }
    // 6) Tính s =  k^-1 (z + r.dA) mod A . Nếu s = 0 thì quay lại bước 3.
    const s =
    r.multiply(d).add(z)      // (z + r.dA)
    .divide(k)                //  .k^-1
    .mod(bigN)
    // Nếu s = 0 thì quay lại bước 3.
    if (s.isZero()) {
      continue;
    }
    else {
      return {
        pair: {
          r: r,
          s: s
        },
        e: e,
        z: z,
        k: k,
        H: H,
      }
    }
  }
}


/******************************************/
/********** Xac thuc chu ky ***************/
/******************************************/

const verifySignature = ({ r, s }, message) => {
  // 1) Kiểm tra r và s có thuộc khoảng [1, n-1] hay không
  if (r.gt(bigN) || r.lesser(1) || s.gt(bigN) || s.lesser(1)) {
    return false;
  }
  // 0) Cac bien phu
  // So bit cua n
  const nLength = toBinary(bigN).length;
  // 2) Tính e = HASH(m), với HASH là hàm băm, su dung sha256 ( SHA-2 )
  // Lay message nhap vao tu nguoi dung, doi sang hex, roi doi tiep sang Big Int
  const e = BigInteger(sha256(message), 16);
  // 3) Cho z bằng Ln bit trái nhất của e, với Ln (n_length) là độ dài bit của n
  const z = leftMostBits(e, nLength);
  // 4) Tính w = s^-1 mod n
  const w = s.modInv(bigN);
  // 5) Tinh u1 = zw mod n && u2 = rw mod n
  const u1 = z.multiply(w).mod(bigN);
  const u2 = r.multiply(w).mod(bigN);
  // Tính điểm C = u1 x G + u2  x Q. Neu chu ky hop le, Cx = r mod n
  // Tinh u1 . G
  const u1G = scalarMultiply({ x: bigG.x, y: bigG.y }, u1);
  // Tinh u2 . Q
  const u2Q = scalarMultiply({ x: Q.x, y: Q.y }, u2);
  // Tinh C
  const C = pointAdding({ x1: u1G.x, y1: u1G.y }, { x2: u2Q.x, y2: u2Q.y });
  const info = C.x.equals(r) ? "Chữ ký hợp lệ" : "Chữ ký không hợp lệ";
  return {
    e: e,
    z: z,
    w: w,
    u1: u1,
    u2: u2,
    C: C,
    info:info
  };
}


/******************************************/
/********** Event handlers  ***************/
/******************************************/

// Cache elements
const inputMessage = document.getElementById('inputMessage');
let signature;
let verification;

// Content Update
const keygenArea = document.getElementById('keygenArea');
const signArea = document.getElementById('signArea');
const verifyArea = document.getElementById('verifyArea');
const receiveArea = document.getElementById('receiveArea');

// Buttons
const resetButton = document.getElementById('resetButton');
const keygenButton = document.getElementById('keygenButton');
const createSignatureButton = document.getElementById('signButton');
const sendButton = document.getElementById('sendButton');
const verifySignatureButton = document.getElementById('verifyButton');

// Reset
const reset = () => {
  createSignatureButton.disabled = true;
  sendButton.disabled = true;
  verifySignatureButton.disabled = true;
  keygenArea.innerHTML = "";
  signArea.innerHTML = "";
  verifyArea.innerHTML = "";
  receiveArea.innerHTML = "";
}
reset();

// Lấy thông điệp tu input
const getInputMessage = () => {
  return inputMessage.value;
}

// Enable button
const enable = (button) => {
  button.disabled = false;
}

// Disable button
const disable = (button) => {
  button.disabled = true;
}

//Event for reset button
resetButton.addEventListener('click', function () {
  reset();
})

//Event for keygen button
keygenButton.addEventListener('click', function() {
  const templateToRender =
  `<div>
  <p>
  <span class="text-info font-weight-bold">Tạo khóa công khai</span>
  <br>
  <br><span class=text-danger>Chọn d ngẫu nhiên: </span>
  <br><span class=text-primary><b>d</b> = ${d}</span>
  <br><span class=text-danger>Tính điểm Q = dG</span>
  <br><span class=text-primary>Điểm Q:</span>
  <br><span class=text-primary><b>x</b>: ${Q.x.toString()}</span>
  <br><span class=text-primary><b>y</b>: ${Q.y.toString()}</span>
  <br>
  <br><span id="divider">==================================================================</span>
  </p>
  </div>`
  keygenArea.insertAdjacentHTML('beforeend', templateToRender);
  keygenArea.scrollIntoView();
  enable(createSignatureButton);
})

//Event for createSignature button
createSignatureButton.addEventListener('click', function() {
  signature = createSignature(getInputMessage());
  const templateToRender =
  `<div>
  <p>
  <span class="text-info font-weight-bold">Tạo chữ ký</span>
  <br>
  <br><span class=text-danger>Băm thông điệp:</span>
  <br><span class=text-primary><b>e</b> = ${signature.e.toString()}</span>
  <br><span class=text-danger>Các giá trị trung gian:</span>
  <br><span class=text-primary><b>z</b> = ${signature.z.toString()}</span>
  <br><span class=text-primary><b>k</b> = ${signature.k.toString()}</span>
  <br><span class=text-danger>Tính điểm (x1, y1) = k.G</span>
  <br><span class=text-primary><b>x<sub>1</sub></b> = ${signature.H.x.toString()}</span>
  <br><span class=text-primary><b>y<sub>1</sub></b> = ${signature.H.y.toString()}</span>
  <br><span class=text-danger>Chữ kí số là cặp (r, s):</span>
  <br><span class=text-primary><b>r</b> = ${signature.pair.r.toString()}</span>
  <br><span class=text-primary><b>s</b> = ${signature.pair.s.toString()}</span>
  <br>
  <br><span id="divider">==================================================================</span>
  </p>
  </div>`
  signArea.insertAdjacentHTML('beforeend', templateToRender);
  signArea.scrollIntoView();
  enable(sendButton);
});

//Event for send button
sendButton.addEventListener('click', function() {
  const templateToRender =
  `<div style="overflow-y: auto;">
  <p>
  <span class="text-info">Alice, you got a message from Bob!</span>
  <br>
  <p class="btn btn-primary btn-md" style="border-radius: 5px; max-width:235px; word-wrap:break-word;">
  ${getInputMessage()}
  </p>
  </p>
  </div>`
  receiveArea.insertAdjacentHTML('beforeend', templateToRender);
  receiveArea.scrollIntoView();
  enable(verifySignatureButton);
});

//Event for verifySignature button
verifySignatureButton.addEventListener('click', function() {
  verification = verifySignature({ r: signature.pair.r, s: signature.pair.s}, getInputMessage());
  const templateToRender =
  `<div>
  <p>
  <span class="text-info font-weight-bold">Xác thực chữ ký</span>
  <br>
  <br><span class=text-danger>Băm thông điệp:</span>
  <br><span class=text-primary><b>e</b> = ${verification.e.toString()}</span>
  <br><span class=text-danger>Các giá trị trung gian:</span>
  <br><span class=text-primary><b>z</b> = ${verification.z.toString()}</span>
  <br><span class=text-primary><b>w</b> = ${verification.w.toString()}</span>
  <br><span class=text-primary><b>u<sub>1</sub></b> = ${verification.u1.toString()}</span>
  <br><span class=text-primary><b>u<sub>2</sub></b> = ${verification.u2.toString()}</span>
  <br><span class=text-danger>Tính điểm C = u1 x G + u2 x Q: </span>
  <br><span class=text-primary><b>x<sub>c</sub></b> = ${verification.C.x.toString()}</span>
  <br><span class=text-primary><b>y<sub>c</sub></b> = ${verification.C.y.toString()}</span>
  <br>
  <br><span class=text-danger font-weight-bold>${verification.info} !</span>
  <br>
  <br><span id="divider">==================================================================</span>
  </p>
  </div`
  verifyArea.insertAdjacentHTML('beforeend', templateToRender) ;
  verifyArea.scrollIntoView();
});
