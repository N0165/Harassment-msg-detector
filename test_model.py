"""Check the DistilBERT harassment model with PyTorch.

Quick sanity test (10 messages):
    python test_model.py

Accuracy on your own CSV (use a test split the model never trained on):
    python test_model.py data.csv text_column label_column
    e.g. python test_model.py tweets_test.csv tweet label
"""
import sys

import torch
from transformers import AutoModelForSequenceClassification, AutoTokenizer

# Folder that holds model.safetensors, config.json, tokenizer.json ...
# Change this if your folder has a different name or location.
MODEL_DIR = "old-model"

tokenizer = AutoTokenizer.from_pretrained(MODEL_DIR)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_DIR)
model.eval()


def predict_probs(texts, batch_size=32):
    """Returns a list of [P(label 0), P(label 1)] for each text."""
    out = []
    for i in range(0, len(texts), batch_size):
        batch = texts[i : i + batch_size]
        enc = tokenizer(batch, return_tensors="pt", truncation=True, max_length=128, padding=True)
        with torch.no_grad():
            probs = torch.softmax(model(**enc).logits, dim=-1)
        out.extend(probs.tolist())
    return out


def sanity_test():
    abusive = [
        "You are a worthless idiot and nobody likes you",
        "I will find you and hurt you",
        "Go kill yourself, loser",
        "You're so ugly and stupid, shut up",
        "Nobody wants you here, you disgusting freak",
    ]
    friendly = [
        "Thanks so much for your help, have a great day!",
        "The meeting is at 3pm tomorrow in the main office",
        "I loved this movie, the acting was wonderful",
        "Congratulations on your promotion, well deserved",
        "This weather is lovely today",
    ]
    pa = predict_probs(abusive)
    pf = predict_probs(friendly)
    print("ABUSIVE messages:")
    for t, p in zip(abusive, pa):
        print(f"  P(0)={p[0]:.3f}  P(1)={p[1]:.3f} | {t}")
    print("FRIENDLY messages:")
    for t, p in zip(friendly, pf):
        print(f"  P(0)={p[0]:.3f}  P(1)={p[1]:.3f} | {t}")

    mean_a = sum(p[1] for p in pa) / len(pa)
    mean_f = sum(p[1] for p in pf) / len(pf)
    print(f"\nAverage P(1): abusive = {mean_a:.3f}, friendly = {mean_f:.3f}")
    gap = mean_a - mean_f
    if abs(gap) < 0.15:
        print("RESULT: the model barely separates abusive from friendly text.")
    elif gap > 0:
        print("RESULT: the model works. Label 1 = harassment.")
    else:
        print("RESULT: the model works, but the labels are flipped. Label 0 = harassment.")


def evaluate_csv(path, text_col, label_col):
    import pandas as pd

    df = pd.read_csv(path).dropna(subset=[text_col, label_col])
    print("Label values found in your CSV:", sorted(df[label_col].unique().tolist())[:10])
    if not set(df[label_col].astype(str).unique()) <= {"0", "1"}:
        print("This script needs labels that are only 0 and 1. Convert your labels first.")
        return
    texts = df[text_col].astype(str).tolist()
    y = df[label_col].astype(int).tolist()
    print(f"Scoring {len(texts)} rows (this can take a few minutes on CPU)...")
    probs = predict_probs(texts)
    pred = [1 if p[1] >= 0.5 else 0 for p in probs]

    tp = sum(1 for a, b in zip(y, pred) if a == 1 and b == 1)
    fp = sum(1 for a, b in zip(y, pred) if a == 0 and b == 1)
    fn = sum(1 for a, b in zip(y, pred) if a == 1 and b == 0)
    acc = sum(1 for a, b in zip(y, pred) if a == b) / len(y)
    prec = tp / (tp + fp) if tp + fp else 0.0
    rec = tp / (tp + fn) if tp + fn else 0.0
    f1 = 2 * prec * rec / (prec + rec) if prec + rec else 0.0
    base = max(y.count(0), y.count(1)) / len(y)
    print(f"\nAccuracy : {acc:.4f}")
    print(f"Precision: {prec:.4f}   Recall: {rec:.4f}   F1: {f1:.4f}   (label 1 = harassment)")
    print(f"Accuracy of always guessing the bigger class: {base:.4f}")
    if acc < 0.5:
        print("Accuracy is below 50%, so the labels may be flipped (0 and 1 swapped).")


if __name__ == "__main__":
    if len(sys.argv) == 4:
        evaluate_csv(sys.argv[1], sys.argv[2], sys.argv[3])
    else:
        sanity_test()