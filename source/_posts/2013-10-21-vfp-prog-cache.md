---
layout: post
title: '[VFP]Prog Cache '
date: 2013-10-21 03:47
comments: true
categories: "VFP"
tag: "VFP"
---
> From the VFP9 helpfile:

>Specifies the amount of memory (address space) in pages that Visual FoxPro allocates at startup or a Visual FoxPro MTDLL COM Server allocates per thread for the internal program cache (memory used to run programs). Each page of memory is equal to 64K so the default setting equates to an allocation a little over 9MB. As the cache is filled, Visual FoxPro will try to flush it to remove unused items. It is possible that Visual FoxPro cannot free enough memory in which case an Error 1202 is generated (Program is too large). Adjusting the PROGCACHE setting can prevent this error from occurring.

>Note:
While this setting can be used for the Visual FoxPro development product or normal runtime applications, it is primarily intended for MTDLL COM Servers where many threads are often created for a single server. In Visual FoxPro 9.0, the default value for MTDLL COM Servers is -2.

>When the value of nMemoryPages is greater than 0, Visual FoxPro allocates a fixed program cache. You can specify between 1 and 65000.

>If you specify 0 for nMemoryPages, no program cache is used. Instead, Visual FoxPro uses dynamic memory allocation based on determinations made by the operating system.

>If you pass a value for nMemoryPages that is less than 0, Visual FoxPro uses dynamic memory allocation but is limited to the specified memory (nMemoryPages * 64K). When the limit is reach, Visual FoxPro will flush allocated programs to free memory.

>You can call SYS(3065) to determine the current PROGCACHE setting. CLEAR PROGRAM will attempt to clear unreferenced code regardless of this setting.

>Note:
The Visual FoxPro OLE DB Provider ignores this setting since it uses dynamic memory allocation (PROGCACHE=0).

>Default: 144 (-2 for MTDLL)

>"The setting is the number of pages of memory you want allocated. Each page is equivalent to 64K of memory. You can set the PROGCACHE from 1 to 65,000 (positive or negative) to designate how much memory is allocated. If you specify zero, no program cache is used and VFP uses dynamic memory allocation determined by the operating system. If you set the PROGCACHE to a negative number, VFP uses dynamic memory allocation, but is limited to the number of memory pages you specified. The default setting is 144 (over 9 megabytes) for single-threaded EXEs and the VFP IDE, and -2 (128 kilobytes) for a multi-threaded DLL. The VFP OLE DB Provider does not use this setting because it uses dynamic memory allocation."

Ref: http://fox.wikis.com/wc.dll?Wiki~ProgCache
