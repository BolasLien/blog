---
title: 用不同的寫法來實作 Todolist
date: 2021-08-13 11:59:36
tags:
- project
- todolist
- javascript
- vue
categories: 心得
---

## 為什麼大家都在做 TodoList？

> 因為 Todolist 包含完整的 CRUD 行為，又功能需求不複雜，很適合當作小專案來練習。

最近六角學院的公開活動 Vue3 夏令營，還有自己練習 JavaScript 的關係，用不同的寫法實作 Todolist 後，總結出上述的心得。

在這裡記錄一下寫法上的差異。

<!-- more -->
---

## Vue options api

Vue2 的寫法 (Vue3 也通)

### 起手式

```js
Vue.createApp({
  data() {
    return {
      // 資料
    }
  },
  methods: {
    // 方法
  },
  mounted() {
    // 生命週期
  },
}).mount()
```

### 不容易迷路

因為已經知道甚麼東西會寫在哪裡，在閱讀上比較不會迷路
例如：要知道`@click="addTodo"`是觸發哪個 method，就去 method object 裡面找

```js
methods: {
  addTodo() {
    if (!this.todoText) return

    // 建立一個todo
    const newTodo = {
      text: this.todoText,
      id: Date.now(),
      isComplete: false,
    }

    // 存到todolist
    this.todolist.push(newTodo)

    // 存到localStorage
    localStorage.setItem("todolist", JSON.stringify(this.todolist));

    // 清空目前輸入
    this.todoText = ''
  },
  editTodo(item) {
  this.editItem = { ...item }
  },
  cancelEdit() {
    this.editItem = {}
  },
}
```

---

## Vue composition api

Vue3 提出的 composition api 的寫法

### 跟 Vue2 通用的部分

template 的寫法大部分一樣

### 起手式

```js
Vue.createApp({
  setup() {
    // data、method或computed或生命週期都寫在這裡，沒規定你要怎樣的順序寫
    return {
      // 回傳用到的data、method或computed
    }
  },
}).mount()
```

### 不再到處都是`this.*`了

改用`ref`、`reactive`的方式來存 data，取值的時候改為`.value`。
method 就像一般 function 的寫法，要用的話直接呼叫。

```js
Vue.createApp({
  setup() {
    // data、method或computed或生命週期都寫在這裡，沒規定你要怎樣的順序寫
    const todolist = Vue.ref([])
    const todoText = Vue.ref('')

    // 刪除一個
    const deleteTodo = targetId => {
      const index = todolist.value.findIndex(item => item.id === targetId)
      todolist.value.splice(index, 1)
    }

    // 刪除全部
    const clearTodoList = () => {
      todolist.value = []
    }

    return {
      // 回傳用到的data、method或computed
      todolist,
      todoText,
      deleteTodo,
      clearTodoList,
    }
  },
}).mount()
```

computed 的寫法，依然是以前那個 function return 的味道。

```js
const showTodoList = Vue.computed(() => {
  return todolist.value.filter(item => {
    if (filter.value === '已完成') {
      return item.isComplete === true
    } else if (filter.value === '未完成') {
      return item.isComplete === false
    } else {
      return item
    }
  })
})
```

### 可以讓程式碼的功能做更好的分類

不再分成`data、method或computed或生命週期`的區塊，所以沒有範圍限制了，寫法上更有彈性了。

---

## vanilla js

就是原生 JavaScript 的寫法

### 程式碼很長

大多都是操作 DOM 的程式碼。
簡單的操作 DOM：1.先選到它、2.再綁定事件，但往往沒這麼簡單，如果功能複雜一點就會又臭又長。

### 程式碼不容易區分功能區塊

處理資料跟處理畫面的功能很容易寫在一起。

### 很容易踩到作用域跟執行順序的坑

執行順序的坑：
要自己定義程式的流程，例如初始化的時候要做甚麼事情，要甚麼時候才執行初始化？這都要看程式碼的順序決定呼叫的位置。

作用域的坑：因為我習慣用 arrow function 的寫法，但如果 element.addEventListener 的 callback 需要用 this 時，還是必須改為 function declaration 的寫法

```js
// 完成 todo
const completeTodo = e => {
  const index = todolist.findIndex(item => item.id === id)
  // this 會指向 window object
  todolist[index].isComplete = this.checked
  textElement.classList.toggle('line-through')
}

// 完成 todo
function completeTodo(e) {
  const index = todolist.findIndex(item => item.id === id)
  // this 會指向用到這個 function 的 Element object
  todolist[index].isComplete = this.checked
  textElement.classList.toggle('line-through')
}
```
---
最後，有興趣的話可以看一下我的 Todolist 。

### 我的 TodoList 功能

- 可以 `新增、呈現、編輯、刪除` todo
- 可以 `完成` todo
- 可以 `過濾(全部、已完成、未完成)` todo
- 可以把 todolist `存到 LocalStorage`
- 用 [bulma](https://bulma.io/) 自創版型

### 用不同的寫法來實作 TodoList

|        寫法         |                               Demo link                               |                                     Code link                                      |
| :-----------------: | :-------------------------------------------------------------------: | :--------------------------------------------------------------------------------: |
|   Vue options api   |   [demo](https://bolaslien.github.io/todolist/vue-options-api.html)   |   [code](https://github.com/BolasLien/todolist/blob/master/vue-options-api.html)   |
| Vue composition api | [demo](https://bolaslien.github.io/todolist/vue-composition-api.html) | [code](https://github.com/BolasLien/todolist/blob/master/vue-composition-api.html) |
|     Vanilla js      |     [demo](https://bolaslien.github.io/todolist/vanilla-js.html)      |     [code](https://github.com/BolasLien/todolist/blob/master/vanilla-js.html)      |
