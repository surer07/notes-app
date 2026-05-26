import os
from flask import Flask, request, jsonify
import boto3
from botocore.client import Config
import search_engine
import jwt
from functools import wraps
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "http://localhost:3000",
            "http://client:3000"
        ],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# 1. Configure RustFS S3 Connection
RUSTFS_ENDPOINT = os.getenv("RUSTFS_ENDPOINT", "http://rustfs:9000")
BUCKET_NAME = "user-notes"

s3_client = boto3.client(
    's3',
    endpoint_url=RUSTFS_ENDPOINT,
    aws_access_key_id=os.getenv("RUSTFS_ROOT_USER", "admin"),
    aws_secret_access_key=os.getenv("RUSTFS_ROOT_PASSWORD", "supersecretpassword"),
    config=Config(signature_version='s3v4'),
    region_name='us-east-1'
)

# --- AUTO-INITIALIZE S3 BUCKET ---
try:
    s3_client.head_bucket(Bucket=BUCKET_NAME)
    print(f"S3 Bucket '{BUCKET_NAME}' verified.")
except Exception:
    print(f"Bucket '{BUCKET_NAME}' not found. Creating it now...")
    try:
        s3_client.create_bucket(Bucket=BUCKET_NAME)
        print(f"Bucket '{BUCKET_NAME}' created successfully.")
    except Exception as e:
        print(f"Failed to auto-create bucket: {str(e)}")
# ---------------------------------

# 2. Configure Search Index
INDEX_DIR = "/app/search_indexes"
if not os.path.exists(INDEX_DIR):
    os.mkdir(INDEX_DIR)

engine = search_engine.Search_engine()

ACCESS_TOKEN_SECRET = os.getenv("ACCESS_TOKEN_SECRET", "your_jwt_signing_key_here")

def authenticate_token(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({"error": "Unauthorized: Missing Token"}), 401
            
        try:
            token = auth_header.split(' ')[1]
            user_data = jwt.decode(token, ACCESS_TOKEN_SECRET, algorithms=['HS256'])
            request.user = user_data
            
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Forbidden: Token has expired"}), 403
        except jwt.InvalidTokenError:
            return jsonify({"error": "Forbidden: Invalid Token"}), 403

        return f(*args, **kwargs)
    return decorated

# API Route: Save Note
@app.route('/api/notes/', methods=['POST'])
@authenticate_token
def save_note():
    data = request.json or {}
    user_id = request.user.get('id')
    note_id = data.get('note_id')
    
    # Handle optional content keys safely
    new_content = data.get('new_content') or ''
    old_content = data.get('old_content') or ''
    
    file_key = f"{user_id}/{note_id}.md"

    try:
        s3_client.put_object(
            Bucket=BUCKET_NAME,
            Key=file_key,
            Body=new_content,
            ContentType='text/markdown'
        )
        user_index_path = os.path.join(INDEX_DIR, f"user_{user_id}")
        engine.set_index_loc(user_index_path)
        engine.update_index(note_id, old_content, new_content)

        return jsonify({"message": "Note saved and indexed successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 4. API Route: Search Engine
@app.route('/api/notes/search', methods=['GET'])
@authenticate_token
def search_notes():
    user_id = request.user.get('id')
    query_string = request.args.get('q', '')

    if not query_string:
        return jsonify({"results": []}), 200

    user_index_path = os.path.join(INDEX_DIR, f"user_{user_id}")
    engine.set_index_loc(user_index_path)
    results_list = engine.search_query(query_string)

    return jsonify({"results": results_list})


# 5. API Route: Serve View Content
@app.route('/api/notes/<note_id>', methods=['GET'])
@authenticate_token
def get_note(note_id):
    user_id = request.user.get('id')
    file_key = f"{user_id}/{note_id}.md"
    try:
        response = s3_client.get_object(Bucket=BUCKET_NAME, Key=file_key)
        markdown_text = response['Body'].read().decode('utf-8')
        return jsonify({"note_id": note_id, "content": markdown_text})
    except Exception as e:
        return jsonify({"error": "Note not found"}), 404


# 6. API Route: List all Note IDs
@app.route('/api/notes/', methods=['GET'])
@authenticate_token
def list_note_ids():
    user_id = request.user.get('id')
    prefix = f"{user_id}/"
    
    try:
        response = s3_client.list_objects_v2(
            Bucket=BUCKET_NAME,
            Prefix=prefix
        )
        
        note_ids = []
        if 'Contents' in response:
            for obj in response['Contents']:
                key = obj['Key']
                filename = key.replace(prefix, "")
                if filename.endswith(".md"):
                    note_id = filename.replace(".md", "")
                    note_ids.append(note_id)
                    
        return jsonify({"note_ids": note_ids}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)