
import json, ollama

with open('knowledge-base/QPM_Embedding_Chunks.json', encoding='utf-8') as f:
    chunks = json.load(f)

out = []
for c in chunks:
    text = f"{c['title']}\n{c['content']}"
    resp = ollama.embeddings(model='nomic-embed-text', prompt=text)
    out.append({**c, 'embedding': resp['embedding']})
    print(c['id'], 'OK')

with open('knowledge-base/QPM_Embeddings.json', 'w', encoding='utf-8') as f:
    json.dump(out, f, ensure_ascii=False)
