import $ from 'jquery';
import forge from 'node-forge';

// Cache elements
// Sender
const publicKeyTextarea = $('#publicKey');
const privateKeyTextarea = $('#privateKey');

const genkeyButton = $('#keygen');

const senderHashInput = $('#hashInput');
const signatureTextarea = $('#signatureTextarea');

const dataTextarea = $('#dataTextarea');

const computeHashButton = $('#computeHash')
const createSignatureButton = $('#createSignature');
const sendButton = $('#send');

// Receiver
const reveiverSenderSignatureInput = $('#reveiverSenderSignature');
const messagesTextarea = $('#messages');
const warningTextarea = $('#warning');

const checkIntegrityButton = $('#checkIntegrity');

// Values
let publicKey = '';
let publicKeyObj;
let privateKeyObj;
let privateKey = '';
let hashObject;
let signatureObj;
let senderHash = '';
let signature  = '';
let data = '';

// Helpers

const updateKeyDisplay = function () {
    privateKeyTextarea.val(privateKey);
    publicKeyTextarea.val(publicKey);
};

const updateHashDisplay = function () {
    senderHashInput.val(senderHash);
};

const updateSignatureDisplay = function () {
    signatureTextarea.val(signature);
};

const updateReceiverMessage = function () {
    const template = `
        <div class="message-item">
            ${data}
        </div>
        </br>
        <div class="message-noti text-success">You got a message from Bob !</div>
    `
    messagesTextarea.html(template);
};

const updatereveiverSenderSignatureInput = function () {
    reveiverSenderSignatureInput.val(signature);
};

const updateWarningTextarea = function (valid) {
    if (valid) {
        warningTextarea.val('Thông điệp toàn vẹn');
        warningTextarea.removeClass('text-danger');
        warningTextarea.addClass('text-success');
    } else {
        warningTextarea.val('Thông điệp đã bị thay đổi');
        warningTextarea.removeClass('text-success');
        warningTextarea.addClass('text-danger');
    }
};

const getData = function () {
    return dataTextarea.val();
};

// Event
dataTextarea.on('change', function (e) {
    // data = dataTextarea.val();
});

genkeyButton.on('click', function(e) {
    forge.pki.rsa.generateKeyPair({bits: 1024, workers: 2}, function(err, keypair) {
        publicKeyObj = keypair.publicKey;
        privateKeyObj = keypair.privateKey;
        publicKey = forge.pki.publicKeyToPem(keypair.publicKey).replace(/(\r\n|\n|\r)/gm,'');
        privateKey = forge.pki.privateKeyToPem(keypair.privateKey).replace(/(\r\n|\n|\r)/gm,'');
        updateKeyDisplay();
    });
});

computeHashButton.on('click', function (e) {
    hashObject = forge.md.sha256.create();
    hashObject.update(getData(), 'utf8');
    senderHash = forge.util.encode64(hashObject.digest().data);
    updateHashDisplay();
});

createSignatureButton.on('click', function (e) {
    signatureObj = privateKeyObj.sign(hashObject);
    signature = forge.util.encode64(signatureObj);
    updateSignatureDisplay();
});

sendButton.on('click', function () {
    data = dataTextarea.val();
    updateReceiverMessage();
});

checkIntegrityButton.on('click', function () {
    updatereveiverSenderSignatureInput();
    let presentHashObj = forge.md.sha256.create();
    presentHashObj.update(getData(), 'utf8');
    console.log(getData());
    console.log(forge.util.encode64(presentHashObj.digest().data));
    const verifyObj = publicKeyObj.verify(presentHashObj.digest().bytes(), signatureObj);
    console.log(verifyObj);
    updateWarningTextarea(verifyObj);
});