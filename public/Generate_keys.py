from flask import Flask, request, jsonify



import hashlib
from hashlib import pbkdf2_hmac
import os

def derive_aes_key_from_counter(password: str, counter: int, salt: bytes, iterations: int = 100000, key_len: int = 32) -> bytes:
    password_bytes = password.encode()
    counter_bytes = counter.to_bytes(4, byteorder='big')  # 4 bytes, big-endian
    combined = password_bytes + counter_bytes  # Combine password and counter
    # Step 3: Use PBKDF2 with the combined input to generate an AES key
    aes_key = pbkdf2_hmac('sha256', combined, salt, iterations, dklen=key_len)
    return aes_key

# Step 4: Generate multiple keys by iterating through different counters
def generate_multiple_keys(password: str, num_keys: int, salt: bytes, iterations: int = 100000) -> list:
    keys = []
    
    # Step 5: Loop through counters and generate keys
    c=0
    for counter in range(num_keys):
        c=c+10
        aes_key = derive_aes_key_from_counter(password, c, salt, iterations)
        keys.append(aes_key.hex())
    
    return keys


# Step 6: Generate multiple AES keys


# # Step 7: Print keys in hexadecimal format for readability
# for idx, key in enumerate(keys, start=1):
#     print(f"Key {idx}:", key.hex())
    



app = Flask(__name__)

@app.route('/GenerateKeys', methods=['POST'])
def GenerateKeys():
    data = request.json  # Get JSON data from frontend
    password = data.get("text", "")  # Extract the number
    # Example Usage
    #password = "mypassword"  # The password you are using
    salt = b"my_fixed_salt_value"  # Fixed salt for PBKDF2 (can also be random in practice)
    num_keys = data.get("count",10)  # How many keys you want to generate
    keys = generate_multiple_keys(password, num_keys, salt)
    return jsonify({"result": keys})

if __name__ == '__main__':
    app.run(debug=True)