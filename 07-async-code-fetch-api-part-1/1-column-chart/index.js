const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {
  subElements = {};
  chartHeight = 50;
  data = [];
  value = 0;

  constructor({
                label = '',
                link = '',
                url = 'api/dashboard/sales',
                range = {
                  from: new Date('2020-04-06'),
                  to: new Date('2020-05-06'),
                },
                formatHeading = data => data
              } = {}) {
    this.range = range;
    this.url = url;
    this.label = label;
    this.link = link;
    this.formatHeading = formatHeading;

    this.render();
    this.update(this.range.from, this.range.to);
  }

  get template() {
    return `
      <div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
        <div class="column-chart__title">
          Total ${this.label}
          ${this.getLink()}
        </div>
        <div class="column-chart__container">
           <div data-element="header" class="column-chart__header">
             ${this.value}
           </div>
          <div data-element="body" class="column-chart__chart">
            ${this.getColumnBody()}
          </div>
          <div data-element="js"></div>
        </div>
      </div>
    `;
  }

  render() {
    const element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild;

    this.subElements = this.getSubElements();
  }

  setIsLoaded(param = false) {
    if (param) {
      this.element.classList.remove('column-chart_loading');
    } else {
      this.element.classList.add('column-chart_loading');
    }
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

  getColumnBody() {
    const maxValue = Math.max(...this.data);
    const scale = this.chartHeight / maxValue;
    return this.data
      .map(item => {
        const percent = (item / maxValue * 100).toFixed(0);

        return `<div style="--value: ${Math.floor(item * scale)}" data-tooltip="${percent}%"></div>`;
      })
      .join('');
  }

  getLink() {
    return this.link ? `<a class="column-chart__link" href="${this.link}">View all</a>` : '';
  }


  async update(from, to) {
    this.range.from = from;
    this.range.to = to;
    this.setIsLoaded(false);
    const fetchedData = await this.fetchData();
    this.data = Object.values(fetchedData);
    this.value = this.data.reduce((a, b) => a + b);
    this.subElements.body.innerHTML = this.getColumnBody();
    this.subElements.header.innerText = this.formatHeading(this.value);
    this.setIsLoaded(true);
    return fetchedData;
  }

  async fetchData() {
    const url = new URL(`${BACKEND_URL}/${this.url}`);
    url.searchParams.set('from', this.convertDate(this.range.from));
    url.searchParams.set('to', this.convertDate(this.range.to));
    const response = await fetch(url.toString());
    return response.json();
  }

  convertDate(dateStr) {
    return new Date(dateStr).toISOString();
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

