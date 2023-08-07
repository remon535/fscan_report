from flask_paginate import Pagination, get_page_args
from flask import Flask, request, redirect, url_for, render_template,Response,stream_with_context
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import func, text,or_,not_
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required,current_user
from database import db, WebInfo, PortInfo, Vulnerability,User
import os
from io import StringIO
from werkzeug.utils import secure_filename
from urllib.parse import urlparse
import re
import ipaddress
from flask import Blueprint
from config import app
import sqlite3
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from flask_socketio import socketio
import time


fscan = Blueprint('fscan', __name__)

def extract_ip_from_url(url):
    ip_regex = r'(?:\d{1,3}\.){3}\d{1,3}'  # ip regex
    match = re.search(ip_regex, url)
    if match:
        return match.group()
    else:
        return None



@fscan.route('/', methods=['GET'])       
@fscan.route('/upload', methods=['POST', 'GET'])
@login_required
def upload():
    ip_count = db.session.query(PortInfo.ip.distinct()).count()

    if request.method == 'GET':
        if 'delete' in request.args:
            # 清空数据库
            db.session.query(WebInfo).delete()
            db.session.query(PortInfo).delete()
            db.session.query(Vulnerability).delete()
            db.session.commit()

            # 删除文件
            uploaded_files = os.listdir(app.config['UPLOAD_FOLDER'])
            for file_name in uploaded_files:
                file_path = os.path.join(app.config['UPLOAD_FOLDER'], file_name)
                os.remove(file_path)
            return redirect(url_for('fscan.upload'))
            
    if request.method == 'POST':

        if 'file' not in request.files:
            return 'No file part'

        file = request.files['file']
        if file.filename == '':
            return 'No selected file'

        filename = secure_filename(request.form['filename'])
        start = int(request.form['start'])
        is_last_chunk = request.form['is_last_chunk'] == 'true'  

        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        with open(file_path, 'ab') as f:
            f.seek(start)
            f.write(file.read())
            
        if is_last_chunk:
 
            with open(file_path, 'rb') as f:
                lines = [line.decode('utf-8', errors='replace') for line in f]
                
                for line in lines:
                    line = line.strip()

                    # 提取web信息
                    if re.match(r'\[\*\] WebTitle:', line):
                        match = re.match(r'\[\*\] WebTitle: (.+?) +code:(\d+) +len:\d+ +title:(.+)', line)
                        if match:
                            url = match.group(1)
                            code = match.group(2)
                            title = match.group(3)
                            
                            if code != '404':
                                ip = extract_ip_from_url(url)
                                web_info = WebInfo(ip=ip, url=url, title=title)
                                db.session.add(web_info)
                                
                    # 提取端口信息
                    elif 'open' in line:
                        parts = line.split(' ')
                        ip_port = parts[0]
                        ip_port_parts = ip_port.split(':')
                        if len(ip_port_parts) == 2:  # 确保返回的列表有两个元素
                            ip, port = ip_port_parts
                            port = int(port)
                            port_info = PortInfo(ip=ip, port=port)
                            db.session.add(port_info)
                        else:
                            print(f"Unexpected format for ip_port: {ip_port}")  
                    

                    # 提取漏洞信息
                    elif line.startswith('[+]') and "InfoScan" not in line:
                        parts = line.split(' ', 1)
                        ip = extract_ip_from_url(parts[1])
                        vulnerability_description = parts[1].strip()
                        vulnerability = Vulnerability(ip=ip, description=vulnerability_description)
                        db.session.add(vulnerability)

                db.session.commit()
                db.session.close()
        return 'File chunk uploaded'
            
    return render_template('upload.html', ip_count=ip_count)

@fscan.route('/query', methods=['GET'])
@login_required
def query():
    query = request.args.get('query')
    query_result = {
        'web_infos': [],       
        'port_infos': [],      
        'vulnerabilities': []  
    }

    # 单个ip查询
    try:
        ip = ipaddress.ip_address(query)
        ip_str = str(ip) 
        web_infos = WebInfo.query.filter_by(ip=ip_str).all()
        port_infos = PortInfo.query.filter_by(ip=ip_str).all()
        vulnerabilities = Vulnerability.query.filter_by(ip=ip_str).all()
        query_result['web_infos'] = web_infos
        query_result['port_infos'] = port_infos
        query_result['vulnerabilities'] = vulnerabilities
        return render_template('query.html', query_result=query_result)
    except ValueError:
        pass

    # c段查询



    try:
        network = ipaddress.ip_network(query, strict=False)
        network_hosts = [str(ip) for ip in network.hosts()]  

        web_infos = WebInfo.query.filter(WebInfo.ip.in_(network_hosts)).all()
        port_infos = PortInfo.query.filter(PortInfo.ip.in_(network_hosts)).all()
        vulnerabilities = Vulnerability.query.filter(Vulnerability.ip.in_(network_hosts)).all()
        query_result['web_infos'] = web_infos
        query_result['port_infos'] = port_infos
        query_result['vulnerabilities'] = vulnerabilities
        return render_template('query.html', query_result=query_result)
    except ValueError:
        pass
    return render_template('query.html', query_result=query_result)

    
