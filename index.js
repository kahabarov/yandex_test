const MyForm = (function(formId) {
  // Приватные функции и данные
  const formFields = ['fio', 'email', 'phone'];

  const countWordsInFio = 3;

  const validDomains = ["ya.ru", "yandex.ru", "yandex.ua", "yandex.by", "yandex.kz", "yandex.com"];

  const maxSumOfDigits = 30;
  // Точка вариации ТЗ
  const ajaxRequestMethod = "GET"; // "POST"

  const setClassNameForMyFormFields = function(fields, className) {
    for (let field of fields) {
      let element = document.querySelector('form#' + formId + ' input[name="' + field + '"]');
      if (element) element.className = className;
    }
  }

  const setSuccessStatusForResultContainer = function() {
    let container = document.getElementById('resultContainer');
    if (container) {
      container.innerHTML = "Success";
      container.className = "success";
    }
  }

  const setErrorStatusForResultContainer = function(reason) {
    let container = document.getElementById('resultContainer');
    if (container) {
      container.innerHTML = reason;
      container.className = "error";
    }
  }

  const setProgressStatusForResultContainer = function() {
    let container = document.getElementById('resultContainer');
    if (container) {
      container.innerHTML = "";
      container.className = "progress";
    }
  }

  const sendRequest = function() {
    let form = document.getElementById(formId),
      request = new XMLHttpRequest();
    if (!form)
      return;
    request.open(ajaxRequestMethod, form.action, true);
    request.onload = function(event) {
      console.log("Код статуса запроса: " + request.status);
      if (request.status == 200 ||
        request.status == 0) { // Это требуется для запуска страницы в Chrome с локального диска
        // также требуется запускать Chrome с ключем --allow-file-access-from-files
        try {
          let res = JSON.parse(request.responseText);
          if (res.status && typeof res.status == "string") {
            switch (res.status) {
              case "success":
                setSuccessStatusForResultContainer();
                break;
              case "error":
                if (res.reason && typeof res.reason == "string") {
                  setErrorStatusForResultContainer(res.reason);
                } else {
                  console.log("Ошибка: некорректное значение для поля reason.");
                }
                break;
              case "progress":
                setProgressStatusForResultContainer();
                if (res.timeout && typeof res.timeout == "number") {
                  setTimeout(sendRequest, res.timeout.toFixed());
                } else {
                  console.log("Ошибка: некорректное значение для поля timeout.");
                }
                break;
              default:
                console.log("Ошибка: некорректное значение для поля status.");
                break;
            }
          } else {
            console.log("Ошибка: некорректное значение для поля status.");
          }
        } catch (error) {
          console.log("Ошибка: " + error.message);
        }
      }
    }
    request.onerror = function(event) {
      console.log("Ошибка: " + event.type);
    }
    request.send(ajaxRequestMethod == "POST" ? new FormData(form) : null);
  }

  const validateFio = function(fio) {
    // Проверка поля ФИО
    let words = fio.split(/\s+/),
      invalids = words.filter((word) => !word.match(/(^([a-zA-Z])+$)|(^([\u0400-\u04FF])+$)/));
    return words.length == countWordsInFio && invalids.length == 0;
  }

  const validateEmail = function(email) {
    // Проверка поля Email
    let template_is_matched = email.match(/^(.+)@([^@\s\.]+\.[^@\s\.]+)$/),
      domain_is_valid = true,
      local_is_valid = true;
    if (template_is_matched) {
      let local = template_is_matched[1],
        domain = template_is_matched[2];
      const re_local = /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")$/;
      local_is_valid = local.match(re_local) != null;
      domain_is_valid = validDomains.indexOf(domain) != -1;
    }
    return template_is_matched && local_is_valid && domain_is_valid;
  }

  const validatePhone = function(phone) {
    var sum_of_digits = 0,
      template_is_matched = phone.match(/^\+7\(\d{3}\)\d{3}\-\d{2}\-\d{2}$/);
    if (template_is_matched) {
      [
        1, //       +7
        3, 4, 5, // (999)
        7, 8, 9, // 999
        11, 12, //  -99
        14, 15 //   -99
      ].forEach((i) => sum_of_digits += parseInt(phone.charAt(i)));
    }
    return template_is_matched && sum_of_digits <= maxSumOfDigits;
  }

  const validateFunctions = {
    'fio': validateFio,
    'email': validateEmail,
    'phone': validatePhone
  }

  // Публикуемые функции
  const validate = function() {
    let result = {
        isValid: true,
        errorFields: []
      },
      data = getData();
    // Выполняем проверку полей
    formFields.forEach((fn) => {
      if (validateFunctions[fn] && !validateFunctions[fn](data[fn].trim())) {
        result.errorFields.push(fn);
        result.isValid = false;
      }
    });
    // Возвращаем результат проверок в требуемой форме
    return result;
  }

  const getData = function() {
    let result = {};
    formFields.forEach((fn) => {
      const nl = document.querySelector('form#' + formId + ' input[name="' + fn + '"]');
      result[fn] = nl ? nl.value : null;
    });
    return result;
  }

  const setData = function(data) {
    formFields.forEach((fn) => {
      const nl = document.querySelector('form#' + formId + ' input[name="' + fn + '"]');
      if (nl) {
        nl.value = data[fn] ? data[fn] : "";
      }
    });
  }

  const submit = function() {
    const result = validate();
    setClassNameForMyFormFields(formFields, null)
    if (result.isValid) {
      document.getElementById('submitButton').disabled = true;
      sendRequest();
    } else {
      setClassNameForMyFormFields(result.errorFields, "error");
    }
  }

  // Экспортируем объект с требуемыми методами
  return {
    validate: validate,
    getData: getData,
    setData: setData,
    submit: submit
  }
})("myForm");
