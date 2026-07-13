# Estructura de carpetas — Frontend (Angular 18+)

```
frontend/
├── src/
│   ├── app/
│   │   ├── core/                              # Singleton services, guards, interceptors
│   │   │   ├── auth/
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── auth.guard.ts
│   │   │   │   └── auth.interceptor.ts
│   │   │   ├── websocket/
│   │   │   │   └── auction-echo.service.ts    # Laravel Reverb / Echo client
│   │   │   ├── api/
│   │   │   │   └── api.service.ts
│   │   │   └── theme/
│   │   │       └── theme.service.ts           # Dark / light mode
│   │   ├── shared/                            # Componentes reutilizables
│   │   │   ├── components/
│   │   │   │   ├── countdown-timer/
│   │   │   │   ├── auction-card/
│   │   │   │   ├── bid-history/
│   │   │   │   ├── bit-balance-badge/
│   │   │   │   └── progress-bar/
│   │   │   ├── pipes/
│   │   │   │   ├── currency-eur.pipe.ts
│   │   │   │   └── time-remaining.pipe.ts
│   │   │   └── models/
│   │   │       ├── auction.model.ts
│   │   │       ├── bid.model.ts
│   │   │       ├── user.model.ts
│   │   │       └── bit-pack.model.ts
│   │   ├── features/
│   │   │   ├── landing/
│   │   │   │   ├── landing.component.ts
│   │   │   │   └── hero-section.component.ts
│   │   │   ├── dashboard/
│   │   │   │   ├── dashboard.component.ts
│   │   │   │   └── auction-grid.component.ts
│   │   │   ├── auction-detail/
│   │   │   │   ├── auction-detail.component.ts
│   │   │   │   ├── bid-button.component.ts
│   │   │   │   └── live-bid-feed.component.ts
│   │   │   ├── wallet/
│   │   │   │   ├── wallet.component.ts
│   │   │   │   └── bit-pack-checkout.component.ts
│   │   │   ├── profile/
│   │   │   │   ├── profile.component.ts
│   │   │   │   ├── bid-history-page.component.ts
│   │   │   │   └── won-products.component.ts
│   │   │   └── admin/
│   │   │       ├── admin.routes.ts
│   │   │       ├── products/
│   │   │       ├── auctions/
│   │   │       └── analytics/
│   │   │           └── weekly-margin-chart.component.ts
│   │   ├── layout/
│   │   │   ├── main-layout/
│   │   │   ├── navbar/
│   │   │   └── footer/
│   │   ├── app.config.ts
│   │   ├── app.routes.ts
│   │   └── app.component.ts
│   ├── assets/
│   │   └── images/
│   ├── environments/
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│   └── styles/
│       ├── tailwind.css
│       └── _variables.scss                    # Tokens de diseño (colores, spacing)
├── tailwind.config.js
└── angular.json
```

## Patrones Angular

| Patrón | Uso |
|--------|-----|
| **Standalone components** | Todos los componentes sin NgModules |
| **Signals + RxJS** | Signals para UI local; RxJS para WebSocket streams |
| **Lazy loading** | Rutas por feature (`loadComponent`) |
| **OnPush** | Componentes de subasta en vivo (rendimiento) |

## UI/UX (conversión)

- Contador regresivo con transición de color (< 10s → rojo/naranja).
- CTA "¡Pujar!" prominente con feedback háptico visual (pulse).
- Modo oscuro por defecto; toggle en navbar.
- Animaciones con `@angular/animations` (fade, scale en nuevas pujas).

## Comunicación tiempo real

```typescript
// auction-echo.service.ts (esquema)
echo.channel(`auction.${auctionId}`)
  .listen('.bid.placed', (payload) => this.bidSubject.next(payload))
  .listen('.timer.updated', (payload) => this.timerSubject.next(payload));
```
