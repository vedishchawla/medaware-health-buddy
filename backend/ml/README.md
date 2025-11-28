# ML Module - Symptom Classifier

## Overview

This module provides ClinicalBERT-based symptom classification for the MedAware application. It uses the pretrained `emilyalsentzer/Bio_ClinicalBERT` model from HuggingFace to classify user symptom descriptions into predefined categories.

## Structure

```
ml/
├── __init__.py
├── symptom_classifier.py    # Main classifier module
├── symptom_labels.json      # Label mappings
└── README.md                # This file
```

## Features

- **ClinicalBERT Integration**: Uses Bio_ClinicalBERT for medical text understanding
- **10 Symptom Categories**: Classifies into predefined symptom types
- **CPU Support**: Runs on CPU (no GPU required)
- **Lazy Loading**: Model loads only once and is cached
- **Keyword Fallback**: Falls back to keyword matching if model fails

## Usage

### Basic Classification

```python
from ml.symptom_classifier import classify_symptom

# Classify a symptom
prediction = classify_symptom("I feel very dizzy and my head is spinning")
print(prediction)  # Output: "Dizziness"
```

### Using the Service Layer

```python
from services.symptom_service import analyze_user_symptom

result = analyze_user_symptom("user123", "I have a severe headache")
print(result["prediction"])  # Output: "Headache"
```

## Symptom Labels

The classifier supports 10 symptom categories:

1. Headache
2. Nausea
3. Dizziness
4. Fatigue
5. Stomach Pain
6. Cough
7. Fever
8. Muscle Pain
9. Rash
10. Chest Pain

Labels are defined in `symptom_labels.json`.

## Model Details

- **Model**: `emilyalsentzer/Bio_ClinicalBERT`
- **Framework**: PyTorch + Transformers
- **Device**: CPU
- **Max Length**: 512 tokens
- **Classification**: Single-label classification (10 classes)

## Installation

Install required dependencies:

```bash
pip install torch transformers sentencepiece protobuf
```

Or install all requirements:

```bash
pip install -r requirements.txt
```

## First Run

On first run, the model will be downloaded from HuggingFace (approximately 400MB). This may take a few minutes depending on your internet connection.

## Performance Notes

⚠️ **Important**: The model uses a randomly initialized classification head. For production use, the model should be fine-tuned on symptom classification data. Current accuracy may be limited.

For better accuracy:
1. Collect labeled symptom data
2. Fine-tune the model on your dataset
3. Replace the classification head with the fine-tuned version

## Testing

Run the test suite:

```bash
python test_symptom_classifier.py
```

## Error Handling

The module includes:
- Input validation
- Model loading error handling
- Keyword-based fallback classification
- Clear error messages

## Future Improvements

- Fine-tune model on symptom dataset
- Add confidence scores
- Support for multi-label classification
- GPU acceleration support
- Model versioning
- Batch processing support

