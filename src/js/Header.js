class BaseError extends Error {
  constructor(message, cause) {
    super(message, cause);
  }
}

class ValidationError extends BaseError {
  constructor(fields, message) {
    super(message ?? "Произошла непредвиденная ошибка", {
      fields,
    });

    this.fields = !Array.isArray(fields) || fields.length === 0 ? null : fields;
  }
}

class UnexpectedError extends BaseError {
  static defaultMessage = "Произошла непредвиденная ошибка";

  constructor(message, cause) {
    super(message ?? UnexpectedError.defaultMessage, cause);
  }
}

class Header {
  selectors = {
    root: "[data-js-header]",
    overlay: "[data-js-header-overlay]",
    burgerButton: "[data-js-header-burger-button]",
    contactsButton: "[data-js-header-contacts]",
    questionsButton: "[data-js-header-questions]",
    workButton: "[data-js-header-work]",
    priceButton: "[data-js-header-price]",
    navActive: "[data-js-header-overlay-nav-isActive]",
    nav: "[data-js-header-overlay-nav]",
    price: "[data-js-price]",
  };

  stateClasses = {
    isActive: "is-active",
    isLock: "is-lock",
  };

  constructor() {
    this.rootElement = document.querySelector(this.selectors.root);
    this.overlayElement = this.rootElement.querySelector(
      this.selectors.overlay
    );
    this.burgerButtonElement = this.rootElement.querySelector(
      this.selectors.burgerButton
    );
    this.navActiveElement = this.rootElement.querySelector(
      this.selectors.navActive
    );
    this.navElement = this.rootElement.querySelector(this.selectors.nav);
    this.bindEvents();
    this.priceElement = document.querySelector(this.selectors.price);
  }

  onBurgerButtonClick() {
    this.navActiveElement.classList.toggle(this.stateClasses.isActive);
    this.navElement.classList.toggle(this.stateClasses.isActive);
    this.burgerButtonElement.classList.toggle(this.stateClasses.isActive);
    this.overlayElement.classList.toggle(this.stateClasses.isActive);
    this.document.documentElement.classList.toggle(this.stateClasses.isLock);
  }

  scrollToSection(selector) {
    const section = document.querySelector(selector);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
      this.onBurgerButtonClick();
    }
  }

  bindEvents() {
    this.burgerButtonElement.addEventListener("click", () =>
      this.onBurgerButtonClick()
    );

    this.rootElement
      .querySelector(this.selectors.contactsButton)
      .addEventListener("click", () => {
        this.scrollToSection(".contacts");
        this.overlayElement.classList.remove(this.stateClasses.isActive);
      });
    this.rootElement
      .querySelector(this.selectors.questionsButton)
      .addEventListener("click", () => {
        this.scrollToSection(".questions");
        this.overlayElement.classList.remove(this.stateClasses.isActive);
      });
    this.rootElement
      .querySelector(this.selectors.workButton)
      .addEventListener("click", () => {
        this.scrollToSection(".work");
        this.overlayElement.classList.remove(this.stateClasses.isActive);
      });
    this.rootElement
      .querySelector(this.selectors.priceButton)
      .addEventListener("click", () => {
        this.scrollToSection(".price");
        this.overlayElement.classList.remove(this.stateClasses.isActive);
      });
  }
}

new Header();

// Модальное окно
let isOpenModal = false;

function openModal() {
  if (!isOpenModal) {
    isOpenModal = true;
    document.getElementById("modal").classList.add("open");
  }
}

function closeModal() {
  if (isOpenModal) {
    isOpenModal = false;
    e.currentTarget.classList.remove("open");
  }
}

// обработчики модального окна
document.querySelectorAll("[data-js-button]").forEach((button) => {
  button.addEventListener("click", function () {
    openModal();
  });
});

window.addEventListener(`keydown`, (e) => {
  if (e.key === "Escape") {
    closeModal();
  }
});

document.querySelector("#modal .modal-box").addEventListener("click", (e) => {
  e._isClickWithInModal = true;
  isOpenModal = false;
});

