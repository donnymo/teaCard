'use strict';

const DESKTOP_QUERY = '(min-width: 1200px)';
const ADDED_TIMEOUT = 1800;

// --- Утилиты ---

const rubFormat = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const kopFormat = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  minimumFractionDigits: 2,
});

// формат цены
function formatPrice(value) {
  return Number.isInteger(value) ? rubFormat.format(value) : kopFormat.format(value);
}

// склонения
function pluralize(n, [one, few, many]) {
  if (n % 10 === 1 && n % 100 !== 11) return one;
  if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14)) return few;
  return many;
}

// --- Фасовка ---

function initPacks(product) {
  const price = product.querySelector('[data-price-current]');
  const oldPrice = product.querySelector('[data-price-old]');
  const oldPriceValue = product.querySelector('[data-price-old-value]');
  const sku = product.querySelector('[data-sku-value]');
  const weight = product.querySelector('[data-pack-weight]');

  function update(input) {
    const current = Number(input.dataset.price);
    const old = Number(input.dataset.oldPrice);

    price.textContent = formatPrice(current);
    // старая цена только при скидке
    oldPrice.hidden = !(old > current);
    if (old > current) oldPriceValue.textContent = formatPrice(old);
    sku.textContent = input.dataset.sku;
    weight.textContent = input.dataset.weight;
  }

  product.querySelectorAll('[data-pack-input]').forEach((input) => {
    input.addEventListener('change', () => update(input));
    if (input.checked) update(input);
  });
}

// --- Количество ---

function initQuantity(root) {
  const input = root.querySelector('[data-quantity-input]');
  const minus = root.querySelector('[data-quantity-decrease]');
  const plus = root.querySelector('[data-quantity-increase]');
  const min = Number(input.min);
  const max = Number(input.max);

  // держим значение в пределах min–max
  function setValue(value) {
    const n =Number.isNaN(value) ? min : Math.min(max, Math.max(min, Math.round(value)));
    input.value = n;
    minus.disabled = n === min;
    plus.disabled = n === max;
  }

  minus.addEventListener('click', () => setValue(input.valueAsNumber - 1));
  plus.addEventListener('click', () => setValue(input.valueAsNumber + 1));
  input.addEventListener('change', () => setValue(input.valueAsNumber));
  setValue(input.valueAsNumber);

  return () => Number(input.value);
}

// --- Корзина ---

function initCart(product) {
  const form = product.querySelector('[data-purchase]');
  if (!form) return;

  const getQuantity = initQuantity(form.querySelector('[data-quantity]'));
  const button = form.querySelector('[data-cart-button]');
  const buttonText = form.querySelector('[data-cart-button-text]');
  const buttonIcon = form.querySelector('[data-cart-button-icon]');
  const status = form.querySelector('[data-cart-status]');
  const cartLink = document.querySelector('[data-cart-link]');
  const badge = document.querySelector('[data-cart-count]');
  const title = product.querySelector('[data-product-title]').textContent.trim();
  const defaultText = buttonText.textContent;

  let count = 0;
  let timer;

  function updateBadge() {
    badge.hidden = false;
    badge.textContent = count;
    cartLink.setAttribute('aria-label', `Корзина: ${count} ${pluralize(count, ['товар', 'товара', 'товаров'])}`);

    // перезапуск анимации
    badge.style.animation = 'none';
    void badge.offsetWidth;
    badge.style.animation = '';
  }

  function setAdded(added) {
    button.classList.toggle('button--primary', !added);
    button.classList.toggle('button--success', added);
    buttonText.textContent = added ? 'Добавлено' : defaultText;
    buttonIcon.setAttribute('href', added ? '#icon-check' : '#icon-cart');
  }

  // обновляем счётчик и показываем «Добавлено»
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const pack = form.querySelector('[data-pack-input]:checked');
    const quantity = getQuantity();

    count += quantity;
    updateBadge();
    setAdded(true);
    status.textContent = `Добавлено в корзину: ${title}, ${pack.dataset.weight}, ${quantity} шт.`;

    clearTimeout(timer);
    timer =setTimeout(() => setAdded(false), ADDED_TIMEOUT);
  });
}

// --- Избранное ---

function initFavorite(product) {
  const button = product.querySelector('[data-favorite]');
  if (!button) return;

  button.addEventListener('click', () => {
    const pressed = button.getAttribute('aria-pressed') === 'true';
    button.setAttribute('aria-pressed', !pressed);
  });
}

// --- Галерея ---

function initGallery(product) {
  const gallery = product.querySelector('[data-gallery]');
  if (!gallery) return;

  const image = gallery.querySelector('[data-gallery-image]');
  const source = gallery.querySelector('[data-gallery-source]');
  const thumbs = gallery.querySelectorAll('[data-gallery-thumb]');

  thumbs.forEach((thumb) => {
    thumb.addEventListener('click', () => {
      thumbs.forEach((item) => {
        item.classList.toggle('gallery__thumb--active', item === thumb);
        item.setAttribute('aria-current', item === thumb);
      });
      source.srcset = thumb.dataset.imageWebp;
      image.srcset = thumb.dataset.imageJpg;
      image.src = thumb.dataset.imageSrc;
    });
  });

  const lightbox = document.querySelector('[data-lightbox]');
  const lightboxImage = lightbox.querySelector('[data-lightbox-image]');
  const lightboxSource = lightbox.querySelector('[data-lightbox-source]');

  function openLightbox() {
    lightboxSource.srcset = source.srcset;
    lightboxImage.srcset = image.srcset;
    lightboxImage.src = image.getAttribute('src');
    lightbox.showModal();
  }

  gallery.querySelector('[data-gallery-zoom]').addEventListener('click', openLightbox);
  image.addEventListener('click', openLightbox);
  lightbox.querySelector('[data-lightbox-close]').addEventListener('click', () => lightbox.close());
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) lightbox.close();
  });
}

// ---Header ---

function initHeader() {
  const header = document.querySelector('[data-header]');
  if (!header) return;

  const menuButton = header.querySelector('[data-menu-toggle]');
  const searchButton = header.querySelector('[data-search-toggle]');
  const searchInput = header.querySelector('[data-search-input]');

  const isOpen = (button) => button.getAttribute('aria-expanded') === 'true';

  function toggleMenu(open) {
    header.classList.toggle('header--menu-open', open);
    menuButton.setAttribute('aria-expanded', open);
    menuButton.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  }

  function toggleSearch(open) {
    header.classList.toggle('header--search-open', open);
    searchButton.setAttribute('aria-expanded', open);
    searchButton.setAttribute('aria-label', open ? 'Закрыть поиск' : 'Открыть поиск');
    if (open) searchInput.focus();
  }

  menuButton.addEventListener('click', () => toggleMenu(!isOpen(menuButton)));
  searchButton.addEventListener('click', () => toggleSearch(!isOpen(searchButton)));

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;

    if (isOpen(searchButton)) {
      toggleSearch(false);
      searchButton.focus();
    }
    if (isOpen(menuButton)) {
      toggleMenu(false);
      menuButton.focus();
    }
  });

  // сбрасываем мобильные состояния
  window.matchMedia(DESKTOP_QUERY).addEventListener('change', (e) => {
    if (!e.matches) return;
    toggleMenu(false);
    toggleSearch(false);
  });
}

// --- Запуск ---

initHeader();

const product = document.querySelector('[data-product]');
if (product) {
  initPacks(product);
  initCart(product);
  initFavorite(product);
  initGallery(product);
}
