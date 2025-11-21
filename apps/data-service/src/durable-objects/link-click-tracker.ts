import { deleteClicksBefore, getRecentClicks } from '@/helpers/durable-queries';
import { DurableObject } from 'cloudflare:workers';
import moment from 'moment';

export class LinkClickTracker extends DurableObject {
	sql: SqlStorage;
	mostRecentOffsetTime: number = 0;
	leastRecentOffsetTime: number = 0;

	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);
		this.sql = ctx.storage.sql;

		ctx.blockConcurrencyWhile(async () => {
			const [leastRecentOffsetTime, mostRecentOffsetTime] = await Promise.all([
				ctx.storage.get<number>('leastRecentOffsetTime'),
				ctx.storage.get<number>('mostRecentOffsetTime'),
			]);

			this.leastRecentOffsetTime = leastRecentOffsetTime || this.leastRecentOffsetTime;
			this.mostRecentOffsetTime = mostRecentOffsetTime || this.mostRecentOffsetTime;

			this.sql.exec(`
                CREATE TABLE IF NOT EXISTS geo_link_clicks (
                    latitude REAL NOT NULL,
                    longitude REAL NOT NULL,
                    country TEXT NOT NULL,
                    time INTEGER NOT NULL
                )
            `);
		});
	}

	async addClick(latitude: number, longitude: number, country: string, time: number) {
		this.sql.exec(
			`
			INSERT INTO geo_link_clicks (latitude, longitude, country, time)
			VALUES (?, ?, ?, ?)
			`,
			latitude,
			longitude,
			country,
			time
		);
		const alarm = await this.ctx.storage.getAlarm();
		if (!alarm) await this.ctx.storage.setAlarm(moment().add(2, 'seconds').valueOf());
	}

	async alarm() {
		console.log('alarm');
		const clickData = getRecentClicks(this.sql, this.mostRecentOffsetTime);

		const sockets = this.ctx.getWebSockets();
		for (const socket of sockets) {
			socket.send(JSON.stringify(clickData.clicks));
		}

		await this.flushOffsetTimes(clickData.mostRecentTime, clickData.oldestTime);
		await deleteClicksBefore(this.sql, clickData.oldestTime);
	}

	async flushOffsetTimes(mostRecentOffsetTime: number, leastRecentOffsetTime: number) {
		this.mostRecentOffsetTime = mostRecentOffsetTime;
		this.leastRecentOffsetTime = leastRecentOffsetTime;
		await this.ctx.storage.put('mostRecentOffsetTime', this.mostRecentOffsetTime);
		await this.ctx.storage.put('leastRecentOffsetTime', this.leastRecentOffsetTime);
	}

	async fetch(_: Request) {
		const webSocketPair = new WebSocketPair();
		const [client, server] = Object.values(webSocketPair);
		this.ctx.acceptWebSocket(server);
		return new Response(null, {
			status: 101,
			webSocket: client,
		});
	}

	webSocketClose(ws: WebSocket, code: number, reason: string, wasClean: boolean): void | Promise<void> {
		console.log('client closed');
	}
}
