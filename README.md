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

## We will divide the explanation in three parts.

1. **Form Validations**
2. **Input Transformation**
3. **Form Sections** 


## 1. Form Validations

Whatever the input fields comes under this form tags will validated based on the rules we pass. 

Lets say we add the field with required attribute or input type email
```html
  <input type="text" name="name" required/>
  <input type="email" name="email"/>
```
The above fields will be validated for null value and invalid email. And error message will be displayed.

Regarding displaying error. Whenever error message is being displayed, it will either search the selector with class .field-error either just before or just after the field. It will also look for the tag with **for** attribute. If you do not understand, I will make it clear by putting the error tag with field

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

For adding other validations, we need to add **amsify-validate** attribute in every input field we want to validate.

```html
 <input type="text" name="email" amsify-validate="required|email"/>
```
You can see, There is a | between validation rules. This field will be validated for null value and invalid email

### Below are the list of basic validations:

1. **required**
2. **email**
3. **url**
4. **onlynumber**
5. **onlydecimal**
6. **nospecialchar**
7. **alphanumeric**

### More validations with options

#### This will validate the minimum length of string
8. **minlen:2**

#### This will validate the maximum length of string
9. **maxlen:10**

#### This will validate the minimum value of number
10. **min:5**

#### This will validate the maximum value of number
11. **max:5**

#### This will validate the range of number
12. **range:5:10**

#### This will compare the field value with the value of **otherfield**
13. **compare:otherfield:equal**
13. **compare:otherfield:greater**
13. **compare:otherfield:less**

#### This will validate the field based on the value of other field
14. **alongwith:otherfield**
14. **alongwith:otherfield:3**

#### This will validate the field based on the value of other field is not
15. **apartfrom:otherfield**
15. **apartfrom:otherfield:3**

#### This will check for file extension we add with rule
16. **fileformat:jpg,png**

#### This will check emails with domain names and restrict based on names
17. **emaildomain:yahoo,gmail**

#### This validation will call post method ajax request to the url we put just after colon and validate if data['status'] is success
18. **ajax:check/field**


## 2. Input Transformation
For making input field value transformed based on the options we apply, we need to add **amsify-transform** attribute to the field.

```html
  <input type="text" name="location" amsify-tranform=""/>
```
Whatever value we set to this attribute, it will transform the input. For example if we want to make all letters uppercase
```html
  <input type="text" name="location" amsify-tranform="upperCase"/>
```

Notice that we are using camel case names inside it. We can apply multiple options to it.
```html
  <input type="text" name="location" amsify-tranform="upperCase|noSpace"/>
```
This will convert the text into uppercase as well as remove spaces from string. Below are the list of options you can use.

1. **upperCase**
2. **onlyDecimals**
3. **onlyNumbers**
4. **noSpecialChar**
5. **singleSpace**
6. **noSpace**

There is one more important option with name **mask**, it will mask the input based on patter we apply. Lets say we can mask the input in date format

```html
  <input type="text" name="dob" amsify-tranform="mask:99/99/9999"/>
```
Whenver user enter numbers without the specials characters in pattern, it will automatically be added.
Note: Pattern by default allow only numbers and consider special characters of the pattern as delimeters.

If you want to allow other inputs like alphabets or alhpanumerics, you can pass it as 3rd parameter like this

```html
  <input type="text" name="location" amsify-tranform="mask:xxx-xxx-xxx:alphabets"/>
```
```html
  <input type="text" name="location" amsify-tranform="mask:xxx-xxx-xxx:alphanumeric"/>
```


## 3. Form Sections

The basic idea behind creating the form section is to validate sections of form individually and allow submit on every section. Let me make little more clear. Let's say we have one form with four fields name, email, address and url. You want validate only name and email in first attempt and allow submit then make other section to appear which is having address and url field. Below is the example

```html
  <form action="" method="post" class="amsify-form-section">
        <input type="text" name="name" amsify-validate="required"/>
        <input type="email" name="email" amsify-validate="required|email"/>
        <input type="submit"/>
  </form>

  <form action="" method="post" class="amsify-form-section">
      <input type="text" name="address" amsify-validate="required"/>
      <input type="text" name="url" amsify-validate="required|url"/>
      <input type="submit"/>
  </form>
```

As you can, I have created two forms having inputs within them and class **.amsify-form-section** to both. This will validate and submit forms one by one with jquery.ui direction effect to the left. The complete fields will be appended in last form and submitted.

Make sure to include the latest jquery.ui.js file to make it work.
