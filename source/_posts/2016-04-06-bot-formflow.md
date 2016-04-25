---
layout: post
title: '[Bot] FormFlow'
date: 2016-04-06 06:50
comments: true
categories: "BOT"
tag: "botframework"
---
[基本版](http://docs.botframework.com/sdkreference/csharp/forms.html)

根據官方文件的作法，當一個formflow完成後，那個Converstaion就會結束，不管之後再傳給bot什麼文字，Bot都不會有任何反應, 除非一個新的ConverstaionID重新建立

但是，在某些訊息環境，是沒有辦法更新ConverstaionID的. 這時候就需要自訂一個Dialog來處理FormComplete及其他的情形
就像官方文件所提到的Dialog是非常強大的

```
[Serializable]
    public class SandwichDialog : IDialog
    {
        private readonly BuildForm<SandwichOrder> SandwichOrderForm;

        internal SandwichDialog(BuildForm<SandwichOrder> SandwichOrderForm)
        {
            this.SandwichOrderForm = SandwichOrderForm;
        }

        public async Task StartAsync(IDialogContext context)
        {
            context.Wait(MessageReceivedAsync);
        }

        public async Task MessageReceivedAsync(IDialogContext context, IAwaitable<Message> argument)
        {
            var message = await argument;
            var pizzaForm = new FormDialog<SandwichOrder>(new SandwichOrder(), this.SandwichOrderForm, FormOptions.PromptInStart);
            context.Call<SandwichOrder>(pizzaForm, FormComplete);
        }

        private async Task FormComplete(IDialogContext context, IAwaitable<SandwichOrder> result)
        {
            SandwichOrder order = null;
            try
            {
                order = await result;
            }          
            catch (OperationCanceledException)
            {
                await context.PostAsync("You canceled the form!");
                return;
            }
            catch (Exception ex)
            {
                await context.PostAsync(ex.Message);
                return;
            }

            if (order != null)
            {
                await context.PostAsync(order.ToString());
            }
            else
            {
                await context.PostAsync("Form returned empty response!");
            }

            context.Wait(MessageReceivedAsync);
        }
    }
```

這個是當pizzaForm完成後，則執行FormComplete. 
```
context.Call<T>(pizzaForm, FormComplete);
```
在 FormComplete 裡面，可以取得使用者所輸入的選項，所以後續要處理的動作會寫在此處

[Gist](https://gist.github.com/chgc/773cfc50587e0d6a000884616d27273f)
