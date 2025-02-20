export class MainLayout {
  title: string;
  navigationItems: Array<{ label: string; route: string }>;

  constructor(title: string, navigationItems: Array<{ label: string; route: string }>) {
    this.title = title;
    this.navigationItems = navigationItems;
  }

  addNavigationItem(item: { label: string; route: string }): void {
    this.navigationItems.push(item);
  }

  removeNavigationItem(route: string): void {
    this.navigationItems = this.navigationItems.filter(item => item.route !== route);
  }
}
