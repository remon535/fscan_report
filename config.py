from flask import Flask
import secrets

app = Flask(__name__, static_folder='static')
app.secret_key =secrets.token_hex(24)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///reports.db'
app.config['UPLOAD_FOLDER'] = './upload/'
#app.config['SECURITY_PASSWORD_SALT'] = 'your_password_salt_here'
