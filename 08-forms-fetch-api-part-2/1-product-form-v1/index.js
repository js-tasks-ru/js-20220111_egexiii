import escapeHtml from './utils/escape-html.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
  element;
  data = {};
  categories;
  subElements = {};

  constructor(productId = null) {
    this.productId = productId;
  }

  initEventListeners() {
    this.uploadImageBtn = this.element.querySelector('button[name=uploadImage]');
    this.uploadImageBtn.addEventListener('click', this.uploadImage);
    this.subElements.imageListContainer.addEventListener('click', this.deleteImage);
    this.element.addEventListener('change', this.setData);
    this.element.addEventListener('submit', (event) => {
      event.preventDefault();
      this.save();
    });
  }

  async loadCategories() {
    const url = new URL('api/rest/categories', BACKEND_URL);
    url.searchParams.set('_sort', 'weight');
    url.searchParams.set('_refs', 'subcategory');

    const response = await fetch(url.toString());
    return response.json();
  }

  async loadData() {
    const url = new URL('api/rest/products', BACKEND_URL);
    url.searchParams.set('id', this.productId);

    const response = await fetch(url.toString());
    const data = await response.json();
    return data[0];
  }

  async save() {
    const url = new URL('api/rest/products', BACKEND_URL);
    const method = this.productId ? 'PATCH' : 'PUT';

    await fetch(url.toString(), {
      method: method,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        description: this.data.description,
        discount: this.data.discount,
        id: this.data.id,
        images: this.data.images,
        price: this.data.price,
        quantity: this.data.quantity,
        status: this.data.status,
        subcategory: this.data.subcategory,
        title: this.data.title
      }),
    });

    const customEvent = this.productId ?
      new CustomEvent("product-updated", {
        detail: 'Product updated'
      }) :
      new CustomEvent("product-saved", {
        detail: 'Product saved'
      });
    this.element.dispatchEvent(customEvent);
  }

  getTemplate() {
    return `
        <form data-element="productForm" class="form-grid">
          <div class="form-group form-group__half_left">
            <fieldset>
              <label class="form-label">Название товара</label>
              <input required
                type="text"
                id="title"
                name="title"
                class="form-control"
                value="${escapeHtml(this.data.title)}"
                placeholder="Название товара">
            </fieldset>
          </div>
          
          <div class="form-group form-group__wide">
            <label class="form-label">Описание</label>
            <textarea required
                id="description"
                class="form-control"
                name="description"
                data-element="productDescription"
                placeholder="Описание товара">${escapeHtml(this.data.description)}</textarea>
          </div>
          
          <div class="form-group form-group__wide" data-element="sortable-list-container">
            <label class="form-label">Фото</label>
            <div data-element="imageListContainer">
                <ul class="sortable-list">
                    ${this.getImages()}
                </ul>
            </div>
            <button type="button" name="uploadImage" class="button-primary-outline">
                <span>Загрузить</span>
            </button>
          </div>
          
          <div class="form-group form-group__half_left">
            <label class="form-label">Категория</label>
            <select class="form-control" name="subcategory" id="subcategory" required>
              ${this.getCategories()};
            </select>
          </div>
          
          <div class="form-group form-group__half_left form-group__two-col">
            <fieldset>
              <label class="form-label">Цена ($)</label>
              <input required
                id="price"
                type="number"
                name="price"
                class="form-control"
                placeholder="100"
                value="${this.data.price}">
            </fieldset>
            <fieldset>
              <label class="form-label">Скидка ($)</label>
              <input required
                id="discount"
                type="number"
                name="discount"
                class="form-control"
                placeholder="0"
                value="${this.data.discount}">
            </fieldset>
          </div>
          
          <div class="form-group form-group__part-half">
            <label class="form-label">Количество</label>
            <input required
                id="quantity"
                type="number"
                class="form-control"
                name="quantity"
                placeholder="1"
                value="${this.data.quantity}">
          </div>
          
          <div class="form-group form-group__part-half">
            <label class="form-label">Статус</label>
            <select class="form-control" name="status" id="status" required>
              <option value="1" ${this.isSelected(1, this.data?.status)}>Активен</option>
              <option value="0" ${this.isSelected(0, this.data?.status)}>Неактивен</option>
            </select>
          </div>
          
          <div class="form-buttons">
            <button type="submit" name="save" class="button-primary-outline">
              Сохранить товар
            </button>
          </div>
    </form>
    `;
  }

  getCategories() {
    return this.categories.map(category =>
      category.subcategories.map(subcategory => `
        <option value="${subcategory.id}" ${this.isSelected(subcategory.id, this.data?.subcategory)}>${category.title} &gt; ${subcategory.title}</option>
      `)).join('\n');
  }

  isSelected(option, dataOption) {
    return option === dataOption ? 'selected' : '';
  }

  getImages() {
    return this.data.images.map(image => this.getImage(image.url, image.source));
  }

  getImage(url, source) {
    return `
          <li class="products-edit__image list-item sortable-list__item" style="">
            <input type="hidden" name="url" value="${url}">
            <input type="hidden" name="source" value="${source}">
            <span>
              <img src="icon-grab.svg" data-grab-handle="${source}" alt="grab">
              <img class="sortable-table__cell-img" alt="Image" src="${url}">
              <span>${source}</span>
            </span>
            <button type="button">
                <img src="icon-trash.svg" data-delete-handle="${source}" alt="delete">
            </button>
          </li>
        `;
  }

  async render() {
    const element = document.createElement('div');
    this.categories = await this.loadCategories();

    if (this.productId) {
      this.data = await this.loadData();
    }

    element.innerHTML = this.getTemplate();
    this.element = element;
    this.subElements = this.getSubElements();
    this.initEventListeners();
    return this.element;
  }

  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }
    return result;
  }


  uploadImage = () => {
    const uploadBtn = document.createElement("input");
    uploadBtn.type = "file";
    uploadBtn.name = "picture";
    uploadBtn.accept = "image/*";
    uploadBtn.click();

    uploadBtn.addEventListener('change', async () => {
      const image = uploadBtn.files[0];
      let result = await this.sendImageToImgur(image);
      this.addImageToList(image.name, result.data.link);
    });
  };

  async sendImageToImgur(image) {
    const url = 'https://api.imgur.com/3/image';
    let data = new FormData();
    data.append('image', image);
    this.uploadImageBtn.classList.add('is-loading');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Client-ID ${IMGUR_CLIENT_ID}`
      },
      body: data,
      redirect: 'follow'
    });

    this.uploadImageBtn.classList.remove('is-loading');
    return response.json();
  }

  addImageToList(name, link) {
    if (!this.data?.images?.length) {
      this.data.images = [];
    }
    this.data.images.push({ source: name, url: link });
    const imagesList = this.subElements.imageListContainer.firstElementChild;
    imagesList.insertAdjacentHTML('beforeend', this.getImage(link, name));
  }

  deleteImage = event => {
    const active = event.target.closest('.products-edit__image');
    if (!active) {
      return;
    }
    const [url, source] = active.children;
    const activeIndex = this.data.images.findIndex(item => {
      return item.source === source.value && item.url === url.value;
    });

    if (activeIndex >= 0) {
      this.data.images.splice(activeIndex, 1);
    }

    active.remove();
  };

  setData = event => {
    const active = event.target.closest('.form-control');
    const field = active.id;
    this.data[field] = active.value;
  };

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.subElements = {};
  }
}
