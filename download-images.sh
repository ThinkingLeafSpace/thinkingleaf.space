#!/bin/bash

# 创建存储图片的目录
mkdir -p images/exhibits/exhibit-001
mkdir -p images/exhibits/exhibit-002
mkdir -p images/exhibits/exhibit-003

# 下载展品001的图片
echo "正在下载展品001的图片..."
curl -o images/exhibits/exhibit-001/main.jpg http://thinkingleaf.space/images/exhibits/exhibit-001-main.jpg
curl -o images/exhibits/exhibit-001/detail-1.jpg http://thinkingleaf.space/images/exhibits/exhibit-001-detail-1.jpg
curl -o images/exhibits/exhibit-001/detail-2.jpg http://thinkingleaf.space/images/exhibits/exhibit-001-detail-2.jpg

# 下载展品002的图片
echo "正在下载展品002的图片..."
curl -o images/exhibits/exhibit-002/main.jpg http://thinkingleaf.space/images/exhibits/exhibit-002-main.jpg
curl -o images/exhibits/exhibit-002/detail-1.jpg http://thinkingleaf.space/images/exhibits/exhibit-002-detail-1.jpg
curl -o images/exhibits/exhibit-002/detail-2.jpg http://thinkingleaf.space/images/exhibits/exhibit-002-detail-2.jpg

# 下载展品003的图片
echo "正在下载展品003的图片..."
curl -o images/exhibits/exhibit-003/main.jpg http://thinkingleaf.space/images/exhibits/flowers/exhibit-003-main.jpg
curl -o images/exhibits/exhibit-003/detail-1.jpg http://thinkingleaf.space/images/exhibits/flowers/exhibit-003-detail-1.jpg
curl -o images/exhibits/exhibit-003/detail-2.jpg http://thinkingleaf.space/images/exhibits/flowers/exhibit-003-detail-2.jpg

echo "图片下载完成！" 