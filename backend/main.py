
from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import HTTPBearer
from pydantic import BaseModel
import sqlite3, jwt, datetime, bcrypt

app = FastAPI()
security = HTTPBearer()
SECRET = "SUPER_SECRET_KEY"

conn = sqlite3.connect("database.db", check_same_thread=False)
cursor = conn.cursor()

cursor.execute("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT UNIQUE, password TEXT, is_admin INTEGER DEFAULT 0)")
cursor.execute("CREATE TABLE IF NOT EXISTS history (id INTEGER PRIMARY KEY, user_id INTEGER, query TEXT)")
cursor.execute("CREATE TABLE IF NOT EXISTS favorites (id INTEGER PRIMARY KEY, user_id INTEGER, query TEXT)")
conn.commit()

def create_admin():
    cursor.execute("SELECT * FROM users WHERE username='admin'")
    if not cursor.fetchone():
        hashed = bcrypt.hashpw("admin123".encode(), bcrypt.gensalt())
        cursor.execute("INSERT INTO users (username, password, is_admin) VALUES (?, ?, 1)", ("admin", hashed))
        conn.commit()
create_admin()

class User(BaseModel):
    username: str
    password: str

class Dork(BaseModel):
    keyword: str
    type: str
    extra: str = ""

def create_token(uid, adm):
    return jwt.encode({"user_id": uid, "is_admin": adm, "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=12)}, SECRET, algorithm="HS256")

def verify(token=Depends(security)):
    return jwt.decode(token.credentials, SECRET, algorithms=["HS256"])

@app.post("/login")
def login(user: User):
    cursor.execute("SELECT id,password,is_admin FROM users WHERE username=?", (user.username,))
    data = cursor.fetchone()
    if not data: raise HTTPException(401)
    uid,pwd,adm = data
    if bcrypt.checkpw(user.password.encode(), pwd):
        return {"token": create_token(uid, adm)}
    raise HTTPException(401)

@app.get("/admin/users")
def users(user=Depends(verify)):
    if not user["is_admin"]: raise HTTPException(403)
    return cursor.execute("SELECT users.id,username,COUNT(history.id),COUNT(favorites.id) FROM users LEFT JOIN history ON users.id=history.user_id LEFT JOIN favorites ON users.id=favorites.user_id GROUP BY users.id").fetchall()
