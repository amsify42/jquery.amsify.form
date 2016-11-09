 // Amsify42 Form 1.0.0
 // http://www.amsify42.com
 (function(AmsifyForm, $, undefined) {

    //Private Property
    var initialize          = false;
    var base_url            = window.location.protocol+'//'+window.location.host;
    var _token              = $('meta[name="_token"]').attr('content');
    var formSelector        = 'form';
    var submitSelector      = '';
    var loadingText         = 'Submitting...';
    var errorClass          = '.field-error';
    //Public Property
    AmsifyForm.base_url     = base_url;
   

    //Public Methods
    AmsifyForm.init = function(config) {
      setConfig(config); 
      var defaultForm = new AmsifyForm.Form;
          defaultForm.setRules();
    };


    AmsifyForm.showError = function(fieldName, message) {
        showError(fieldName, message);
    };

    AmsifyForm.set = function(config) {
        var newForm = new AmsifyForm.Form();
          newForm.setRules(config);
    };




AmsifyForm.Form = function() {

    AmsifyForm.Form.prototype.setRules = function(config) {

        var setFormSelector = formSelector;

        if(config !== undefined) {
          if(config.form !== undefined) { setFormSelector  = config.form};
        }

        $(setFormSelector).each(function(index, form){

            var fieldRules      = [];
            var inputs          = $(this).find(':input');

            $.each(inputs, function(key, input){
              
              // If AmsifyForm Validate Attribute is set
              if($(input).attr('amsify-validate') || $(input).prop('required')) {

                var fieldRuleRow  = $(input).attr('name');

                // Set Title if it is available
                if($(input).prop('placeholder') != '') {
                  fieldRuleRow  += ':'+$(input).attr('placeholder');
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
                          var maskArray = transform.split(':');
                          if(AmsifyForm[maskArray[0]] !== undefined) {
                            AmsifyForm[maskArray[0]](fieldName, maskArray[1]);
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


            AmsifyForm.setValidation(fieldRules, config);
            AmsifyForm.submitForm(fieldRules, this, config);
        });
    };

  };




  AmsifyForm.setValidation = function(fieldRules, config) {

    $(document).on('keyup change focusout', function(event) {
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
             if(AmsifyForm.validate(targetFieldRules).errors == true) {
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




    AmsifyForm.submitForm = function(fieldRules, form, config) {

        var setSubmitSelector = submitSelector;
        var setLoadingText    = loadingText;

        if(config !== undefined) {
          if(config.loadingText !== undefined) { setLoadingText  = config.loadingText};
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

        $(form).submit(function(e){
          e.stopImmediatePropagation();
          clearErrors();
          $submitSelector = getSubmitSelector(form, config);
          var defaultText = $submitSelector.html();
          var result      = AmsifyForm.validate(fieldRules); 
           if(result.errors == false) {

              // Performing custom rules
                if(config !== undefined && config.rules !== undefined) {
                  if(processCustomRules(config.rules) !== true) {
                    e.preventDefault(); return false;
                  }
                }
               // End fo performing custom rules 

               $submitSelector.prop('disabled', true).html(setLoadingText); 

               // Checking Ajax 
               if(config !== undefined && config.ajax !== undefined) {
                  e.preventDefault();
                  AmsifyForm.submitAjaxForm(form, config.ajax);
               }
               // End of checking Ajax
           } else {  
            e.preventDefault();
            $submitSelector.prop('disabled', false).html(defaultText);      
            if(result.topField != '') { $(getFormField(result.topField)).focus();}
          }
        });
    };


    function processCustomRules(rules) {
        var result = true;
        if(rules !== undefined) {
          $.each(rules, function(index, rule){
              result = fieldCustomRule(index, rule);
          });
        }
        return result;
    };

    function fieldCustomRule(field, rule) {
      var result = rule($(getFormField(field)).val());
      if(result !== true) {
        AmsifyForm.showError(field, result);
      }
      return result;
    }



    AmsifyForm.submitAjaxForm = function(form, config) {

        var targetMethod = AmsifyForm.base_url;

        if(config.action !== undefined) {
            targetMethod += config.action;
        }

        $.ajax({
            type        : 'POST',
            url         : targetMethod,
            data        : new FormData($(form)[0]),
            contentType : false,
            processData : false,
            cache       : false,
            async       : true,
            success     : function(data) {
              if(config.callback && typeof config.callback == "function") {
                  config.callback(data);
              }
            },
            error       : function (data) {
              if(config.callback && typeof config.callback == "function") {
                  config.callback(data);
              }
            }             
        });
    };



     AmsifyForm.validate = function(fieldRules) {
        
              var filteremail = /^\b[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b$/i;
              var filterurl   = /^(https?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i;
              var whitespace  = /^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]{5,})$/;
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

              // Rquired if not empty
              if($.inArray('requiredif', validationArray) != -1) {
                  if(fieldvalue == '') {
                    return true;
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


             // If validation is: unique
            if(item.indexOf('unique') == 0) { 
              var uniqueArray = item.split(':');
              var ajaxMethod  = uniqueArray[1];
              var ajax        = new AmsifyForm.ajax();
              var status      = ajax.postCheckUnique(fieldName, fieldvalue, ajaxMethod);
              if(!status) {
                  errors = true;
                  var message = upperCase(getLabelName)+' already exist';
                    if(customMessage != '')                    
                      message = customMessage;

                  showError(fieldName, message);
                  if(topField == '') topField = fieldName;
                  return false;
              }
            }
            // End of validation is: required


            // If validation is: unique
            if(item.indexOf('oldpassword') == 0) { 
              var passArray = item.split(':');
              var ajaxMethod  = passArray[1];
              var ajax        = new AmsifyForm.ajax();
              var status      = ajax.postCheckUnique(fieldName, fieldvalue, ajaxMethod);
              if(!status) {
                  errors = true;
                  var message = upperCase(getLabelName)+' is Incorrect';
                    if(customMessage != '')                    
                      message = customMessage;

                  showError(fieldName, message);
                  if(topField == '') topField = fieldName;
                  return false;
              }
            }
            // End of validation is: required

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
             // End of validation is: email


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
             // End of validation is: url

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
            // End of validation is: only number

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
             // End of validation is: no special char


            // If validation is: alphanumeric
            if(item == 'alphanumeric' || item.indexOf('alphanumeric') == 0) { 
               if(/^(?:[0-9]+[a-z]|[a-z]+[0-9]|[a-z]+[!@#$%\^&*(){}[\]<>?/|\-]+[0-9]|[!@#$%\^&*(){}[\]<>?/|\-]+[a-z]+[0-9])[a-z0-9 !@#$%\^&*(){}[\]<>?/|\-]*$/i.test(fieldvalue) == false) {
                  errors = true;
                   var message = 'Must be alphanumeric';
                    if(customMessage != '')                    
                        message = customMessage;

                  showError(fieldName, message);
                  if(topField == '') topField = fieldName;
                  return false;
               }
             }
             // End of validation is: one special char

             // If validation is: compare
             if(item.indexOf('compare') == 0) { 
              var compareArray    = item.split(':');
              var compareWith     = compareArray[1];
              var compareCriteria = compareArray[2];
              var compareType     = compareArray[3];

              var defaultValue;
              var compareValue;

              if (compareType == 'integer') {
                 var defaultValue = parseInt(fieldvalue);
                 var compareValue = parseInt($(getFormField(compareWith)).val());  
              } 
              else if (compareType == 'float') {
                 var defaultValue = parseFloat(fieldvalue);
                 var compareValue = parseFloat($(getFormField(compareWith)).val());                 
              } 
              else {
                var defaultValue = fieldvalue;
                var compareValue = $(getFormField(compareWith)).val();                 
              }

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
            // End of validation is: minlen

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
            // End of validation is: maxlen
            
            // If validation is: min : integer
            if(item.indexOf('min') == 0 && item.indexOf('minlen') != 0) { 
              var minArray = item.split(':');
              var limit    = parseInt(minArray[1]);
              var minvalue = parseInt(fieldvalue);
              if(typeof limit == 'number' && typeof minvalue == 'number' && minvalue < limit) {
                  errors = true;
                   var message = upperCase(getLabelName)+' must be atleast '+limit;
                    if(customMessage != '')                    
                        message = customMessage;

                  showError(fieldName, message);
                  if(topField == '') topField = fieldName;
                  return false;
              }
            }
            // End of validation is: min : integer
            
            // If validation is: max : integer
            if(item.indexOf('max') == 0 && item.indexOf('maxlen') != 0) { 
              var maxArray = item.split(':');
              var limit    = parseInt(maxArray[1]);
              var maxvalue = parseInt(fieldvalue);
              if(typeof limit == 'number' && typeof maxvalue == 'number' && maxvalue > limit) {
                  errors = true;
                   var message = upperCase(getLabelName)+' cannot exceed '+limit;
                    if(customMessage != '')                    
                        message = customMessage;

                  showError(fieldName, message);
                  if(topField == '') topField = fieldName;
                  return false;
              }
            }
            // End of validation is: max : integer


             // If validation is: minlen
             if(item.indexOf('range') == 0) { 
              var rangeArray = item.split(':');
              var rangeFrom  = parseInt(rangeArray[1]);
              var rangeTo    = parseInt(rangeArray[2]);
              if(fieldvalue < rangeFrom || fieldvalue > rangeTo) {
                  errors = true;
                   var message = 'Range between '+rangeFrom+' and '+rangeTo+' is allowed';
                    if(customMessage != '')                    
                        message = customMessage;

                  showError(fieldName, message);
                  if(topField == '') topField = fieldName;
                  return false;
              }
            }
            // End of validation is: minlen



            // If validation is: alongwith
             if(item.indexOf('alongwith') == 0) { 
              var alongiwthArray                    = item.split(':');
              var alongiwthArrayField               = alongiwthArray[1];
              var alongiwthArrayFieldValueCriteria  = []; 
              if(item.length > 2) {
                 alongiwthArrayFieldValueCriteria   = alongiwthArray[2].split(',');
              }
              var alongiwthfieldType                = $(getFormField(alongiwthArrayField)).prop('tagName');
              var alongiwthValue                    = getValueByTagInputType(alongiwthfieldType, alongiwthArrayField);
              var inArray                           = $.inArray(alongiwthValue, alongiwthArrayFieldValueCriteria); 
              // console.log(
              //               ' Field :'+fieldName +
              //               ' FieldValue :'+fieldvalue +
              //               ' AlongField :'+alongiwthArrayField +
              //               ' Criteria:'+ alongiwthArrayFieldValueCriteria +
              //               ' CriteriaComapre:'+ inArray +
              //               ' Value:'+ alongiwthValue
              //               );
              if( item.length > 2 && 
                  alongiwthArrayFieldValueCriteria.length > 0 && 
                  alongiwthValue != '' && 
                  fieldvalue == '' &&
                  inArray != -1) {
                  errors = true;
                   var message = fieldName+' is required along with selected value of '+upperCase(alongiwthArrayField);
                    if(customMessage != '')                    
                        message = customMessage;

                  showError(fieldName, message);
                  if(topField == '') topField = fieldName;
                  return false;
             }
             else if(!alongiwthValue && alongiwthArrayFieldValueCriteria.length == 0) {
                  errors = true;
                   var message = fieldName+' is required along with '+upperCase(alongiwthArrayField);
                    if(customMessage != '')                    
                        message = customMessage;

                  showError(fieldName, message);
                  if(topField == '') topField = fieldName;
                  return false;
              }
            }
            // End of validation is: alongwith

            // If validation is: apartfrom
             if(item.indexOf('apartfrom') == 0) { 
              var apartfromArray      = item.split(':');
              var apartfromArrayField = apartfromArray[1];
              var apartfromfieldType  = $(getFormField(apartfromArrayField)).prop('tagName');
              var apartfromValue      = getValueByTagInputType(apartfromfieldType, apartfromArrayField);
              if(apartfromValue) {
                  errors = true;
                   var message = upperCase(apartfromArrayField)+' is not required along with '+fieldName;
                    if(customMessage != '')                    
                        message = customMessage;

                  showError(apartfromArrayField, message);
                  if(topField == '') topField = fieldName;
                  return false;
              }
            }
            // End of validation is: apartfrom


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
            // End of validation is: fileformat


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







        // get input value by input type  
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


    // get checkbox values
    function getCheckboxSelectedValues(field) {
      return $(field+":checked").map(function () {return $(this).val();}).get();
    };


    // upper case first letterof string
    function upperCase(string) {
      return string.replace(/^[a-z]/, function(m){ return m.toUpperCase() });
    };



    // show Error
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
          $('span[for="'+fieldName+'"]').show().html(message).css("background-color", "#FFCCCC");  
        } else {
          $(field).after('<span class="'+errorClass.substring(1)+'">'+message+'</span>');
        }
       }

       // $(field).parent().removeClass('has-success').addClass('has-error');
       // $(field).siblings('.glyphicon-ok').hide();
       // $(field).siblings('.glyphicon-remove').show();

    };




    // hide Error
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



    function clearErrors() {
      $(errorClass).hide();
      $('.amsify-validate-field').css("background-color", "");
    }




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

    // Filter Form Field for KeyUp Submit Form
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



    function getFormField(name) {
      return '*[name="'+name+'"]';
    };



    // Setting Configuations
  function setConfig(config) {
    if(config !== undefined) {
        if(config.hasOwnProperty('form')) {
          formSelector = config.form;
        }
        if(config.hasOwnProperty('submit')) {
          submitSelector = config.submit;
        }
        if(config.hasOwnProperty('loadingText')) {
          loadingText = config.loadingText;
        }
      }
  };






    AmsifyForm.detectIE = function() {

        var ua = window.navigator.userAgent;

        var msie = ua.indexOf('MSIE ');
        if (msie > 0) {
            // IE 10 or older => return version number
            return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
        }

        var trident = ua.indexOf('Trident/');
        if (trident > 0) {
            // IE 11 => return version number
            var rv = ua.indexOf('rv:');
            return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
        }

        var edge = ua.indexOf('Edge/');
        if (edge > 0) {
           // IE 12 => return version number
           return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
        }

        // other browser
        return false;
    };




    
    // UPPER CASE    
    AmsifyForm.upperCase = function(fieldName) {
        $(getFormField(fieldName)).on('keyup focusout',function(){
            this.value = this.value.toUpperCase();
        });    
    };

    // only Decimals
    AmsifyForm.onlyDecimals = function(fieldName) {
        $(getFormField(fieldName)).on('keyup focusout', function(event) {
            this.value = this.value.replace(/[^0-9\.]/g,'');
          });
    };


    // only Numbers
    AmsifyForm.onlyNumbers  = function(fieldName) {
       $(getFormField(fieldName)).on('keyup focusout', function(e) {
          e.stopImmediatePropagation();
          this.value = this.value.replace(/[^0-9]/g,'');
        });
     };

    // No Special Chars
    AmsifyForm.noSpecialChar = function(fieldName) {
        $(getFormField(fieldName)).on('keyup focusout', function(e) {
           e.stopImmediatePropagation(); 
              if(e.which === 32)
                return false;
              this.value = this.value.replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, ' ');
        });
    };

    // Single Space
    AmsifyForm.singleSpace = function(fieldName) {
        $(getFormField(fieldName)).on('keyup focusout', function(e) {
            e.stopImmediatePropagation();
            this.value = this.value.replace(/\s+/g, " ");
        });
    };

    // No Space
    AmsifyForm.noSpace = function(fieldName) {
       $(getFormField(fieldName)).on('keyup focusout', function(e){
          e.stopImmediatePropagation();
            if (e.which === 32) {
                e.preventDefault();      
            }
        }).blur(function() {
            // for variety's sake here's another way to remove the spaces:
            $(this).val(function(i,oldVal){ return oldVal.replace(/\s/g,''); });         
        });

    };        


    // Mask
    AmsifyForm.mask = function(fieldName, pattern) {
      $(getFormField(fieldName)).on('keyup focusout', function(e) {
        var key = e.charCode || e.keyCode || 0;
        // If not backspace
        if(key != 8) {
          // If pattern is defined
          if(pattern !== undefined) {
            var transformValue     = $(this).val();
            // Trim value if its exceeding pattern length and return 
            if(transformValue.length > pattern.length) {
                transformValue = transformValue.substr(0, pattern.length);
                $(this).val(transformValue);
                return false;
            }

            // Collect [Pattern Special Chars] and [AlphaNumeric] in arrays
            var alphaNumericPositions     = []; 
            var specialCharPositions      = [];
            for(var i = 0, len = pattern.length; i < len; i++) {
              if(pattern[i].match(/[0-9a-z]/i)) {
                alphaNumericPositions.push(i);
              } else {
                specialCharPositions.push(i);
              }
            }

            // Replaced char with special chars by moving characters further
            for(var i = 0, len = pattern.length; i < len; i++) {
              if(i < transformValue.length) {
                if($.inArray(i, specialCharPositions) != -1) {
                  if(transformValue[i] != pattern[i]) {
                    var specialChars    = getPreceedingSpecialChars(i, pattern, specialCharPositions);
                    var replacedString  = specialChars+''+transformValue[i];
                    transformValue      = replaceAt(transformValue, replacedString, i);
                  }
                }
              }
            }

            // Again Check for preceeding special chars from the end
            var specialChar = getPreceedingSpecialChars(transformValue.length, pattern, specialCharPositions);
            if(specialChar != '') {
              transformValue += specialChar;
            }

            // Set Mask Transformed value
            $(this).val(transformValue);
          }
        }
      });
    };


    function getPreceedingSpecialChars(position, pattern, specialCharPositions) {
      var string = '';
      for(var i = position, len = pattern.length; i < len; i++) { 
        if($.inArray(i, specialCharPositions) == -1) {
           break;
        }
        else if($.inArray(i, specialCharPositions) > -1) {
           string += pattern[i];
         }
       }
       return string;
    };

    function replaceAt(string, replace, index) {
        return string.substr(0, index) + replace + string.substr(index + 1);
    };



}(window.AmsifyForm = window.AmsifyForm || {}, jQuery));   
