import { Injectable } from '@angular/core';
import { Realtime, InboundMessage, RealtimeChannel } from 'ably';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AblyService {
    private ablyClient: Realtime | null = null;
    private channels: Map<string, RealtimeChannel> = new Map();

    // BehaviorSubject to store current shop code
    private shopCodeSubject = new BehaviorSubject<string | null>(null);
    shopCode$ = this.shopCodeSubject.asObservable();

    // Subject for received Ably messages
    private ablyMessageSubject = new Subject<any>();
    ablyMessages$ = this.ablyMessageSubject.asObservable();

    /** Called when home component sets shop code */
    async setShopCode(shopCode: string) {
        this.shopCodeSubject.next(shopCode);
    }

    constructor() { }

    /**
     * Initialize the Ably client with an API key
     * @param apiKey Your Ably API key
     */
    initialize(apiKey: string): void {
        if (!this.ablyClient) {
            this.ablyClient = new Realtime({ key: apiKey });
        }
    }



    /**
     * Subscribe to a channel with a specific key
     * @param channelName The name of the channel to subscribe to
     * @param eventName The name of the event to subscribe to (optional)
     * @param callback The function to call when a message is received
     * @returns A promise that resolves when the subscription is established
     */
    async subscribe(
        channelName: string,
        callback: (message: InboundMessage) => void,
        eventName?: string
    ): Promise<void> {
        if (!this.ablyClient) {
            throw new Error('Ably client not initialized. Call initialize() first.');
        }

        let channel = this.channels.get(channelName);

        if (!channel) {
            channel = this.ablyClient.channels.get(channelName);
            this.channels.set(channelName, channel);
        }

        channel.unsubscribe();
        // Attach to the channel
        await channel.attach();

        // Subscribe to messages
        if (eventName) {
            channel.subscribe(eventName, callback);
        } else {
            channel.subscribe(callback);
        }
    }

    /**
     * Unsubscribe from a channel
     * @param channelName The name of the channel to unsubscribe from
     * @param eventName The name of the event to unsubscribe from (optional)
     * @param callback The callback function to remove (optional)
     */
    async unsubscribe(
        channelName: string,
        eventName?: string,
        callback?: (message: InboundMessage) => void
    ): Promise<void> {
        const channel = this.channels.get(channelName);
        if (channel) {
            if (eventName && callback) {
                channel.unsubscribe(eventName, callback);
            } else if (eventName) {
                channel.unsubscribe(eventName);
            } else if (callback) {
                channel.unsubscribe(callback);
            } else {
                channel.unsubscribe();
            }
        }
    }

    /**
     * Publish a message to a channel
     * @param channelName The name of the channel to publish to
     * @param eventName The name of the event to publish
     * @param data The data to send with the message
     * @returns A promise that resolves when the message is published
     */
    async publish(
        channelName: string,
        eventName: string,
        data: any
    ): Promise<void> {
        if (!this.ablyClient) {
            throw new Error('Ably client not initialized. Call initialize() first.');
        }

        let channel = this.channels.get(channelName);
        if (!channel) {
            channel = this.ablyClient.channels.get(channelName);
            this.channels.set(channelName, channel);
        }

        await channel.publish(eventName, data);
    }

    /**
     * Close the Ably connection
     */
    async close(): Promise<void> {
        if (this.ablyClient) {
            await this.ablyClient.close();
            this.ablyClient = null;
            this.channels.clear();
        }
    }
}