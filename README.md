# Amsify Jquery Form Plugin

This plugin provides a way to divide forms in sections, validate fields, transformation and masking of inputs.

#### Requirements
1. *jquery.js* file
2. *jquery.amsify.helper.js* file which is there in my repository
3. *jquery-ui.js* (in case you are using form sections)

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

Whatever the input fields comes under this form tags will be validated based on the rules we pass. 

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
You can see, There is a or symbol | between validation rules. This field will be validated for null value and invalid email

### Below are the list of basic validations:
```txt
1. required
2. email
3. url
4. onlynumber
5. onlydecimal
6. nospecialchar
7. alphanumeric
```
### More validations with options

#### This will validate only when value is not null
```txt
requiredif
```
```html
	<input type="text" name="number" amsify-validate="requiredif|minlen:10"/>
```

#### This will validate the minimum length of string
```txt
minlen:{number}
```
```html
	<input type="text" name="phone-number" amsify-validate="required|minlen:10"/>
```
The example above shows, how to use it. 10 is passed along with colon separator. This will ask user to enter atleast 10 character of string. Below are some more validations mentioned with type of options to be pass with validation rule. 
probably you understood now, how to use it.


#### This will validate the maximum length of string
```txt
maxlen:{number}
```

#### This will validate the minimum value of number
```txt
min:{number}
```

#### This will validate the maximum value of number
```txt
max:{number}
```

#### This will validate the range of number
```txt
range:{from}:{to}
```

#### This will compare the field value with the value of **otherfield**
This validation will compare the two fields and display errors unless both are same. Below example will give some more idea
<br />
```txt
compare:{otherFieldName}:equal
```
```html
	<input type="password" name="new-password" amsify-validate="required|minlen:5"/>
	<input type="password" name="confirm-password" amsify-validate="compare:new-password:equal"/>
```
As you can see, I have set other field name **new-password** to compare with **confirm-password** and passed **equal** as third option to check whether both field values are equal. If you do not pass third option, it will consider it **equal** by default.<br />

Below two options works only with numeric/decimal values, as it compares greater than/lesser than directly to the values not string length.<br />
```txt
compare:{otherFieldName}:greater
compare:{otherFieldName}:less
```

#### This will validate the field based on the value of other field
This validation checks the mentioned otherFieldName value. If its not null, it will ask to fill the current field.<br />
```txt
alongwith:{otherFieldName}
```
This option also do the same thing, except it check the value of other and compare with the value we pass in third section of this validation.<br />
```txt
alongwith:{otherFieldName}:{value}
```
#### This will validate the field based on the value of other field is not and this validation do the opposite of alongwith validation.
```txt
apartfrom:{otherFieldName}
apartfrom:{otherFieldName}:{value}
```

#### This will check for file extension we pass with rule
```txt
fileformat:{extensionsSeparatedByComma}
```
Below is the example<br />
```txt
fileformat:jpg,png
```

#### This will check emails with domain names and restrict based on names
```txt
emaildomain:{DomainsSeparatedByComma}
```
Below is the example<br />
```txt
emaildomain:yahoo,gmail
```

#### This validation is seprated by double colon and will call post method ajax request to the url we put just after colon and validate if data['status'] is success from ajax response. You can either pass absolute or relative url. Make sure to put proper protocol if you are passing absolute url.
```txt
ajax::{ajaxMethod}
```

Absolute URL example<br />
```txt
ajax::http://mysite/check/email
```
Relative URL example<br />
```txt
ajax::check/email
```

#### You can also set custom rule in javascrpt like this
```js
$('#my-form').amsifyForm({
	rules 		: {
		username : function(value) {
			if(value != 'amsify') {
				return 'Name should be amsify';
			} else {
				return true;
			}
		},
	},
});
```
As you can see above, in rules key we are passing callback function with one parameter which is the value of field **username**. The key of the callback function is the name of field.

You can pass multiple callback functions in rules for different fields. <br />
```js
$('#my-form').amsifyForm({
	rules 		: {
		username : function(value) {...},
		password : function(value) {...},
	},
});
```

This function should either return true(if validated according to your logic) or error message which is the string.<br />

#### Calling Ajax on Submit
```js
$('#my-form').amsifyForm({
	ajax 		: {
		action 		: 'check/email',
		callback 	: function(data) {
			console.info(data);
		}
	},
});
```

For making your form call Ajax Post method instead of redirecting, you can do it by adding **ajax** option with two keys **action** and **callback**. Action url can be either absolute or relative. Callback function is having one paramter which will recieve date in both cases success or failure.<br />


#### Settings you can pass to this plugin for form validations
```js
$('form').amsifyForm({
	autoValidate: false,
	validateOn: 'focusout',
	submit:'#my-submit',
	loadingText:'Signing in...'
});
```

1. autoValidate - When it is set as false will make form validate only on submit.
2. validateOn - Will make the fields validate based on option we provide like 'change' or 'keyup' or 'focusout' or combination of it with spaces between them.
3. submit - You can pass submit selector here, in case it is helpful.
4. loadingText - Will show the text on submit button when it is successfully validated and submitted.


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
  <input type="text" name="dob" amsify-tranform="mask::99/99/9999"/>
```
Not that you have to put double colon as a separator in this option.
Whenver user enter numbers without the specials characters in pattern, it will automatically be added.
Note: Pattern by default allow only numbers and consider special characters and spaces of the pattern as separators.

If you want to allow other inputs like alphabets or alhpanumerics, you can pass it as 3rd parameter like this

```html
  <input type="text" name="location" amsify-tranform="mask::xxx-xxx-xxx::alphabets"/>
```
```html
  <input type="text" name="location" amsify-tranform="mask::xxx-xxx-xxx::alphanumeric"/>
```


## 3. Form Sections

For form sections to take, we need to include jquery-ui.js file in it.

The basic idea behind creating the form section is to validate sections of form individually and allow submit on every section. Let me make it little more clear. 

Let's say we have one form with four fields **name**, **email**, **address** and **url**. You want validate only **name** and **email** in first attempt and allow submit then make other section to appear which is having **address** and **url** field. 
Below is the example

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

As you can, I have created two forms having inputs within them and added class **.amsify-form-section** to both. This will validate and submit forms one by one with jquery.ui direction effect to the left. The complete fields will be appended in last form and submitted.

Make sure to include the latest jquery-ui.js file to make it work.

### There are couple of more options in form sections
1. **Form Section with timer**
2. **Form Section with Multiple timer**

These options will auto submit the form if user does not submit based on the seconds we pass to it. Below is the example of timer

```html
  <div class="amsify-form-timer-section" amsify-all-forms-timer="120">
  Timer: <span class="amsify-form-timer"></span>
  </div>
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
The extra div tag having attribute **amsify-all-forms-timer** must be set with number of seconds we allocate for all forms

For multiple timer for each form section.

```html
  <form action="" method="post" class="amsify-form-section" amsify-form-timer="60">
  <div class="amsify-form-timer-section">
  Timer: <span class="amsify-form-timer"></span>
  </div>
        <input type="text" name="name" amsify-validate="required"/>
        <input type="email" name="email" amsify-validate="required|email"/>
        <input type="submit"/>
  </form>

  <form action="" method="post" class="amsify-form-section" amsify-form-timer="60">
  <div class="amsify-form-timer-section">
  Timer: <span class="amsify-form-timer"></span>
  </div>
      <input type="text" name="address" amsify-validate="required"/>
      <input type="text" name="url" amsify-validate="required|url"/>
      <input type="submit"/>
  </form>
```
Each form section will wait until the number of seconds we pass is completed and auto submit to transit the next section or submit the complete form if its the last section.
