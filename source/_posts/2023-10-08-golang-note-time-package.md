---
layout: post
title: '[Go] Go's time package'
comments: true
typora-root-url: 2023-10-08-golang-note-time-package/
typora-copy-images-to: 2023-10-08-golang-note-time-package/
date: 2023-10-08 16:25:27
categories: Go
tags: Go
---

Go 的 time package，主要提供 time 相關的功能，這篇筆記整理一些常用的 function

<!-- more -->

引用方式

```go
import "time"
```

## 常用方法

```go
time.Now() // 目前時間 (with 時區資訊)
time.Date(2023,10,8,0,0,0,<location>) // 建立日期
time.Now().Unix() // timestamp
time.Unix(1595569527, 0) // timestamp 轉換回 time
time.Now().Format("2006/1/2") // 時間輸出格式設定, 進步說明如下
time.Now().Weekday() // 顯示目前周幾 Sunday, Monday,...

time.LoadLocation("Asia/Taipei") // 取得時區資訊，在建立 time.Date 時會用到
time.LoadLocation("Local") // 取得本地時區

time.Now().Add(6 * time.Hour) // 加 6 小時
time.now().AddDate(1,0,0) // 加一年

time.Now().Truncate(time.Minute) // 取到年月日時分，秒為 0

```

- time Format 對應的數字

  ```subunit
  月份 1,01,Jan,January
  日　 2,02,_2
  時　 3,03,15,PM,pm,AM,am
  分　 4,04
  秒　 5,05
  年　 06,2006
  時區 -07,-0700,Z0700,Z07:00,-07:00,MST
  周幾 Mon,Monday
  ```

- `time.Add` 補充說明

  `time.Add(<duration>)`, duration 的單位, Go 有提供以下幾種

  1. `time.Second`
  2. `time.Minute`
  3. `time.Hour`

  `time.Add()` 會回傳 `time.Time` 的型別，表示可以串接下去，例如

  ```go
  time.Now().AddDate(0, 0, 1).Add(-1 * time.Nanosecond)
  ```

- `time.AddDate` 補充說明，function 接受三個數字，分別代表 年，月，日

## 其他 API

- 比較時間

    ```go
    now := time.Now()
    oneDayAgo := now.AddDate(0, 0, -1)
    
    isOneDayAgoBeforeNow := oneDayAgo.Before(now) // true
    isOneDayAgoAfterNow := oneDayAgo.After(now) // false
    ```
    
- 計時器

    ```go
    time.After(duration)
    ```

    每多少時間執行一次

- 計算時間長度

    ```go
    start := time.Now()
    time.Sleep(5 * time.Second)
    fmt.Println(time.Since(start))
    ```

- 計算時間差

    ```go
    start := time.Now()
    mockDate := time.Date(2023, 10, 7, 0, 12, 0, 0, start.Location())
    fmt.Println(start, mockDate.Sub(start))
    ```

    ![image-20231008172503519](image-20231008172503519.png)



## Time/Duration Struct 方法

### Time

```go
Add(d Duration) Time
AddDate(yars int ,months int, days int) Time
After(u Time) bool
Before(u  Time) bool
Date() (year int, month Month, day int)
Month() Month
Day() int
Hour() int
Minute() int
Second() int
Year() int 
Weekday() Weekday 
YearDay() int 
ISOWeek() (year, week int)
Naosecond() int 
Zone() (name string, offset int)
Equal(u Time) bool 
Round(Duration d)
Truncate(Duration d)
Format(layout string) string
Sub(t Time) 
UTC() Time 
Unix() int64 
UnixNano() int64 
```

### Duration

```go
Hours()
Minutes()
Seconds()
Milliseconds()
Microseconds()
Nanoseconds()
String()
Round(d)
Truncate(d)
FixedZone()
LoadLocation(name string)
LoadLocation("Local")
```

## 練習題

寫一個 function 取得一天的開始與結束時間，類似 date-fns 的 `startOfDay` 和 `endOfDay` 結合

```go
func DateRange(t time.Time) (beginOfDate time.Time, endOfDate time.Time) {
	year, month, day := t.Date()
	beginOfDate = time.Date(year, month, day, 0, 0, 0, 0, t.Location())
	endOfDate = beginOfDate.AddDate(0, 0, 1).Add(-1 * time.Nanosecond)

	return beginOfDate, endOfDate
}

func main() {
    now := time.Now()
	startOfDay, endOfDay := DateRange(now)
	fmt.Println(startOfDay, endOfDay)
}

```

![image-20231008173942719](image-20231008173942719.png)

## 參考資料

- [Go time package Documentation](https://pkg.go.dev/time)







