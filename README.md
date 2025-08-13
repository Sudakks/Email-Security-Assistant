# Intelligent Email Security Assistant

### Function
Email security assistant is a Chrome extension for Gmail to protect users from privacy risks such as personal identity exposure and sensitive data leakage. Built with Vue.js and Vite, the tool automatically detects and highlights sensitive information (e.g., phone numbers, addresses) in email bodies using regex-based rules, Microsoft Presidio NLP, and LLM-powered contextual analysis. Users can choose to encrypt detected content via OpenPGP.js, ensuring confidentiality during transmission.\\
The extension features a modular architecture and deep browser integration through the Chrome Extension API, improving maintainability and scalability. The detection pipeline supports both predefined and user-defined sensitive data rules, achieving 96% accuracy for predefined patterns and 100% accuracy for custom rules, with processing latency under 3 seconds.\\
Tested across mainstream Chrome versions, the extension delivers real-time alerts (<5s click-to-result) and an intuitive UI with in-page highlighting to enhance user trust and adoption. This solution combines frontend engineering, backend logic, AI-powered detection, and security-focused UX design to provide an effective and user-friendly email privacy protection tool.


### Relevant Language and Library
- Vue, JavaScript, Python
- Presidio, OpenPGP
