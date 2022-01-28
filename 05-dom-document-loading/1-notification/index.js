export default class NotificationMessage {

  static active;

  element;

  constructor(message = '', {
    duration = 0,
    type = '',
  } = {}) {
    this.message = message;
    this.duration = duration;
    this.type = type;
    this.render();
  }

  getTemplate() {
    return `
      <div class="notification ${this.type}" style="--value:${(this.duration / 1000) + 's'}">
        <div class="timer"></div>
        <div class="inner-wrapper">
            <div class="notification-header">${this.type}</div>
            <div class="notification-body">
                ${this.message}
            </div>
        </div>
      </div>
    `;
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
  }

  show(element) {
    if (NotificationMessage.active) {
      NotificationMessage.active.remove();
      NotificationMessage.activeNotification = null;
    }

    NotificationMessage.active = this.element;

    if (element) {
      element.append(this.element);
    } else {
      document.body.append(this.element);
    }

    setTimeout(() => {
      this.remove();
    }, this.duration);
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
  }

}
