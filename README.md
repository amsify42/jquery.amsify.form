Amsify Jquery Form
-------------------

This is a plugin for form validations, transformations, masking and sections.
```js
	$('form').amsifyForm();
```

## Requires
1. [AmsifyHelper](https://github.com/amsify42/jquery.amsify.helper)
2. Jquery-ui(If draggable sort option is being used)

# Table of Contents
1. [Validations](#validations)
2. [Transformations](#transformations)
3. [Masking](#masking)
4. [Ajax](#ajax)
5. [Form Sections](#form-setions)
6. [Settings](#settings)


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

## Transformations
We can set also transformation by two ways
1. Input attributes
2. Passing through object

### Input attributes
```html
	<form>
		<input type="text" name="name" amsify-validate="required" amsify-transform="upperCase"/>
		<input type="text" name="price" amsify-validate="required" amsify-transform="onlyDecimals"/>
	</form>
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
					transforms	: 'onlyDecimals'
				},
			]
		});
```
## Masking

## Ajax

## Form Sections

## Settings