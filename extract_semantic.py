import json
import urllib.request
import os
from pathlib import Path

prompt_template = """You are a graphify extraction subagent. Read the files listed and extract a knowledge graph fragment.
Output ONLY valid JSON matching the schema below - no explanation, no markdown fences, no preamble.

Files (chunk {chunk_num} of {total_chunks}):
{files_content}

Rules:
- EXTRACTED: relationship explicit in source
- INFERRED: reasonable inference
- AMBIGUOUS: uncertain - flag for review

Code files: focus on semantic edges.
Doc/paper files: extract named concepts, entities, citations, rationale.

confidence_score is REQUIRED on every edge - never omit it, never use 0.5 as a default:
- EXTRACTED edges: confidence_score = 1.0 always
- INFERRED edges: 0.6-0.9
- AMBIGUOUS edges: 0.1-0.3

Output exactly this JSON (no other text):
{{"nodes":[{{"id":"filestem_entityname","label":"Human Readable Name","file_type":"document","source_file":"relative/path","source_location":null,"source_url":null,"captured_at":null,"author":null,"contributor":null}}],"edges":[{{"source":"node_id","target":"node_id","relation":"calls|implements|references|cites|conceptually_related_to|shares_data_with|semantically_similar_to|rationale_for","confidence":"EXTRACTED|INFERRED|AMBIGUOUS","confidence_score":1.0,"source_file":"relative/path","source_location":null,"weight":1.0}}],"hyperedges":[],"input_tokens":0,"output_tokens":0}}"""

uncached = Path("graphify-out/.graphify_uncached.txt").read_text().splitlines()
uncached = [u for u in uncached if u.strip()]

chunk_size = 25
chunks = [uncached[i:i+chunk_size] for i in range(0, len(uncached), chunk_size)]

for i, chunk in enumerate(chunks):
    print(f"Processing chunk {i+1}/{len(chunks)} with {len(chunk)} files...")
    files_content = ""
    for f in chunk:
        try:
            content = Path(f).read_text()
            files_content += f"\n--- {f} ---\n{content[:2000]}\n" # truncate to avoid huge context
        except Exception as e:
            print(f"Failed to read {f}: {e}")
            
    prompt = prompt_template.format(chunk_num=i+1, total_chunks=len(chunks), files_content=files_content)
    
    data = {
        "model": "gemma4-32k:latest",
        "prompt": prompt,
        "stream": False,
        "format": "json"
    }
    
    req = urllib.request.Request("http://localhost:11434/api/generate", data=json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode())
            out_json = result["response"]
            
            try:
                # Validate json
                parsed = json.loads(out_json)
                Path(f"graphify-out/.graphify_chunk_{i+1}.json").write_text(out_json)
                print(f"Chunk {i+1} saved.")
            except json.JSONDecodeError:
                print(f"Failed to decode JSON for chunk {i+1}")
                Path(f"graphify-out/.graphify_chunk_{i+1}.json").write_text('{"nodes":[], "edges":[]}')
    except Exception as e:
        print(f"Request failed: {e}")
        Path(f"graphify-out/.graphify_chunk_{i+1}.json").write_text('{"nodes":[], "edges":[]}')
