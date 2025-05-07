# presidio_service.py
from flask import Flask, request, jsonify
import re
from presidio_analyzer import AnalyzerEngine, RecognizerResult

app = Flask(__name__)
analyzer = AnalyzerEngine()

ENTITIES = ["CREDIT_CARD", "EMAIL_ADDRESS", "IP_ADDRESS", "LOCATION", "URL", "PHONE_NUMBER"]

def merge_adjacent_locations(entities, text):
    sorted_entities = sorted(entities, key=lambda x: x.start)
    merged = []
    i = 0
    while i < len(sorted_entities):
        current = sorted_entities[i]
        if current.entity_type != "LOCATION":
            merged.append(current)
            i += 1
            continue
            
        j = i + 1
        start = current.start
        end = current.end
        while j < len(sorted_entities):
            next_ent = sorted_entities[j]
            if next_ent.entity_type != "LOCATION":
                break
                
            gap = text[end: next_ent.start]
            if re.match(r'^[\s,.;]*$', gap):
                end = next_ent.end
                j += 1
            else:
                break
        
        merged_entity = RecognizerResult(
            entity_type="LOCATION",
            start=start,
            end=end,
            score=max(e.score for e in sorted_entities[i:j])
        )
        merged.append(merged_entity)
        i = j
    return merged


@app.route("/anonymize", methods=["POST"])
def anonymize():
    text = request.json.get("text", "")
    if not text:
        return jsonify({"error": "Missing 'text' field"}), 400
    try:
        results = analyzer.analyze(text=text, language="en", entities=ENTITIES)
        merged_results = merge_adjacent_locations(results, text)
        
        return jsonify({
            "entities": [
                {
                    "type": r.entity_type,
                    "start": r.start,
                    "end": r.end,
                    "original": text[r.start:r.end]
                } for r in merged_results
            ]
        })
    except Exception as e:
        app.logger.error(f"Error in anonymize: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5001)