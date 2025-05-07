# presidio_service.py
from flask import Flask, request, jsonify
import re
from presidio_analyzer import AnalyzerEngine, RecognizerRegistry
from presidio_analyzer.nlp_engine import NlpEngineProvider
from presidio_analyzer import Pattern, PatternRecognizer, RecognizerResult

app = Flask(__name__)
#analyzer = AnalyzerEngine()

#自定义地址
ADDRESS_REGEX = r"\b\d+\s+([A-Za-z]+\s+)+(?:Avenue|Street|Road|Rd|St|Ave|Boulevard|Blvd|Lane|Ln|Drive|Dr),\s*(?:[A-Za-z]+\s*)+(?:,\s*[A-Za-z]+\s*)*"
address_recognizer = PatternRecognizer(
    supported_entity="C_ADDRESS",
    patterns=[Pattern("address", regex=ADDRESS_REGEX, score=0.8)]
)

registry = RecognizerRegistry()
registry.load_predefined_recognizers()
registry.add_recognizer(address_recognizer)
analyzer = AnalyzerEngine(registry=registry)

# 包含ADDRESS实体
ENTITIES = ["CREDIT_CARD", "EMAIL_ADDRESS", "IP_ADDRESS", "URL", "LOCATION"]

def merge_adjacent_locations(entities, text):
    sorted_entities = sorted(entities, key=lambda x: x.start)
    merged = []
    i = 0
    print(len(sorted_entities))
    while i < len(sorted_entities):
        current = sorted_entities[i]
        print(current.start)

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
        for r in merged_results:
            print(f"the type is {r.entity_type}, start is {r.start}, end is {r.end}")
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