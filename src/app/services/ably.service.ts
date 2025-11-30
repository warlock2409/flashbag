import { Injectable } from '@angular/core';
import { Realtime, InboundMessage, RealtimeChannel } from 'ably';
import { BehaviorSubject, filter, Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AblyService {
    private ablyClient: Realtime | null = null;
    private channels: Map<string, RealtimeChannel> = new Map();

    // BehaviorSubject to store current shop code
    private shopCodeSubject = new BehaviorSubject<string | null>(null);
    shopCode$ = this.shopCodeSubject.asObservable();

    /** Called when home component sets shop code */
    async setShopCode(shopCode: string) {
        console.log('AblyService: Setting shop code to', shopCode);
        this.shopCodeSubject.next(shopCode);
    }

    // Subject for received Ably messages
    private ablyMessageSubject = new Subject<any>();
    private ablyMessages$ = this.ablyMessageSubject.asObservable();

    sendMessage(type: string, data: any) {
        console.log('AblyService: Sending message of type', type, 'with data:', data);
        this.ablyMessageSubject.next({ type, data });
    }

    // Subscribe only to messages of a specific type
    onMessage(type: string): Observable<any> {
        console.log('AblyService: Creating subscription for message type', type);
        return this.ablyMessages$.pipe(
            filter(msg => msg.type === type),
        );
    }

    constructor() { }

    /**
     * Initialize the Ably client with an API key
     * @param apiKey Your Ably API key
     */
    initialize(apiKey: string): void {
        console.log('AblyService: Initializing with API key');
        if (!this.ablyClient) {
            this.ablyClient = new Realtime({ key: apiKey });
            console.log('AblyService: Ably client initialized');
        } else {
            console.log('AblyService: Ably client already initialized');
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
        console.log('AblyService: Subscribing to channel', channelName, 'with event name', eventName);
        if (!this.ablyClient) {
            console.error('AblyService: Ably client not initialized. Call initialize() first.');
            throw new Error('Ably client not initialized. Call initialize() first.');
        }

        let channel = this.channels.get(channelName);

        if (!channel) {
            console.log('AblyService: Getting channel', channelName);
            channel = this.ablyClient.channels.get(channelName);
            this.channels.set(channelName, channel);
        }

        // Attach to the channel
        console.log('AblyService: Attaching to channel', channelName);
        await channel.attach();

        // Subscribe to messages
        if (eventName) {
            console.log('AblyService: Subscribing to event', eventName, 'on channel', channelName);
            channel.subscribe(eventName, callback);
        } else {
            console.log('AblyService: Subscribing to all events on channel', channelName);
            channel.subscribe(callback);
        }
        console.log('AblyService: Successfully subscribed to channel', channelName);
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
        console.log('AblyService: Unsubscribing from channel', channelName, 'event', eventName);
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
            console.log('AblyService: Successfully unsubscribed from channel', channelName);
        } else {
            console.log('AblyService: Channel not found for unsubscription', channelName);
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
        console.log('AblyService: Publishing to channel', channelName, 'event', eventName, 'data', data);
        if (!this.ablyClient) {
            console.error('AblyService: Ably client not initialized. Call initialize() first.');
            throw new Error('Ably client not initialized. Call initialize() first.');
        }

        let channel = this.channels.get(channelName);
        if (!channel) {
            channel = this.ablyClient.channels.get(channelName);
            this.channels.set(channelName, channel);
        }

        await channel.publish(eventName, data);
        console.log('AblyService: Successfully published to channel', channelName);
    }

    /**
     * Close the Ably connection
     */
    async close(): Promise<void> {
        console.log('AblyService: Closing connection');
        if (this.ablyClient) {
            await this.ablyClient.close();
            this.ablyClient = null;
            this.channels.clear();
            console.log('AblyService: Connection closed');
        }
    }
}