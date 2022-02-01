export default class SortableTable {

  subElements = {}

  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    this.data = data;
    this.render();
  }

  getHeader() {
    return this.headerConfig.map(el => {
      return `
          <div class="sortable-table__cell" data-id=${el.id} data-sortable="${el.sortable}">
            <span>${el.title}</span>
            <span data-element="arrow" class="sortable-table__sort-arrow">
              <span class="sort-arrow"></span>
            </span>
          </div>`;
    }).join('\n');
  }

  getRows(data) {
    return data.map((rowData) => {
      return `<a href="" class="sortable-table__row">${this.getCells(rowData)}</a>`;
    }).join('');
  }

  getCells(rowData) {
    return this.headerConfig.map(config => {
      const value = rowData[config.id];
      return config.template ? config.template(value) : `<div class="sortable-table__cell">${value}</div>`;
    }).join('\n');
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = `
    <div class="sortable-table">
        <div data-element="header" class="sortable-table__header sortable-table__row">
          ${this.getHeader()}
        </div>
        <div data-element="body" class="sortable-table__body">
          ${this.getRows(this.data)}
        </div>
    </div>
    `;
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(element);
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

  sort(field, order) {
    const sortHeader = this.headerConfig.find(item => item.id === field);
    if (!sortHeader.sortable) {
      return;
    }

    const direction = { asc: 1, desc: -1 }[order];
    let sortedData;
    switch (sortHeader.sortType) {
      case 'string':
        sortedData = this.sortStrings(this.data, field, direction);
        break;
      case 'number':
        sortedData = this.sortNumbers(this.data, field, direction);
        break;
    }

    this.updateSortInfo(field, order);
    this.subElements.body.innerHTML = this.getRows(sortedData);
  }

  sortStrings(data, field, direction) {
    return [...data].sort((a, b) => direction * a[field].localeCompare(b[field], ['ru', 'en']));
  }

  sortNumbers(data, field, direction) {
    return [...data].sort((a, b) => direction * (a[field] - b[field]));
  }

  updateSortInfo(field, order) {
    this.element
      .querySelectorAll('[data-id]')
      .forEach(it => it.getAttribute('data-id') === field ? it.dataset.order = order : '');
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
  }
}
