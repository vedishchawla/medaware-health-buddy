"""Training script for MedAware's symptom classifier.

This script fine-tunes the Bio_ClinicalBERT model on the SIDER dataset
for a single epoch (hackathon-friendly) and stores the resulting model
artifacts under ./ml/model so they can be consumed by the inference module.

Usage:
    python ml/train.py
"""

import json
import os
from pathlib import Path
from typing import Dict, List

import numpy as np
from datasets import load_dataset
from transformers import (
    AutoModelForSequenceClassification,
    AutoTokenizer,
    DataCollatorWithPadding,
    Trainer,
    TrainingArguments,
)
from sklearn.metrics import accuracy_score, f1_score


MODEL_NAME = "emilyalsentzer/Bio_ClinicalBERT"
ROOT_DIR = Path(__file__).resolve().parent
MODEL_DIR = ROOT_DIR / "model"
LABEL_MAP_PATH = MODEL_DIR / "label_map.json"


def _detect_text_column(columns: List[str]) -> str:
    """Best-effort detection of the text column in SIDER dataset."""
    candidates = ["text", "sentence", "description", "raw_text"]
    for cand in candidates:
        if cand in columns:
            return cand
    # Fallback to first column if nothing matches
    return columns[0]


def compute_metrics(eval_pred):
    """Compute accuracy and macro F1 for evaluation."""
    logits, labels = eval_pred
    preds = np.argmax(logits, axis=-1)
    return {
        "accuracy": accuracy_score(labels, preds),
        "f1_macro": f1_score(labels, preds, average="macro"),
    }


def main():
    print("Loading SIDER dataset...")
    # huggingface provides SIDER as a config within biomedical-ner dataset
    dataset = load_dataset("biomedical-ner", "sider")

    if "train" not in dataset:
        raise RuntimeError("SIDER dataset must contain a 'train' split.")

    train_dataset = dataset["train"]
    # Use validation if available; otherwise derive from train
    if "validation" in dataset:
        eval_dataset = dataset["validation"]
    elif "test" in dataset:
        eval_dataset = dataset["test"]
    else:
        split = train_dataset.train_test_split(test_size=0.1, seed=42)
        train_dataset = split["train"]
        eval_dataset = split["test"]

    # Build label maps
    label_values = sorted(set(train_dataset["label"]))
    label2id: Dict[str, int] = {label: idx for idx, label in enumerate(label_values)}
    id2label: Dict[int, str] = {idx: label for label, idx in label2id.items()}

    # Persist label map for inference
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    with LABEL_MAP_PATH.open("w", encoding="utf-8") as f:
        json.dump(id2label, f, indent=2)

    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    text_column = _detect_text_column(train_dataset.column_names)

    def preprocess_function(examples):
        texts = examples[text_column]
        tokenized = tokenizer(
            texts,
            truncation=True,
            max_length=256,
        )
        tokenized["labels"] = [label2id[label] for label in examples["label"]]
        return tokenized

    print("Tokenizing dataset...")
    tokenized_train = train_dataset.map(
        preprocess_function,
        batched=True,
        remove_columns=train_dataset.column_names,
    )
    tokenized_eval = eval_dataset.map(
        preprocess_function,
        batched=True,
        remove_columns=eval_dataset.column_names,
    )

    data_collator = DataCollatorWithPadding(tokenizer=tokenizer)

    model = AutoModelForSequenceClassification.from_pretrained(
        MODEL_NAME,
        num_labels=len(label2id),
        label2id=label2id,
        id2label=id2label,
        problem_type="single_label_classification",
    )

    training_args = TrainingArguments(
        output_dir=str(MODEL_DIR / "checkpoints"),
        num_train_epochs=1,
        per_device_train_batch_size=8,
        per_device_eval_batch_size=8,
        learning_rate=2e-5,
        weight_decay=0.01,
        evaluation_strategy="epoch",
        save_strategy="no",
        logging_steps=50,
        load_best_model_at_end=False,
        report_to="none",
    )

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=tokenized_train,
        eval_dataset=tokenized_eval,
        data_collator=data_collator,
        tokenizer=tokenizer,
        compute_metrics=compute_metrics,
    )

    print("Starting fine-tuning (1 epoch)...")
    trainer.train()
    print("Training complete. Saving artifacts...")

    trainer.save_model(str(MODEL_DIR))
    tokenizer.save_pretrained(str(MODEL_DIR))

    print(f"Model saved to {MODEL_DIR}")
    print("Training complete")


if __name__ == "__main__":
    main()

