 // Amsify42 Form 1.0.0
 // http://www.amsify42.com
 (function(AmsifyForm, $, undefined) {
    /**
     * form selector
     * @type {String}
     */
    var formSelector        = 'form';
    /**
     * based on value auto validation will work
     * @type boolean
     */
    var autoValidate        = true;
    /**
     * validate the form based on option passed
     * @type {String}
     */
    var validateOn          = 'change focusout';
    /**
     * submit button selector
     * @type {String}
     */
    var submitSelector      = '';
    /**
     * text appear on submit button after submission
     * @type {String}
     */
    var loadingText         = '';
    /**
     * error class for all fields
     * @type {String}
     */
    var errorClass          = '.field-error';
    /**
     * expression for testing email address
     * @type {RegExp}
     */
    var filteremail         = /^\b[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b$/i;
    /**
     * expression for testing url
     * @type {RegExp}
     */
    var filterurl           = /^(https?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i;

    /**
     * Making method available through Jquery selector
     * @param  {object} config
     */
    $.fn.amsifyForm = function(config) {
        if(config !== undefined) config['form'] = this;
        else var config = {form: this};
        var amsifyForm = new AmsifyForm.Form;
            amsifyForm.setRules(config);
    };
    
    /**
     * init the plugin with global settings
     * @param  {object} config
     */
    AmsifyForm.init = function(config) {
      setConfig(config); 
      var amsifyForm = new AmsifyForm.Form;
          amsifyForm.setRules();
    };

    /**
     * run the plugin with each instance settings
     * @param {object} config
     */
    AmsifyForm.set = function(config) {
      var newForm = new AmsifyForm.Form();
      newForm.setRules(config);
    };


    /**
     * for showing field error
     * @param  {string} fieldName
     * @param  {string} message
     */
    AmsifyForm.showError = function(fieldName, message) {
      showError(fieldName, message);
    };

    /**
     * for hiding field error
     * @param  {string} fieldName
     */
    AmsifyForm.cleanError = function(fieldName) {
      cleanError(fieldName);
    };

    /**
     * This is like class which can be instantiated multiple times with each setting rules
     */
    AmsifyForm.Form = function() {
      /**
       * set the rules for form
       * @param {object} config
       */
      AmsifyForm.Form.prototype.setRules = function(config) {
        var setFormSelector = formSelector;
        if(config !== undefined) {
          if(config.form !== undefined) { setFormSelector  = config.form};
          if(config.validateOn !== undefined) { validateOn  = config.validateOn};
          if(config.autoValidate !== undefined) { autoValidate  = config.autoValidate};
        }

        // Each form with passed selector will be effected
        $(setFormSelector).each(function(index, form){
          // Check for multiple form sections
          if($(this).hasClass('amsify-form-section')) {
            $('.amsify-form-section:first').show();
            if(index == 0) setFixedCloneMethod();
          }
          // End check for multiple form sections

          /**
           * collect field rules
           * @type {Array}
           */
          var fieldRules      = [];
          /**
           *  get all the inputs from form selector
           * @type {object}
           */
          var inputs          = $(this).find(':input');

          // Iterate each input from form
          $.each(inputs, function(key, input){

              // If AmsifyForm Validate Attribute is set
              if($(input).attr('amsify-validate') || $(input).prop('required')) {

                var fieldRuleRow  = $(input).attr('name');
                // Set Title if it is available
                if(AmsifyHelper.detectIE()) {
                  fieldRuleRow  += ':'+$(input).attr('name');
                } else if($(input).prop('placeholder') != '') {
                  fieldRuleRow  += ':'+$(input).attr('placeholder');
                } else {
                  fieldRuleRow  += ':'+$(input).attr('name');
                }

                // If required attribute is found
                if($(input).is('[required]')) {
                  $(input).removeAttr('required');
                  fieldRuleRow  += '|required';
                }

                // If input type is email
                if($(input).attr('type') == 'email') {
                  fieldRuleRow  += '|email';
                }
                $(input).addClass('amsify-validate-field');
                fieldRuleRow  += '|'+$(input).attr('amsify-validate');

                // Check if Ajax validation exist
                if($(input).attr('amsify-validate')) {
                  var checkValidations = $(input).attr('amsify-validate').split('|');
                  $.each(checkValidations, function(index, checkValidation){
                    if(checkValidation.indexOf('ajax') == 0) {
                      var checkValidator = checkValidation.split(':');
                      if(checkValidator[0] == 'ajax') {
                        $(input).attr('amsify-ajax-checked', '0');
                      }
                    }
                  });
                }

                // If Validation rule is (alongwith)
                if(fieldRuleRow.indexOf('alongwith') == 0) {
                  $(input).prop('disabled', 1);
                  var findFieldArray = fieldRuleRow.split('alongwith:');
                  if(findFieldArray.length > 1) {
                    var fieldInfoArray  = findFieldArray[1].split(':');
                    var fieldInfoField  = $(input).attr('name');
                    if(fieldInfoArray.length > 1) {
                      fieldInfoField += ':'+fieldInfoArray[1];
                    }
                    if($(getFormField(fieldInfoArray[0])).attr('amsify-alongwith-field')) {
                      var lastValue       = $(getFormField(fieldInfoArray[0])).attr('amsify-alongwith-field');
                      $(getFormField(fieldInfoArray[0])).attr('amsify-alongwith-field', lastValue+'|'+fieldInfoField);
                    } else {
                      $(getFormField(fieldInfoArray[0])).attr('amsify-alongwith-field', fieldInfoField);
                    }

                    // If no validation is applied, just add dummy validation for rotation
                    if(!$(getFormField(fieldInfoArray[0])).attr('amsify-validate')) {
                      fieldRules.push(fieldInfoArray[0]+'|'+'check');
                    }
                  }
                }

                // If Validation rule is (apartfrom)
                if(fieldRuleRow.indexOf('apartfrom') == 0) {
                  var findFieldArray = fieldRuleRow.split('apartfrom:');
                  if(findFieldArray.length > 1) {
                    var fieldInfoArray  = findFieldArray[1].split(':');
                    var fieldInfoField  = $(input).attr('name');
                    if(fieldInfoArray.length > 1) {
                      fieldInfoField += ':'+fieldInfoArray[1];
                    }
                    if($(getFormField(fieldInfoArray[0])).attr('amsify-apartfrom-field')) {
                      var lastValue       = $(getFormField(fieldInfoArray[0])).attr('amsify-apartfrom-field');
                      $(getFormField(fieldInfoArray[0])).attr('amsify-apartfrom-field', lastValue+'|'+fieldInfoField);
                    } else {
                      $(getFormField(fieldInfoArray[0])).attr('amsify-apartfrom-field', fieldInfoField);
                    }
                    // If no validation is applied, just add dummy validation for rotation
                    if(!$(getFormField(fieldInfoArray[0])).attr('amsify-validate')) {
                      fieldRules.push(fieldInfoArray[0]+'|'+'check');
                    }
                  }
                }
                fieldRules.push(fieldRuleRow);
              }

              // Check form transform
              if($(input).attr('amsify-transform')) {
                var transforms      = $(input).attr('amsify-transform');
                var transformsArray = transforms.split('|');

                if(transformsArray.length > 0) {
                  var fieldName     = $(input).attr('name');
                  $.each(transformsArray, function(index, transform) {
                    if(transform.indexOf('mask') == 0) {
                      var maskArray = transform.split('::');
                      if(AmsifyForm[maskArray[0]] !== undefined) {
                        if(maskArray[2] !== undefined) {
                          AmsifyForm[maskArray[0]](fieldName, maskArray[1], maskArray[2]);
                        } else {
                          AmsifyForm[maskArray[0]](fieldName, maskArray[1]);
                        }
                      }
                    }
                    else {
                      if(AmsifyForm[transform] !== undefined) {
                        AmsifyForm[transform](fieldName);
                      }
                    }
                  });
                }
              }
              // End
            });

          // Check for auto validate setting
          var autoValidateIn = autoValidate;
          if(config !== undefined) {
            if(config.autoValidate === undefined || config.autoValidate == true) {
              autoValidateIn = true;
            }
          }
          if(autoValidateIn) {
            AmsifyForm.setValidation(validateOn ,fieldRules, config, this);
          }
          //End of checking for auto validate setting

          AmsifyForm.submitForm(fieldRules, this, config);

          // Check if count down is set
          if(index == 0) {
            if($(this).attr('amsify-form-timer')) {
                var seconds = $(this).attr('amsify-form-timer');
                startCountDown(this, seconds);
            } else if($('[amsify-all-forms-timer]').length) {
                var seconds = $('[amsify-all-forms-timer]').attr('amsify-all-forms-timer');
                startCountDown(this, seconds);
            }
          }
          // End of Checking if count down is set
        });
      };
    };




/**
 * 
 ************ All form validations functionalities section ************
 *
 **/

    /**
     *  set the validations for each form
     * @param {string} validateOn
     * @param {array} fieldRules
     * @param {[object} config
     * @param {selector} form
     */
    AmsifyForm.setValidation = function(validateOn, fieldRules, config, form) {

      $(document).on(validateOn, function(event) {
        var observedField   = event.target.name;
        var fieldArray      = fieldRules;
        var len             = fieldArray.length;
        var i               = 0;

        while(i<len) {
          //Split the string for checking validations
          var validationArray = fieldArray[i].split('|');
          var fieldNameArray  = validationArray[0].split(':');
          var getFieldName    = fieldNameArray[0];

            if(getFieldName == observedField) {
             var targetFieldRules = [];
             targetFieldRules.push(fieldArray[i]);
             if(AmsifyForm.validate(targetFieldRules, form).errors == true) {
             }
             else if(config !== undefined && config.rules !== undefined && config.rules[getFieldName] !== undefined) {
              result = fieldCustomRule(getFieldName, config.rules[getFieldName]);
              if(result !== true) {
                showError(getFieldName, result);
              } else {
                cleanError(getFieldName);
              }
            } else {
              cleanError(getFieldName); 
            }
          }
          i++;
        }
      });
    };

    /**
     *  take care submit action of form
     * @param  {array} fieldRules
     * @param  {selector} form
     * @param  {object} config
     */
    AmsifyForm.submitForm = function(fieldRules, form, config) {

        var setSubmitSelector = submitSelector;
        var setLoadingText    = loadingText;

        if(config !== undefined) {
          if(config.loadingText !== undefined) { setLoadingText  = config.loadingText};
          if(config.submit !== undefined) { $(config.submit).click(function(){ $(form).submit(); }); };
        }

        // First Prevent Submit on Enter
        $(document).on('keypress', form, function(e) {
          var keyCode = e.keyCode || e.which;
          if(keyCode === 13) { 
            e.preventDefault();
            return false;
          }
        });

        // Allow click submit button if last field type is not textarea  
        var lastField = filterFieldForKeyup(fieldRules);
        if(lastField != null) {
          $(getFormField(lastField)).keyup(function(e){
            if(e.keyCode == 13){
              $submitSelector = getSubmitSelector(form, config);
              $submitSelector.click();
            }
          });
        }

        // If button is pressed for skipping section of form
        $(document).on('click', '.amsify-skip-form', function(e){
          e.stopImmediatePropagation();
          form = $(this).closest('form');
          if($(form).hasClass('amsify-form-section') && $(form).next('.amsify-form-section').length) {
            transitNextForm(form);
          }
        });

        $(form).submit(function(e){
          e.stopImmediatePropagation();
          clearErrors();
          // Check if allow submit is available
          var allowed = 'no';
          if($(this).find('input[name=allow-submit]').length) {
            allowed = $(this).find('input[name=allow-submit]').val();
          }
          // End of Checking
          $submitSelector = getSubmitSelector(form, config);
          var defaultText = $submitSelector.html();
          var result      = AmsifyForm.validate(fieldRules, form); 
          $submitSelector.prop('disabled', true); 
          if(setLoadingText) {
            $submitSelector.html(setLoadingText);
          }
          if(result.errors == false || allowed == 'yes') {

              if(allowed != 'yes') {
                // Performing custom rules
                if(config !== undefined && config.rules !== undefined) {
                  if(processCustomRules(config.rules) !== true) {
                    return AmsifyHelper.stopSubmit(e, submitSelector, defaultText, false);
                  }
                }
                // End fo performing custom rules   


                // Check for multiple form sections
                if($(form).hasClass('amsify-form-section') && $(form).next('.amsify-form-section').length) {
                  AmsifyHelper.stopSubmit(e);
                  transitNextForm(form);
                }
                // End of Check for multiple form sections
                // Checking Ajax 
                else if(config !== undefined && config.ajax !== undefined) {
                  e.preventDefault();
                  if($(form).attr('clear-interval')) {
                    clearInterval($(form).attr('clear-interval'));
                  }
                  AmsifyForm.submitAjaxForm(form, config.ajax, submitSelector, defaultText);
                }
                 // End of checking Ajax

                // Stopping if allow submit is no 
                else {
                  if($(form).find('[amsify-ajax-checked="0"]').length) {
                    AmsifyHelper.stopSubmit(e, submitSelector, defaultText);
                  }
                }
                // End of stopping if allow submit is no 
               } else {
                  // If allowed is yes but fields are not validated yet
                  if(result.errors == true) {
                    AmsifyHelper.stopSubmit(e, submitSelector, defaultText);
                    if(result.topField != '') { $(getFormField(result.topField)).focus();}
                  }
               }

             } else {  
              AmsifyHelper.stopSubmit(e, submitSelector, defaultText);
              if(result.topField != '') { $(getFormField(result.topField)).focus();}
            }
          });
      };

      /**
       *  process custom rules and return
       * @param  {object} rules
       * @return {boolean}
       */
      function processCustomRules(rules) {
        var results = [];
        if(rules !== undefined) {
          $.each(rules, function(index, rule){
            results.push(fieldCustomRule(index, rule));
          });
        }

        var response = true;
        $.each(results, function(index, result){
          if(result !== true) {
            response = false;
            return false;
          }
        });
        return response;
      };

      /**
       *  check each custom rule and validate
       * @param  {string} field
       * @param  {function} rule
       * @return {boolean}
       */
      function fieldCustomRule(field, rule) {
        var result = rule($(getFormField(field)).val());
        if(result !== true) {
          AmsifyForm.showError(field, result);
          return result;
        }
        return true;
      };

      /**
       * submit ajax form
       * @param  {selector} form
       * @param  {object} config
       * @param  {selector} submitSelector
       * @param  {string} defaultText
       */
      AmsifyForm.submitAjaxForm = function(form, config, submitSelector, defaultText) {

        var ajaxConfig    = {};
        var targetMethod  = '';
        if(config.action !== undefined) {
          targetMethod = AmsifyHelper.getActionURL(config.action);
        } else {
          targetMethod = AmsifyHelper.base_url;
        }

        ajaxConfig['afterSuccess'] = function(data) {
          if(config.callback && typeof config.callback == "function") {
             config.callback(data);
          }
          $submitSelector.prop('disabled', false).html(defaultText);  
        };
        ajaxConfig['afterResponseError'] = function(data) {
          if(config.callback && typeof config.callback == "function") {
            config.callback(data);
          }
          $submitSelector.prop('disabled', false).html(defaultText); 
        };

        AmsifyHelper.callAjax(targetMethod, AmsifyHelper.getFormData(form, true), ajaxConfig);
      };

      /**
       *  do validation on fields based on rules
       * @param  {array} fieldRules
       * @param  {selector} form
       * @return {array}
       */
      AmsifyForm.validate = function(fieldRules, form) {

        var fieldArray  = fieldRules;
        var len         = fieldArray.length;
        var i           = 0;
        var errors      = false;
        var types       = [];
        var topField    = '';
        var result      = {};

        while(i<len) {

              // Split the string for checking validations
              var validationArray = fieldArray[i].split('|');
              var testCases       = [];
              //var getFieldName    = validationArray[0];
              var fieldNameArray  = validationArray[0].split(':');
              var getFieldName    = fieldNameArray[0];
              var fieldName       = getFieldName;

              // Getting Label for printing message
              var getLabelName    = fieldName;
              if(fieldNameArray.length > 1) {
                getLabelName    = fieldNameArray[1];
              }
              // End of getting Label for printing message

              var fieldType       = $(getFormField(fieldName)).prop('tagName');
              //types.push(fieldType);
              // Fetching value based on type of input 
              var fieldvalue     = getValueByTagInputType(fieldType, fieldName);          
              // End of Fetching value based on type of input
              
              // If field has atleast one test case validation
              if(validationArray.length > 1) {
                 // Iterating validation items
                  $.each(validationArray, function(index, item) {
                  // If name is not id of field
                  if(index != 0) {

                  var customMessage = '';
                  // If custom message is set
                  if(item.indexOf('message-') != -1) {
                   var messageArray = item.split('message-');
                   customMessage    = messageArray[1];
                  }

                  // Required if not empty
                  if($.inArray('requiredif', validationArray) != -1) {
                    if(fieldvalue == '') {
                      return true;
                    }
                  }

                  // If along with field is associated with this field  
                  if($(getFormField(fieldName)).attr('amsify-alongwith-field')) {
                    var fieldsArray = $(getFormField(fieldName)).attr('amsify-alongwith-field').split('|');
                    var i = 0;
                    while(i<fieldsArray.length) {
                      var fieldInfoArray = fieldsArray[i].split(':');
                      if(fieldInfoArray.length > 1) {
                        if(fieldvalue == fieldInfoArray[1]) {
                          $(getFormField(fieldInfoArray[0])).prop('disabled', 0);
                        } else {
                          $(getFormField(fieldInfoArray[0])).val('').prop('disabled', 1);
                          cleanError(fieldInfoArray[0]);
                        }
                      }
                      else if(fieldInfoArray.length > 0) {
                        if($.trim(fieldvalue) != '') {
                          $(getFormField(fieldInfoArray[0])).prop('disabled', 0);
                        } else {
                          $(getFormField(fieldInfoArray[0])).val('').prop('disabled', 1);
                          cleanError(fieldInfoArray[0]);
                        }
                      }
                      i++;
                    }
                  }

                  // If apart from field is associated with this field  
                  if($(getFormField(fieldName)).attr('amsify-apartfrom-field')) {
                    var fieldsArray = $(getFormField(fieldName)).attr('amsify-apartfrom-field').split('|');
                    var i = 0;
                    while(i<fieldsArray.length) {
                      var fieldInfoArray = fieldsArray[i].split(':')                  
                      if(fieldInfoArray.length > 1) {  
                        var valuesArray = fieldInfoArray[1].split(',');                
                        var inArray     = $.inArray(fieldvalue, valuesArray);
                        if(valuesArray.length > 1 && inArray != -1) {
                          $(getFormField(fieldInfoArray[0])).val('').prop('disabled', 1);
                          cleanError(fieldInfoArray[0]);
                        } else if(fieldvalue != fieldInfoArray[1]) {
                          $(getFormField(fieldInfoArray[0])).prop('disabled', 0);
                        } else {
                          $(getFormField(fieldInfoArray[0])).val('').prop('disabled', 1);
                          cleanError(fieldInfoArray[0]);
                        }
                      }
                      else if(fieldInfoArray.length > 0) {
                        if($.trim(fieldvalue) == '') {
                          $(getFormField(fieldInfoArray[0])).prop('disabled', 0);
                        } else {
                          $(getFormField(fieldInfoArray[0])).val('').prop('disabled', 1);
                          cleanError(fieldInfoArray[0]);
                        } 
                      }
                      i++;
                    }
                  }

                // If validation is: required
                if(item == 'required' || item.indexOf('required') == 0) {
                  if(fieldvalue == '') {
                    errors = true;
                    var message = upperCase(getLabelName)+' is required';
                    if(customMessage != '')                    
                      message = customMessage;                  

                    showError(fieldName, message);
                    if(topField == '') topField = fieldName;
                    return false;
                  } 
                }

                // If validation is: email
                if(item == 'email' || item.indexOf('email') == 0) { 
                 if(!filteremail.test(fieldvalue)) {
                  errors = true;
                  var message = 'Please enter valid email address';
                  if(customMessage != '')                    
                    message = customMessage;

                  showError(fieldName, message);
                  if(topField == '') topField = fieldName;
                  return false;
                  }
                }
            
                // If validation is: url
                if(item == 'url' || item.indexOf('url') == 0) {
                   if(!filterurl.test(fieldvalue)) {
                    errors = true;
                    var message = 'Please enter valid url';
                    if(customMessage != '')                    
                      message = customMessage;

                    showError(fieldName, message);
                    if(topField == '') topField = fieldName;
                    return false;
                  }
                }
                
                // If validation is: only number
                if(item == 'onlynumber' || item.indexOf('onlynumber') == 0) { 
                 if(isNaN(fieldvalue)) {
                  errors = true;
                  var message = 'Please enter valid number';
                  if(customMessage != '')                    
                    message = customMessage;

                  showError(fieldName, message);
                  if(topField == '') topField = fieldName;
                  return false;
                  }
                }

                // If validation is: only Decimals
                if(item == 'onlydecimal' || item.indexOf('onlydecimal') == 0) { 
                 if(/[^0-9\.]/g.test(fieldvalue) == true) {
                  errors = true;
                  var message = 'Please enter valid decimals';
                  if(customMessage != '')                    
                    message = customMessage;

                  showError(fieldName, message);
                  if(topField == '') topField = fieldName;
                  return false;
                  }
                }
                
                // If validation is: no special char
                if(item == 'nospecialchar' || item.indexOf('nospecialchar') == 0) { 
                 if(/^[a-zA-Z0-9- ]*$/.test(fieldvalue) == false) {
                  errors = true;
                  var message = 'Special characters not allowed';
                  if(customMessage != '')                    
                    message = customMessage;

                  showError(fieldName, message);
                  if(topField == '') topField = fieldName;
                  return false;
                  }
                }

                // If validation is: alphanumeric
                if(item == 'alphanumeric' || item.indexOf('alphanumeric') == 0) { 
                  if(!isAlphaNumeric(fieldvalue)) {
                  errors = true;
                  var message = 'Must be alphanumeric';
                  if(customMessage != '')                    
                    message = customMessage;

                  showError(fieldName, message);
                  if(topField == '') topField = fieldName;
                  return false;
                  }
                }
                
                // If validation is: compare
                if(item.indexOf('compare') == 0) { 
                  var compareArray    = item.split(':');
                  var compareWith     = compareArray[1];
                  var compareCriteria = 'equal';
                  if(compareArray[2] !== undefined) {
                    compareCriteria = compareArray[2];
                  }

                  var defaultValue = fieldvalue;
                  var compareValue = $(getFormField(compareWith)).val();                 

                if(compareCriteria == 'equal') {
                  if(defaultValue != compareValue) {
                    errors = true;
                    var message = 'Fields are not matching';
                    if(customMessage != '')                    
                      message = customMessage;

                    showError(fieldName, message);
                    showError(compareWith, message);
                    if(topField == '') topField = fieldName;
                    return false;
                  }
                }
                else if(isNaN(fieldvalue)) {
                    errors = true;
                    var message = upperCase(getLabelName)+' and '+upperCase(compareWith)+' must be a number';
                    if(customMessage != '')                    
                      message = customMessage;

                    showError(fieldName, message);
                    showError(compareWith, message);
                    if(topField == '') topField = fieldName;
                    return false;
                }
                if(compareCriteria == 'greater' || item.indexOf('required') == 0) {
                  if(defaultValue <= compareValue) {
                    errors = true;
                    var message = upperCase(getLabelName)+' must be greater than '+upperCase(compareWith);
                    if(customMessage != '')                    
                     message = customMessage;

                   showError(fieldName, message);
                   if(topField == '') topField = fieldName;
                   return false;
                  }
                }

                 if(compareCriteria == 'less' || item.indexOf('required') == 0) {
                  if(defaultValue >= compareValue) {
                    errors = true;
                    var message = upperCase(getLabelName)+' must be less than '+upperCase(compareWith);
                    if(customMessage != '')                    
                     message = customMessage;

                   showError(fieldName, message);
                   if(topField == '') topField = fieldName;
                   return false;
                    }
                  }
                  // Hide Error of Compared Field
                  if(!errors) {
                    cleanError(compareWith);
                  }
                }
                // End of validation is: compare

                // If validation is: minlen
                if(item.indexOf('minlen') == 0) { 
                  var minArray    = item.split(':');
                  var limit       = parseInt(minArray[1]);
                  var minlenvalue = fieldvalue;
                  if(typeof limit == 'number' && minArray.length > 1 && minlenvalue.length < limit) {
                    errors = true;
                    var message = upperCase(getLabelName)+' must be atleast '+limit+' characters long';
                    if(customMessage != '')                    
                     message = customMessage;

                   showError(fieldName, message);
                   if(topField == '') topField = fieldName;
                   return false;
                  }
                }
               
                // If validation is: maxlen
                if(item.indexOf('maxlen') == 0) { 
                  var maxArray    = item.split(':');
                  var limit       = parseInt(maxArray[1]);
                  var maxlenvalue = fieldvalue;
                  if(typeof limit == 'number' && maxArray.length > 1 && maxlenvalue.length > limit) {
                    errors = true;
                    var message = upperCase(getLabelName)+' cannot exceed '+limit+' characters';
                    if(customMessage != '')                    
                     message = customMessage;
                   showError(fieldName, message);
                   if(topField == '') topField = fieldName;
                   return false;
                  }
                }
                
                // If validation is: min : integer
                if(item.indexOf('min') == 0 && item.indexOf('minlen') != 0) { 
                  var minArray = item.split(':');
                  var limit    = parseInt(minArray[1]);
                  var minvalue = parseInt(fieldvalue);
                  if(isNaN(minvalue)) {
                    errors = true;
                    var message = upperCase(getLabelName)+' must be a number';
                    if(customMessage != '')                    
                      message = customMessage;

                    showError(fieldName, message);
                    if(topField == '') topField = fieldName;
                    return false;
                  }
                  else if(typeof limit == 'number' && typeof minvalue == 'number' && minvalue < limit) {
                    errors = true;
                    var message = upperCase(getLabelName)+' must be atleast '+limit;
                    if(customMessage != '')                    
                      message = customMessage;

                    showError(fieldName, message);
                    if(topField == '') topField = fieldName;
                    return false;
                  }
                }
                
                // If validation is: max : integer
                if(item.indexOf('max') == 0 && item.indexOf('maxlen') != 0) { 
                  var maxArray = item.split(':');
                  var limit    = parseInt(maxArray[1]);
                  var maxvalue = parseInt(fieldvalue);
                  if(isNaN(maxvalue)) {
                    errors = true;
                    var message = upperCase(getLabelName)+' must be a number';
                    if(customMessage != '')                    
                      message = customMessage;

                    showError(fieldName, message);
                    if(topField == '') topField = fieldName;
                    return false;
                  }
                  else if(typeof limit == 'number' && typeof maxvalue == 'number' && maxvalue > limit) {
                    errors = true;
                    var message = upperCase(getLabelName)+' cannot exceed '+limit;
                    if(customMessage != '')                    
                      message = customMessage;

                    showError(fieldName, message);
                    if(topField == '') topField = fieldName;
                    return false;
                  }
                }
                
                // If validation is: minlen
                if(item.indexOf('range') == 0) { 
                  var rangeArray = item.split(':');
                  var rangeFrom  = parseInt(rangeArray[1]);
                  var rangeTo    = parseInt(rangeArray[2]);
                  if(isNaN(fieldvalue)) {
                    errors = true;
                    var message = upperCase(getLabelName)+' must be a number';
                    if(customMessage != '')                    
                      message = customMessage;

                    showError(fieldName, message);
                    if(topField == '') topField = fieldName;
                    return false;
                  }
                  else if(fieldvalue < rangeFrom || fieldvalue > rangeTo) {
                    errors = true;
                    var message = 'Range between '+rangeFrom+' and '+rangeTo+' is allowed';
                    if(customMessage != '')                    
                      message = customMessage;

                    showError(fieldName, message);
                    if(topField == '') topField = fieldName;
                    return false;
                  }
                }
                
                // If validation is: alongwith
                if(item.indexOf('alongwith') == 0) { 
                  var alongiwthArray                    = item.split(':');
                  var alongiwthArrayField               = alongiwthArray[1];
                  var alongiwthArrayFieldValueCriteria  = []; 
                  if(alongiwthArray.length > 2) {
                   alongiwthArrayFieldValueCriteria     = alongiwthArray[2].split(',');
                 }
                 var alongiWithFieldType                = $(getFormField(alongiwthArrayField)).prop('tagName');
                 var alongiWithValue                    = getValueByTagInputType(alongiWithFieldType, alongiwthArrayField);
                 var inArray                            = $.inArray(alongiWithValue, alongiwthArrayFieldValueCriteria); 
                  if(alongiwthArray.length > 2 && alongiwthArrayFieldValueCriteria.length > 0 &&  alongiWithValue != '' && fieldvalue == '' && inArray != -1) {
                    $(getFormField(fieldName)).prop('disabled', 0);
                    errors = true;
                    var message = fieldName+' is required along with selected value of '+upperCase(alongiwthArrayField);
                    if(customMessage != '')                    
                      message = customMessage;

                    showError(fieldName, message);
                    if(topField == '') topField = fieldName;
                    return false;
                  }
                  else if($.trim(alongiWithValue) != '' && $.trim(fieldvalue) == '' && alongiwthArray.length <= 2) {
                    $(getFormField(fieldName)).prop('disabled', 0);
                    errors = true;
                    var message = fieldName+' is required along with '+upperCase(alongiwthArrayField);
                    if(customMessage != '')                    
                      message = customMessage;

                    showError(fieldName, message);
                    if(topField == '') topField = fieldName;
                    return false;
                  }
                }
                
                // If validation is: apartfrom
                if(item.indexOf('apartfrom') == 0) { 
                  var apartfromArray      = item.split(':');
                  var apartfromArrayField = apartfromArray[1];

                  var apartfromArrayFieldValueCriteria  = []; 
                  if(apartfromArray.length > 2) {
                    apartfromArrayFieldValueCriteria     = apartfromArray[2].split(',');
                  }

                  var apartfromfieldType  = $(getFormField(apartfromArrayField)).prop('tagName');
                  var apartfromValue      = getValueByTagInputType(apartfromfieldType, apartfromArrayField);
                  var inArray             = $.inArray(apartfromValue, apartfromArrayFieldValueCriteria); 
                  if(apartfromArray.length > 2 && apartfromArrayFieldValueCriteria.length > 0 &&  apartfromValue != '' && fieldvalue != '' && inArray != -1) {
                    errors = true;
                    var message = fieldName+' is not required along with selected value of '+upperCase(apartfromArrayField);
                    if(customMessage != '')                    
                      message = customMessage;

                    showError(fieldName, message);
                    if(topField == '') topField = fieldName;
                    return false;
                  }
                  else if(apartfromValue && fieldvalue  && apartfromArray.length <= 2) {
                    errors = true;
                    var message = upperCase(fieldName)+' is not required along with '+upperCase(apartfromArrayField);
                    if(customMessage != '')                    
                      message = customMessage;

                    showError(fieldName, message);
                    if(topField == '') topField = fieldName;
                      return false;
                  }
                  else if(apartfromArray.length > 2 && apartfromArrayFieldValueCriteria.length > 0 && fieldvalue == '' && inArray == -1) {
                    errors = true;
                    var message = fieldName+' is required as the selected value of '+upperCase(apartfromArrayField)+' is not '+apartfromArray[2];
                    if(customMessage != '')                    
                      message = customMessage;

                    showError(fieldName, message);
                    if(topField == '') topField = fieldName;
                    return false;
                  }
                  else if(apartfromValue == '' && fieldvalue == '' && apartfromArray.length <= 2) {
                    errors = true;
                    var message = upperCase(fieldName)+' is required as '+upperCase(apartfromArrayField)+' is null';
                    if(customMessage != '')                    
                      message = customMessage;

                    showError(fieldName, message);
                    if(topField == '') topField = fieldName;
                      return false;
                  }
                }
                
                // If validation is: fileformat
                if(item.indexOf('fileformat') == 0) { 
                  var fileformatArray      = item.split(':');
                  var extractFormatsArray  = fileformatArray[1].split(',');
                  if($.inArray(fieldvalue.split('.').pop().toLowerCase(), extractFormatsArray) == -1) {
                   errors = true;
                   var message = ' Only '+fileformatArray[1]+' extensions are allowed';
                   if(customMessage != '')                    
                    message = customMessage;

                  showError(fieldName, message);
                  if(topField == '') topField = fieldName;
                  return false;
                  }
                }
                
                // If validation is: emaildomain
                if(item.indexOf('emaildomain') == 0) { 
                  var fileformatArray      = item.split(':');
                  var extractFormatsArray  = fileformatArray[1].split(',');
                  var currentEmailDomain   = fieldvalue.split('@').pop().toLowerCase();
                  currentEmailDomain   = currentEmailDomain.split('.')[0];
                  if($.inArray(currentEmailDomain, extractFormatsArray) != -1) {
                   errors = true;
                   var message = ' Email with domain '+currentEmailDomain+' is not allowed';
                   if(customMessage != '')                    
                    message = customMessage;

                  showError(fieldName, message);
                  if(topField == '') topField = fieldName;
                  return false;
                  }
                }
                // End of validation is: emaildomain

                // If validation is: Ajax Request
                if(item == 'ajax' || item.indexOf('ajax') == 0) {
                  var ajaxResult = ajaxValidate(item, fieldName, fieldvalue, form);
                  if(ajaxResult === false) {
                    errors = true;
                    return ajaxResult;
                  }
                }
                // If no errors occured
                $(getFormField(fieldName)).css("background-color", "");
              }
          });
        }
        i++;
      }
      result['errors']   = errors;
      result['topField'] = topField;
      return result;
    }; 

    /**
     * Validate Field based on Ajax response
     * @param  {string} validation
     * @param  {string} field
     * @param  {string} value
     * @param  {selector} form
     * @return {boolean}
     */
    function ajaxValidate(validation, field, value, form) {
        var value         = $.trim(value);
        var fieldChecked  = $(getFormField(field)).attr('amsify-ajax-checked');
        var ajaxSuccess   = $(getFormField(field)).attr('amsify-ajax-success'); 
        var ajaxValue     = $(getFormField(field)).attr('amsify-ajax-value'); 

        // If ajax value is already validated with error for the same value
        if(value == ajaxValue){
          showError(field, $(getFormField(field)).attr('amsify-ajax-message'));
          return false;
        }

        // If value is null or its already in process
        if(value == '' || $(getFormField(field)).attr('amsify-ajax-checking')) {
          return false;
        }

        if(fieldChecked === undefined || fieldChecked == '0' || value != ajaxSuccess) {
          formSubmitStatus(form, 'no');
          $(getFormField(field)).attr('amsify-ajax-checked', '0');
          var validationArray = validation.split('::');


          var ajaxConfig   = {};
          var actionMethod = AmsifyHelper.getActionURL(validationArray[1]);
          var params       = { value : value, _token : AmsifyHelper.getToken() }; 

          ajaxConfig['beforeSend'] = function() {
            $(getFormField(field)).attr('amsify-ajax-checking', '1')
            if(!$('.'+field+'-field-loader').length) {
              $(getFormField(field)).after('<img class="'+field+'-field-loader" src="'+AmsifyHelper.base_url+'/images/loader-small.gif"/>');
            } else {
              $('.'+field+'-field-loader').show();
            }
          };
          ajaxConfig['afterError'] = function(data) {
              showError(field, data['message']);
              $(getFormField(field)).attr('amsify-ajax-value', value);
              $(getFormField(field)).attr('amsify-ajax-message', data['message']);
          };
          ajaxConfig['afterSuccess'] = function(data) {
              $(getFormField(field)).attr('amsify-ajax-checked', '1').attr('amsify-ajax-success', value);
              $(getFormField(field)).removeAttr('amsify-ajax-value');
              if(!$(form).find('[amsify-ajax-checked="0"]').length) {
                formSubmitStatus(form, 'yes');
              }
          };
          ajaxConfig['complete'] = function() {
            $('.'+field+'-field-loader').hide();
            $(getFormField(field)).removeAttr('amsify-ajax-checking');
          };

          AmsifyHelper.callAjax(actionMethod, params, ajaxConfig);

        } else {
          $(getFormField(field)).attr('amsify-ajax-cheking', '1');
        }
    };

    /**
     * Allow Form submit status
     * @param  {selector} form
     * @param  {string} value
     */
    function formSubmitStatus(form, value) {
      if($(form).find('input[name=allow-submit]').length) {
        $(form).find('input[name=allow-submit]').val(value);
      } else {
        var input = $('<input>').attr('type', 'hidden').attr('name', 'allow-submit').val(value);
        $(form).append($(input));
      }
    };

    /**
     * get input value by input type
     * @param  {string} fieldType
     * @param  {string} fieldName
     * @return {string}
     */
    function getValueByTagInputType(fieldType, fieldName) {

      var field       = getFormField(fieldName);
      var fieldvalue;
      // If tag is <select></select>
      if(fieldType == 'SELECT') {
        fieldvalue = $(field).val();          
      }
      // If tag is <input>
      else if(fieldType == 'INPUT') {

        var inputType = $(field).attr('type'); 
        // If Input type is radio
        if(inputType == 'radio') {
          fieldvalue = $(field+':checked').val();
        }
        // If Input type is checkbox
        else if(inputType == 'checkbox') {
          fieldvalue = getCheckboxSelectedValues(field);
        }
        // It will apply for remaining fields like text,password,hidden,file
        else {
         fieldvalue = $(field).val(); 
        }
      }
      // If tag is <textarea></textarea>
      else if(fieldType == 'TEXTAREA') {
        fieldvalue = $(field).val();
        setAutoGrowTextarea(field);
      }
      // If Input type is DIV
      else if(fieldType == 'DIV') {
        fieldvalue = $(field).html(); 
      }
      if(fieldvalue === undefined) {
        fieldvalue = '';
      }

      return fieldvalue;
    };

    /**
     * set autogrow for textarea
     * @param {string} field
     */
    function setAutoGrowTextarea(field) {
      $(field).addClass('autogrow');
      $(document).on('keyup', '.autogrow', function(e) {
          $(this).height(30);
          $(this).height(this.scrollHeight + parseFloat($(this).css("borderTopWidth")) + parseFloat($(this).css("borderBottomWidth")));
      });
    };

    /**
     * get checkbox values
     * @param  {string} field
     * @return {string}
     */
    function getCheckboxSelectedValues(field) {
      return $(field+":checked").map(function () {return $(this).val();}).get();
    };

    /**
     * Check if value is Alphanumeric
     * @param  {string}  input
     * @return {Boolean}
     */
    function isAlphaNumeric(input) {
        var reg   = /^[^%\s]/;
        var reg2  = /[a-zA-Z]/;
        var reg3  = /[0-9]/;
        return reg.test(input) && reg2.test(input) && reg3.test(input);
    };

    /**
     * upper case first letterof string
     * @param  {string}  string
     * @return {string}
     */
    function upperCase(string) {
      return AmsifyHelper.upperCaseFirst(string);
    };

    /**
     * field error
     * @param  {string} fieldName
     * @param  {string} message
     */
    function showError(fieldName, message) {

      var field = getFormField(fieldName);

      $(field).css("background-color", "#FFCCCC");

      // One Sibling
      if($(field).siblings(errorClass).length == 1) {
        $(field).siblings(errorClass).show().html(message); 
      } 
      // Multiple Siblings
      else if ($(field).siblings(errorClass).length > 1) {

        // Next Sibling
        if($(field).next(errorClass).length) {
        $(field).next(errorClass).show().html(message); 
        } 
        // Previous Sibling
        else {
         $(field).prev(errorClass).show().html(message); 
        }

      }
      // No Siblings
      else {
        // Check for span error field 
        if($('span').is('[for="'+fieldName+'"]')) {
        $('span[for="'+fieldName+'"]').addClass(errorClass.substring(1)).show().html(message);  
        } else {
        $(field).after('<span class="'+errorClass.substring(1)+'">'+message+'</span>');
        }
      }
      // $(field).parent().removeClass('has-success').addClass('has-error');
      // $(field).siblings('.glyphicon-ok').hide();
      // $(field).siblings('.glyphicon-remove').show();
     };

    /**
     * hide field Error
     * @param  {string} fieldName
     */
    function cleanError(fieldName) {
      var field = getFormField(fieldName);
      // One Sibling
      if($(field).siblings(errorClass).length == 1) {
        $(field).siblings(errorClass).hide();
      } 
      // Multiple Siblings
      else if ($(field).siblings(errorClass).length > 1) {
        // Next Sibling
        if($(field).next(errorClass).length) {
        $(field).next(errorClass).hide();
        } 
        // Previous Sibling
        else {
         $(field).prev(errorClass).hide();
        }
      }
      // No Siblings
      else {
        $('span[for="'+fieldName+'"]').hide();
      }
      $(field).css("background-color", "");
    };

    /**
     * clean all errors
     */
    function clearErrors() {
      $(errorClass).hide();
      $('.amsify-validate-field').css("background-color", "");
    }

    /**
     * get submit selector
     * @param  {selector} form
     * @param  {object} config
     * @return {selector}
     */
    function getSubmitSelector(form, config) {
      var setSubmitSelector = submitSelector;
      if(config !== undefined) {
        if(config.submit !== undefined) { setSubmitSelector  = config.submit};
      }
      if(setSubmitSelector != '') {
        return $(setSubmitSelector);
      } else {
        return $(form).find(':submit:first'); 
      }
    };

    /**
     * Filter Form Field for KeyUp Submit Form
     * @param  {array} fieldRules
     * @return {string}
     */
    function filterFieldForKeyup(fieldRules) {
      var length      = fieldRules.length;
      for(i = 1; i <= length; ++i) {
        var lastField   = fieldRules[length-i].split('|')[0].split(':')[0];
        var fieldType   = $(getFormField(lastField)).prop('tagName');  
        if(fieldType != 'TEXTAREA') {
          return lastField;
        }
      }
      return null;
    };

    /**
     * get field selector by name
     * @param  {string} name
     * @return {string}
     */
    function getFormField(name) {
      return '*[name="'+name+'"]';
    };



/**
 * 
 ************ All formSection functionalities section ************
 *
 **/

      /**
       *  transit the form section to another section or submit
       * @param  {selector} form
       */
      function transitNextForm(form) {
          // Clear the timer of running form
          if($(form).attr('clear-interval') && !$('[amsify-all-forms-timer]').length) {
            interval = $(form).attr('clear-interval');
            clearInterval(interval);
          } else {
            var interval = $('[clear-interval]').attr('clear-interval');
            $(form).next('.amsify-form-section').attr('clear-interval', interval);
          }
          // End of clearing timer

          // Transition of showing next form
          $next = $(form).next('.amsify-form-section');
          $(form).css({'position':'absolute', 'width':'inherit'});
          $(form).hide('slide', { direction: 'left' }, 1000);
          $next.show('slide', { direction: 'right' }, 1000);
          $(form).find(':input').not(':submit').clone().hide().prependTo($next);

          // Start next count down if exist
          if($(form).next('.amsify-form-section').attr('amsify-form-timer')) {
              var nextSeconds = $(form).next('.amsify-form-section').attr('amsify-form-timer');
              startCountDown($(form).next('.amsify-form-section'), nextSeconds);
          }
      };

      /**
       * run the countdown based on value passed
       * @param  {selector} form
       * @param  {integer} seconds
       */
      function startCountDown(form, seconds) {

        $form = $(form).find('.amsify-form-timer');
        if($('[amsify-all-forms-timer]').length) {
          $form = $('.amsify-form-timer-section').find('.amsify-form-timer');
        } 

        var interval = setInterval(function() { 
            if(seconds <= 0) {
              $form.text(secondsToHms(seconds));
              clearInterval(interval);
              if($(form).find('.amsify-form-timer-section').length) {
                $(form).find('.amsify-form-timer-section').hide();
              }
              $form.find('.amsify-form-timer').hide();

              var input = $('<input>').attr('type', 'hidden').attr('name', 'allow-submit').val('yes');

              if($('[amsify-all-forms-timer]').length) {
                   $('.amsify-form-section:visible').each(function(index, form){
                      $(form).append($(input));
                      $(form).submit();
                   });
              } else {
                if($(form).hasClass('amsify-form-section') && $(form).next('.amsify-form-section').length) {
                  transitNextForm(form);
                } else {
                  $(form).append($(input));
                  $(form).submit();
                }
              }
            } else {
              seconds--;
              var time = secondsToHms(seconds);

              if(seconds <= 60 && $form.css('color') != 'red') {
                $form.css('color', 'red');
              }
                $form.text(time);
            }
        }, 1000);
        $(form).attr('clear-interval', interval);
      };

      /**
       * convert seconds to time format
       * @param  {integer} totalSeconds
       * @return {string}
       */
      function secondsToHms(totalSeconds) {
        var hours   = Math.floor(totalSeconds / 3600);
        var minutes = Math.floor((totalSeconds - (hours * 3600)) / 60);
        var seconds = totalSeconds - (hours * 3600) - (minutes * 60);

        // round seconds
        seconds = Math.round(seconds * 100) / 100

        var result = (hours < 10 ? "0" + hours : hours);
            result += ":" + (minutes < 10 ? "0" + minutes : minutes);
            result += ":" + (seconds  < 10 ? "0" + seconds : seconds);
        return result;
      };

      /**
       * Setting fixed Clone Method of Jquery for Selection and Multiple Selection
       */
      function setFixedCloneMethod() {
        (function(original) {
          jQuery.fn.clone = function () {
            var result           = original.apply(this, arguments),
                my_selects       = this.find('select').add(this.filter('select')),
                result_selects   = result.find('select').add(result.filter('select'));
            for(var i = 0, l = my_selects.length;  i < l; i++) {
              //result_selects[i].selectedIndex = my_selects[i].selectedIndex;  
              $(result_selects[i]).val($(my_selects[i]).val());
            } 
            return result;
          };
        }) (jQuery.fn.clone);
      };


/**
 * 
 ************ All transformation functionalities section ************
 *
 **/
    /**
     * transform input to uppercase
     * @param  {string} fieldName
     */
    AmsifyForm.upperCase = function(fieldName) {
      AmsifyHelper.upperCase(getFormField(fieldName));    
    };

    /**
     * transform input to decimals
     * @param  {string} fieldName
     */
    AmsifyForm.onlyDecimals = function(fieldName) {
      AmsifyHelper.onlyDecimals(getFormField(fieldName));
    };

    /**
     * transform input to numerics
     * @param  {string} fieldName
     */
    AmsifyForm.onlyNumbers  = function(fieldName) {
      AmsifyHelper.onlyNumbers(getFormField(fieldName));
    };

    /**
     * transform input to string without special char
     * @param  {string} fieldName
     */
    AmsifyForm.noSpecialChar = function(fieldName) {
      AmsifyHelper.noSpecialChar(getFormField(fieldName));
    };
    /**
     * transform input to string with single space
     * @param  {string} fieldName
     */
    AmsifyForm.singleSpace = function(fieldName) {
      AmsifyHelper.singleSpace(getFormField(fieldName));
    };

    /**
     * transform input to string with no space
     * @param  {string} fieldName
     */
    AmsifyForm.noSpace = function(fieldName) {
      AmsifyHelper.noSpace(getFormField(fieldName));
    };

    /**
     * transform and mask the input based on pattern applied
     * @param  {string} fieldName
     * @param  {string} pattern
     * @param  {string} type
     */
    AmsifyForm.mask = function(fieldName, pattern, type) {
      AmsifyHelper.mask(getFormField(fieldName), pattern, type);
    };

/**
 * 
 ************ Configuration section ************
 *
 **/
    /**
     * set the global config based on options passed
     * @param {object} config
     */
    function setConfig(config) {
      if(config !== undefined) {
        if(config.hasOwnProperty('form')) {
          formSelector = config.form;
        }
        if(config.hasOwnProperty('autoValidate')) {
          autoValidate = config.autoValidate;
        }
        if(config.hasOwnProperty('validateOn')) {
          validateOn = config.validateOn;
        }
        if(config.hasOwnProperty('submit')) {
          submitSelector = config.submit;
        }
        if(config.hasOwnProperty('loadingText')) {
          loadingText = config.loadingText;
        }
      }
    };

}(window.AmsifyForm = window.AmsifyForm || {}, jQuery));
