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
