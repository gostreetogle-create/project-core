#!/usr/bin/env python3
"""seed_chromadb.py — Load база-знаний/извлечённое/*.md into ChromaDB."""

import chromadb
import os
import re
import sys
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
EXTRACTED = BASE / "база-знаний" / "извлечённое"
CHROMA_DIR = BASE / "база-знаний" / "chroma_db"

client = chromadb.PersistentClient(path=str(CHROMA_DIR))

try:
    client.delete_collection("project_brain")
except Exception:
    pass

collection = client.create_collection(
    name="project_brain",
    metadata={"hnsw:space": "cosine"}
)

def parse_md_sections(text: str) -> dict:
    sections = {}
    lines = text.split('\n')
    current_section = 'header'
    current_content = []
    for line in lines:
        if line.startswith('## '):
            if current_content:
                sections[current_section] = '\n'.join(current_content).strip()
            current_section = line[3:].strip()
            current_content = []
        else:
            current_content.append(line)
    if current_content:
        sections[current_section] = '\n'.join(current_content).strip()
    return sections

# Index root-level markdown files too
root_md_files = [
    BASE / "AGENTS.md",
    BASE / "README.md",
    BASE / "CHANGELOG.md",
    BASE / "протокол-сессии.md",
]
root_md_files = [f for f in root_md_files if f.exists()]

md_files = sorted(EXTRACTED.glob("*.md")) + root_md_files
ids = []
documents = []
metadatas = []

for md_file in md_files:
    project_name = md_file.stem if md_file.parent == EXTRACTED else f"root__{md_file.stem}"
    text = md_file.read_text(encoding="utf-8")
    sections = parse_md_sections(text)

    # Add full document
    safe_id = re.sub(r'[^a-zA-Z0-9_-]', '_', f"{project_name}__full")[:64]
    ids.append(safe_id)
    documents.append(text[:5000])
    metadatas.append({
        "project": project_name,
        "type": "full",
        "language": "typescript",
        "tags": "project-brain,knowledge-base"
    })

    for section_name, content in sections.items():
        if len(content) > 50:
            safe_section = re.sub(r'[^a-zA-Z0-9_-]', '_', section_name[:30])[:30]
            section_id = re.sub(r'[^a-zA-Z0-9_-]', '_', f"{project_name}__{safe_section}")[:64]
            ids.append(section_id)
            documents.append(content[:2000])

            doc_type = "finding"
            sn = section_name.lower()
            if "технологи" in sn or "technology" in sn or "архитектур" in sn or "architecture" in sn:
                doc_type = "architecture"
            elif "цель" in sn or "намерени" in sn:
                doc_type = "intention"
            elif "слои" in sn or "стандарт" in sn or "правил" in sn:
                doc_type = "rule"
            elif "структур" in sn or "ui kit" in sn or "компонент" in sn:
                doc_type = "structure"
            elif "запуск" in sn or "деплой" in sn or "deploy" in sn:
                doc_type = "devops"
            elif "база" in sn or "chromadb" in sn or "векторн" in sn:
                doc_type = "vector_db"
            elif "создание" in sn or "нового" in sn:
                doc_type = "process"
            elif "бизнес" in sn or "logic" in sn:
                doc_type = "business"

            metadatas.append({
                "project": project_name,
                "type": doc_type,
                "language": "typescript",
                "tags": f"{project_name},{doc_type}"
            })

batch_size = 10
for i in range(0, len(ids), batch_size):
    collection.add(
        ids=ids[i:i+batch_size],
        documents=documents[i:i+batch_size],
        metadatas=metadatas[i:i+batch_size]
    )

sys.stdout.reconfigure(encoding='utf-8')
print(f"[OK] ChromaDB seeded: {len(ids)} documents from {len(md_files)} files")
print(f"     Location: {CHROMA_DIR}")
print(f"     Collections: {[c.name for c in client.list_collections()]}")
