import {Events} from './events';
import Map = Phaser.Structs.Map;

export class EventManager {
    private static singleton: EventManager = null;

    private eventEmitter: Map<Events, Function[]> = new Map([]);
    private notListenedEvents: Map<Events, any> = new Map([]);

    private static getInstance() {
        if (!EventManager.singleton) {
            EventManager.singleton = new EventManager();
        }
        return EventManager.singleton;
    }

    public static emit(event: Events, ...args: any[]): void {
        const instance = this.getInstance();
        const emitter = instance.eventEmitter.get(event);
        if (emitter) {
            emitter.forEach(item => item(...args));
        } else {
            instance.notListenedEvents.set(event, args);
        }
    }

    public static on(event: Events, fn: Function): void {
        const instance = this.getInstance();
        const eventEmitter = instance.eventEmitter;
        const eventListener = eventEmitter.get(event);
        if (eventListener) {
            eventListener.push(fn);
        } else {
            eventEmitter.set(event, [fn]);
        }
    }

    public static recover(event: Events, fn: Function): void {
        const instance = this.getInstance();
        const notListenedEvent = instance.notListenedEvents.get(event);
        if (notListenedEvent) {
            fn(notListenedEvent);
        }
        this.on(event, fn);
    }

    public static destroy() {
        delete EventManager.singleton.eventEmitter;
        delete EventManager.singleton.notListenedEvents;
        EventManager.singleton = null;
    }
}
