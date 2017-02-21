# Amsify Form Plugin

This plugin provides a way to divide forms in sections, validate fields and masking of inputs.

For making form tags take effect, you can run the plugin this way

```js
  $('form').amsifyForm();
```

Now, the every form tag will start getting validated based on rules we apply

```html
  <form method="post" action="">
    <input type="submit">
  </form>
```
You can pass any other selector like ID or CLASS of the form

```html
  <form method="post" action="" id="my-id">
    <input type="submit">
  </form>
  <script>
    $('#my-id').amsifyForm();
  </script>
```

```html
  <form method="post" action="" class="my-class">
    <input type="submit">
  </form>
  <script>
    $('.my-class').amsifyForm();
  </script>
```

We will divide the explanation in three parts.

1. **Form Validations**
2. **Masking of Inputs**
3. **Form Sections** 


## Form Validations

Whatever the input fields comes under this form tags will validated based on the rules we pass. 

Lets say we add the field with required attribute or input type email
```html
  <input type="text" name="name" required/>
  <input type="email" name="email"/>
```
The above fields will be validated for null value and valid email. And error message will be displayed.

Regarding displaying error. Whenever error message is being displayed, it will either search the selector with class .field-error either just before or just after the field. It will also look for the tag with **for** selector. If you do not understand, I will make it clear by putting the error tag with field

```html
  <input type="text" name="email" required/>
  <span class="field-error"></span> 
```
**or**
```html
  <span class="field-error"></span> 
  <input type="text" name="name" required/>
```
**or**
```html
  <div>
    <input type="text" name="email" required/>
  </div>
  <span for="email"></span> 
```
Error message with attribute **for** is useful when field is outide of parant element of field or little far from field. Incase of no error tag is added, it will simply add span tag with class .field-error just after the field.
