from flask import Flask, request, redirect, url_for, render_template
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required,current_user
from database import db, WebInfo, PortInfo, Vulnerability,User
import os
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash
from urllib.parse import urlparse
import re
import ipaddress
from config import app
from fscan import fscan

app.register_blueprint(fscan)
db.init_app(app)


login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

@app.template_filter('get_protocol_class')
def get_protocol_class(description):
    if description.startswith("http://"):
        return "http"
    elif description.startswith("https://"):
        return "https"
    elif description.startswith("ftp://"):
        return "ftp"
    elif description.startswith("Redis:"):
        return "redis"
    elif description.startswith("SSH:"):
        return "ssh"   
    else:
        return ""




@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))
    
@app.route('/', methods=['GET', 'POST'])
@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    
    if request.method == 'POST':
        user = User.query.filter_by(username=request.form['username']).first()
        if user and check_password_hash(user.password, request.form['password']): 
            login_user(user)
            return redirect(url_for('index'))
    return render_template('login.html')


  
@app.route('/index', methods=['GET', 'POST'])
@login_required
def index():
        userInfo = {
            'avatar': '',
            'realname': current_user.username  
        }
        menuList = [
            {
                'name': 'fscan',
                'children': [
                    
                    {'name': '报告导入', 'url': '/upload'},
                    {'name': '信息查询', 'url': '/query'},
                    {'name': '漏洞列表', 'url': '/vuln'}
                ]
                                
            }
        ]
        return render_template('index.html', userInfo=userInfo, menuList=menuList)

    

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

@app.route('/change_password', methods=['POST'])
@login_required
def change_password():
    old_password = request.form.get('old_password')
    new_password = request.form.get('new_password')
    confirm_password = request.form.get('confirm_password')  

    user = User.query.filter_by(id=current_user.id).first()

    if not user or not user.password:
        return 'User not found or no password set', 400

    if not check_password_hash(user.password, old_password):
        return '旧密码不正确', 400

    if new_password != confirm_password:
        return 'New passwords do not match', 400
        
    user.password = generate_password_hash(new_password)
    try:
        db.session.commit()
    except Exception as e:
        return f"Error updating password: {str(e)}", 500
    
    return '密码修改成功'


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        admin_user = User.query.filter_by(username='admin').first()
        if not admin_user:
            admin_username = 'admin'  # Set the admin username
            admin_password = 'report'  # Set the admin password
            hashed_password = generate_password_hash(admin_password)
            new_admin = User(username=admin_username, password=hashed_password)
            db.session.add(new_admin)
            db.session.commit()
    app.run(debug=True,host='0.0.0.0',port=11451, ssl_context=('cert.pem', 'key.pem'))
