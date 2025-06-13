# 自定义语法测试

## 普通 Markdown 功能

这是**加粗**和*斜体*文本。

这是[链接](https://example.com)。

* 这是列表项 1
* 这是列表项 2

## 自定义内联代码语法

这是一个普通的内联代码：`console.log('hello')`

这是一个自定义提及：`oss-file{"type":"mention","user_info":{"id":"123","name":"张三","avatar":"https://example.com/avatar.jpg"}}`

## 其他测试内容

> 引用内容中的自定义提及：`oss-file{"type":"mention","user_info":{"id":"456","name":"李四","avatar":"https://example.com/avatar2.jpg"}}`

代码块中的内容（不应该被解析为自定义语法）：

```markdown
`oss-file{"type":"mention","user_info":{"id":"123","name":"张三","avatar":"https://example.com/avatar.jpg"}}`
``` 