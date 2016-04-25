---
layout: post
title: '[Memo]常用git指令'
date: 2013-10-09 13:16
comments: true
categories: "Note"
tag: "Git"
---
1. commit your code
```
git add .
git commit -m "xxxx" 
```

2. merge your branch to master
以master為主要branch
```
git checkout master
git merge [module name]<= this should be branch name
```  

3. update
```
git pull origin master
```
檢查是否有conflict要修

4. push至origin
```
git push origin master:[module name]
```

5. 通知alvin合併

6. 拉別人的code
```
git add remote kyo /home/kyo/web/mc2
```

7. 直接合併於目前的branch  EX. 拉KYO的master
```
git pull remote kyo master
```

8. 拉成新的branch EX. 拉KYO的master為自己的kyo branch 
```
git fetch remote kyo master:kyo
```

9. git 環境設定

###設定個人資訊
```
git config --global user.name "Your Name"

git config --global user.email you@example.com
```

###設定git環境

cd ~ #進入個人home目錄 
ex./home/fish
vi .gitconfig 

####編輯git環境檔，貼上以下環境設定變數

[color]
 
 branch = auto
 
 diff = auto
 
 status = auto

[color "branch"]

  current = yellow reverse
 
  local = yellow 

  remote = green

[color "diff"]
 
 meta = yellow bold
 
 frag = magenta bold
 
 old = red bold
 
 new = green bold

[color "status"]

  added = green
 
  changed = red