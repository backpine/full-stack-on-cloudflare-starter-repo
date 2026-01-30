import { Context } from "effect";

export class CloudFlareContext extends Context.Tag("CloudFlareContext")<
	CloudFlareContext,
	{
		req: {
			param: (key: string) => string;
			raw: { cf: unknown };
		};
		env: Env;
		text: (body: string, status: number) => Response;
		redirect: (url: string) => Response;
	}
>() {}
