<!--
#
# Copyright 2012-2013, Polyvi Inc. (http://polyvi.github.io/openxface)
# This program is distributed under the terms of the GNU General Public License.
# 
# This file is part of xFace.
# 
# xFace is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
# 
# xFace is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
# 
# You should have received a copy of the GNU General Public License
# along with xFace.  If not, see <http://www.gnu.org/licenses/>.
#
-->

# Release Notes

## 1.0.0 (Thu Mar 20 2014)


 *  ios平台库模式下将所有的public头文件拷贝到导出的压缩包中
 *  将cordova的头文件拷贝到cordova目录下
 *  ios平台库模式打包时拷贝其它需要的cordova头文件，将需要的framework写到readme中
 *  支持ios平台生成模拟器版本的sdk包
 *  1. using asset tag instead of source-file tag to copy dir 2. rename xFaceLib to xfaceSdk to keep the same with ios
 *  解决ios平台编译库时路径拼接不对的问题
 *  基本实现ios平台库模式打包
 *  1. package demo and doc to xFaceLib.zip when building with lib mode 2. update lib and res and app of demo to lateset when building with lib mode
 *  Add xfaceLib doc and demo
 *  Initial commit by xsrc
 *  since xFaceLib contains doc, demo and script, create lib plugin for that , xmen will add it to engine
