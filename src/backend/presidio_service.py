# presidio_service.py
from flask import Flask, request, jsonify
from presidio_analyzer import AnalyzerEngine, RecognizerRegistry
from presidio_analyzer.predefined_recognizers import PatternRecognizer
from presidio_analyzer import TextAnalyticsRecognizer, TextAnalyticsEntityCategory

import random, string
from presidio_anonymizer import AnonymizerEngine
from presidio_anonymizer.entities import OperatorConfig

app = Flask(__name__)

ta_entities = [
    TextAnalyticsEntityCategory(name="Location",
                                entity_type="LOCATION",
                                supported_languages=["en"]),
    TextAnalyticsEntityCategory(name="Address",
                                entity_type="MAILINGADDRESS",
                                supported_languages=["en"]),
    TextAnalyticsEntityCategory(name="URL",
                                entity_type="URL",
                                supported_languages=["en"]),
    TextAnalyticsEntityCategory(name="IP",
                            entity_type="IP",
                            supported_languages=["en"]),
]

text_analytics_recognizer = TextAnalyticsRecognizer(
    text_analytics_key="<YOUR_KEY>",
    text_analytics_endpoint="<YOUR_ENDPOINT>",
    text_analytics_categories=ta_entities,
)

registry = RecognizerRegistry()
# 先清空所有预置 Recognizer
registry.remove_all()
# 注册 Azure Text Analytics Recognizer
registry.add_recognizer(text_analytics_recognizer)
# 如果还想注册正则匹配（如身份证、邮箱等），可用 PatternRecognizer
"""
registry.add_recognizer(
    PatternRecognizer(
        supported_entity="ID_CARD",
        patterns=[{"name":"id_card","pattern": r"[1-9]\d{17}[\dXx]"}],
        context=[],
    )
)
"""
analyzer = AnalyzerEngine(registry=registry)
anonymizer = AnonymizerEngine()

# 默认脱敏策略：将检测到的敏感信息替换为同长度的“#”
def randomize_preserve(ch: str) -> str:
    if ch.isdigit():
        return random.choice(string.digits)
    if ch.isalpha():
        return random.choice(string.ascii_letters)
    return ch

def mask_random_chars(text: str) -> str:
    return "".join(randomize_preserve(c) for c in text)

# 注册自定义算子

# 用 Python 函数包装 OperatorConfig
class RandomMaskOperator(OperatorConfig):
    def __init__(self):
        super().__init__("custom", {"func": mask_random_chars})
anonymizer = AnonymizerEngine()

# 定义 default_ops
default_ops = {
    "DEFAULT": RandomMaskOperator(),
    "LOCATION": RandomMaskOperator(),
    "MAILINGADDRESS": RandomMaskOperator(),
    "URL": RandomMaskOperator(),
    "IP": RandomMaskOperator(),
}



default_ops = {
    "DEFAULT": OperatorConfig("mask", {"masking_char": "#", "chars_to_mask": 0}),
}

@app.route("/anonymize", methods=["POST"])
def anonymize():
    text = request.json.get("text", "")
    # 4. 检测
    results = analyzer.analyze(text=text, language="en")
    # 5. 脱敏
    anon = anonymizer.anonymize(text=text, analyzer_results=results, operators=default_ops)
    # 返回脱敏后文本和实体信息
    return jsonify({
        "text": anon.text,
        "entities": [
            {"type": r.entity_type, "start": r.start, "end": r.end, "original": text[r.start:r.end]}
            for r in results
        ]
    })

if __name__ == "__main__":
    app.run(port=5001)