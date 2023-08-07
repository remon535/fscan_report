FROM python:3.8-slim

# 设置工作目录
WORKDIR /app

# 复制当前目录下的所有文件到容器的/app目录
COPY . /app

# 安装项目依赖
RUN pip install --no-cache-dir -r requirements.txt

# 指定容器启动时运行的命令
CMD ["/bin/bash", "run.sh"]
