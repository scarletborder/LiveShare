#!/bin/bash

# 创建 dist 目录（如果不存在）
mkdir -p dist

# 初始编译
tsc
sass style/app.scss dist/app.css