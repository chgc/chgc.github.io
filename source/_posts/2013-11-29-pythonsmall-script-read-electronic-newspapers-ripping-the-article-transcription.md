---
layout: post
title: '[python] small script -- 讀電子報，擷取文章，轉錄'
date: 2013-11-29 10:17
comments: true
categories: "Python"
tag: "Python"
---
#流程
1. 從gmail裡面讀取電子報(特定的寄件者)
2. 取得郵件內容
3. 分析html
4. 取得所要的部份(s)
5. 將要轉錄的文章發布到wordpress上
6. 將已處理的信件從收件夾中移到另一個資料夾中
7. 結束作業

#開發環境
python 3.3

#有用到的package
* imaplib --> 用來處理imap type email
* email   --> email結構
* re      
* BeautifulSoup4 --> work with python 3.3 --> from bs4 import BeautifulSoup
* wordpress_xmlrpc --> 透過xmlrpc的方式新增文章

# 所遇到的問題
1. 編碼
	a. 信件
  b. 信件內容
2. html形式的email裡面藏有\xa0 , 還是因為編碼的關係

其實在使用bs4的過程中，也是花最多時間的地方是如何讓中文正常的顯示出來。其實在第一段要取得信件裡的內容時，就遇到中文編碼的問題。

demo code
```
import imaplib,email,re
from email.header import decode_header
from bs4 import BeautifulSoup
from wordpress_xmlrpc import Client,WordPressPost,WordPressPost,WordPressTerm
from wordpress_xmlrpc.methods import posts
from wordpress_xmlrpc.methods.posts import NewPost,EditPost
from wordpress_xmlrpc.methods.users import GetUserInfo

# 這樣子可以傳回中文字
def decode_subject(subject,encoding):
    if encoding == None:
        return subject
    else:
        return subject.decode(encoding)  
# 用意跟上面的一樣, 只是為了處理編碼的問題
def showmessage(mail):
    if mail.is_multipart():
        for part in mail.get_payload():
            showmessage(part)
    else:
        type = mail.get_content_charset()        
        if type == None:
            return mail.get_payload()
        else:
            try:
                return mail.get_payload(decode=1).decode(type)
            except UnicodeDecodeError:
                return mail
                
conn = imaplib.IMAP4_SSL("imap.gmail.com", 993)
conn.login('account','password)
conn.select("inbox") # connect to inbox.
typ, data = conn.search(None, 'ALL')
try:   
    for num in data[0].split()[-1:]: #從最新的信件開始讀起
        typ, msg_data = conn.fetch(num, '(RFC822)')
        for response_part in msg_data:
            if isinstance(response_part, tuple):                
                msg = email.message_from_string(response_part[1].decode())              
                subject,encoding = decode_header(msg['subject'])[0]               
                mailsubject = decode_subject(subject,encoding)
                #_from = msg['from']                
                body = showmessage(msg) # 編碼轉換
                # 分析並將轉錄到wordpress上
                for link in soup.find_all("table")[8:]:#start with 8th table element                            content = link.encode('big5').decode('cp950')
                    if content.find('class="contentword"') > -1:
                        news = BeautifulSoup(content)                      
                        for part in news.find_all('tr'):
                            td = part.find_all("td")
                            title = td[0].get_text()
                            puretext = re.sub('(\xa0)+',' ',td[1].get_text())
                            if title == '公布日期':                               
                                publishdate = puretext
                            elif title=='標題':
                                posttitle = puretext
                            elif title=='詳細內容':
                                postcontent = puretext
                        postToWP.post(posttitle,postcontent,"post tag")
        move_mail(conn,num,'Archive.Today')
finally:
    try:
        conn.close()
    except:
        pass
    conn.logout()    
```

在3.3裡, email.message_from_string 傳進去的文字如果不加decode，會傳錯誤訊息出來。
```
email.message_from_string(response_part[1].decode())
```

發布文章到wordpress
參考網址: http://python-wordpress-xmlrpc.readthedocs.org/en/latest/index.html
```
class postToWP:
    def post(title,content,tag):
        client = Client('http://blog url//xmlrpc.php', 'username', 'password')        
        post = WordPressPost()
        post.title = title
        post.content = content
        post.terms_names = {
        'post_tag': [tag],              # 標籤(Tag)
        'category': [tag],              # 分類(Categories)
        }      
        post.post_status = 'publish'    # 如果沒有這一個，就會是草稿狀態
        post.id = client.call(NewPost(post))
```        