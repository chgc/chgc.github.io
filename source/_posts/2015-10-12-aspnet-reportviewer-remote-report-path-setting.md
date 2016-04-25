---
layout: post
title: '[ASP.NET] ReportViewer的遠端報表路徑設定'
date: 2015-10-12 06:58
comments: true
categories: "ASP.NET MVC"
tag: "MVC 5"
---
###ReportViewer的遠端報表的設定方式

1. 如果需要設定登入使用者的權限時, 需要實作IReportServerCredentials, 但是如果需要就抄下面的Code
用法:

```
ReportViewer1.ServerReport.ReportServerCredentials = New CustomReportCredentials(username, password, domain)
```

```VB.NET
Imports System.Net
Public Class CustomReportCredentials
    Implements Microsoft.Reporting.WebForms.IReportServerCredentials

    ' local variable for network credential
    Private strUserName As String
    Private strPassWord As String
    Private strDomainName As String
    Public Sub New(ByVal UserName As String, ByVal PassWord As String, ByVal DomainName As String)
        strUserName = UserName
        strPassWord = PassWord
        strDomainName = DomainName
    End Sub
    Public ReadOnly Property ImpersonationUser() As System.Security.Principal.WindowsIdentity Implements Microsoft.Reporting.WebForms.IReportServerCredentials.ImpersonationUser
        Get
            ' not use ImpersonationUser
            Return Nothing
        End Get
    End Property
    Public ReadOnly Property NetworkCredentials() As System.Net.ICredentials Implements Microsoft.Reporting.WebForms.IReportServerCredentials.NetworkCredentials
        Get
            ' use NetworkCredentials
            Return New NetworkCredential(strUserName, strPassWord, strDomainName)
        End Get
    End Property
    Public Function GetFormsCredentials(ByRef authCookie As System.Net.Cookie, ByRef userName As String, ByRef password As String, ByRef authority As String) As Boolean Implements Microsoft.Reporting.WebForms.IReportServerCredentials.GetFormsCredentials
        ' not use FormsCredentials unless you have implements a custom autentication.
        authCookie = Nothing
        password = authority = Nothing
        Return False
    End Function
End Class
```

2. ServerReportUrl要指定SSRS的Report Server URL, 而不是Report Manager URL。因為這個URL的錯誤，讓我一直遇到404的錯誤.
ex: http://serverIP/ReportServer

3. ReportPath就是根據Root的相對應位置而設定，不需要.rdlc(localReport就需要搭配附檔名)
4. 如果有參數要設定, 使用方式如下

```
Dim objParms As New System.Collections.ObjectModel.Collection(Of ReportParameter)
objParms.Add(New ReportParameter("param1", "param1 value"))
ReportViewer1.ServerReport.SetParameters(objParms)
```