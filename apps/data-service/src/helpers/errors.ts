import { Data } from "effect";

export class KvFetchError extends Data.TaggedError("KvFetchError")<{
	cause: unknown;
}> {}
export class JsonParseError extends Data.TaggedError("JsonParseError")<{
	cause: unknown;
}> {}
export class KvNotFoundError extends Data.TaggedError("KvNotFoundError")<{
	readonly id: string;
}> {}

export class ZodParseError extends Data.TaggedError("ZodParseError")<{
	cause: unknown;
}> {}

export class FetchLinkFromDBError extends Data.TaggedError(
	"FetchLinkFromDBError",
)<{
	cause: unknown;
}> {}

export class NoLinkFoundError extends Data.TaggedError(
	"NoLinkFoundError",
)<{}> {}

export class SaveLinktoKVError extends Data.TaggedError("SaveLinktoKVError")<{
	cause: unknown;
}> {}
