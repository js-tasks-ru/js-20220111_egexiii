export default class SortableTable {

  element;
  subElements = {};

  constructor(headerConfig = [], {
    data = [],
    sorted = {}
  } = {}) {
    this.headerConfig = headerConfig;
    this.data = data;
    this.sorted = sorted;

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

  initEventListeners() {
    this.subElements.header.addEventListener('pointerdown', this.onSortClick);
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
      </div>`;
  }


  render() {
    const { id, order } = this.sorted;

    this.sortData(id, order);

    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTable();

    const element = wrapper.firstElementChild;
    this.element = element;
    this.subElements = this.getSubElements(element);

    this.initEventListeners();
  }

  sortData(id, order) {
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

  updateRows() {
    this.subElements.body.innerHTML = this.getRows();
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
