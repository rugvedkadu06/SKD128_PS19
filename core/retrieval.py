import numpy as np
from scipy.spatial.distance import cosine

def cosine_sim(a, b):
    return 1 - cosine(a, b)

def retrieve_chunks(query_vec, chunks, top_k=5):
    scores = []
    for c in chunks:
        # cosine distance returns 0 for exact match, 1 for orthogonal
        # similarity is 1 - distance
        similarity = cosine_sim(query_vec, c["emb"])
        scores.append((similarity, c))
    
    scores.sort(key=lambda x: -x[0])
    return [c for _, c in scores[:top_k]]
