---
layout: post
title: 'IIS_Parallels_Win8_Mac.txt'
date: 2014-03-01 16:56
comments: true
categories: "Note"
tag: "IIS"
---
1) In your Windows 8 VM, go to Control Panel > System > Advanced system settings > Computer Name and click Change.  Name this whatever you like, e.g. "windows".  Restart your VM.
 
2) Open CMD or Powershell as administrator.  Add a URL ACL entry for your new name on the port of your choice, e.g.
netsh http add urlacl url=http://windows:8080/ user=everyone
 
3) Open CMD or Powershell as administrator.  Add an inbound firewall rule for this new port.  In Windows 8, the syntax is:
netsh advfirewall firewall add rule name="IISExpressWeb" dir=in action=allow protocol=TCP localport=8080
 
In Windows 7, the syntax is:
netsh firewall add portopening TCP 8080 IISExpressWeb enable ALL
 
4) Edit your IISExpress applicationhost.config file, typically found at your Documents\IISExpress\config\applicationhost.config.  Find your site under sites, and add a binding to the port using your machine name, e.g. 
<bindings>
    <binding protocol="http" bindingInformation="*:8080:localhost" /> <!-- This will be here already, genereated by VS -->
    <binding protocol="http" bindingInformation="*:8080:windows" /> <!-- Add this -->
</bindings>
 
5) Startup IISExpress with Visual Studio, hit your URL from a browser on your Mac/VM Host, e.g. http://windows:8080
 
6) Revel in your magnificence.
 
More info here:
http://stackoverflow.com/questions/3313616/iis-express-enable-external-request
http://stackoverflow.com/questions/5442551/iisexpress-returns-a-503-error-from-remote-machines
http://www.hanselman.com/blog/WorkingWithSSLAtDevelopmentTimeIsEasierWithIISExpress.aspx

Ref: https://gist.github.com/justingarrick/6322779