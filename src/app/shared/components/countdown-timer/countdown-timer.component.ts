import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { WebsocketService } from '../../../core/websocket/websocket.service';

export type TimerSize = 'card' | 'massive';

@Component({
  selector: 'app-countdown-timer',
  standalone: true,
  template: `
    <div
      class="flex flex-col items-center"
      [class]="isUrgent() ? 'animate-pulse-urgent' : ''"
    >
      @if (showLabel()) {
        <span class="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500">
          {{ isUrgent() ? '¡Últimos segundos!' : 'Tiempo restante' }}
        </span>
      }
      <time
        [class]="timerClass()"
        [attr.datetime]="formattedTime()"
        [attr.aria-live]="isUrgent() ? 'assertive' : 'polite'"
      >
        {{ formattedTime() }}
      </time>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CountdownTimerComponent {
  private readonly ws = inject(WebsocketService);
  private readonly destroyRef = inject(DestroyRef);
  private tickInterval: ReturnType<typeof setInterval> | null = null;

  readonly auctionId = input.required<number>();
  readonly initialSeconds = input.required<number>();
  readonly size = input<TimerSize>('card');
  readonly showLabel = input(true);

  readonly secondsChanged = output<number>();
  readonly becameUrgent = output<void>();

  readonly remainingSeconds = signal(0);
  readonly isUrgent = computed(() => this.remainingSeconds() > 0 && this.remainingSeconds() < 10);

  readonly formattedTime = computed(() => {
    const total = Math.max(0, this.remainingSeconds());
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  });

  readonly timerClass = computed(() => {
    const size = this.size();
    if (this.isUrgent()) {
      return size === 'massive' ? 'timer-massive-urgent' : 'timer-urgent';
    }
    return size === 'massive' ? 'timer-massive-calm' : 'timer-calm';
  });

  constructor() {
    effect(() => {
      const id = this.auctionId();
      const initial = this.initialSeconds();
      this.remainingSeconds.set(initial);
      this.startLocalTick();
      this.subscribeToWebSocket(id);
    }, { allowSignalWrites: true });

    effect(() => {
      if (this.isUrgent()) {
        this.becameUrgent.emit();
      }
    });

    this.destroyRef.onDestroy(() => {
      if (this.tickInterval) {
        clearInterval(this.tickInterval);
      }
    });
  }

  private startLocalTick(): void {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
    }

    this.tickInterval = setInterval(() => {
      const current = this.remainingSeconds();
      if (current > 0) {
        const next = current - 1;
        this.remainingSeconds.set(next);
        this.secondsChanged.emit(next);
      }
    }, 1000);
  }

  private subscribeToWebSocket(auctionId: number): void {
    this.ws
      .onTimerUpdate(auctionId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        this.remainingSeconds.set(event.remainingSeconds);
        this.secondsChanged.emit(event.remainingSeconds);
      });
  }
}
