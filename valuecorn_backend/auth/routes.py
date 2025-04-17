from flask import Blueprint, request, jsonify
import bcrypt
import pyodbc
from flask_jwt_extended import create_access_token
from datetime import timedelta

auth_bp = Blueprint('auth', __name__)

def get_db():
    return pyodbc.connect(
        'DRIVER={ODBC Driver 17 for SQL Server};'
        'SERVER=LAPTOP-E5EKBDRG;'
        'DATABASE=Valuecorn;'
        'UID=sa;PWD=P@ssw0rd'
    )
@auth_bp.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        email = data['email']
        password = data['password']
        first_name = data['firstName']
        last_name = data['lastName']
        phone_number=data['phoneNumber']    
        username=data['username']
        
        conn = get_db()
        cursor = conn.cursor()

        cursor.execute("SELECT Id FROM Users WHERE Email = ?", (email,))
        if cursor.fetchone():
            return jsonify({"error": "Email already registered"}), 400

        hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

        cursor.execute(
            "INSERT INTO Users (Email, PasswordHash, RoleId, FirstName, LastName,UserName,PhoneNumber) VALUES (?, ?, ?, ?, ?,?,?)",
            (email, hashed.decode('utf-8'), 1, first_name, last_name,username,phone_number)
        )
        conn.commit()

        return jsonify({"message": "User registered successfully"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@auth_bp.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data['email']
        password = data['password']

        conn = get_db()
        cursor = conn.cursor()

        cursor.execute("SELECT Id, PasswordHash, RoleId FROM Users WHERE Email = ?", (email,))
        user = cursor.fetchone()

        if not user:
            return jsonify({"error": "Invalid credentials"}), 401

        stored_hash = user[1]
        if not bcrypt.checkpw(password.encode('utf-8'), stored_hash.encode('utf-8')):
            return jsonify({"error": "Invalid credentials"}), 401

        # Generate JWT token
        access_token = create_access_token(identity={
            "id": user[0],
            "email": email,
            "role": user[2]
        }, expires_delta=timedelta(days=7))

        return jsonify({
            "message": "Login successful",
            "token": access_token
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500