import { DurableObject } from 'cloudflare:workers';
import moment from 'moment';

// https://orm.drizzle.team/docs/connect-cloudflare-do

export class LinkClickTracker extends DurableObject {
	sql: SqlStorage;

	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);
		this.sql = ctx.storage.sql;

		ctx.blockConcurrencyWhile(async () => {
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
	}

	async fetch(_: Request) {
		const webSocketPair = new WebSocketPair();
		const [client, server] = Object.values(webSocketPair);

		this.ctx.acceptWebSocket(server);

		return new Response(null, { status: 101, webSocket: client });
	}

	webSocketClose(ws: WebSocket, code: number, reason: string, wasClean: boolean): void | Promise<void> {
		console.log('WebSocket closed', code, reason, wasClean);
	}
}
