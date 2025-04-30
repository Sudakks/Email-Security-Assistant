// server.js
import express from 'express';
import axios from 'axios';
import cors from 'cors';
//环境变量未加载，后端未正确配置dotenv导致无法读取.env文件
import 'dotenv/config'

//import libphonenumber from 'google-libphonenumber';
import { findNumbers } from 'libphonenumber-js';
//const { PhoneNumberUtil, PhoneNumberFormat } = libphonenumber;
//const phoneUtil = PhoneNumberUtil.getInstance();

const app = express();

app.use(cors());
app.use(express.json());


function escapeRegExp(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function maskPreservingFormat(s) {
    return s.split('').map((ch) => {
        if (/[a-z]/.test(ch)) return String.fromCharCode(97 + Math.floor(Math.random() * 26));
        if (/[A-Z]/.test(ch)) return String.fromCharCode(65 + Math.floor(Math.random() * 26));
        if (/\d/.test(ch)) return String.fromCharCode(48 + Math.floor(Math.random() * 10));
        return ch; // 保留符号
    }).join('');
}

const basicPatterns = {
    //phone: /(\+?\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{4}[- ]?\d{4}\b/g,
    email: /\b\S+@\S+\.\S+\b/g,
    idCard: /\b[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]\b/g
}
//扫描所有匹配的原始串，替换
function buildMaskedBodyAndMap(bodyText) {
    let originals = [];

    //先识别电话号码


    const foundPhones = Array.from(findNumbers(bodyText, 'CN'));
    /*
    console.log('number is ', foundPhones.length);
    foundPhones.forEach((match, index) => {
        console.log(`📦 Match #${index + 1}:`, JSON.stringify(match, null, 2));
    });*/
    
    foundPhones.forEach(match => {
        if (match.phone) {
            //console.log("sense number is " + match.phone);
            originals.push(match.phone); // 确保 number 存在
        }
    });


    //再识别其他的
    for (const regex of Object.values(basicPatterns)) {
        let m;
        while ((m = regex.exec(bodyText)) !== null) {
            originals.push(m[0]);
        }
    }
    originals = Array.from(new Set(originals)).sort((a, b) => b.length - a.length);

    //建立映射并替换
    const mapMaskedOriginal = {};
    let maskedBody = bodyText;
    for (const orig of originals) {
        const masked = maskPreservingFormat(orig);
        mapMaskedOriginal[masked] = orig;
        //全局匹配
        const re = new RegExp(escapeRegExp(orig), 'g');
        maskedBody = maskedBody.replace(re, masked);
        //console.log("maskedBody is " + maskedBody);
    }
    console.log("maskedBody is " + maskedBody);
    return { maskedBody, mapMaskedOriginal };

}

function sanitizeEmailBody(emailBody) {
    let maskedBody = emailBody;
    Object.values(basicPatterns).forEach((regex) => {
        maskedBody = maskedBody.replace(regex, (match) => maskPreservingFormat(match));
    });
    return maskedBody;
}

// ChatGPT代理端点
app.post('/api/detect-threats', async (req, res) => {
    try {
        const { emailBody } = req.body;

        const { maskedBody, mapMaskedOriginal } = buildMaskedBodyAndMap(emailBody);

        const response = await axios.post(
            'https://api.chatanywhere.org/v1/chat/completions',
            {
                model: "gpt-3.5-turbo",
                messages: [{
                    role: "user",
                    content: 
                        `Please carefully analyze the following email content and extract any sensitive information, including:
                        - Phone numbers
                        - Physical addresses
                        - Identification numbers (e.g., ID card, passport)
                        - Email addresses
                        - Bank account numbers
                        - Credit card numbers
                        - Passwords

                        Please return ONLY the JSON array, without any additional text, without any markdown formatting (no \`\`\`json), and without explanations.

                        Each item should have:
                        - "threatPriority": "low", "medium", or "high" (fixed priority based on the type)
                            - ID number, bank accounts, and passwords => high
                            - phone numbers, addresses => medium
                            - email addresses => low
                        - "attribute": The type of sensitive information (e.g., "Phone Number Exposed", "Email Exposed")
                        - "content": The exact detected sensitive information
                        
                        If no sensitive information is found, return an empty array [].
                        
                        Email content:\n${maskedBody}`
                }]
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.CHATGPT_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const gptResponse = response.data.choices[0].message.content;
        const parsedThreats = JSON.parse(gptResponse.trim().replace(/^```json|```$/g, ''));

        //还原
        const restored = parsedThreats.map(item => {
            const original = mapMaskedOriginal[item.content];
            if (original) {
                return { ...item, content: original };
            }
            else {
                return item;//如果检测出了未在basicPatterns里的GPT检测结果，那么直接返回原内容
            }
        });
        console.log('restored :', restored);
        return res.json(restored);
    } catch (error) {
        console.error('Backend error:', error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));