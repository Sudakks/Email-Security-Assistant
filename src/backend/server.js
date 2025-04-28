// server.js
import express from 'express';
import axios from 'axios';
import cors from 'cors';
//环境变量未加载，后端未正确配置dotenv导致无法读取.env文件
import 'dotenv/config'

const app = express();

app.use(cors());
app.use(express.json());

// ChatGPT代理端点
app.post('/api/detect-threats', async (req, res) => {
    try {
        const { emailBody } = req.body;

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
                        
                        Email content:\n${emailBody}`
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
        res.json(parsedThreats);
    } catch (error) {
        console.error('Backend error:', error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));