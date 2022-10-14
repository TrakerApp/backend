export function getUserId(event) {
	return event.requestContext?.authorizer?.jwt?.claims?.sub
}
