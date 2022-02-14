import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {

  element;
  subElements = {};
  defaultPaging = 40;

  constructor(headerConfig = [], {
    data = [],
    sorted = {
      id: headerConfig.find(item => item.sortable).id,
      order: 'asc'
    },
    url = '',
    isSortLocally = false,
  } = {}) {
    this.headerConfig = headerConfig;
    this.data = data;
    this.sorted = sorted;
    this.url = url;
    this.isSortLocally = isSortLocally;

    this.render();
  }

  onSortClick = event => {
    const toggleOrder = order => {
      const orders = {
        asc: 'desc',
        desc: 'asc'
      };

      return orders[order];
    };

    const column = event.target.closest('[data-sortable="true"]');

    if (column) {
      const { id, order } = column.dataset;
      const newOrder = toggleOrder(order);
      column.dataset.order = newOrder;
      const arrow = column.querySelector('.sortable-table__sort-arrow');
      if (!arrow) {
        column.append(this.subElements.arrow);
      }
      this.sortData(id, newOrder);
      this.updateRows();
    }
  };

  onTableScroll = () => {
    const windowRelativeBottom = document.documentElement.getBoundingClientRect().bottom;

    if (windowRelativeBottom === document.documentElement.clientHeight) {
      this.getData(this.data.length);
    }
  };

  initEventListeners() {
    this.subElements.header.addEventListener('pointerdown', this.onSortClick);
    window.addEventListener('scroll', this.onTableScroll);
  }

  getHeader() {
    return `<div data-element="header" class="sortable-table__header sortable-table__row">
      ${this.headerConfig.map(item => this.getHeaderCell(item)).join('\n')}
    </div>`;
  }

  getHeaderCell({ id, title, sortable }) {
    const isSorted = this.sorted.id === id;
    const order = isSorted ? this.sorted.order : 'asc';

    return `
      <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" data-order="${order}">
        <span>${title}</span>
        ${this.getSortingArrow(id)}
      </div>
    `;
  }

  getSortingArrow(id) {
    return this.sorted.id === id ? `<span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
      </span>` : '';
  }

  getTableBody() {
    return `
      <div data-element="body" class="sortable-table__body">
        ${this.getRows()}
      </div>`;
  }

  getRows() {
    return this.data.map(item => `
      <div class="sortable-table__row">
        ${this.getRow(item)}
      </div>`
    ).join('\n');
  }

  getRow(item) {
    return this.headerConfig.map(({ id, template }) => {
      return template
        ? template(item[id])
        : `<div class="sortable-table__cell">${item[id]}</div>`;
    }).join('\n');
  }

  getTable() {
    return `
      <div class="sortable-table">
        ${this.getHeader()}
        ${this.getTableBody()}
         <div data-element="loading" class="loading-line sortable-table__loading-line"></div>

        <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
            <div>
                <p>No products satisfies your filter criteria</p>
                <button type="button" class="button-primary-outline">Reset all filters</button>
            </div>
        </div>
      </div>`;
  }


  async render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTable();

    const element = wrapper.firstElementChild;
    this.element = element;
    this.subElements = this.getSubElements(element);
    this.initEventListeners();

    await this.getData();
  }

  sortData(id, order) {
    if (this.isSortLocally)
      this.sortOnClient(id, order);
    else
      this.sortOnServer(id, order);
  }

  sortOnClient(id, order) {
    this.sorted.id = id;
    this.sorted.order = order;

    const column = this.headerConfig.find(it => it.id === id);
    if (!column.sortable) {
      return;
    }

    const arr = [...this.data];
    const direction = { asc: 1, desc: -1 }[order];

    this.data = arr.sort((a, b) => {
      switch (column.sortType) {
        case 'number':
          return direction * (a[id] - b[id]);
        case 'string':
          return direction * a[id].localeCompare(b[id], 'ru');
      }
    });
  }

  async sortOnServer(id, order) {
    this.sorted.id = id;
    this.sorted.order = order;
    await this.getData();
  }

  updateRows() {
    this.subElements.body.innerHTML = this.getRows();
  }

  async getData(start = 0, end = start + this.defaultPaging) {
    const LOADING_CLASS = 'sortable-table_loading';

    this.element.classList.add(LOADING_CLASS);
    const url = new URL(this.url, BACKEND_URL);
    url.searchParams.set('_sort', this.sorted.id);
    url.searchParams.set('_order', this.sorted.order);
    url.searchParams.set('_start', start.toString());
    url.searchParams.set('_end', end.toString());


    const response = await fetch(url.toString());
    const resultData = await response.json();


    if (resultData.length) {
      this.data = start > 0 ? this.data.concat(resultData) : resultData;
      this.updateRows();
    }
    if (!this.data.length) {
      this.element.classList.add('sortable-table_empty');
    }
    this.element.classList.remove(LOADING_CLASS);
  }


  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }

    return result;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.subElements = {};
  }
}