@fscan.route('/vuln')
@login_required
def vulnerabilities():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)
    offset = (page - 1) * per_page
    vulnerabilities = Vulnerability.query.order_by(func.substr(Vulnerability.description, -1)).limit(per_page).offset(offset).all()
    
    c_segment_counts = {}
    for vulnerability in vulnerabilities:
        ip = vulnerability.ip
        c_segment = '.'.join(ip.split('.')[:3])
        if c_segment in c_segment_counts:
            c_segment_counts[c_segment] += 1
        else:
            c_segment_counts[c_segment] = 1
        
    if c_segment_counts:
        # 将字典转换为DataFrame
        df = pd.DataFrame.from_dict(c_segment_counts, orient='index', columns=['Count'])
        df = df.reset_index().rename(columns={'index': 'subnet'})

        # 按漏洞数量降序排序，并选择前20个C段
        df = df.sort_values('Count', ascending=False).head(20)

        # 绘制柱状图
        plt.figure(figsize=(10, 6))
        sns.barplot(x='subnet', y='Count', data=df)
        plt.xlabel('subnet')
        plt.ylabel('Vulnerability Count')
        plt.title('Top 20 class c subnet  with Highest Vulnerability Counts')
        plt.xticks(rotation=45)
        plt.tight_layout()

        # 保存图表为临时文件
        chart_file = 'static/vulnerability_counts.png'
        plt.savefig(chart_file)
    else:
        chart_file = None
    
    total = Vulnerability.query.count()
    pagination = Pagination(page=page, per_page=per_page, total=total, record_name='vulnerabilities', css_framework='bootstrap4')

    return render_template('vuln.html', vulnerabilities=vulnerabilities, chart_file=chart_file, pagination=pagination)

#########################################导出功能
# 导出 Web 地址
@app.route('/upload/web_info')
def export_web_info():
    web_infos = WebInfo.query.all()
    output = StringIO()
    for web_info in web_infos:
        output.write(f"{web_info.url}  Title: {web_info.title}\n")
#        output.write(f"IP: {web_info.ip}\n")
        output.write("\n")
    output.seek(0)
    return Response(output.getvalue(), mimetype='text/plain', headers={'Content-Disposition': 'attachment; filename=web_info.txt'})

# 导出 IP+Port 数据
@app.route('/upload/ip_port')
def export_ip_port():
    port_infos = PortInfo.query.all()
    output = StringIO()
    for port_info in port_infos:
        output.write(f"{port_info.ip}:{port_info.port}\n")
    output.seek(0)
    return Response(output.getvalue(), mimetype='text/plain', headers={'Content-Disposition': 'attachment; filename=ip_port.txt'})
'''
# 导出漏洞信息
@app.route('/upload/vulnerabilities')
def export_vulnerabilities():
    vulnerabilities = Vulnerability.query.order_by(func.substr(Vulnerability.description, -1,5)).all()
    output = StringIO()
    for vulnerability in vulnerabilities:
        output.write(f"{vulnerability.description}\n")
    output.seek(0)
    return Response(output.getvalue(), mimetype='text/plain', headers={'Content-Disposition': 'attachment; filename=vulnerabilities.txt'})
'''


@app.route('/upload/vulnerabilities')
def export_vulnerabilities():
    vulnerabilities = Vulnerability.query.all()

    # 分类和排序
    http_vulnerabilities = []
    https_vulnerabilities = []
    other_vulnerabilities = []

    for vulnerability in vulnerabilities:
        description = vulnerability.description
        if description.startswith("http"):
            http_vulnerabilities.append(vulnerability)
        elif description.startswith("https"):
            https_vulnerabilities.append(vulnerability)
        else:
            other_vulnerabilities.append(vulnerability)

    # 对其他协议头进行分类并按协议头排序
    other_vulnerabilities.sort(key=lambda x: x.description.split(' ')[0])

    # 对 http 和 https 漏洞按最后一部分进行降序排序
    http_vulnerabilities.sort(key=lambda x: x.description.rsplit(' ', 1)[-1], reverse=True)
    https_vulnerabilities.sort(key=lambda x: x.description.rsplit(' ', 1)[-1], reverse=True)

    # 输出到文件
    output = StringIO()

    # 输出 http 的漏洞
    for vulnerability in http_vulnerabilities:
        output.write(f"{vulnerability.description}\n")

    # 输出 https 的漏洞
    for vulnerability in https_vulnerabilities:
        output.write(f"{vulnerability.description}\n")

    # 输出其他协议头的漏洞
    for vulnerability in other_vulnerabilities:
        output.write(f"{vulnerability.description}\n")

    output.seek(0)

    return Response(output.getvalue(), mimetype='text/plain', headers={'Content-Disposition': 'attachment; filename=vulnerabilities.txt'})
