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
    "familia":    "a family photo with multiple people together, a wedding couple, a bride and groom, parents and children, siblings, relatives hugging, a family reunion or household gathering",
    "viagem":     "a travel or tourism photo showing famous landmarks, monuments, foreign cities, beaches abroad, vacation scenery, or people posing in front of tourist attractions",
    "evento":     "a formal celebration event: graduation ceremony receiving a diploma, birthday party with cake, wedding reception, banquet, anniversary, or ceremonial gathering with decorations",
    "retrato":    "a close-up portrait of one single person alone, facing the camera, head and shoulders framed, studio-style solo photo",
    "escritorio": "an office or workplace scene: business building facade with a company sign, professional desk with computers, meeting room, paperwork environment, or commercial storefront",
    "paisagem":   "a pure landscape or nature scene with no people: mountains, beaches, forests, rivers, sky, sunset, plants, or wildlife",
    "documento":  "a plain scanned document, certificate paper, printed letter, form, receipt, ID card, or a screenshot containing mostly text",
    "outros":     "a generic personal photo that does not clearly fit other categories",
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
