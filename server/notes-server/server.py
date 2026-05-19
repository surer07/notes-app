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

# 2. Configure Search Index
INDEX_DIR = "search_indexes"
if not os.path.exists(INDEX_DIR):
    os.mkdir(INDEX_DIR)

engine = search_engine.Search_engine()

ACCESS_TOKEN_SECRET = os.getenv("ACCESS_TOKEN_SECRET", "your_jwt_signing_key_here")

def authenticate_token(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        
        # Check if header exists and starts with 'Bearer '
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({"error": "Unauthorized: Missing Token"}), 401
            
        try:
            token = auth_header.split(' ')[1]
            # Decode the token (automatically checks expiration)
            user_data = jwt.decode(token, ACCESS_TOKEN_SECRET, algorithms=['HS256'])
            
            # Attach the user data to the request object (similar to req.user = user)
            request.user = user_data
            
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Forbidden: Token has expired"}), 403
        except jwt.InvalidTokenError:
            return jsonify({"error": "Forbidden: Invalid Token"}), 403

        return f(*args, **kwargs)
    return decorated

# 3. API Route: Save Note (Write to RustFS + Index for Search)
@app.route('/api/notes', methods=['POST'])
@authenticate_token
def save_note():
    data = request.json
    user_id = request.user.get('id')
    note_id = data.get('note_id')
    new_content = data.get('new_content')
    old_content = data.get('old_content')
    file_key = f"{user_id}/{note_id}.md"

    try:
        # Step A: Save raw markdown file to RustFS
        s3_client.put_object(
            Bucket=BUCKET_NAME,
            Key=file_key,
            Body=new_content,
            ContentType='text/markdown'
        )

        engine.set_index_loc(f"./{INDEX_DIR}/user_{user_id}")

        engine.update_index(note_id, old_content, new_content)

        return jsonify({"message": "Note saved and indexed successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# 4. API Route: Serve View Content (For Webpage Display)
@app.route('/api/notes/<note_id>', methods=['GET'])
@authenticate_token
def get_note(note_id):
    user_id = request.user('id')
    file_key = f"{user_id}/{note_id}.md"
    try:
        response = s3_client.get_object(Bucket=BUCKET_NAME, Key=file_key)
        markdown_text = response['Body'].read().decode('utf-8')
        return jsonify({"note_id": note_id, "content": markdown_text})
    except Exception as e:
        return jsonify({"error": "Note not found"}), 404


# 5. API Route: Search Engine
@app.route('/api/search', methods=['GET'])
@authenticate_token
def search_notes():
    user_id = request.user.get('id')
    query_string = request.args.get('q')

    if not query_string or not user_id:
        return jsonify({"error": "Missing query parameter 'q' or 'user_id'"}), 400

    engine.set_index_loc(f"./{INDEX_DIR}/user_{user_id}")

    results_list = engine.search_query(query_string)

    return jsonify({"results": results_list})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)