---
layout: post
title: '[VFP] 讀ini檔案'
date: 2015-06-25 01:31
comments: true
categories: "VFP"
tag: "VFP"
---
```
********************
****讀取ini file****
********************
function getinit(mfilename,msection,mentry)
    local lcinifile,lcvalue,lcbuffer,luentryvalue,lnnumbytes

*-- DECLARE DLL statements for reading/writing to private INI files
    declare integer GetPrivateProfileString in Win32API ;
        string cSection, string cKey, string cDefault, string @cBuffer, ;
        integer nBufferSize, string cINIFile

    local minivalue, mresult, mbuffersize
    mbuffersize = 255
    minivalue = spac(mbuffersize)
    mresult=getprivateprofilestring(msection,mentry,"*NULL*",@minivalue,mbuffersize,mfilename)
    minivalue=substr(minivalue,1,mresult)
    if minivalue="*NULL*"
        minivalue=.null.
    endif
    return minivalue
endfun
```

demo config ini file
```
[section]
entryName=return value
```