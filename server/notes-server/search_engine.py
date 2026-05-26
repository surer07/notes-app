from pathlib import Path
import json
import hashlib
import math

class Search_engine:
    def __init__(self):
        self.stopwords = [
            "i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your", 
            "yours", "yourself", "yourselves", "he", "him", "his", "himself", "she", 
            "her", "hers", "herself", "it", "its", "itself", "they", "them", "their", 
            "theirs", "themselves", "what", "which", "who", "whom", "this", "that", 
            "these", "those", "am", "is", "are", "was", "were", "be", "been", "being", 
            "have", "has", "had", "having", "do", "does", "did", "doing", "a", "an", 
            "the", "and", "but", "if", "or", "because", "as", "until", "while", "of", 
            "at", "by", "for", "with", "about", "against", "between", "into", "through", 
            "during", "before", "after", "above", "below", "to", "from", "up", "down", 
            "in", "out", "on", "off", "over", "under", "again", "further", "then", 
            "once", "here", "there", "when", "where", "why", "how", "all", "any", 
            "both", "each", "few", "more", "most", "other", "some", "such", "no", 
            "nor", "not", "only", "own", "same", "so", "than", "too", "very", 
            "s", "t", "can", "will", "just", "don", "should", "now"
        ]
        self.punctuations = '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~'
        self.index_path = None
        self.files_info_path = None

    def _hash_term(self, term: str, length=6):
        term = term.encode('ascii', errors='ignore')
        hashed = hashlib.md5(term).hexdigest()
        return hashed[:length]

    def _tokenize(self, content: str, is_set=False):
        # Remove punctuation and lowercase
        mapping = str.maketrans("", "", self.punctuations)
        cleaned_text = content.translate(mapping).lower()
        tokens = cleaned_text.split()
        
        # Optionally filter stopwords (not in original, but good practice)
        # tokens = [t for t in tokens if t not in self.stopwords]
        
        if is_set:
            # Return dict with dummy empty sets to keep return type (dict, int)
            return {token: set() for token in set(tokens)}, len(tokens)
        else:
            # For indexing: store positions of each full word
            terms = {}
            for pos, token in enumerate(tokens):
                terms.setdefault(token, set()).add(pos)
            return terms, len(tokens)

    def set_index_loc(self, dir_path: str):
        self.index_path = Path(f"{dir_path}/index")
        self.index_path.mkdir(parents=True, exist_ok=True)
        self.files_info_path = Path(f"{dir_path}/files_info")
        self.files_info_path.mkdir(parents=True, exist_ok=True)

        info_file = Path(f"{self.files_info_path}/files_info.json")
        if not info_file.is_file():
            with open(info_file, "w") as f:
                json.dump({}, f, indent=4)

    def index_file(self, id: str, content: str):
        if self.index_path is None or self.files_info_path is None:
            raise RuntimeError("Call set_index_loc first")
        
        # Check for duplicate indexing
        with open(f"{self.files_info_path}/files_info.json", "r") as f:
            files_info_data = json.load(f)
        if id in files_info_data:
            raise ValueError(f"Document '{id}' already indexed. Use update_index or delete first.")
        
        tokens, doc_length = self._tokenize(content)
        
        # Save document length
        files_info_data[id] = doc_length
        with open(f"{self.files_info_path}/files_info.json", "w") as f:
            json.dump(files_info_data, f, indent=4)
        
        # Add to inverted index
        for token, positions in tokens.items():
            positions_list = list(positions)
            token_hash = self._hash_term(token)
            file_path = self.index_path / f"{token_hash}.json"
            
            if file_path.is_file():
                with open(file_path, "r") as f:
                    loaded_data = json.load(f)
            else:
                loaded_data = {}
            
            if token not in loaded_data:
                loaded_data[token] = {}
            loaded_data[token][id] = positions_list
            
            with open(file_path, "w") as f:
                json.dump(loaded_data, f, indent=4)

    def update_index(self, id: str, old_content: str, new_content: str):
        self.delete_file_index(id, old_content)
        self.index_file(id, new_content)

    def delete_file_index(self, id: str, content: str):
        if self.index_path is None:
            raise RuntimeError("Call set_index_loc first")
            
        tokens, _ = self._tokenize(content)
        for token in tokens:
            token_hash = self._hash_term(token)
            file_path = self.index_path / f"{token_hash}.json"
            if not file_path.is_file():
                continue
                
            with open(file_path, "r") as f:
                loaded_data = json.load(f)
            
            # Remove id from this token if present
            if token in loaded_data and id in loaded_data[token]:
                del loaded_data[token][id]
                
                # Clean up empty token entry
                if not loaded_data[token]:
                    del loaded_data[token]
                    
                # Write back or delete file if empty
                if loaded_data:
                    with open(file_path, "w") as f:
                        json.dump(loaded_data, f, indent=4)
                else:
                    file_path.unlink()  # remove empty index file
        
        # Remove document length from files_info
        info_path = self.files_info_path / "files_info.json"
        if info_path.is_file():
            with open(info_path, "r") as f:
                files_info = json.load(f)
            if id in files_info:
                del files_info[id]
                with open(info_path, "w") as f:
                    json.dump(files_info, f, indent=4)

    def search_query(self, query: str):
        if self.index_path is None or self.files_info_path is None:
            raise RuntimeError("Call set_index_loc first")
            
        query_tokens, _ = self._tokenize(query, is_set=True)
        files_data = {}      # token -> {id: positions}
        files_scores = {}
        
        # Gather inverted entries for all query tokens
        for token in query_tokens:
            token_hash = self._hash_term(token)
            file_path = self.index_path / f"{token_hash}.json"
            if file_path.is_file():
                with open(file_path, "r") as f:
                    loaded_data = json.load(f)
                if token in loaded_data:
                    files_data[token] = loaded_data[token]
        
        # Load document lengths
        with open(f"{self.files_info_path}/files_info.json", "r") as f:
            files_info_data = json.load(f)
        
        total_docs = len(files_info_data)
        if total_docs == 0:
            return []
        
        # Compute TF-IDF for each document
        for token, doc_dict in files_data.items():
            # number of documents containing this token
            doc_freq = len(doc_dict)
            idf = math.log(total_docs / doc_freq) if doc_freq > 0 else 0
            
            for doc_id, positions in doc_dict.items():
                doc_len = files_info_data.get(doc_id)
                if doc_len is None:  # should not happen, but be safe
                    continue
                tf = len(positions) / doc_len
                tf_idf = tf * idf
                files_scores[doc_id] = files_scores.get(doc_id, 0) + tf_idf
        
        sorted_scores = dict(sorted(files_scores.items(), key=lambda item: item[1], reverse=True))
        return list(sorted_scores.keys())