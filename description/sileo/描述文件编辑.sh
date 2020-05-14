#!/bin/sh
标题
perl -p -i -e "s/852359/小火箭/g"  cydia副本 sileo副本.json
#描述
perl -p -i -e "s/852360/小火箭砸壳版本/g"  cydia副本 sileo副本.json
#支持系统
perl -p -i -e "s/852362/11.0-13.4.5/g"  cydia副本 sileo副本.json

#插件标识符
mv cydia副本 beta
mv sileo副本.json beta.json


cp cydia样本 cydia副本
cp sileo样本.json sileo副本.json




