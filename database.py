from flask import Flask, request, render_template
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required
import logging


app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///reports.db'
db = SQLAlchemy(app)

class WebInfo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    ip = db.Column(db.String(15))
    url = db.Column(db.String(255))
    title = db.Column(db.String(255))

class PortInfo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    ip = db.Column(db.String(15))
    port = db.Column(db.Integer)

class Vulnerability(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    ip = db.Column(db.String(15))
    description = db.Column(db.String(255))


class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(15), unique=True)
    password = db.Column(db.String(80))
