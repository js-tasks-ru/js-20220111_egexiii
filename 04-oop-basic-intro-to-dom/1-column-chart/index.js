export default class ColumnChart {
  chartHeight = 50;

  constructor({
    data = [],
    label = '',
    link = '',
    value = 0,
    formatHeading = data => data
  } = {}) {
    this.data = data;
    this.label = label;
    this.link = link;
    this.value = value;
    this.formatHeading = formatHeading;
    this.render();
  }

  getColumnTemplate(value, max) {
    const heightVal = Math.floor(value * this.chartHeight / max);
    const tooltipVal = (value / max * 100).toFixed(0);
    return `<div style="--value: ${heightVal}" data-tooltip="${tooltipVal}%"></div>`;
  }

  getChartTemplate() {
    const max = Math.max(...this.data);
    return `<div class="column-chart__container">
            ${this.value ? `<div data-element="header" class="column-chart__header">${this.formatHeading(this.value)}</div>` : ''}
            <div data-element="body" class="column-chart__chart">
                ${this.data.map(val => this.getColumnTemplate(val, max)).join('\n')}
            </div>`;
  }

  getTitleTemplate() {
    return `<div class="column-chart__title">
                Total ${this.label}
                <a href="${this.link}" class="column-chart__link">View all</a>
            </div>`;
  }

  getTemplate() {
    return `<div class="column-chart ${this.data?.length === 0 ? 'column-chart_loading' : ''}" style="--chart-height: ${this.chartHeight}">
                ${this.getTitleTemplate()}
                ${this.getChartTemplate()}
            </div>`;
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
  }

  update(data) {
    this.data = data;
    this.render();
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
  }
}
