Amsify Jquery Form
-------------------

This is a plugin for form validations, transformations, masking and sections.
```js
	$('form').amsifyForm();
```

## Requires
1. [AmsifyHelper](https://github.com/amsify42/jquery.amsify.helper)
2. Jquery-ui(If form sections option is being used)

# Table of Contents
1. [Validations](#validations)
2. [Transformations](#transformations-point_up_2)
3. [Masking](#masking-point_up_2)
4. [Ajax](#ajax-point_up_2)
5. [Form Sections](#form-sections-point_up_2)
6. [More Options](#more-options-point_up_2)


## Validations

We can set validation by two ways
1. Input attributes
2. Passing object rules

### Input attributes
```html
	<form>
		<input type="text" name="name" amsify-validate="required"/>
		<input type="text" name="email" amsify-validate="required|email"/>
	</form>
```
If you notice, if there are multiple validations it is being separated by symbol **|**
```js
	$('form').amsifyForm();
```

### Passing object rules
```html
	<form>
		<input type="text" name="name"/>
		<input type="text" name="email"/>
	</form>
```
```js
	$('form').amsifyForm({
		fieldRules : [
				{
					field 	: 'name',
					rules 	: {
						required 	: {}
					}
				},
				{
					field 	: 'email',
					rules 	: {
						required 	: {},
						email 		: {}
					}
				},
			]
		});
```
List of basic validations you can use.
```txt
required
onlynumber
onlydecimal
alphanumeric
nospecialchar
email
url
```
```txt
For more validations, please check example files.
```
## Transformations [:point_up_2:](#table-of-contents)
Whatever user may type, It will transform inputs to the given option.
<br/>
Let's say you want only numbers to be allowed in input, you can add option in **amsify-transform** attribute
```html
	<input type="text" name="name" amsify-validate="required" amsify-transform="onlyNumbers"/>
```

We can also set transformation by two ways
1. Input attributes
2. Passing through object

### Input attributes
```html
	<form>
		<input type="text" name="name" amsify-validate="required" amsify-transform="upperCase"/>
		<input type="text" name="price" amsify-validate="required" amsify-transform="onlyDecimals"/>
	</form>
```
You can also pass multiple options separated by symbol **|**
```html
<input type="text" name="price" amsify-validate="required" amsify-transform="onlyDecimals|noSpace"/>
```
### Passing through object
```html
	<form>
		<input type="text" name="name"/>
		<input type="text" name="price"/>
	</form>
```
```js
	$('form').amsifyForm({
		fieldRules : [
				{
					field 	: 'name',
					rules 	: {
						required 	: {}
					},
					transforms	: 'upperCase'
				},
				{
					field 	: 'email',
					rules 	: {
						required 	: {},
						email 		: {}
					},
					transforms	: ['onlyDecimals', 'singleSpace'] // You can also pass multiple options as array
				},
			]
		});
```
List of options you can use for transformations.
```txt
upperCase
onlyDecimals
onlyNumbers
noSpecialChar
singleSpace
noSpace
```
## Masking [:point_up_2:](#table-of-contents)
This will do the masking of input based on given pattern.
<br/>
Let's say you want to allow date in particular pattern
```txt
	99/99/9999
```
You can set this pattern in input attribute like this
```html
	<input type="text" name="date" amsify-validate="required" amsify-mask="99/99/9999"/>
```
We can also set masking by two ways
1. Input attributes
2. Passing through object

### Input attributes
```html
	<form>
		<input type="text" name="date" amsify-validate="required" amsify-mask="99/99/9999"/>
		<input type="text" name="phone" amsify-validate="required" amsify-mask="(999) 999-9999"/>
	</form>
```
For allowing only alphabets or numeric or alhpanumerics, you can pass option like this
```html
	<form>
		<input type="text" name="date" amsify-validate="required" amsify-mask="99/99/9999::numbers"/>
		<input type="text" name="address" amsify-validate="required" amsify-mask="xxx-xxx-xxx::alphanumeric"/>
		<input type="text" name="address2" amsify-validate="required" amsify-mask="xxx-xxx-xxx::alphabets"/>
	</form>
```
**Note:** Attribute value is separated by double colon. If you don't want to pass second option, it will take **numbers** as default.

### Passing through object
```html
	<form>
		<input type="text" name="date"/>
		<input type="text" name="phone"/>
	</form>
```
```js
	$('form').amsifyForm({
		fieldRules : [
			{
				field 	: 'date',
				rules 	: {
					required : {}
				},
				mask 	: '99/99/9999'
			},
			{
				field 	: 'phone',
				rules 	: {
					required : {}
				},
				mask 	: '(999) 999-9999'
			},
		]
	});
```
For allowing only alphabets or numeric or alhpanumerics, you can pass option like this
```html
	<form>
		<input type="text" name="date"/>
		<input type="text" name="address"/>
		<input type="text" name="address2"/>
	</form>
```
```js
	$('form').amsifyForm({
		fieldRules : [
			{
				field 	: 'date',
				rules 	: {
					required : {}
				},
				mask 	: ['99/99/9999', 'numbers']
			},
			{
				field 	: 'address',
				rules 	: {
					required : {}
				},
				mask 	: ['xxx-xxx-xxx', 'alphanumeric']
			},
			{
				field 	: 'address2',
				rules 	: {
					required : {}
				},
				mask 	: ['xxx-xxx-xxx', 'alphabets']
			},
		]
	});
```
**Note:** mask value is passed as an array with second element as type of masking. If you don't want to pass second option, it will take **numbers** as default.

## Ajax [:point_up_2:](#table-of-contents)
You can set ajax action in form attribute
```html
	<form amsify-ajax-action="/ajax-submit.php">
		<input type="text" name="name"/>
		<input type="submit"/>
	</form>
```
You can also set ajax action through initilization.
```html
	<form>
		<input type="text" name="name"/>
		<input type="submit"/>
	</form>
```
```js
	$('form').amsifyForm({
		ajax 		: {
			action 	: '/ajax-submit.php',
		}
	});
```
action url can be both absolute or relative. You can also set submit selector, loading text and callback functions like this
```html
	<form>
		<input type="text" name="username"/>
		<input type="password" name="password"/>
		<input type="submit" id="login"/>
	</form>
```
```js
	$('form').amsifyForm({
		submit 		:'#login',
		loadingText	:'Authorising...',
		ajax 		: {
			action 			: '/login.php',
			afterSuccess : function(data) {
				console.info(data);
			},
			afterError : function(data) {
				console.info(data);
			},
		}
	});
```
**Note:** Callbacks **afterSuccess** and **afterError** will be exexuted based on response you sent from server.
<br/>
**afterSuccess** executed when status in response is true
```js
	{
		status: true,
		message: 'Submitted successfully'
	}
```
**afterError** executed when status in response is equal to 'error' or 'errors'
```js
	{
		status: 'error',
		message: 'Some error has occured'
	}
```
## Form Sections [:point_up_2:](#table-of-contents)
Form sections can be used, if you want to validate multiple form one by one and finally submit the last form with all the inputs belonging to all the forms.
<br/>
For doing this, you simply have to do two things
```txt
1. Make sure you have multiple forms
2. Initialize plugin with selector which all the forms are having
```
Below is the example
```html
	<form clas="sections">
		<input type="text" name="name" amsify-validate="required"/>
		<input type="submit"/>
	</form>
	<form clas="sections">
		<input type="text" name="email" amsify-validate="email"/>
		<input type="submit"/>
	</form>
	<form clas="sections">
		<input type="text" name="address" amsify-validate="required"/>
		<input type="submit"/>
	</form>
```
```js
	$('.sections').amsifyForm({
		formSections: true;
	});
```
You can set timer, if you want form to get submitted automatically after some interval.
```html
	<div>
		Timer: <span amsify-all-forms-timer="20"></span>
	</div>
```
**Note:** You can put the selector **amsify-all-forms-timer** anywhere with number of seconds in it.
<br/>
You can also set timer, if you want each form to submit automatically after some interval.
```html
	<form>
		<div>
			Timer: <span amsify-form-timer="20"></span>
		</div>
		<input type="text" name="name" amsify-validate="required"/>
		<input type="submit"/>
	</form>
	<form>
		<div>
			Timer: <span amsify-form-timer="20"></span>
		</div>
		<input type="text" name="email" amsify-validate="email"/>
		<input type="submit"/>
	</form>
	<form>
		<div>
			Timer: <span amsify-form-timer="20"></span>
		</div>
		<input type="text" name="address" amsify-validate="required"/>
		<input type="submit"/>
	</form>
```
```js
	$('form').amsifyForm({
		formSections: true;
	});
```
**Note:** You can put the selector **amsify-form-timer** anywhere within each form with number of seconds in it.

## More Options [:point_up_2:](#table-of-contents)
### Validate On
You can pass custom event name for binding validation
```js
	$('form').amsifyForm({
		validateOn: 'keyup focusout',
	});
```
### Secure Attributes
When you set validations or transformation or masking from input attributes and you don't want it to appear, you can pass this option as true.
```js
	$('form').amsifyForm({
		secureAttributes: true,
	});
```
### Custom Error Class
You can set custom class name to the error tags which are being generated.
```js
	$('form').amsifyForm({
		errorClass: '.custom-error',
	});
```
