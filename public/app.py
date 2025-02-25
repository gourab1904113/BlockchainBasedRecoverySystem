from flask import Flask, request, jsonify
from sympy import symbols, Eq, solve
from flask_cors import CORS

import hashlib
from hashlib import pbkdf2_hmac

from Crypto.Cipher import AES
from Crypto.Util.Padding import pad
from Crypto.Util.Padding import unpad
import binascii
import os
import random
from typing import List, Tuple



iv = b'16ByteFixedIV123'  # 16 bytes

def encryption_data(plaintext: str, key_hex: hex):
    key = binascii.unhexlify(key_hex)  
    plaintext_bytes = plaintext.encode() 
    padded_plaintext = pad(plaintext_bytes, AES.block_size)
    cipher = AES.new(key, AES.MODE_CBC, iv) 
    ciphertext = cipher.encrypt(padded_plaintext) 
    return ciphertext.hex()


def decryption_data(ciphertext:str,key_hex:hex):
    # Convert key and IV from hex string to bytes
    key = binascii.unhexlify(key_hex)
    # Convert ciphertext from hex string to bytes
    ciphertext_bytes = binascii.unhexlify(ciphertext)
    # Create AES cipher in CBC mode
    cipher_dec = AES.new(key, AES.MODE_CBC, iv)
    # Perform decryption
    decrypted_padded = cipher_dec.decrypt(ciphertext_bytes)
    # Unpad and decode
    decrypted_text = unpad(decrypted_padded, AES.block_size).decode('utf-8')
    return decrypted_text

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


# Function to generate a random polynomial
def generate_coefficients(secret: int, threshold: int) -> List[int]:
    coefficients = [secret]
    for _ in range(threshold - 1):
        coefficients.append(random.randint(1, 256))
    return coefficients

# Function to create shares
def create_shares(
    secret: int, total_shares: int, threshold: int
) -> List[Tuple[int, int]]:
    coefficients = generate_coefficients(secret, threshold)
    shares = []
    for x in range(1, total_shares + 1):
        y = sum(coeff * (x**exp) for exp, coeff in enumerate(coefficients))
        shares.append((x, str(y)))
    return shares

def reconstruct_secret(shares):
    x = symbols('x')
    secret = 0
    for i, (xi, yi) in enumerate(shares):
        term = yi
        for j, (xj, _) in enumerate(shares):
            if i != j:
                term *= (x - xj) / (xi - xj)
        secret += term
    return secret.subs(x, 0)


def process_input(input_data):
    lines = input_data.splitlines()
    pairs = []
    for line in lines:
    # Split the line by spaces
        parts = line.split()
        if len(parts) == 2:
            # Convert the parts to integers and store as a tuple
            index, value = int(parts[0]), int(parts[1])
            pairs.append((index, value))
        else:
            print(f"Skipping invalid line: {line}")
    return pairs

app = Flask(__name__)
CORS(app)


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


@app.route('/Encryption', methods=['POST'])
def Encryption():
    data = request.json  # Get JSON data from frontend
    raw = data.get("text", "")  # Extract the number
    key = data.get("key","")  # How many keys you want to generate
    res = encryption_data(raw,key)
    return jsonify({"result": res})


@app.route('/Decryption', methods=['POST'])
def Decryption():
    data = request.json 
    raw = data.get("text", "").strip()# Ciphertext in hex
    key = data.get("key","").strip()
    res = decryption_data(raw,key)
    return jsonify({"result": res})



@app.route('/GenerateShare', methods=['POST'])
def GenerateShare():
    data = request.json  # Get JSON data from frontend
    text = data.get("text", "")  # Extract the number
    secret = int(text , 16)
  
    total_shares= data.get("count",10)  
    threshold = data.get("mincount",10)  
    shares = create_shares(secret, total_shares, threshold)
    return jsonify({"result": shares})


@app.route('/ConstructData', methods=['POST'])
def ConstructData():
    data = request.json  # Get JSON data from frontend
    input = data.get("text", "")
    print(input)
    shares=process_input(input)
    print(shares)
    res=hex(reconstruct_secret(shares))[2:]
    return jsonify({"result": res})


if __name__ == '__main__':
    app.run(debug=True)