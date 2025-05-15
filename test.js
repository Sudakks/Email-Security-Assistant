import * as openpgp from 'openpgp';
function PGPEncryption() {
    (async () => {
        // ������Կ�ԣ�����������Ϊ privateKey �� publicKey
        const { privateKey, publicKey, revocationCertificate } = await openpgp.generateKey({
            type: 'ecc',
            curve: 'curve25519',
            userIDs: [{ name: 'Jon Smith', email: 'jon@example.com' }],
            passphrase: 'super long and hard to guess secret',
            format: 'armored'
        });

        // ��ȡ��Կ
        const publicKeyObj = await openpgp.readKey({ armoredKey: publicKey });

        // ��ȡ������˽Կ
        const privateKeyObj = await openpgp.decryptKey({
            privateKey: await openpgp.readPrivateKey({ armoredKey: privateKey }),
            passphrase: 'super long and hard to guess secret'
        });

        // ������Ϣ
        const encrypted = await openpgp.encrypt({
            message: await openpgp.createMessage({ text: 'Hello,111 World!' }),
            encryptionKeys: publicKeyObj,
            signingKeys: privateKeyObj // ʹ�ý��ܺ��˽Կǩ��
        });
        console.log("the obj is " + publicKeyObj);
        console.log(encrypted);

        // ������Ϣ
        const message = await openpgp.readMessage({ armoredMessage: encrypted });
        const { data: decrypted, signatures } = await openpgp.decrypt({
            message,
            verificationKeys: publicKeyObj,
            decryptionKeys: privateKeyObj
        });
        console.log(decrypted);

        // ��֤ǩ��
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
