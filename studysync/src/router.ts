// Simple client-side router
export type RouteHandler = () => void;

export class Router {
  private routes: Map<string, RouteHandler> = new Map();
  private currentRoute: string = '';

  constructor() {
    // Don't auto-initialize here, let the app control it
  }

  addRoute(path: string, handler: RouteHandler): void {
    this.routes.set(path, handler);
  }

  navigate(path: string): void {
    window.history.pushState({}, '', path);
    this.handleRoute();
  }

  getCurrentRoute(): string {
    return this.currentRoute;
  }

  handleRoute(): void {
    const path = window.location.pathname;
    this.currentRoute = path;

    // Find matching route
    const handler = this.routes.get(path);
    if (handler) {
      handler();
    } else {
      // Default route
      const defaultHandler = this.routes.get('/');
      if (defaultHandler) {
        defaultHandler();
      }
    }
  }
}

export const router = new Router();