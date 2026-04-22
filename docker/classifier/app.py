"""
Classifier service para as fotos da vó Jacinta.

Recebe uma imagem, devolve:
- category: uma das labels fixas (família, viagem, evento, retrato, escritório, paisagem, documento, outros)
- confidence: cosine similarity da melhor match (0.0–1.0)
- phash: perceptual hash de 64 bits em hex (16 chars) pra dedup

Estratégia: CLIP ViT-B/32 compara a imagem com um set de prompts em português
e inglês (mais preciso em inglês). A categoria com maior similaridade ganha.
"""

from __future__ import annotations

import io
import logging
import os

import imagehash
import torch
from fastapi import FastAPI, HTTPException, UploadFile, File
from PIL import Image
from transformers import CLIPModel, CLIPProcessor

logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO"))
log = logging.getLogger("classifier")

CATEGORY_PROMPTS = {
    "familia":    "a photo of a family gathering, wedding, birthday, relatives, or loved ones together",
    "viagem":     "a travel photo with landmarks, tourist attractions, buildings, or scenic places abroad",
    "evento":     "a photo of a formal event, graduation ceremony, party, celebration, or banquet",
    "retrato":    "a portrait or close-up photo of a single person posing",
    "escritorio": "a photo of an office, workplace, business meeting, desk, paperwork, or professional environment",
    "paisagem":   "a landscape photo of nature, mountains, beaches, forests, rivers, or scenery without people",
    "documento":  "a scanned document, certificate, letter, form, paper, or screenshot of text",
    "outros":     "a generic photo that does not fit any specific category",
}

MODEL_ID = os.getenv("CLIP_MODEL", "openai/clip-vit-base-patch32")

app = FastAPI(title="jstomm classifier")

_model: CLIPModel | None = None
_processor: CLIPProcessor | None = None
_text_features: torch.Tensor | None = None
_category_keys: list[str] = list(CATEGORY_PROMPTS.keys())


@app.on_event("startup")
def load_model() -> None:
    global _model, _processor, _text_features

    log.info("Loading CLIP model %s (this takes ~30s on first boot)", MODEL_ID)
    _model = CLIPModel.from_pretrained(MODEL_ID)
    _model.eval()
    _processor = CLIPProcessor.from_pretrained(MODEL_ID)

    # Pré-calcula embeddings das categorias (só roda uma vez no boot)
    prompts = [CATEGORY_PROMPTS[k] for k in _category_keys]
    with torch.no_grad():
        inputs = _processor(text=prompts, return_tensors="pt", padding=True)
        _text_features = _model.get_text_features(**inputs)
        _text_features = _text_features / _text_features.norm(dim=-1, keepdim=True)

    log.info("Model loaded. Ready.")


@app.get("/health")
def health() -> dict[str, str | bool]:
    return {"ok": _model is not None, "model": MODEL_ID}


@app.get("/categories")
def categories() -> dict[str, list[str]]:
    return {"categories": _category_keys}


@app.post("/classify")
async def classify(file: UploadFile = File(...)) -> dict:
    if _model is None or _processor is None or _text_features is None:
        raise HTTPException(status_code=503, detail="Model not loaded yet")

    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Empty file")

    try:
        img = Image.open(io.BytesIO(data)).convert("RGB")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image: {e}")

    # Perceptual hash — baratíssimo, usamos pra dedup depois
    phash = str(imagehash.phash(img))  # 16 chars hex

    # CLIP inference
    with torch.no_grad():
        inputs = _processor(images=img, return_tensors="pt")
        image_features = _model.get_image_features(**inputs)
        image_features = image_features / image_features.norm(dim=-1, keepdim=True)

        # Cosine similarity contra cada categoria
        sims = (image_features @ _text_features.T).squeeze(0)  # type: ignore[operator]
        probs = torch.softmax(sims * 100, dim=-1)  # temperatura típica do CLIP

        best_idx = int(probs.argmax())
        confidence = float(probs[best_idx])

    category = _category_keys[best_idx]

    return {
        "category": category,
        "confidence": round(confidence, 4),
        "phash": phash,
    }


@app.post("/phash")
async def phash_only(file: UploadFile = File(...)) -> dict:
    """Só o perceptual hash — para dedup rápido sem carregar CLIP."""
    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Empty file")
    try:
        img = Image.open(io.BytesIO(data)).convert("RGB")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image: {e}")

    return {"phash": str(imagehash.phash(img))}
