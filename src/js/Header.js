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
document.querySelectorAll("[data-js-button]").forEach((button) => {
  button.addEventListener("click", function () {
    document.getElementById("modal").classList.add("open");
    categoriesAddTask.addEventListener(
      "click",
      categoryLinkedCategoryForAddTask
    );
  });
});

window.addEventListener(`keydown`, (e) => {
  if (e.key === "Escape") {
    document.getElementById("modal").classList.remove("open");
  }
});

document.querySelector("#modal .modal-box").addEventListener("click", (e) => {
  e._isClickWithInModal = true;
});
document.getElementById("modal").addEventListener("click", (e) => {
  if (e._isClickWithInModal) return;
  e.currentTarget.classList.remove("open");
});

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
