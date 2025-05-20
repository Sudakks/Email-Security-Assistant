<script setup>
    import AccordionItem from "./AccordionItem.vue"
    import DropdownSelector from './DropdownSelector.vue'
    import { ref, onMounted, watch } from 'vue'
    import * as openpgp from 'openpgp';

    const selectedAlgorithm = ref('');
    const encryptionOptions = [
        { label: 'OpenPGP (Pretty Good Privacy)', value: 'PGP' },
        { label: 'S/MIME', value: 'S/MIME' },
        { label: 'TLS', value: 'TLS' }
    ]
    const isAccordionOpen = ref(false);
    const myPublicKey = ref('')
    const myPrivateKeyArmored = ref('')
    const keyGenerated = ref(false)

    onMounted(() => {
        const encryptionAlgorithm = localStorage.getItem('encryptionAlgorithm');
        if (encryptionAlgorithm) {
            selectedAlgorithm.value = JSON.parse(encryptionAlgorithm);
        }
    });

    onMounted(() => {
        const nowPublicKey = localStorage.getItem('myPublicKey');
        if (nowPublicKey) {
            myPublicKey.value = nowPublicKey;
        }
    });

    watch(selectedAlgorithm, (newEncryptionAlgorithm) => {
        localStorage.setItem('encryptionAlgorithm', JSON.stringify(newEncryptionAlgorithm));
    }, { deep: true });


    //生成新的密钥
    const generateKeys = async () => {
        const { privateKey, publicKey, revocationCertificate } = await openpgp.generateKey({
            type: 'ecc',
            curve: 'curve25519',
            userIDs: [{ name: 'Yan', email: 'sudakks77@gmail.com' }],
            //passphrase: 'super long and hard to guess secret',
            format: 'armored'
        });

        if (!publicKey.startsWith('-----BEGIN PGP PUBLIC KEY BLOCK-----')) {
            console.error('Error with publicKey format', publicKey);
            alert('Failure to generate publicKey');
            return;
        }

        //确实是这里直接存储，不要用onMounted，我也不知道为什么会错
        localStorage.setItem('myPublicKey', publicKey); // 无引号
        myPublicKey.value = publicKey
        myPrivateKeyArmored.value = privateKey
        keyGenerated.value = true
    }

    //下载私钥
    const downloadPrivateKey = () => {
        const blob = new Blob([myPrivateKeyArmored.value], { type: 'text/plain;charset=utf-8' })
        const url = URL.createObjectURL(blob)

        const a = document.createElement('a')
        a.href = url
        a.download = 'private_key.asc'
        a.click()

        URL.revokeObjectURL(url)
    }
</script>

<template>
    <AccordionItem title="Encryption Settings" v-model="isAccordionOpen">
        <label class="label">Current encrption selection:</label>
        <DropdownSelector v-model="selectedAlgorithm"
                          :options="encryptionOptions" />
        <button v-if="selectedAlgorithm === 'PGP'" class="pgp-button" @click="generateKeys">
            Regenerate Encryption Keys
        </button>

        <div v-if="selectedAlgorithm === 'PGP'">
            <label class="label">Your Public Key:</label>
            <textarea readonly :value="myPublicKey" style="width: 100%; height: 200px;" />
        </div>

        <div v-if="keyGenerated" style="margin-top: 20px;">
            <button @click="downloadPrivateKey" class="pgp-button">
                Download Private Key
            </button>
        </div>
    </AccordionItem>

</template>

<style>
    .label {
        display: block;
        margin-bottom: 7px;
        font-weight: bold;
        color: #444;
    }

    .pgp-button {
        padding: 8px 12px;
        background-color: #E4F3F8;
        font-size: 14px;
        font-weight: bold;
        color: #454545;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        display: flex;
        justify-content: center;
        margin: 10px auto;
    }

        .pgp-button:hover {
            background-color: #D0EEF8;
        }
    </style>