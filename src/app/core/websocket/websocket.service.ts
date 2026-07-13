import { Injectable, OnDestroy, inject, signal } from '@angular/core';
import { Observable, Subject, filter, map, shareReplay } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BidPlacedEvent, TimerUpdateEvent } from '../../shared/models/auction.model';
import { LiveBid } from '../../shared/models/bid.model';

/**
 * Servicio de tiempo real para subastas.
 * Preparado para Laravel Echo + Pusher; incluye modo simulación para desarrollo.
 */
@Injectable({ providedIn: 'root' })
export class WebsocketService implements OnDestroy {
  private readonly bidEvents$ = new Subject<BidPlacedEvent>();
  private readonly timerEvents$ = new Subject<TimerUpdateEvent>();
  private readonly mockIntervals = new Map<number, ReturnType<typeof setInterval>>();
  private echoConnected = signal(false);

  readonly isConnected = this.echoConnected.asReadonly();

  ngOnDestroy(): void {
    this.mockIntervals.forEach((id) => clearInterval(id));
    this.mockIntervals.clear();
  }

  connect(): void {
    if (environment.production && environment.reverb?.key) {
      this.initEcho();
      return;
    }
    this.echoConnected.set(true);
  }

  disconnect(): void {
    this.mockIntervals.forEach((id) => clearInterval(id));
    this.mockIntervals.clear();
    this.echoConnected.set(false);
  }

  onBidPlaced(auctionId: number): Observable<LiveBid> {
    return this.bidEvents$.pipe(
      filter((e) => e.auctionId === auctionId),
      map((e) => this.toLiveBid(e)),
      shareReplay({ bufferSize: 1, refCount: true }),
    );
  }

  onTimerUpdate(auctionId: number): Observable<TimerUpdateEvent> {
    return this.timerEvents$.pipe(
      filter((e) => e.auctionId === auctionId),
      shareReplay({ bufferSize: 1, refCount: true }),
    );
  }

  /** Emite evento de puja (usado por API o mock). */
  emitBid(event: BidPlacedEvent): void {
    this.bidEvents$.next(event);
  }

  emitTimerUpdate(event: TimerUpdateEvent): void {
    this.timerEvents$.next(event);
  }

  /**
   * Simula ticks de temporizador y pujas aleatorias para desarrollo UI.
   */
  startMockAuctionStream(auctionId: number, initialSeconds: number): void {
    if (this.mockIntervals.has(auctionId)) {
      return;
    }

    let seconds = initialSeconds;
    const names = ['Alex_R', 'Maria_K', 'Carlos_99', 'LunaBit', 'NeoBidder', 'PixelPro'];
    const avatars = [
      'https://api.dicebear.com/7.x/avataaars/svg?seed=',
      'https://api.dicebear.com/7.x/bottts/svg?seed=',
    ];

    const intervalId = setInterval(() => {
      seconds = Math.max(0, seconds - 1);

      this.emitTimerUpdate({ auctionId, remainingSeconds: seconds });

      if (seconds > 0 && seconds <= 3 && Math.random() > 0.4) {
        seconds = Math.min(15, seconds + 10);
        const seed = names[Math.floor(Math.random() * names.length)];
        this.emitBid({
          auctionId,
          bidId: Date.now(),
          amount: Math.round((Math.random() * 50 + 5) * 100) / 100,
          user: {
            id: Math.floor(Math.random() * 1000),
            name: seed,
            avatarUrl: `${avatars[0]}${seed}`,
          },
          placedAt: new Date().toISOString(),
          remainingSeconds: seconds,
        });
        this.emitTimerUpdate({ auctionId, remainingSeconds: seconds });
      }

      if (seconds === 0) {
        seconds = 12;
        this.emitTimerUpdate({ auctionId, remainingSeconds: seconds });
      }
    }, 1000);

    this.mockIntervals.set(auctionId, intervalId);
  }

  stopMockAuctionStream(auctionId: number): void {
    const id = this.mockIntervals.get(auctionId);
    if (id) {
      clearInterval(id);
      this.mockIntervals.delete(auctionId);
    }
  }

  private initEcho(): void {
    // Integración futura: laravel-echo + pusher-js
    // import Echo from 'laravel-echo';
    // import Pusher from 'pusher-js';
    this.echoConnected.set(true);
  }

  private toLiveBid(event: BidPlacedEvent): LiveBid {
    return {
      id: event.bidId,
      auctionId: event.auctionId,
      userName: event.user.name,
      userAvatarUrl: event.user.avatarUrl,
      amount: event.amount,
      placedAt: new Date(event.placedAt),
      isNew: true,
    };
  }
}
