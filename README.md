# Intelligent Email Security Assistant

### Function
Email security assistant is a Chrome extension for Gmail to protect users from privacy risks such as personal identity exposure and sensitive data leakage. Built with Vue.js and Vite, the tool automatically detects and highlights sensitive information (e.g., phone numbers, addresses) in email bodies using regex-based rules, Microsoft Presidio NLP, and LLM-powered contextual analysis. Users can choose to encrypt detected content via OpenPGP.js, ensuring confidentiality during transmission.<br />
<br />
The extension features a modular architecture and deep browser integration through the Chrome Extension API, improving maintainability and scalability. The detection pipeline supports both predefined and user-defined sensitive data rules, achieving 96% accuracy for predefined patterns and 100% accuracy for custom rules, with processing latency under 3 seconds.<br />
<br />
Tested across mainstream Chrome versions, the extension delivers real-time alerts (<5s click-to-result) and an intuitive UI with in-page highlighting to enhance user trust and adoption. This solution combines frontend engineering, backend logic, AI-powered detection, and security-focused UX design to provide an effective and user-friendly email privacy protection tool.

### Design Details
<img width="289" height="476" alt="image" src="https://github.com/user-attachments/assets/ac33f4fe-26db-43f5-a6f9-ff6d808e33ff" /><br />
After using the detection function, the warnings will be highlighted<br />
<img width="244" height="435" alt="image" src="https://github.com/user-attachments/assets/26f63630-701d-469f-8475-7d8027eabd53" /><br />
The email assistant offeres the option to encrpyt and decrpyt the email body<br />
<img width="298" height="476" alt="image" src="https://github.com/user-attachments/assets/f832537a-7ccd-4a61-b823-c2d44875a1f8" /><br />
User can customize their sensitive keywords according to their personal needs<br />
<img width="293" height="185" alt="image" src="https://github.com/user-attachments/assets/c89209f3-eddf-4af8-81a7-fd90b350db8d" />
<img width="270" height="205" alt="image" src="https://github.com/user-attachments/assets/698ec93c-ae2d-4b98-a97d-4e2c7bc133d4" />








### Relevant Language and Library
- Vue, JavaScript, Python
- Presidio, OpenPGP
