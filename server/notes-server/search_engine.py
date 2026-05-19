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

    def _hash_term(self, term:str, length=6):
        term = term.encode('ascii', errors='ignore')
        hashed = hashlib.md5(term).hexdigest()
        return hashed[:length]

    def _tokenize(self, content:str, is_set=False):
        mapping = str.maketrans("", "", self.punctuations)
        cleaned_text = content.translate(mapping).lower()
        tokens = cleaned_text.split()
        min_gram = 3
        max_gram = 6
        terms = {}
        for position, token in enumerate(tokens):
            for window_length in range(min_gram, min(max_gram, len(token) + 1)):
                gram = token[:window_length]
                terms.setdefault(gram, set([]))
                terms[gram].add(position)
        return terms, len(tokens)

    def set_index_loc(self, dir_path:str):
        self.index_path = Path(f"{dir_path}/index")
        self.index_path.mkdir(parents=True, exist_ok=True)
        self.files_info_path = Path(f"{dir_path}/files_info")
        self.files_info_path.mkdir(parents=True, exist_ok=True)

        info_file = Path(f"{self.files_info_path}/files_info.json")
        if not info_file.is_file():
            with open(info_file, "w") as f:
                json.dump({}, f, indent=4)


    def index_file(self, id:str, content:str):
        tokens, doc_length = self._tokenize(content)
        with open(f"{self.files_info_path}/files_info.json", "r") as f:
            files_info_data = json.load(f)
        files_info_data[id] = doc_length
        with open(f"{self.files_info_path}/files_info.json", "w") as f:
            json.dump(files_info_data, f, indent=4)
        for token, values in tokens.items():
            values = list(values)
            hash = self._hash_term(token)
            if Path(f"{self.index_path}/{hash}.json").is_file():
                with open(f"{self.index_path}/{hash}.json", "r") as f:
                    loaded_data = json.load(f)
                if token not in loaded_data:
                    loaded_data[token] = {}
                loaded_data[token][id] = values
                with open(f"{self.index_path}/{hash}.json", "w") as f:
                    json.dump(loaded_data, f, indent=4)
            else:
                with open(f"{self.index_path}/{hash}.json", "w") as f:
                    data = {token: {id: values}}
                    json.dump(data, f, indent=4)

    def  update_index(self, id:str, old_content:str, new_content:str):
        old_tokens, _ = self._tokenize(old_content)
        for token in old_tokens:
            hash = self._hash_term(token)
            with open(f"{self.index_path}/{hash}.json", "r") as f:
                loaded_data = json.load(f)
            popped_data = loaded_data[token].pop(id)
            print(popped_data)
            with open(f"{self.index_path}/{hash}.json", "w") as f:
                json.dump(loaded_data, f, indent=4)
        self.index_file(id, new_content)

    def search_query(self, query:str):
        query_tokens, _ = self._tokenize(query, is_set=True)
        #token and files that have it
        files_data = {}
        files_scores = {}

        for token in query_tokens:
            hash = self._hash_term(token)
            if Path(f"{self.index_path}/{hash}.json").is_file():
                with open(f"{self.index_path}/{hash}.json", "r") as f:
                    loaded_data = json.load(f)
                if token in loaded_data:
                    files_data[token] = loaded_data[token]

        with open(f"{self.files_info_path}/files_info.json", "r") as f:
                files_info_data = json.load(f)

        for token, files in files_data.items():
            for id, positions in files_data[token].items():
                doc_length = files_info_data[id]
                tf = len(positions) / doc_length
                idf = math.log(len(files_info_data) / len(files))  
                tf_idf = tf * idf
                if not id in files_scores:
                    files_scores[id] = tf_idf
                else:
                    files_scores[id] += tf_idf

        sorted_scores = dict(sorted(files_scores.items(), key=lambda item: item[1], reverse=True))

        return sorted_scores.keys()
                
