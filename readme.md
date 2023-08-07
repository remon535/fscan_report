# fscan_report
fscan_report是基于flask开发的fscan报告整合平台，用于整合 fscan 扫描报告，允许用户对扫描结果进行分类导出和深入分析，便于后续的测试

大型的内网环境较为复杂，为了尽量避免对业务造成影响，以c段为单位进行扫描较为稳妥，这样就导致报告数量巨大。不便于整理和浏览。遂产生了编写该工具的想法

目前报告导入格式仅支持txt格式。。。。。


可以参考我的批量扫描脚本（扫描整个10.0.0.0/8网段资产）
```
#!/bin/bash

do_scan() {
  network=$1
  file_name=$(echo "${network}" | tr '.' '_')
  

  # 执行扫描并将输出重定向到文件，timeout是为了应对fscan对弱口令进行爆破时可能卡死的问题

  #可以自定义fscan运行参数
  timeout 780s ./fscan_amd64 -h ${network}.0/24  > ${file_name}.txt    

}

export -f do_scan

max_concurrency=5
counter=0
#扫描10.0.0.0/8
for i in {10}; do
  for j in {0..255}; do
    for k in {0..255}; do
      network="${i}.${j}.${k}"

      do_scan "$network" &

      counter=$((counter + 1))

      if [ $counter -eq $max_concurrency ]; then
        wait -n
        counter=$((counter - 1))
      fi
    done
  done
done

wait

```
## 效果展示
fscan报告批量导入，可单独导出漏洞结果，web资产和存活ip对应的开放端口
![图片](https://github.com/remon535/fscan_report/assets/51557121/6a21d368-eb7b-4668-87a9-c4af9c3e25e4)
支持对单个ip或c段的报告查询
![图片](https://github.com/remon535/fscan_report/assets/51557121/1fb02b3f-69e0-44a2-a0f4-1752ecbaf9c8)

统计漏洞最多的20个c段，可参考该结果判断出服务器集中的网段
![图片](https://github.com/remon535/fscan_report/assets/51557121/7e21bd89-94ea-48ed-9762-b1b9f5c29c3f)
![图片](https://github.com/remon535/fscan_report/assets/51557121/76693e02-f7d2-4be5-a0fd-10b373a84110)



## 安装
### docker部署
```
git clone https://github.com/remon535/fscan_report.git
cd fscan_report
docker-compose build
docker-compose up -d
```
### 直接运行
```
git clone https://github.com/remon535/fscan_report.git
cd fscan_report
chmod +x run.sh
./run.sh
```
默认用户名:admin 默认密码:report 


## contact me
blog:http://remon535.xyz

QQ:894752373


[MIT License](LICENSE)
