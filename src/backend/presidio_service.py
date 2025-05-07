# presidio_service.py
from html import entities
from flask import Flask, request, jsonify
import random
import string

from presidio_analyzer import AnalyzerEngine
from presidio_anonymizer import AnonymizerEngine
from presidio_anonymizer.entities import OperatorConfig

app = Flask(__name__)
analyzer = AnalyzerEngine()

ENTITIES = ["CREDIT_CARD", "EMAIL_ADDRESS", "IP_ADDRESS", "LOCATION", "URL"]

@app.route("/anonymize", methods=["POST"])
def anonymize():
    text = request.json.get("text", "")
    if not text:
        return jsonify({"error": "Missing 'text' field"}), 400
    results = analyzer.analyze(text=text, language="en", entities=ENTITIES)
    return jsonify({
        "entities": [
            {
                "type": r.entity_type, 
                "start": r.start, 
                "end": r.end, 
                "original": text[r.start:r.end]}
            for r in results
        ]
    })

if __name__ == "__main__":
    app.run(port=5001)