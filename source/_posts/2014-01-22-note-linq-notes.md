---
layout: post
title: '[工作筆記] Linq筆記 - 取得最後一筆的聊天紀錄'
date: 2014-01-22 07:32
comments: true
categories: "Note"
tag: "Linq"
---
目的： 取得最後一筆的聊天紀錄
```
var result = (from o in db.messages
							let msgFrom = o.fromUid == uid
							let msgTo = o.toUid == uid
							where msgFrom || msgTo
							group o by msgTo ? o.fromUid : o.toUid into grp
							let lastDate = grp.Max(m => m.createDate)
							from p in grp
							where p.createDate == lastDate
							select new viewMessage
							{
								uid = p.fromUid == uid ? p.toUid : p.fromUid,
								name = p.fromUid == uid ? p.toemployees.name : p.fromemployees.name,
								msg = p.msg,
								lastdate = p.createDate,
								unread = p.unread
							}).AsEnumerable();
```