document.getElementById("modal").addEventListener("click", (e) => {
  if (e._isClickWithInModal) return;

  closeModal();
});

// пишу коментарий что это такое и зачем
const inputs = document.querySelectorAll("[data-js-input]");
const nameLabels = document.querySelectorAll("[data-js-name]");

function toggleVisibility() {
  inputs.forEach((input, index) => {
    if (input.value.trim() !== "") {
      nameLabels[index].style.display = "none";
    } else {
      nameLabels[index].style.display = "block";
    }
  });
}

inputs.forEach((input) => {
  input.addEventListener("input", toggleVisibility);
});
toggleVisibility();

// Совершение запрос
async function sendRequest(phoneNumber, name) {
  //   {
  //     "statusCode": 400,
  //     "error": "Bad Request",
  //     "message": "Validation Error",
  //     "extensions": {
  //         "code": "VALIDATION_ERROR",
  //         "message": "Validation Error",
  //         "fields": [
  //             {
  //                 "name": "phoneNumber",
  //                 "message": "Неверный номер телефона"
  //             }
  //         ]
  //     }
  // }

  try {
    const response = await fetch("http://localhost:5000/order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify({
        phoneNumber,
        name,
        __test_delay: 2_000,
      }),
    });

    const payload = await response.json();

    if (!response.ok) {
      if (payload.extensions?.code === "VALIDATION_ERROR") {
        if (
          !Array.isArray(payload.extensions.fields) ||
          payload.extensions.fields.length === 0
        ) {
          throw new ValidationError(null, payload.extensions.message);
        }

        throw new ValidationError(payload.extensions.fields);
      }
    }

    return payload;
  } catch (error) {
    if (error instanceof BaseError) {
      throw error;
    }

    throw UnexpectedError(undefined, error);
  }
}

// IDLE -- ничего не происходит

// PROCESSING -- выполнение запроса
// SUCCEEDED -- запрос выполнен успешно
// FAILED -- запрос выполнен с ошибкой

function submitListenner(event) {
  event.preventDefault();
  const form = event.target;

  const [phoneNumber, name] = [...form.querySelectorAll("[data-js-input]")].map(
    (e) => e.value
  );

  // PROCESSING
  const { submitButtonNode, submitButtonSavedText } =
    processingStageLockUi(form);

  // debugger;

  sendRequest(phoneNumber, name)
    .finally(() => {
      // PROCESSING
      processingStageUnlockUi(submitButtonNode, submitButtonSavedText);
    })
    .then((result) => succeededStage(result, form))
    .catch((error) => failedStageUpdateUi(error, form));

  // debugger;
}

//
// PROCESSING
//

/**
 * функция блокирует UI до запроса, чтобы не совершались повторные вызовы запроса из UI
 * Эта функция возвращает ноду кнопки submit и текст с этой кнопки. Далее эти данные должны быть
 * переданы в функцию unlockUi
 */
function processingStageLockUi(form) {
  // ЗАДАЧА: в идеале  сделать на кнопке лоадер (спиннер)
  const submitButtonNode = form.querySelector("[type=submit]");
  const submitButtonSavedText = submitButtonNode.innerText;
  submitButtonNode.innerHTML = '<span class="loader"></span>';
  // debugger;
  submitButtonNode.disabled = true;

  return { submitButtonNode, submitButtonSavedText };
}

/**
 * функция разблокирует UI после запроса. Принимает данные из функции lockUi
 */
function processingStageUnlockUi(submitButtonNode, submitButtonSavedText) {
  // ЗАДАЧА: убрать спинер и показать кнопку
  submitButtonNode.innerText = submitButtonSavedText;
  submitButtonNode.disabled = false;
}

//
// SUCCEEDED
//
function succeededStage(result, form) {
  // ЗАДАЧА: отобразить успешное завершение кейса отпраки запроса

  const resultElement = document.querySelector(".result");
  const resultTextElement = document.querySelector(".result-text");
  resultElement.classList.toggle("visually-hidden");
  resultTextElement.innerText = result.message;
  // Закрыть модалку
  debugger;
  console.log(result);
  closeModal();
}

