---
layout: post
title: '[Phalcon] Using Model'
date: 2013-10-09 11:47
comments: true
categories: "Phalcon"
tag: "Phalcon"
---
In Phalcon Model system. 是根據ORM的架構，讓資料表物件化，讓在資料讀取或是寫入的動作上，可以利用物件的特性去操作。
# 初始設定
```
/**
 * Database connection is created based in the parameters defined in the configuration file
 */
$di->set('db', function() use ($config) {
	return new DbAdapter(array(
		'host' => $config->database->host,
		'username' => $config->database->username,
		'password' => $config->database->password,
		'dbname' => $config->database->dbname
	));
});
```

上列的動作會開啟與資料庫中間的連線關係，$config會去讀取所指定的設定文件

Model文件預設的命名方式為table名稱，例如:
```
class Rebots extends \Phalcon\Mvc\Model
{
}
```

官方文件建議，要在Model文件中描述資料表的欄位，以減少使用伺服器的記憶體資源。

如果Model的名稱與資料庫資料表名稱不同時，可以透過以下的方式重新設定所關聯的資料表名稱

```
public function initialize()
{
	$this->setSource('Rebots');
}
```    

#於Controller中使用Model讀取資料

讀取清單的方式有幾種

```
ModelName::find(condition)
```

當找到筆資料時，所回傳的物件可以直接修改後，並儲存(Update)

```
$result = ModelName::find('id=1');
$result->fieldName = "something something";
$result->save(); <=將資料回傳至資料庫中
```

新增動作

```
$result = new ModelName();
$result->fieldName = "something something";
$result->save();
```

刪除動作

```
$result = ModelName::find(condition);
if ($result != false) {
	   // 執行刪除
    if ($result->delete() == false) {        
        echo "Delete Failed";
        foreach ($result->getMessages() as $message) {
            echo $message, "\n";
        }
    } else {
        echo "Deleted successfully!";
    }
}
```
