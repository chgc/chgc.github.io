---
layout: post
title: '[C#]Design Pattern for .NET Programmers'
date: 2014-04-29 06:44
comments: true
categories: "CSharp"
tag: "C#"
---
#NOTE: Youtube link: http://youtu.be/S8XL1L_1Lyw

* Abstract Factory

```
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Patterns
{
    class Program
    {
        public static Object Create(string className, Dictionary<String, Object> values)
        {
            Type type = Type.GetType(className);
            Object instance = Activator.CreateInstance(type);
            foreach (var entry in values)
            {
                type.GetProperty(entry.Key).SetValue(instance, entry.Value, null);
            }
            return instance;
        }
        static void Main(string[] args)
        {
            Console.WriteLine(Create("Patterns.Book", new Dictionary<string, object>()
            {
                {"Title", "Some titles"},
                {"Pages", 100}
            }));

            Console.WriteLine(Create("Patterns.CD", new Dictionary<string, object>()
            {
                {"Title", "Some CD"},
                {"Volume", 12}
            }));           
        }
    }

    class Book
    {
        public string Title { get; set; }
        public int Pages { get; set; }
        public override string ToString()
        {
            return string.Format("Book {0} {1}", Title, Pages);
        }
    }

    class CD
    {
        public string Title { get; set; }
        public int Volume { get; set; }
        public override string ToString()
        {
            return string.Format("CD {0} {1}", Title, Volume);
        }
    }
}

```

* Cascade Pattern

```
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Patterns
{
    class Program
    {

        static void Main(string[] args)
        {           
            // Sect I
            //Mailer mailer = new Mailer();
            //mailer.from("abc@mail.com");
            //mailer.to("ddd@outlook.com");
            //mailer.subject("subjeccccttt");
            //mailer.message("contents blah blah");
            //mailer.send();

            // Sect II- Cascade way
            new Mailer().from("abc@mail.com")
                        .to("ddd@outlook.com")
                        .subject("subjeccccttt")
                        .message("contents blah blah")
                        .send();
        }       
    }
    // Sect I
    //class Mailer
    //{
    //    public void to(string toAdrr) { }
    //    public void from(string fromAddr) { }
    //    public void subject(string sub){}
    //    public void message(string msg) { }
    //    public void send() { }
    //}

    // Sect II
    class Mailer
    {
        public Mailer to(string toAdrr) { return this; }
        public Mailer from(string fromAddr) { return this; }
        public Mailer subject(string sub) { return this; }
        public Mailer message(string msg) { return this; }
        public void send() { }
    }    
}

```

* Pluggable Behavior

```
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Patterns
{
    class Program
    {
        static int totalValues(int[] values)
        {
            int total = 0;
            foreach (var value in values)
            {
                total += value;
            }
            return total;
        }
        static int totalEvenValues(int[] values)
        {
            int total = 0;
            foreach (var value in values)
            {
                if (value % 2 == 0) total += value;
            }
            return total;
        }
        static int totalOddValues(int[] values)
        {
            int total = 0;
            foreach (var value in values)
            {
                if (value % 2 != 0) total += value;
            }
            return total;
        }
        static int totalSelectValues(int[] values, Func<int, bool> selector)
        {
            int total = 0;
            foreach (var value in values)
            {                
                // pass value(first param) into function and return second param value
                if (selector(value)) total += value;
            }
            return total;
        }
        // 
        static void Main(string[] args)
        {
            int[] values = new int[] { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 };

            Console.WriteLine(totalValues(values));
            Console.WriteLine(totalEvenValues(values));
            Console.WriteLine(totalOddValues(values));

            Console.WriteLine("==================");
            // re-write
            // define functioin in lambda format
            // ref: http://msdn.microsoft.com/zh-tw/library/bb397687(v=vs.110).aspx
            Console.WriteLine(totalSelectValues(values, (value) => true));
            Console.WriteLine(totalSelectValues(values, (value) => value % 2 == 0));
            Console.WriteLine(totalSelectValues(values, (value) => value % 2 != 0));
        }
    }
}

```

* Execute Around Method Pattern

**part1**
```
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Patterns
{
    class Program
    {
        class Resource
        {
            public Resource()
            {
                Console.WriteLine("Creating...");
            }
            public void op1()
            {
                Console.WriteLine("op1...");
            }
            public void op2()
            {
                Console.WriteLine("op2...");
            }
            ~Resource()
            {
                Console.WriteLine("cleanup exensive resource");
            }

        }  
        public static void Main(string[] args)
        {
            {
                Resource resource = new Resource();
                resource.op1();
                resource.op2();
            }
            Console.WriteLine("out of the block");         
        }
    }
}
```

執行結果: 
![執行結果](http://farm6.staticflickr.com/5580/14064551455_dd5b4aa881_o.png)

**part2 (with using())**
```
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Patterns
{
    class Program
    {
        class Resource : IDisposable
        {
            public Resource()
            {
                Console.WriteLine("Creating...");
            }
            public void op1()
            {
                Console.WriteLine("op1...");
            }
            public void op2()
            {
                Console.WriteLine("op2...");
            }
            ~Resource()
            {
                Clearnup();
            }
            public void Dispose()
            {
                Clearnup();
                GC.SuppressFinalize(this);
            }
            private void Clearnup()
            {
                Console.WriteLine("cleanup exensive resource");
            }
        }
        public static void Main(string[] args)
        {
            // this require class that implement IDisposable
            using (Resource resource = new Resource())
            {
                resource.op1();
                resource.op2();
            }
            Console.WriteLine("out of the block");
        }
    }
}

```

執行結果
![](http://farm3.staticflickr.com/2898/14061421201_8488f6081d_o.png)

**part3 with Execute Around Method Pattern**
```
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Patterns
{
    class Program
    {
        class Resource
        {
            //Call Resource class from here
            public static void Use(Action<Resource> block)
            {
                Resource resouce = new Resource();
                try
                {
                    block(resouce);
                }
                finally
                {
                    resouce.Clearnup();
                }
                
            }

            //change public to protected
            // can't new class in normal way : class _class = new class()
            protected Resource()
            {
                Console.WriteLine("Creating...");
            }
            
            public void op1()
            {
                Console.WriteLine("op1...");
            }
            public void op2()
            {
                Console.WriteLine("op2...");
            }
            
            private void Clearnup()
            {
                Console.WriteLine("cleanup exensive resource");
            }
        }
        public static void Main(string[] args)
        {            
            {
                Resource.Use(
                    (resource) =>
                    {
                        resource.op1();
                        resource.op2();
                    });                
            }
            Console.WriteLine("out of the block");
        }
    }
}

```

執行結果
![](http://farm8.staticflickr.com/7321/14084736613_7b95ec6720_o.png)