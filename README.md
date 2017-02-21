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