//
// FAILED
//
function failedStageUpdateUi(error, form) {
  if (failedStageUpdateUiValidationErrorHandler(error, form)) {
    return;
  }

  if (failedStageUpdateUiUnexpectedErrorHandler(error)) {
    return;
  }

  if (failedStageUpdateUiBaseErrorHandler(error)) {
    return;
  }

  failedStageUpdateUiDefaultErrorHandler();
}

function failedStageUpdateUiValidationErrorHandler(error, form) {
  if (error instanceof ValidationError) {
    if (Array.isArray(error.fields)) {
      for (const field of error.fields) {
        failedStageUpdateUiShowInputRelatedErrorInUI(field, form);
      }

      return true;
    }

    failedStageUpdateUiShowGlobalErrorInUI(error.message);
    return true;
  }

  return false;
}

function failedStageUpdateUiShowInputRelatedErrorInUI(field, form) {
  // ЗАДАЧА: отобразить ошибку связанную с полями ввода
  //
  // В form найти ноду инпута по field. Дальше в этой ноде переключить класс на ошибку
  // И показать подсказву под нодой (вроде под нодой) (field.message)
  const inputNode = form.querySelector("[ data-js-input]");
  inputNode.setCustomValidity(field.message);

  // debugger;
  console.error(field);
}

function failedStageUpdateUiUnexpectedErrorHandler(error) {
  if (error instanceof UnexpectedError) {
    failedStageUpdateUiShowGlobalErrorInUI(error.message);

    return true;
  }

  return false;
}

function failedStageUpdateUiBaseErrorHandler(error) {
  if (error instanceof BaseError) {
    failedStageUpdateUiShowGlobalErrorInUI(error.message);

    return true;
  }

  return false;
}

function failedStageUpdateUiDefaultErrorHandler() {
  failedStageUpdateUiShowGlobalErrorInUI(UnexpectedError.defaultMessage);
}

function failedStageUpdateUiShowGlobalErrorInUI(message) {
  // ЗАДАЧА: отобразить глобальную (не связанную с полями ввода) ошибку
  console.error(message);

  return true;
}

[...document.querySelectorAll(".data__form")].map((f) =>
  f.addEventListener("submit", submitListenner)
);

// Закрытие окна с положительным результатом отправки
const resultElement = document.querySelector(".result");
const resultCloseElement = document.querySelector(".result-close");

window.addEventListener(`keydown`, (e) => {
  if (e.key === "Escape") {
    resultElement.classList.add("visually-hidden");
  }
});
resultCloseElement.addEventListener("click", (e) => {
  resultElement.classList.add("visually-hidden");
});

// [...document.querySelectorAll(".data__form")].map((formE) => {
//   formE.addEventListener("submit", submitListenner);
//   const phoneNumberInput = formE.querySelector("[type=tel]");
//   // phoneNumberInput.addEventListener("focus", (inputE) => {
//   //   if(inputE.target.value.length === 0) {
//   //     inputE.target.value = "+7 ("
//   //   }
//   // })

//   phoneNumberInput.addEventListener("input", (inputE) => {
//     const clarifiedInput = inputE.target.value.replace(/^(?:\+7|\+|7|8)/,"");
//     const formattedPhoneNumber = `+7 ${formatPhoneNumber(clarifiedInput)}`;

//     inputE.target.value =formattedPhoneNumber;
//   })
// });

// function formatPhoneNumber(input) {
//     const digits = input.replace(/\D/g,'').substring(0,10);
//     const operatorCode = digits.substring(0,3);
//     const prefix = digits.substring(3,6);
//     const suffixA = digits.substring(6,8);
//     const suffixB = digits.substring(8,10);

//     if(digits.length > 7) {
//       return `(${operatorCode}) ${prefix}-${suffixA}-${suffixB}`;
//     }
//     if(digits.length > 6) {
//       return `(${operatorCode}) ${prefix}-${suffixA}`;
//     }
//     else if(digits.length > 3) {
//       return `(${operatorCode}) ${prefix}`;
//     }
//     else if(digits.length > 0) {
//       return `(${operatorCode}`;
//     }

//     return input;
// }
