export class MainLayout {
  constructor(
    private _title: string,
    private _navigationItems: Array<{ label: string; route: string }>
  ) {}

  get title(): string {
    return this._title;
  }
  get navigationItems(): Array<{ label: string; route: string }> {
    return this._navigationItems;
  }

  addNavigationItem(item: { label: string; route: string }): void {
    this._navigationItems.push(item);
  }

  removeNavigationItem(route: string): void {
    this._navigationItems = this._navigationItems.filter(item => item.route !== route);
  }
}
