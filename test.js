import * as openpgp from 'openpgp';
function PGPEncryption() {
    (async () => {
        // 生成密钥对，变量名更改为 privateKey 和 publicKey
        const { privateKey, publicKey, revocationCertificate } = await openpgp.generateKey({
            type: 'ecc',
            curve: 'curve25519',
            userIDs: [{ name: 'Jon Smith', email: 'jon@example.com' }],
            passphrase: 'super long and hard to guess secret',
            format: 'armored'
        });

        // 读取公钥
        const publicKeyObj = await openpgp.readKey({ armoredKey: publicKey });

        // 读取并解密私钥
        const privateKeyObj = await openpgp.decryptKey({
            privateKey: await openpgp.readPrivateKey({ armoredKey: privateKey }),
            passphrase: 'super long and hard to guess secret'
        });

        // 加密消息
        const encrypted = await openpgp.encrypt({
            message: await openpgp.createMessage({ text: 'Hello,111 World!' }),
            encryptionKeys: publicKeyObj,
            signingKeys: privateKeyObj // 使用解密后的私钥签名
        });
        console.log("the obj is " + publicKeyObj);
        console.log(encrypted);

        // 解密消息
        const message = await openpgp.readMessage({ armoredMessage: encrypted });
        const { data: decrypted, signatures } = await openpgp.decrypt({
            message,
            verificationKeys: publicKeyObj,
            decryptionKeys: privateKeyObj
        });
        console.log(decrypted);

        // 验证签名
        try {
            await signatures[0].verified;
            console.log('Signature is valid');
        } catch (e) {
            throw new Error('Signature could not be verified: ' + e.message);
        }
    })();
}
//generate();
PGPEncryption();
